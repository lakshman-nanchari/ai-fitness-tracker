import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { Loader2, Trash2, Sparkles } from "lucide-react";

const MealPlanner = () => {
  const [preferences, setPreferences] = useState({
    diet_type: "",
    calories_per_day: "",
    meals_per_day: 3,
    allergies: "",
    goal: "",
  });

  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState("");

  const fetchPlans = async () => {
    try {
      const res = await axios.get("/api/meal/meal-plans/");
      setPlans(res.data);
    } catch (err) {
      setError("Failed to load meal plans.");
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: name === "meals_per_day" ? parseInt(value) : value,
    }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/meal/meal-plans/", preferences);
      fetchPlans();
    } catch (err) {
      setError("Failed to generate meal plan.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/meal/meal-plans/${id}/`);
      setPlans((prev) => prev.filter((plan) => plan.id !== id));
    } catch (err) {
      setError("Failed to delete meal plan.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-center">🥗 AI-Powered Meal Planner</h1>

        {/* Preferences Form */}
        <div className="bg-gray-800 shadow-xl rounded-2xl p-8 space-y-6 border border-gray-700">
          <h2 className="text-2xl font-semibold text-white">Your Preferences</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="diet_type"
              className="dark-input"
              value={preferences.diet_type}
              onChange={handleChange}
            >
              <option value="">Select Diet Type</option>
              <option value="vegan">Vegan</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="indian nonveg">Indian Non-Veg</option>
              <option value="keto">Keto</option>
            </select>

            <input
              type="number"
              name="calories_per_day"
              placeholder="Calories per Day (e.g. 2000)"
              className="dark-input"
              value={preferences.calories_per_day}
              onChange={handleChange}
            />

            <select
              name="meals_per_day"
              className="dark-input"
              value={preferences.meals_per_day}
              onChange={handleChange}
            >
              <option value={3}>3 Meals/Day (Standard)</option>
              <option value={5}>5 Meals/Day (Includes Snacks)</option>
            </select>

            <input
              type="text"
              name="allergies"
              placeholder="Allergies (comma separated)"
              className="dark-input"
              value={preferences.allergies}
              onChange={handleChange}
            />

            <select
              name="goal"
              className="dark-input col-span-1 md:col-span-2"
              value={preferences.goal}
              onChange={handleChange}
            >
              <option value="">Select Goal</option>
              <option value="weight loss">Weight Loss</option>
              <option value="muscle gain">Muscle Gain</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold px-5 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-600 flex items-center justify-center w-full md:w-fit"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
            ) : (
              <Sparkles className="h-5 w-5 mr-2" />
            )}
            Generate Meal Plan
          </button>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {/* Saved Plans */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4 text-white">Your Saved Plans</h2>
          {plans.length === 0 ? (
            <p className="text-gray-400 text-center">No meal plans yet. Generate one!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const mealSections = plan.plan_text.split(/(?=Breakfast:|Lunch:|Dinner:|Snack:|Morning Snack:|Evening Snack:)/gi);
                return mealSections.map((mealText, index) => {
                  let label = mealText.match(/^[^:]+:/i)?.[0] || `Meal ${index + 1}`;
                  let emoji = label.toLowerCase().includes("breakfast")
                    ? "🍳"
                    : label.toLowerCase().includes("lunch")
                    ? "🥗"
                    : label.toLowerCase().includes("dinner")
                    ? "🍛"
                    : "🍽️";

                  return (
                    <div
                      key={`${plan.id}-${index}`}
                      className="bg-gray-700 border border-gray-600 rounded-2xl shadow-lg p-5 relative hover:scale-[1.01] transition-transform"
                    >
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="absolute top-3 right-3 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <h3 className="text-lg font-semibold text-purple-300 mb-2">
                        {emoji} {label.replace(":", "")}
                      </h3>
                      <pre className="whitespace-pre-wrap text-sm text-white/90 bg-gray-800 p-3 rounded-md leading-relaxed">
                        {mealText.trim()}
                      </pre>
                    </div>
                  );
                });
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealPlanner;
