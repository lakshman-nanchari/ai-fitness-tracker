from django.contrib import admin
from .models import FitnessGoal

@admin.register(FitnessGoal)
class FitnessGoalAdmin(admin.ModelAdmin):
    list_display = ['user', 'step_goal', 'calorie_goal', 'water_goal', 'sleep_goal']
    search_fields = ['user__username', 'user__email']
    list_filter = ['step_goal', 'calorie_goal']
