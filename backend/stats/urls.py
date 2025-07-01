from django.urls import path,include
from .views import (
    UserDailyStatListCreateView,
    UserDailyStatDetailView,
    UserTodayStatView,
    SummaryView,  # ✅ Only one summary view needed now
)

urlpatterns = [
    path("daily-stats/", UserDailyStatListCreateView.as_view(), name="user-daily-stats"),
    path("daily-stats/<int:pk>/", UserDailyStatDetailView.as_view(), name="user-daily-stat-detail"),
    path("today/", UserTodayStatView.as_view(), name="user-today-stat"),
    path("summary/", SummaryView.as_view(), name="user-summary"),  # ✅ Clean, unified summary endpoint
    path('fitness-goal/', include('fitnessgoal.urls')),
]
