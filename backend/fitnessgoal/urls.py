from django.urls import path
from .views import FitnessGoalDetailView, GenerateFitnessGoalView

urlpatterns = [
    path('goal-view/', FitnessGoalDetailView.as_view(), name='fitness-goal-detail'),
    path('generate/', GenerateFitnessGoalView.as_view(), name='generate-goal'),
]
