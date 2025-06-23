from django.contrib import admin
from .models import UserDailyStat

@admin.register(UserDailyStat)
class UserDailyStatAdmin(admin.ModelAdmin):
    list_display = ("user", "date", "steps", "calories", "water_intake_liters", "sleep_hours")
    list_filter = ("date", "user")
    search_fields = ("user__username",)
