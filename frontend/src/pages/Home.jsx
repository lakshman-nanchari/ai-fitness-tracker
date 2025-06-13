// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section with Full Background Image */}
      <div className="relative h-[90vh] bg-cover bg-no-repeat bg-center text-white flex items-center justify-center px-8"
        style={{ backgroundImage: "url('/images/gym/3d-gym-equipment.jpg')" }}
      >
        
        <div className="relative z-10 text-center max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to FitTrack</h1>
          <p className="text-lg md:text-xl font-light mb-6">
            Your AI-powered personal trainer and diet planner.
          </p>
          <Link
            to="/register"
            className="bg-white text-indigo-600 font-semibold py-2 px-6 rounded-full shadow-lg hover:bg-gray-100 transition"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Why Choose FitTrack?</h2>
          <p className="mt-4 text-lg text-gray-600">Experience smart fitness, personalized workouts, and real-time health insights with our AI-powered tools.</p>
        </div>

        <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {features.map(({ title, desc, icon }) => (
            <div
              key={title}
              className="bg-white rounded-xl shadow-lg overflow-hidden transition hover:shadow-xl"
            >
              {/* Top Image Section */}
              <div
                className="h-50 bg-cover bg-center"
                style={{ backgroundImage: `url(${icon})` }}
              />

              {/* Text Content Section */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">{title}</h3>
                <p className="text-gray-600 text-center">{desc}</p>
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
    icon: "/images/gym/smartDiet.jpg", // Use local optimized PNGs here
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
