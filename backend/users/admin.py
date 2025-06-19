from django.contrib import admin
from .models import UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'age', 'gender', 'height_cm', 'weight_kg', 'goal')
    search_fields = ('user__username', 'goal')
    list_filter = ('gender', 'goal')
