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

        # Use preference values unless request overrides them
        diet_type = request.data.get("diet_type") or prefs.diet_type
        goal = request.data.get("goal") or prefs.goal or getattr(profile, "goal", "")
        allergies = request.data.get("allergies") or prefs.allergies or "none"
        calories = request.data.get("calories_per_day") or prefs.calories_per_day

        # Validate inputs
        if not diet_type:
            return Response({"error": "Diet type is required (via request or preferences)."}, status=400)
        if not goal:
            return Response({"error": "Goal is required (via request, profile, or preferences)."}, status=400)
        if not calories:
            return Response({"error": "Calories per day is required."}, status=400)

        # Prompt generation
        prompt = (
            f"Generate a 3-meal {diet_type} meal plan for a {profile.age}-year-old "
            f"{profile.gender.lower()} who wants to {goal.lower()}. "
            f"Include estimated calories per meal. Avoid: {allergies}. "
            f"Total daily calories: {calories}."
        )

        # Call HuggingFace API
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
            return MealPlan.objects.none()  # Swagger-safe fallback
        return MealPlan.objects.filter(user=user)
