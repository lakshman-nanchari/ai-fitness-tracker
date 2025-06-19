from rest_framework import serializers
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True, help_text="User's username")
    email = serializers.EmailField(source='user.email', read_only=True, help_text="User's email address")
    age = serializers.IntegerField(required=False, help_text="User's age")
    gender = serializers.ChoiceField(
        choices=UserProfile.GENDER_CHOICES,
        required=False,
        help_text="Gender: M = Male, F = Female, O = Other"
    )
    height_cm = serializers.FloatField(required=False, help_text="Height in centimeters")
    weight_kg = serializers.FloatField(required=False, help_text="Weight in kilograms")
    goal = serializers.ChoiceField(
        choices=UserProfile.GOAL_CHOICES,
        required=False,
        help_text="Fitness goal: lose_weight, gain_muscle, stay_fit"
    )

    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'age', 'gender', 'height_cm', 'weight_kg', 'goal']
