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
        responses={
            200: UserDailyStatSerializer(many=True),
            401: "Unauthorized",
        },
        tags=["User Stats"]
    )
    def get(self, *args, **kwargs):
        return super().get(*args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Create new daily stat",
        request_body=UserDailyStatSerializer,
        responses={
            201: UserDailyStatSerializer,
            400: "Bad request – invalid data",
            401: "Unauthorized",
        },
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
        responses={
            200: UserDailyStatSerializer,
            401: "Unauthorized",
            404: "Stat not found",
        },
        tags=["User Stats"]
    )
    def get(self, *args, **kwargs):
        return super().get(*args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Update daily stat by ID",
        request_body=UserDailyStatSerializer,
        responses={
            200: UserDailyStatSerializer,
            400: "Bad request – invalid data",
            401: "Unauthorized",
            404: "Stat not found",
        },
        tags=["User Stats"]
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)


class UserTodayStatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Get today's stat for the logged-in user",
        responses={
            200: UserDailyStatSerializer,
            404: "No entry found for today",
            401: "Unauthorized",
        },
        tags=["User Stats"]
    )
    def get(self, request):
        today = timezone.now().date()
        stat = UserDailyStat.objects.filter(user=request.user, date=today).first()
        if not stat:
            return Response({"detail": "No entry found for today."}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserDailyStatSerializer(stat)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SevenDaySummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Get 7-day fitness stats summary",
        responses={
            200: openapi.Response(
                description="7-day summary",
                examples={
                    "application/json": {
                        "total_steps": 56000,
                        "total_calories": 10500,
                        "average_sleep_hours": 7.2
                    }
                },
            ),
            401: "Unauthorized",
        },
        tags=["User Stats"]
    )
    def get(self, request):
        today = timezone.now().date()
        week_ago = today - timedelta(days=6)
        stats = UserDailyStat.objects.filter(user=request.user, date__range=[week_ago, today])

        total_steps = sum(s.steps for s in stats if s.steps is not None)
        total_calories = sum(s.calories for s in stats if s.calories is not None)
        avg_sleep = (
            sum(s.sleep_hours for s in stats if s.sleep_hours is not None) / stats.count()
            if stats.exists() else 0
        )

        return Response({
            "total_steps": total_steps,
            "total_calories": total_calories,
            "average_sleep_hours": round(avg_sleep, 1)
        }, status=status.HTTP_200_OK)
