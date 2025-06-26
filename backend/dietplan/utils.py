# dietplan/utils.py

def calculate_calories(age, gender, height_cm, weight_kg, goal):
    if not all([age, gender, height_cm, weight_kg, goal]):
        return 2000  # fallback

    gender = gender.upper()
    goal = goal.lower()

    if gender == 'M':
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    elif gender == 'F':
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
    else:
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age

    if goal == "lose_weight":
        return round(bmr * 0.8)
    elif goal == "gain_muscle":
        return round(bmr * 1.2)
    else:  # stay_fit
        return round(bmr)
