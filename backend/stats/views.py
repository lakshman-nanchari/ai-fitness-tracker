from datetime import timedelta
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import UserDailyStat
from .serializers import UserDailyStatSerializer


# List + Create daily stats
class UserDailyStatListCreateView(generics.ListCreateAPIView):
    serializer_class = UserDailyStatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return UserDailyStat.objects.none()
        return UserDailyStat.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @swagger_auto_schema(
        operation_summary="Get list of all daily stats for the logged-in user",
        responses={200: UserDailyStatSerializer(many=True)},
        tags=["User Stats"]
    )
    def get(self, *args, **kwargs):
        return super().get(*args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Create a new daily stat entry",
        request_body=UserDailyStatSerializer,
        responses={201: UserDailyStatSerializer, 400: "Bad Request", 401: "Unauthorized"},
        tags=["User Stats"]
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


# Retrieve + Update a stat by ID
class UserDailyStatDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserDailyStatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return UserDailyStat.objects.none()
        return UserDailyStat.objects.filter(user=user)

    def get_object(self):
        try:
            return super().get_object()
        except Exception:
            raise NotFound("Stat not found or does not belong to the user.")

    @swagger_auto_schema(
        operation_summary="Retrieve specific daily stat by ID",
        responses={200: UserDailyStatSerializer, 401: "Unauthorized", 404: "Not Found"},
        tags=["User Stats"]
    )
    def get(self, *args, **kwargs):
        return super().get(*args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Update daily stat by ID (PUT)",
        request_body=UserDailyStatSerializer,
        responses={200: UserDailyStatSerializer, 400: "Bad Request", 401: "Unauthorized", 404: "Not Found"},
        tags=["User Stats"]
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Partially update daily stat by ID (PATCH)",
        request_body=UserDailyStatSerializer,
        responses={200: UserDailyStatSerializer, 400: "Bad Request", 401: "Unauthorized", 404: "Not Found"},
        tags=["User Stats"]
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)


# Get today's stats
class UserTodayStatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Get today's stat for the logged-in user",
        responses={200: UserDailyStatSerializer, 404: "No entry found for today", 401: "Unauthorized"},
        tags=["User Stats"]
    )
    def get(self, request):
        today = timezone.now().date()
        stat = UserDailyStat.objects.filter(user=request.user, date=today).first()
        if not stat:
            return Response({"detail": "No entry found for today."}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserDailyStatSerializer(stat)
        return Response(serializer.data, status=status.HTTP_200_OK)


# Get summary (today, last 7 days, last 30 days)
class SummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Get combined summary (today + last 7 days + last 30 days)",
        responses={
            200: openapi.Response(
                description="Fitness summary data",
                examples={
                    "application/json": {
                        "today": {"steps": 8000, "calories": 2000, "water": 2.0, "sleep": 7},
                        "last_7_days": {
                            "total_steps": 55000,
                            "total_calories": 14000,
                            "total_water": 14.0,
                            "average_sleep_hours": 6.8,
                        },
                        "last_30_days": {
                            "total_steps": 215000,
                            "total_calories": 54000,
                            "total_water": 60.0,
                            "average_sleep_hours": 7.1,
                        },
                    }
                }
            ),
            401: "Unauthorized",
        },
        tags=["User Stats"]
    )
    def get(self, request):
        user = request.user
        today = timezone.now().date()
        week_ago = today - timedelta(days=6)
        month_ago = today - timedelta(days=30)

        # Today
        today_stat = UserDailyStat.objects.filter(user=user, date=today).first()
        today_data = {
            "steps": today_stat.steps if today_stat else 0,
            "calories": today_stat.calories if today_stat else 0,
            "water": today_stat.water_intake_liters if today_stat else 0,
            "sleep": today_stat.sleep_hours if today_stat else 0,
        }

        # Last 7 days
        week_stats = UserDailyStat.objects.filter(user=user, date__range=[week_ago, today])
        week_data = {
            "total_steps": sum(s.steps for s in week_stats),
            "total_calories": sum(s.calories for s in week_stats),
            "total_water": sum(s.water_intake_liters for s in week_stats),
            "average_sleep_hours": round(
                sum(s.sleep_hours for s in week_stats) / week_stats.count(), 1
            ) if week_stats else 0
        }

        # Last 30 days
        month_stats = UserDailyStat.objects.filter(user=user, date__range=[month_ago, today])
        month_data = {
            "total_steps": sum(s.steps for s in month_stats),
            "total_calories": sum(s.calories for s in month_stats),
            "total_water": sum(s.water_intake_liters for s in month_stats),
            "average_sleep_hours": round(
                sum(s.sleep_hours for s in month_stats) / month_stats.count(), 1
            ) if month_stats else 0
        }

        return Response({
            "today": today_data,
            "last_7_days": week_data,
            "last_30_days": month_data,
        }, status=status.HTTP_200_OK)
