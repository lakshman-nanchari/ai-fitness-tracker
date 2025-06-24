import React, { useState, useEffect } from "react";
import axios from "../api/axios"; // make sure this is your configured axios instance
import { Loader2, Trash2, Sparkles } from "lucide-react";

const MealPlanner = () => {
  const [preferences, setPreferences] = useState({
    dietary_restrictions: "",
    calorie_target: "",
    meals_per_day: 3,
    additional_notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState("");

  // Fetch saved plans from backend
  const fetchPlans = async () => {
    try {
      const res = await axios.get("/api/meal-plans/");
      setPlans(res.data);
    } catch (err) {
      setError("Failed to load meal plans.");
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setPreferences({ ...preferences, [e.target.name]: e.target.value });
  };

  // Generate a new plan
  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/meal-plans/generate/", preferences);
      fetchPlans();
    } catch (err) {
      setError("Failed to generate meal plan.");
    } finally {
      setLoading(false);
    }
  };

  // Delete a plan
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/meal-plans/${id}/`);
      setPlans(plans.filter((plan) => plan.id !== id));
    } catch (err) {
      setError("Failed to delete meal plan.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">🍽️ Meal Planner</h1>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <input
          type="text"
          name="dietary_restrictions"
          placeholder="Dietary Restrictions (e.g. vegan, keto)"
          className="w-full border border-gray-300 rounded p-2"
          value={preferences.dietary_restrictions}
          onChange={handleChange}
        />
        <input
          type="number"
          name="calorie_target"
          placeholder="Calorie Target (e.g. 2000)"
          className="w-full border border-gray-300 rounded p-2"
          value={preferences.calorie_target}
          onChange={handleChange}
        />
        <input
          type="number"
          name="meals_per_day"
          placeholder="Meals Per Day"
          className="w-full border border-gray-300 rounded p-2"
          value={preferences.meals_per_day}
          onChange={handleChange}
        />
        <textarea
          name="additional_notes"
          placeholder="Any additional notes..."
          className="w-full border border-gray-300 rounded p-2"
          rows={3}
          value={preferences.additional_notes}
          onChange={handleChange}
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center"
        >
          {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
          Generate Meal Plan
        </button>
      </div>

      {/* Error */}
      {error && <p className="text-red-600 text-center">{error}</p>}

      {/* Saved Plans */}
      <div className="space-y-4">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white border border-gray-200 rounded-lg shadow p-4 relative">
            <button
              onClick={() => handleDelete(plan.id)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <h3 className="font-semibold text-lg mb-2">Plan #{plan.id}</h3>
            <pre className="whitespace-pre-wrap text-sm text-gray-700">{plan.plan}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MealPlanner;
