import React, { useEffect, useState } from "react";
import axios from "../../api/axios"; // adjust path if needed
import { Loader2 } from "lucide-react";

const GoalItem = ({ label, value, goal }) => {
  const percent = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  const isCompleted = value >= goal;

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm font-medium">
        <span>{label}</span>
        <span>
          {value} / {goal}
        </span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-xl mt-1 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-xl ${
            isCompleted ? "bg-green-500" : "bg-blue-500"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

const FitnessGoalPage = () => {
  const [goal, setGoal] = useState(null);
  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [goalRes, todayRes] = await Promise.all([
          axios.get("/api/stats/fitness-goal/goal-view/"),
          axios.get("/api/stats/today/"),
        ]);
        setGoal(goalRes.data);
        setToday(todayRes.data);
      } catch (err) {
        console.error("Error fetching goal or today’s stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
      </div>
    );
  }

  if (!goal || !today) {
    return (
      <div className="text-center text-gray-500 mt-10">
        No goal or today’s data found.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Your Daily Goals</h2>

        <GoalItem label="Steps" value={today.steps} goal={goal.step_goal} />
        <GoalItem label="Calories" value={today.calories} goal={goal.calorie_goal} />
        <GoalItem label="Water (L)" value={today.water_intake_liters} goal={goal.water_goal} />
        <GoalItem label="Sleep (hrs)" value={today.sleep_hours} goal={goal.sleep_goal} />
      </div>
    </div>
  );
};

export default FitnessGoalPage;
