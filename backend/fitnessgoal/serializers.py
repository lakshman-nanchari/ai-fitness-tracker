from rest_framework import serializers
from .models import FitnessGoal

class FitnessGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = FitnessGoal
        fields = ['step_goal', 'calorie_goal', 'water_goal', 'sleep_goal']
