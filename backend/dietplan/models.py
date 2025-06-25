from django.db import models
from django.conf import settings

class MealPreference(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    diet_type = models.CharField(max_length=50)
    goal = models.CharField(max_length=50)
    calories_per_day = models.PositiveIntegerField(default=2000)
    meals_per_day = models.PositiveSmallIntegerField(default=3)
    allergies = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s Preferences"


class MealPlan(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="meal_plans")
    created_at = models.DateTimeField(auto_now_add=True)
    plan_text = models.TextField()

    def __str__(self):
        return f"Meal Plan {self.id} for {self.user.username}"
