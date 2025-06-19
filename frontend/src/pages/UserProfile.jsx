import React, { useEffect, useState } from "react";
import axios from "../api/axios"; // shared Axios instance with token
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [form, setForm] = useState({
    age: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
    goal: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const genderOptions = [
    { label: "Male", value: "M" },
    { label: "Female", value: "F" },
    { label: "Other", value: "O" },
  ];

  const goalOptions = [
    { label: "Lose Weight", value: "lose_weight" },
    { label: "Gain Muscle", value: "gain_muscle" },
    { label: "Stay Fit", value: "stay_fit" },
  ];

  useEffect(() => {
    axios
      .get("/api/users/profile/")
      .then((res) => {
        setForm(res.data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load profile. Make sure you're logged in.");
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await axios.put("/api/users/profile/", form);
      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to update profile.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-100 to-emerald-200 dark:from-gray-900 dark:to-gray-800 px-4 py-10">
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-green-700 dark:text-green-400">Your Profile</h2>

        {message && <p className="text-green-600 dark:text-green-300 text-center">{message}</p>}
        {error && <p className="text-red-600 dark:text-red-400 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Age</label>
            <input
              type="number"
              name="age"
              value={form.age || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Gender</label>
            <select
              name="gender"
              value={form.gender || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select</option>
              {genderOptions.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Height (cm)</label>
            <input
              type="number"
              name="height_cm"
              value={form.height_cm || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Weight (kg)</label>
            <input
              type="number"
              name="weight_kg"
              value={form.weight_kg || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Goal</label>
            <select
              name="goal"
              value={form.goal || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select</option>
              {goalOptions.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
