from django.conf import settings
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class MealPreference(models.Model):
    MEAL_CHOICES = (
        (3, "3 meals/day"),
        (5, "5 meals/day"),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    diet_type = models.CharField(max_length=20, default='veg')  # veg / non-veg / vegan etc.
    meals_per_day = models.IntegerField(choices=MEAL_CHOICES, default=3)
    allergies = models.CharField(max_length=255, blank=True, null=True)
    location = models.CharField(max_length=100, default="India")

    def __str__(self):
        return f"{self.user.username}'s meal preference"



class MealPlan(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="meal_plans")
    created_at = models.DateTimeField(auto_now_add=True)
    plan_text = models.TextField()

    def __str__(self):
        return f"Meal Plan {self.id} for {self.user.username}"
