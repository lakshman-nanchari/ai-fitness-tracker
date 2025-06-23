from django.urls import path
from .views import (
    UserDailyStatListCreateView,
    UserDailyStatDetailView,
    UserTodayStatView,
    SevenDaySummaryView,
)

urlpatterns = [
    # List all stats / Create new
    path("daily-stats/", UserDailyStatListCreateView.as_view(), name="user-daily-stats"),

    # Retrieve or update specific stat
    path("daily-stats/<int:pk>/", UserDailyStatDetailView.as_view(), name="user-daily-stat-detail"),

    # Get today's stat
    path("today/", UserTodayStatView.as_view(), name="user-today-stat"),

    # Get 7-day summary
    path("summary/", SevenDaySummaryView.as_view(), name="user-7-day-summary"),
]
