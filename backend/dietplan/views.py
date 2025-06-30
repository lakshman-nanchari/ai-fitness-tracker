import re
import requests
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.conf import settings

from .models import MealPreference, MealPlan
from .serializers import MealPreferenceSerializer, MealPlanSerializer
from .utils import calculate_calories


class MealPreferenceView(generics.RetrieveUpdateAPIView):
    serializer_class = MealPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Get user's meal preferences",
        operation_description="Retrieves the current user's meal preference data such as diet type, allergies, location, and meals per day."
    )
    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Update user's meal preferences",
        operation_description="Updates the current user's meal preference fields like diet type, allergies, location, and meals per day."
    )
    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def get_object(self):
        obj, _ = MealPreference.objects.get_or_create(user=self.request.user)
        return obj

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)


#  Updated parser that handles **Bolded** markdown headers and meal sections
def extract_meals(plan_text, meals_per_day):
    meal_labels = (
        ["Breakfast", "Lunch", "Dinner"]
        if meals_per_day == 3
        else ["Breakfast", "Morning Snack", "Lunch", "Evening Snack", "Dinner"]
    )
    label_set = {label.lower(): label for label in meal_labels}
    extracted = {}
    current_label = None

    lines = plan_text.splitlines()

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Matches "**Breakfast:**", "Breakfast:", etc.
        match = re.match(r"^\**\*?([A-Za-z\s]+?)\*?\**[:\-]?\s*$", line)
        if match:
            label_candidate = match.group(1).strip().lower()
            if label_candidate in label_set:
                current_label = label_set[label_candidate]
                extracted[current_label] = []
                continue

        if current_label:
            extracted[current_label].append(line)

    return {
        meal: "\n".join(content).strip()
        for meal, content in extracted.items()
    }


class MealPlanListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Get latest meal plan",
        operation_description="Retrieves the most recent meal plan generated for the user.",
        responses={200: MealPlanSerializer()}
    )
    def get(self, request):
        latest_plan = MealPlan.objects.filter(user=request.user).order_by('-created_at').first()
        if not latest_plan:
            return Response({"message": "No meal plans available."}, status=404)

        meals_per_day = 5 if "Snack" in latest_plan.plan_text else 3
        structured_plan = extract_meals(latest_plan.plan_text, meals_per_day)

        return Response({
            "id": latest_plan.id,
            "meals": structured_plan,
            "created_at": latest_plan.created_at,
        })

    @swagger_auto_schema(
        operation_summary="Generate a new meal plan",
        operation_description="Generates a personalized meal plan based on user preferences and profile data.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "diet_type": openapi.Schema(type=openapi.TYPE_STRING),
                "allergies": openapi.Schema(type=openapi.TYPE_STRING),
                "meals_per_day": openapi.Schema(type=openapi.TYPE_INTEGER),
                "location": openapi.Schema(type=openapi.TYPE_STRING),
            }
        ),
        responses={201: MealPlanSerializer()}
    )
    def post(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)

        if not profile or not profile.age or not profile.gender or not profile.goal:
            return Response({"error": "Complete your profile with age, gender, and goal."},
                            status=status.HTTP_400_BAD_REQUEST)

        prefs, _ = MealPreference.objects.get_or_create(user=user)

        diet_type = request.data.get("diet_type") or prefs.diet_type or "veg"
        goal = profile.goal
        allergies = request.data.get("allergies") or prefs.allergies or "none"
        meals_per_day = int(request.data.get("meals_per_day") or prefs.meals_per_day or 3)
        location = request.data.get("location") or prefs.location or "India"

        if meals_per_day not in [3, 5]:
            return Response({"error": "Only 3 or 5 meals per day are supported."}, status=400)

        calories = calculate_calories(
            age=profile.age,
            gender=profile.gender,
            height_cm=profile.height_cm,
            weight_kg=profile.weight_kg,
            goal=goal
        )

        meal_labels = (
            ["Breakfast", "Lunch", "Dinner"]
            if meals_per_day == 3
            else ["Breakfast", "Morning Snack", "Lunch", "Evening Snack", "Dinner"]
        )

        prompt = (
            f"Create a {meals_per_day}-meal {diet_type} diet plan for a {profile.age}-year-old "
            f"{profile.gender.lower()} from {location} who wants to {goal.replace('_', ' ')}. "
            f"Daily calories should be ~{calories}. Avoid allergens: {allergies}. "
            f"Use culturally relevant foods from {location}.\n"
            f"Label each meal like:\n\n" +
            "\n".join(f"{label}:" for label in meal_labels) +
            "\n\nInclude calories per meal and prep instructions. Format as readable text."
        )

        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                    "HTTP-Referer": "https://fittrack.yoursite.com",
                    "X-Title": "FitTrack Meal Planner",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "mistralai/mistral-small-3.2-24b-instruct:free",
                    "messages": [
                        {"role": "system", "content": "You are a helpful meal planner."},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.7,
                },
                timeout=60,
            )

            if response.status_code != 200:
                return Response({"error": "Meal plan generation failed."}, status=500)

            result = response.json()
            plan_text = result["choices"][0]["message"]["content"]

            meal_plan = MealPlan.objects.create(user=user, plan_text=plan_text)
            structured_plan = extract_meals(plan_text, meals_per_day)

            return Response({
                "id": meal_plan.id,
                "meals": structured_plan,
                "created_at": meal_plan.created_at,
            }, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


class MealPlanDeleteView(generics.DestroyAPIView):
    serializer_class = MealPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Delete a meal plan",
        operation_description="Deletes a meal plan belonging to the authenticated user by ID.",
        responses={204: "Meal plan deleted"}
    )
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return MealPlan.objects.none()
        return MealPlan.objects.filter(user=user)
