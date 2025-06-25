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
        if not request.user.is_authenticated:
            return Response([])  # Swagger-safe fallback
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

        # Fetch profile
        profile = getattr(user, "profile", None)
        if not profile or not profile.age or not profile.gender:
            return Response({"error": "Complete your profile (age and gender required)."}, status=400)

        # Get or create preferences
        prefs, _ = MealPreference.objects.get_or_create(user=user)

        # Resolve values
        diet_type = request.data.get("diet_type") or prefs.diet_type
        goal = request.data.get("goal") or prefs.goal or getattr(profile, "goal", "")
        allergies = request.data.get("allergies") or prefs.allergies or "none"
        calories = request.data.get("calories_per_day") or prefs.calories_per_day
        meals_per_day = int(request.data.get("meals_per_day") or prefs.meals_per_day or 3)

        # Validate inputs
        if not diet_type:
            return Response({"error": "Diet type is required."}, status=400)
        if not goal:
            return Response({"error": "Goal is required."}, status=400)
        if not calories:
            return Response({"error": "Calories per day is required."}, status=400)
        if meals_per_day not in [3, 5]:
            return Response({"error": "Only 3 or 5 meals per day are supported."}, status=400)

        # Define meal labels
        if meals_per_day == 3:
            meal_labels = ["Breakfast", "Lunch", "Dinner"]
        else:
            meal_labels = ["Breakfast", "Morning Snack", "Lunch", "Evening Snack", "Dinner"]

        # Prompt for AI
        prompt = (
            f"Create a {meals_per_day}-meal {diet_type} diet plan for a {profile.age}-year-old "
            f"{profile.gender.lower()} who wants to {goal.lower()}. "
            f"Total daily calories should be approximately {calories}. "
            f"Do not include ingredients they are allergic to: {allergies}. "
            f"Label each meal with these headers:\n\n" +
            "\n".join(f"{label}:" for label in meal_labels) +
            "\n\nInclude estimated calories per meal and format clearly for readability."
        )

        # Call Hugging Face
        headers = {
            "Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"
        }
        response = requests.post(
            "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
            json={"inputs": prompt},
            headers=headers,
        )

        if response.status_code != 200:
            return Response({"error": "AI generation failed."}, status=500)

        output = response.json()
        plan_text = output[0]["generated_text"] if isinstance(output, list) else output.get("generated_text", "")

        meal_plan = MealPlan.objects.create(user=user, plan_text=plan_text)
        return Response(MealPlanSerializer(meal_plan).data, status=201)


class MealPlanDeleteView(generics.DestroyAPIView):
    serializer_class = MealPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return MealPlan.objects.none()
        return MealPlan.objects.filter(user=user)
