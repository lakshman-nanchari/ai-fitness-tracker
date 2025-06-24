from django.db import models
from django.conf import settings

class MealPreference(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    diet_type = models.CharField(max_length=50)  # e.g., vegetarian, keto
    goal = models.CharField(max_length=50)       # e.g., weight loss, muscle gain
    allergies = models.TextField(blank=True, null=True)
    calories_per_day = models.PositiveIntegerField(default=2000)

    def __str__(self):
        return f"{self.user.username}'s Preferences"

class MealPlan(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="meal_plans")
    created_at = models.DateTimeField(auto_now_add=True)
    plan_text = models.TextField()

    def __str__(self):
        return f"MealPlan {self.id} for {self.user.username}"
