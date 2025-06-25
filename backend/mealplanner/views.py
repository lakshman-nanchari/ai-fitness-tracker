from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import requests

from .models import MealPreference, MealPlan
from .serializers import MealPreferenceSerializer, MealPlanSerializer


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

    @swagger_auto_schema(operation_summary="List meal plans for the user")
    def get(self, request):
        plans = MealPlan.objects.filter(user=request.user).order_by("-created_at")
        return Response(MealPlanSerializer(plans, many=True).data)

    @swagger_auto_schema(
        operation_summary="Generate AI-powered meal plan",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "diet_type": openapi.Schema(type=openapi.TYPE_STRING),
                "goal": openapi.Schema(type=openapi.TYPE_STRING),
                "allergies": openapi.Schema(type=openapi.TYPE_STRING),
                "calories_per_day": openapi.Schema(type=openapi.TYPE_INTEGER),
                "meals_per_day": openapi.Schema(type=openapi.TYPE_INTEGER),
            },
            required=[]
        ),
        responses={201: MealPlanSerializer, 400: "Bad Request", 500: "AI Error"}
    )
    def post(self, request):
        user = request.user
        profile = getattr(user, "profile", None)

        if not profile or not profile.age or not profile.gender:
            return Response({"error": "Complete your profile (age and gender required)."}, status=400)

        prefs, _ = MealPreference.objects.get_or_create(user=user)

        # Gather inputs
        diet_type = request.data.get("diet_type") or prefs.diet_type
        goal = request.data.get("goal") or prefs.goal or profile.goal
        allergies = request.data.get("allergies") or prefs.allergies or "none"
        calories = request.data.get("calories_per_day") or prefs.calories_per_day
        meals_per_day = int(request.data.get("meals_per_day") or prefs.meals_per_day or 3)

        if not diet_type or not goal or not calories:
            return Response({"error": "Missing required fields."}, status=400)
        if meals_per_day not in [3, 5]:
            return Response({"error": "Only 3 or 5 meals per day are supported."}, status=400)

        meal_labels = (
            ["Breakfast", "Lunch", "Dinner"]
            if meals_per_day == 3
            else ["Breakfast", "Morning Snack", "Lunch", "Evening Snack", "Dinner"]
        )

        prompt = (
            f"Create a {meals_per_day}-meal {diet_type} diet plan for a {profile.age}-year-old "
            f"{profile.gender.lower()} who wants to {goal.lower()}. "
            f"Total daily calories should be approximately {calories}. "
            f"Do not include ingredients they are allergic to: {allergies}. "
            f"Label each meal with these headers:\n\n" +
            "\n".join(f"{label}:" for label in meal_labels) +
            "\n\nInclude estimated calories per meal and format clearly for readability."
        )

        try:
            headers = {
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "HTTP-Referer": "https://fittrack.yoursite.com",
                "X-Title": "FitTrack Meal Planner",
                "Content-Type": "application/json",
            }

            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json={
                    "model": "mistralai/mistral-small-3.2-24b-instruct:free",
                    "messages": [
                        {"role": "system", "content": "You are a helpful fitness and nutrition assistant."},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.7,
                }
            )

            if response.status_code != 200:
                return Response({"error": "meal plan generation failed."}, status=500)

            result = response.json()
            plan_text = result["choices"][0]["message"]["content"]

            meal_plan = MealPlan.objects.create(user=user, plan_text=plan_text)
            return Response(MealPlanSerializer(meal_plan).data, status=201)

        except Exception as e:
            return Response({"error": f"request failed: {str(e)}"}, status=500)


class MealPlanDeleteView(generics.DestroyAPIView):
    serializer_class = MealPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MealPlan.objects.filter(user=self.request.user)
