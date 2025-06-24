from django.urls import path
from .views import MealPreferenceView, MealPlanListCreateView, MealPlanDeleteView

urlpatterns = [
    path("preferences/", MealPreferenceView.as_view(), name="meal-preferences"),
    path("plans/", MealPlanListCreateView.as_view(), name="meal-plans"),
    path("plans/<int:pk>/", MealPlanDeleteView.as_view(), name="delete-meal-plan"),
]
