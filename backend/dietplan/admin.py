from django.contrib import admin
from .models import MealPreference, MealPlan

@admin.register(MealPreference)
class MealPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'diet_type', 'goal', 'calories_per_day')
    search_fields = ('user__username', 'diet_type', 'goal')

@admin.register(MealPlan)
class MealPlanAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')
    search_fields = ('user__username',)
    readonly_fields = ('created_at',)
