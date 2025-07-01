from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class FitnessGoal(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="fitness_goal")
    step_goal = models.PositiveIntegerField(default=10000)
    calorie_goal = models.PositiveIntegerField(default=2000)
    water_goal = models.FloatField(default=2.5)  # Liters
    sleep_goal = models.FloatField(default=8.0)  # Hours

    def __str__(self):
        return f"{self.user.username}'s Fitness Goals"
