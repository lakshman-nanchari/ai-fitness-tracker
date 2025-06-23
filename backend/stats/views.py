from datetime import timedelta
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from .models import UserDailyStat
from .serializers import UserDailyStatSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi


class UserDailyStatListCreateView(generics.ListCreateAPIView):
    serializer_class = UserDailyStatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserDailyStat.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @swagger_auto_schema(
        operation_summary="Get list of daily stats",
        responses={200: UserDailyStatSerializer(many=True)},
        tags=["User Stats"]
    )
    def get(self, *args, **kwargs):
        return super().get(*args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Create new daily stat",
        request_body=UserDailyStatSerializer,
        responses={201: UserDailyStatSerializer, 400: "Bad Request", 401: "Unauthorized"},
        tags=["User Stats"]
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class UserDailyStatDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserDailyStatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserDailyStat.objects.filter(user=self.request.user)

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
        operation_summary="Update daily stat by ID",
        request_body=UserDailyStatSerializer,
        responses={200: UserDailyStatSerializer, 400: "Bad Request", 401: "Unauthorized", 404: "Not Found"},
        tags=["User Stats"]
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)


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


class SummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Get combined summary (today + 7-day + 30-day)",
        responses={
            200: openapi.Response(
                description="Fitness summary",
                examples={
                    "application/json": {
                        "today": {"steps": 10000, "calories": 2200, "water": 2.5, "sleep": 7},
                        "last_7_days": {
                            "total_steps": 56000,
                            "total_calories": 10500,
                            "total_water": 17.5,
                            "average_sleep_hours": 7.2,
                        },
                        "last_30_days": {
                            "total_steps": 210000,
                            "total_calories": 42000,
                            "total_water": 75.0,
                            "average_sleep_hours": 6.9,
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

        # Last 7 Days
        week_stats = UserDailyStat.objects.filter(user=user, date__range=[week_ago, today])
        week_data = {
            "total_steps": sum(s.steps for s in week_stats),
            "total_calories": sum(s.calories for s in week_stats),
            "total_water": sum(s.water_intake_liters for s in week_stats),
            "average_sleep_hours": round(
                sum(s.sleep_hours for s in week_stats) / week_stats.count(), 1
            ) if week_stats else 0
        }

        # Last 30 Days
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
