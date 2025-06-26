# meal/utils.py

def calculate_calories(age, gender, height_cm, weight_kg, goal):
    if gender.lower() == 'male':
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    else:
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161

    goal = goal.lower()
    if goal == "weight loss":
        return round(bmr - 500)
    elif goal == "muscle gain":
        return round(bmr + 500)
    else:  # maintenance
        return round(bmr)
