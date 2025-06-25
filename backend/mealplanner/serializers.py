from rest_framework import serializers
from .models import MealPreference, MealPlan


class MealPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealPreference
        fields = '__all__'
        read_only_fields = ['user']


class MealPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealPlan
        fields = ['id', 'created_at', 'plan_text', 'user']
        read_only_fields = ['id', 'created_at', 'user']

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep.pop("user", None)  # Hides user field in response
        return rep
