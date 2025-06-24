from rest_framework import serializers
from .models import MealPreference, MealPlan

class MealPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealPreference
        fields = "__all__"
        read_only_fields = ("user",)

class MealPlanSerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(read_only=True)  # avoid Swagger default serialization issue

    class Meta:
        model = MealPlan
        fields = "__all__"
        read_only_fields = ("user", "created_at")
