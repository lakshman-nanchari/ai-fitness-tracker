from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import MealPreference, MealPlan
from .serializers import MealPreferenceSerializer, MealPlanSerializer
import requests
from django.conf import settings
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi


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

    @swagger_auto_schema(operation_description="List meal plans for the logged-in user")
    def get(self, request):
        if not request.user.is_authenticated:
            return Response([])  # Swagger-safe fallback
        plans = MealPlan.objects.filter(user=request.user).order_by("-created_at")
        return Response(MealPlanSerializer(plans, many=True).data)

    @swagger_auto_schema(
        operation_description="Generate a meal plan using AI based on preferences or custom input",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "diet_type": openapi.Schema(type=openapi.TYPE_STRING, description="Optional override for diet type"),
                "goal": openapi.Schema(type=openapi.TYPE_STRING, description="Optional override for goal"),
                "allergies": openapi.Schema(type=openapi.TYPE_STRING, description="Optional override for allergies"),
                "calories_per_day": openapi.Schema(type=openapi.TYPE_INTEGER, description="Optional override for calories"),
            },
            required=[]
        )
    )
    def post(self, request):
        try:
            prefs = MealPreference.objects.get(user=request.user)
        except MealPreference.DoesNotExist:
            return Response({"error": "Set meal preferences first."}, status=400)

        profile = getattr(request.user, "profile", None)
        if not profile:
            return Response({"error": "User profile not found."}, status=400)

        # Allow on-the-fly overrides
        diet_type = request.data.get("diet_type", prefs.diet_type)
        goal = request.data.get("goal", prefs.goal)
        allergies = request.data.get("allergies", prefs.allergies)
        calories = request.data.get("calories_per_day", prefs.calories_per_day)

        prompt = (
            f"Generate a 3-meal {diet_type} diet plan for a {profile.age}-year-old "
            f"{profile.gender.lower()} who wants to {goal.lower()}. "
            f"Include estimated calories per meal. Avoid: {allergies or 'none'}. "
            f"Total daily calories: {calories}."
        )

        headers = {
            "Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"
        }

        payload = {"inputs": prompt}
        response = requests.post(
            "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
            json=payload,
            headers=headers,
        )

        if response.status_code != 200:
            return Response({"error": "AI generation failed."}, status=500)

        output = response.json()
        plan_text = output[0]["generated_text"] if isinstance(output, list) else output.get("generated_text", "")

        meal_plan = MealPlan.objects.create(user=request.user, plan_text=plan_text)
        return Response(MealPlanSerializer(meal_plan).data, status=201)


class MealPlanDeleteView(generics.DestroyAPIView):
    serializer_class = MealPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return MealPlan.objects.none()  # Swagger-safe fallback
        return MealPlan.objects.filter(user=user)
