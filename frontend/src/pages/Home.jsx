// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSun, FaMoon } from "react-icons/fa";

const Home = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div className="bg-white dark:bg-black min-h-screen text-gray-900 dark:text-white transition duration-500">

      {/* Hero Section */}
      <div
        className="relative h-[90vh] bg-cover bg-center flex items-center justify-center px-6"
        style={{ backgroundImage: "url('/images/gym/3d-gym-equipment.jpg')" }}
      >
        {/* Theme Toggle Inside Hero - top-right corner */}
        <div className="absolute top-6 right-6">
          <button
            onClick={() => setIsDark(!isDark)}
            className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:scale-110 transition"
          >
            {isDark ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-black" />}
          </button>
        </div>

        {/* Centered Hero Content */}
        <div className="bg-black/50 p-10 rounded-xl text-center max-w-2xl backdrop-blur-sm">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">Welcome to FitTrack</h1>
          <p className="text-lg md:text-xl font-light mb-6 text-gray-200">
            Your AI-powered personal trainer and diet planner.
          </p>
          <Link
            to="/register"
            className="bg-yellow-400 dark:bg-purple-600 text-black dark:text-white font-semibold py-2 px-6 rounded-full hover:bg-yellow-500 dark:hover:bg-purple-700 transition"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white">
            Why Choose FitTrack?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Smart fitness, personalized workouts, and real-time health insights powered by AI.
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {features.map(({ title, desc, icon }) => (
            <div
              key={title}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden transition hover:shadow-xl"
            >
              <div
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${icon})` }}
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white">
                  {title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const features = [
  {
    title: "Smart Diet Plans",
    desc: "AI-generated personalized meal plans with calorie tracking.",
    icon: "/images/gym/smartDiet.jpg",
  },
  {
    title: "Workout Tracking",
    desc: "Log workouts and track progress with your virtual trainer.",
    icon: "/images/gym/workoutTracking.jpg",
  },
  {
    title: "Health Insights",
    desc: "Get daily AI feedback and progress summaries to stay on track.",
    icon: "/images/gym/healthInsights.jpg",
  },
];

export default Home;
