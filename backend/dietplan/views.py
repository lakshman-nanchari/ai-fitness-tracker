from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
import requests

from .models import MealPreference, MealPlan
from .serializers import MealPreferenceSerializer, MealPlanSerializer
from .utils import calculate_calories  

class MealPreferenceView(generics.RetrieveUpdateAPIView):
    serializer_class = MealPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj, _ = MealPreference.objects.get_or_create(user=self.request.user)
        return obj

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)


class MealPlanListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        plans = MealPlan.objects.filter(user=request.user).order_by('-created_at')
        return Response(MealPlanSerializer(plans, many=True).data)

    def post(self, request):
        user = request.user
        data = request.data
        profile = getattr(user, 'profile', None)

        if not profile or not profile.age or not profile.gender or not profile.goal:
            return Response(
                {"error": "Complete your profile with age, gender, and goal."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get or create preferences
        prefs, _ = MealPreference.objects.get_or_create(user=user)

        # Pull from request data or fall back to preferences
        diet_type = data.get("diet_type") or prefs.diet_type or "veg"
        goal = profile.goal
        allergies = data.get("allergies") or prefs.allergies or "none"
        meals_per_day = int(data.get("meals_per_day") or prefs.meals_per_day or 3)
        location = data.get("location") or prefs.location or "India"

        if meals_per_day not in [3, 5]:
            return Response({"error": "Only 3 or 5 meals per day are supported."}, status=400)

        # ✅ Calculate calories dynamically using latest profile
        calories = calculate_calories(
            age=profile.age,
            gender=profile.gender,
            height_cm=profile.height_cm,
            weight_kg=profile.weight_kg,
            goal=profile.goal
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
            return Response(MealPlanSerializer(meal_plan).data, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=500)



class MealPlanDeleteView(generics.DestroyAPIView):
    serializer_class = MealPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MealPlan.objects.filter(user=self.request.user)
