from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from django.shortcuts import get_object_or_404
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

    def get(self, request):
        plans = MealPlan.objects.filter(user=request.user).order_by("-created_at")
        return Response(MealPlanSerializer(plans, many=True).data)

    def post(self, request):
        user = request.user
        profile = getattr(user, "profile", None)

        prefs, _ = MealPreference.objects.get_or_create(user=user)

        # Gather inputs from request or fallbacks
        diet_type = request.data.get("diet_type") or prefs.diet_type or "balanced"
        goal = request.data.get("goal") or prefs.goal or getattr(profile, "goal", None)
        allergies = request.data.get("allergies") or prefs.allergies or "none"
        calories = request.data.get("calories_per_day") or prefs.calories_per_day or 2000
        meals_per_day = int(request.data.get("meals_per_day", prefs.meals_per_day or 3))

        # Validate essential data
        if not profile or not profile.age or not profile.gender:
            return Response({"error": "Complete your profile (age and gender required)."}, status=400)

        if not diet_type or not goal or not calories:
            return Response({"error": "Missing required diet_type, goal, or calories."}, status=400)

        if meals_per_day not in [3, 5]:
            return Response({"error": "Only 3 or 5 meals per day are supported."}, status=400)

        meal_labels = (
            ["Breakfast", "Lunch", "Dinner"]
            if meals_per_day == 3
            else ["Breakfast", "Morning Snack", "Lunch", "Evening Snack", "Dinner"]
        )

        # Construct the prompt
        prompt = (
            f"Create a {meals_per_day}-meal {diet_type} diet plan for a {profile.age}-year-old "
            f"{profile.gender.lower()} who wants to {goal.lower()}. "
            f"Total daily calories should be approximately {calories}. "
            f"Avoid allergens: {allergies}. "
            f"Label meals as:\n\n" +
            "\n".join(f"{label}:" for label in meal_labels) +
            "\n\nInclude calories per meal and preparation instructions. Format the response in JSON like:\n"
            """{
    "Breakfast": {
        "items": [{"name": "Oatmeal", "calories": 250, "instructions": "Boil oats with milk."}],
        "macros": {"protein": 15, "carbs": 30, "fat": 8}
    },
    ...
}"""
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
                        {"role": "system", "content": "You are a helpful fitness and nutrition assistant."},
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
            return Response({"error": f"Request failed: {str(e)}"}, status=500)


class MealPlanDeleteView(generics.DestroyAPIView):
    serializer_class = MealPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MealPlan.objects.filter(user=self.request.user)
