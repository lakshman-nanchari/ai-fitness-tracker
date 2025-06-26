import React, { useState } from "react";
import axios from "../api/axios";
import { Loader2, Trash2, Sparkles, FolderOpen } from "lucide-react";

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
    setError("");
    try {
      const res = await axios.get("/api/diet/meal-plans/");
      setPlans(res.data);
    } catch (err) {
      setError("Failed to load meal plans.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = {
      ...preferences,
      [name]: name === "meals_per_day" ? parseInt(value) : value,
    };

    if (name === "diet_type") {
      const defaultCalories = {
        vegan: 1800,
        vegetarian: 2000,
        "indian nonveg": 2200,
        keto: 2100,
        "non-veg": 1900,
      };
      updated.calories_per_day = defaultCalories[value.toLowerCase()] || "";
    }

    setPreferences(updated);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/diet/meal-plans/", preferences);
      fetchPlans();
    } catch (err) {
      setError("Failed to generate meal plan.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/diet/meal-plans/${id}/`);
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
            <div className="space-y-2">
              <input
                name="diet_type"
                placeholder="Diet Type (e.g. vegan, keto)"
                className="dark-input"
                value={preferences.diet_type}
                onChange={handleChange}
              />
              <select
                className="dark-input"
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    diet_type: e.target.value,
                    calories_per_day:
                      {
                        vegan: 1800,
                        vegetarian: 2000,
                        "indian nonveg": 2200,
                        "non-veg": 1900,
                        keto: 2100,
                      }[e.target.value] || "",
                  }))
                }
              >
                <option value="">Choose a Diet (optional)</option>
                <option value="vegan">Vegan</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="indian nonveg">Indian Non-Veg</option>
                <option value="non-veg">Non-Veg</option>
                <option value="keto">Keto</option>
              </select>
            </div>

            <input
              type="number"
              name="calories_per_day"
              placeholder="Calories per Day"
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

          <div className="flex flex-col md:flex-row gap-4">
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

            <button
              onClick={fetchPlans}
              className="bg-gray-700 text-white px-5 py-3 rounded-lg flex items-center justify-center w-full md:w-fit hover:bg-gray-600"
            >
              <FolderOpen className="h-5 w-5 mr-2" />
              Load My Saved Plans
            </button>
          </div>

          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        {/* Saved Plans */}
        {plans.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4 text-white">Your Saved Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan) => {
                const sections = plan.plan_text.split(/\n(?=\*\*.*\*\*:)/g);

                return (
                  <div
                    key={plan.id}
                    className="bg-gray-800 border border-gray-600 rounded-2xl shadow-xl p-6 relative space-y-4"
                  >
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="absolute top-3 right-3 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    {sections.map((section, index) => {
                      const match = section.match(/\*\*(.*?)\*\*:/);
                      const title = match ? match[1] : `Meal ${index + 1}`;
                      const emoji = title.toLowerCase().includes("breakfast")
                        ? "🍳"
                        : title.toLowerCase().includes("lunch")
                        ? "🥗"
                        : title.toLowerCase().includes("dinner")
                        ? "🍛"
                        : title.toLowerCase().includes("snack")
                        ? "🍪"
                        : "🍽️";

                      return (
                        <div
                          key={`${plan.id}-${index}`}
                          className="bg-gray-700 border border-gray-500 rounded-xl p-4"
                        >
                          <h3 className="text-md font-semibold text-purple-300 mb-2">
                            {emoji} {title}
                          </h3>
                          <pre className="whitespace-pre-wrap text-sm text-white/90 bg-gray-900 p-3 rounded-md leading-relaxed">
                            {section.trim()}
                          </pre>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlanner;
