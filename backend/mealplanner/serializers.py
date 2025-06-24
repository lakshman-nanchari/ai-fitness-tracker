from rest_framework import serializers
from .models import MealPreference, MealPlan

class MealPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealPreference
        fields = "__all__"
        read_only_fields = ("user",)

class MealPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealPlan
        fields = "__all__"
        read_only_fields = ("user", "created_at")
