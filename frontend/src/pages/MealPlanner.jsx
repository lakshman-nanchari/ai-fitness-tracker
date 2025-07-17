import React, { useState } from "react";
import axios from "../api/axios";
import { Loader2, Trash2, Sparkles, FolderOpen } from "lucide-react";

const MealPlanner = () => {
  const [preferences, setPreferences] = useState({
    diet_type: "",
    meals_per_day: 3,
    allergies: "",
    location: "",
  });

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");

  const fetchPlans = async () => {
    setError("");
    try {
      const res = await axios.get("/api/diet/meal-plans/");
      setPlan(res.data);
    } catch (err) {
      setError("Failed to load meal plan.");
    }
  };

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
      await axios.post("/api/diet/meal-plans/", preferences);
      await fetchPlans();
    } catch (err) {
      setError("Failed to generate meal plan.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/diet/meal-plans/${id}/`);
      setPlan(null);
    } catch (err) {
      setError("Failed to delete meal plan.");
    }
  };

  const getEmoji = (title) => {
    title = title.toLowerCase();
    if (title.includes("breakfast")) return "🍳";
    if (title.includes("lunch")) return "🥗";
    if (title.includes("dinner")) return "🍛";
    if (title.includes("snack")) return "🍪";
    return "🍽️";
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-center text-emerald-400">🥗 Meal Planner</h1>

        {/* Preferences Form */}
        <div className="bg-gray-800 border border-gray-700 shadow-xl rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-semibold text-white">Your Preferences</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="diet_type"
              className="bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={preferences.diet_type}
              onChange={handleChange}
            >
              <option value="">Choose a Diet Type (optional)</option>
              <option value="vegan">Vegan</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="indian nonveg">Indian Non-Veg</option>
              <option value="non-veg">Non-Veg</option>
              <option value="keto">Keto</option>
            </select>

            <select
              name="meals_per_day"
              className="bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              className="bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={preferences.allergies}
              onChange={handleChange}
            />

            <input
              type="text"
              name="location"
              placeholder="Location (e.g. India, USA)"
              className="bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={preferences.location}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white font-semibold px-6 py-3 rounded-lg flex items-center justify-center w-full md:w-fit transition"
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
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center justify-center w-full md:w-fit transition"
            >
              <FolderOpen className="h-5 w-5 mr-2" />
              Load My Saved Plan
            </button>
          </div>

          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        {/* Meal Plan Display */}
        {loading ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Generating Your Plan...</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className="animate-pulse bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-6 space-y-4"
                >
                  <div className="h-5 w-32 bg-gray-700 rounded-md" />
                  <div className="h-20 bg-gray-700 rounded-md" />
                  <div className="h-20 bg-gray-700 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        ) : plan && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Your Saved Plan</h2>

            <div className="flex justify-end mb-4">
              <button
                onClick={() => handleDelete(plan.id)}
                className="text-sm text-red-400 hover:text-red-600 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete Plan
              </button>
            </div>

            {(() => {
              const mealEntries = Object.entries(plan.meals).filter(([title]) => title !== "total_calories");
              let extractedNote = "";

              mealEntries.forEach(([title, meal]) => {
                if (typeof meal?.instructions === "string") {
                  const noteMatch = meal.instructions.match(/(Note:.*)$/i);
                  if (noteMatch) {
                    extractedNote = noteMatch[1];
                    meal.instructions = meal.instructions.replace(noteMatch[1], "").trim();
                  }
                }
              });

              return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mealEntries.map(([title, meal], index) => {
                      const emoji = getEmoji(title);
                      return (
                        <div
                          key={`${plan.id}-${index}`}
                          className="bg-gray-800 border border-gray-600 rounded-2xl shadow-xl p-6 space-y-4"
                        >
                          <h3 className="text-lg font-semibold text-amber-300">
                            {emoji} {title}
                          </h3>

                          {meal.calories && (
                            <p className="text-sm text-white/80">
                              <span className="font-semibold text-green-400">Calories:</span> {meal.calories}
                            </p>
                          )}

                          {meal.ingredients && (
                            <p className="text-sm text-white/80">
                              <span className="font-semibold text-blue-400">Ingredients:</span> {meal.ingredients}
                            </p>
                          )}

                          {meal.instructions && (
                            <p className="text-sm text-white/90 leading-relaxed">
                              <span className="font-semibold text-yellow-400 block mb-1">Preparation:</span>
                              {meal.instructions}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {extractedNote && (
                    <div className="bg-yellow-900/40 border border-yellow-600 rounded-xl p-5 mt-6 shadow-lg text-sm text-yellow-100">
                      <strong className="block mb-2 text-yellow-300">📌 Note:</strong>
                      <p>{extractedNote}</p>
                    </div>
                  )}

                  {plan.meals?.total_calories && (
                    <p className="text-right text-sm text-white/70 mt-4">
                      <span className="font-semibold text-pink-400">Total Calories:</span> {plan.meals.total_calories}
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlanner;
