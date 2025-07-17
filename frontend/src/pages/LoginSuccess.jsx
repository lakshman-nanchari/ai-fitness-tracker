import React from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Salad, UserCircle2, LogOut } from "lucide-react";

const LoginSuccess = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-100 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center transition-all duration-300">
        <h1 className="text-4xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
          Welcome Back to <span className="text-emerald-600 dark:text-emerald-300">FitTrack</span>!
        </h1>
        <p className="text-md text-gray-600 dark:text-gray-300 italic mb-6">
          “Your health is an investment, not an expense.”
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-2 shadow transition-all"
          >
            <Dumbbell className="w-5 h-5" />
            Start Workout
          </button>

          <button
            onClick={() => navigate("/meal-planner")}
            className="px-6 py-3 bg-amber-200 text-amber-800 hover:bg-amber-300 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 rounded-lg flex items-center justify-center gap-2 shadow transition-all"
          >
            <Salad className="w-5 h-5" />
            View Diet Plan
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 shadow transition-all"
          >
            <UserCircle2 className="w-5 h-5" />
            View Profile
          </button>

          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center gap-2 shadow transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginSuccess;
