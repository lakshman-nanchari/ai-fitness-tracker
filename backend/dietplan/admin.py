from django.contrib import admin
from .models import MealPreference, MealPlan

@admin.register(MealPreference)
class MealPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'diet_type', 'goal_from_profile', 'calories_from_profile')
    search_fields = ('user__username', 'diet_type')

    def goal_from_profile(self, obj):
        return obj.user.profile.goal if hasattr(obj.user, 'profile') else '—'
    goal_from_profile.short_description = 'Goal'

    def calories_from_profile(self, obj):
        goal = obj.user.profile.goal if hasattr(obj.user, 'profile') else None
        return {
            'lose_weight': 1500,
            'gain_muscle': 2500,
            'stay_fit': 2000
        }.get(goal, '—')
    calories_from_profile.short_description = 'Calories/Day'


@admin.register(MealPlan)
class MealPlanAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')
    search_fields = ('user__username',)
    readonly_fields = ('created_at',)
