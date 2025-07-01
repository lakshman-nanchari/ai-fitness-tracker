def generate_personalized_goals(user):
    profile = user.profile  # assumes User has OneToOneField to Profile
    from dietplan.models import MealPlan
    meal_plan = MealPlan.objects.filter(user=user).last()

    if profile.gender.lower() == "male":
        bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age + 5
    else:
        bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age - 161

    tdee = bmr * 1.375  # Light activity

    goal_type = profile.goal.lower()
    if "lose" in goal_type:
        target_calories = tdee - 500
    elif "gain" in goal_type:
        target_calories = tdee + 300
    else:
        target_calories = tdee

    if meal_plan and hasattr(meal_plan, "total_calories"):
        target_calories = meal_plan.total_calories

    return {
        "calorie_goal": round(target_calories),
        "step_goal": 10000 if "lose" in goal_type else 8000,
        "water_goal": round(profile.weight_kg * 0.033, 1),
        "sleep_goal": 8.0 if "lose" in goal_type else 7.0,
    }
