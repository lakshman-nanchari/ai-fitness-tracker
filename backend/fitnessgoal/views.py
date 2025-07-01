from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import FitnessGoal
from .serializers import FitnessGoalSerializer
from .utils import generate_personalized_goals


class FitnessGoalDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Get current user's fitness goals",
        responses={200: FitnessGoalSerializer()},
        tags=["Fitness Goals"]
    )
    def get(self, request):
        goal, _ = FitnessGoal.objects.get_or_create(user=request.user)
        serializer = FitnessGoalSerializer(goal)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="Update user's fitness goals",
        request_body=FitnessGoalSerializer,
        responses={200: FitnessGoalSerializer()},
        tags=["Fitness Goals"]
    )
    def put(self, request):
        goal, _ = FitnessGoal.objects.get_or_create(user=request.user)
        serializer = FitnessGoalSerializer(goal, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GenerateFitnessGoalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Generate fitness goals using profile + diet data",
        operation_description="Generates personalized fitness goals using height, weight, age, and current diet plan.",
        responses={200: FitnessGoalSerializer()},
        tags=["Fitness Goals"]
    )
    def post(self, request):
        goal_data = generate_personalized_goals(request.user)
        goal, _ = FitnessGoal.objects.get_or_create(user=request.user)
        for key, value in goal_data.items():
            setattr(goal, key, value)
        goal.save()
        serializer = FitnessGoalSerializer(goal)
        return Response(serializer.data, status=status.HTTP_200_OK)
