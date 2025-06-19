import React from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Salad, UserCircle2 } from "lucide-react";

const LoginSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-lime-100 to-emerald-200 dark:from-gray-900 dark:to-gray-800 px-6">
      <div className="text-center max-w-xl">
        <h1 className="text-4xl font-extrabold text-green-800 dark:text-green-400 mb-4">
          Welcome Back to FitTrack!
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 italic">
          “Your health is an investment, not an expense.”
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition"
          >
            <Dumbbell className="w-5 h-5" />
            Start Workout
          </button>

          <button
            onClick={() => navigate("/diet")}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-300 transition dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            <Salad className="w-5 h-5" />
            View Diet Plan
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition"
          >
            <UserCircle2 className="w-5 h-5" />
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginSuccess;
