import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { User, Mail, Save, BadgeInfo } from "lucide-react";

const UserProfile = () => {
  const [form, setForm] = useState({
    age: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
    goal: "",
  });

  const [user, setUser] = useState({ username: "", email: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const genderLabels = { M: "Male", F: "Female", O: "Other" };
  const goalLabels = {
    lose_weight: "Lose Weight",
    gain_muscle: "Gain Muscle",
    stay_fit: "Stay Fit",
  };

  useEffect(() => {
    axios
      .get("/api/users/profile/")
      .then((res) => {
        const { username, email, ...profile } = res.data || {};
        setUser({ username: username || "", email: email || "" });
        setForm(profile || {});
      })
      .catch((err) => {
        console.error(err);
        if (err.response?.status === 401) navigate("/auth");
        else setError("Failed to load profile.");
      });
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await axios.put("/api/users/profile/", form);
      setMessage("✅ Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setError("❌ Failed to update profile.");
    }
  };

  const infoField = (label, value, transform) => (
    <div className="flex justify-between border-b py-2 text-sm sm:text-base">
      <span className="text-gray-600 dark:text-gray-400 font-medium">{label}:</span>
      <span className="text-gray-900 dark:text-gray-100 font-semibold">
        {value ? (transform ? transform(value) : value) : label}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-100 to-emerald-200 dark:from-gray-900 dark:to-gray-800 px-6 py-10">
      <div className="w-full max-w-5xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Panel: User Info */}
        <div className="md:w-1/2 p-6 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
          <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-6 flex items-center gap-2">
            <User className="w-6 h-6" /> Profile Overview
          </h2>

          <div className="space-y-1 text-gray-800 dark:text-gray-100">
            {infoField("Username", user.username)}
            {infoField("Email", user.email)}
            {infoField("Age", form.age)}
            {infoField("Gender", form.gender, (val) => genderLabels[val] || val)}
            {infoField("Height (cm)", form.height_cm)}
            {infoField("Weight (kg)", form.weight_kg)}
            {infoField("Goal", form.goal, (val) => goalLabels[val] || val)}
          </div>
        </div>

        {/* Right Panel: Form */}
        <div className="md:w-1/2 p-6">
          <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-6">Edit Profile</h2>

          {message && <p className="text-green-600 dark:text-green-300 mb-3">{message}</p>}
          {error && <p className="text-red-600 dark:text-red-400 mb-3">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-1">Age</label>
              <input
                type="number"
                name="age"
                placeholder="e.g. 25"
                value={form.age || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Gender</label>
              <select
                name="gender"
                value={form.gender || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border dark:bg-gray-800 dark:text-white bg-white"
              >
                <option value="">Select Gender</option>
                {Object.entries(genderLabels).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Height (cm)</label>
              <input
                type="number"
                name="height_cm"
                placeholder="e.g. 170"
                value={form.height_cm || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Weight (kg)</label>
              <input
                type="number"
                name="weight_kg"
                placeholder="e.g. 65"
                value={form.weight_kg || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Goal</label>
              <select
                name="goal"
                value={form.goal || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border dark:bg-gray-800 dark:text-white bg-white"
              >
                <option value="">Select Goal</option>
                {Object.entries(goalLabels).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
              >
                <Save className="w-5 h-5" /> Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
