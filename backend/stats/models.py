from django.db import models
from django.conf import settings
from datetime import date


class UserDailyStat(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="daily_stats")
    date = models.DateField(default=date.today)



    steps = models.PositiveIntegerField(default=0)
    calories = models.PositiveIntegerField(default=0)
    water_intake_liters = models.FloatField(default=0.0)
    sleep_hours = models.FloatField(default=0.0)

    class Meta:
        unique_together = ("user", "date")
        ordering = ["-date"]

    def __str__(self):
        return f"{self.user.username} - {self.date}"
