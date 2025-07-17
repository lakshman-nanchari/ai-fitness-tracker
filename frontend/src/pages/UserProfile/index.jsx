import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import { UserCircle, BarChart3, Settings, CheckCircle } from "lucide-react";
import OverviewTab from "./OverviewTab";
import EditProfileTab from "./EditProfileTab";
import StatsTab from "./StatsTab";
import FitnessGoalPage from "./FitnessGoalPage";
import { motion, AnimatePresence } from "framer-motion";

const tabs = [
  { key: "profile", label: "Profile", icon: <UserCircle /> },
  { key: "edit", label: "Edit", icon: <Settings /> },
  { key: "stats", label: "Progress", icon: <BarChart3 /> },
  { key: "goals", label: "Goals", icon: <CheckCircle /> },
];

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("profile");
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

  useEffect(() => {
    axios
      .get("/api/users/profile/")
      .then((res) => {
        const { username, email, ...profile } = res.data || {};
        setUser({ username, email });
        setForm(profile);
      })
      .catch(() => setError("Failed to load profile."));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put("/api/users/profile/", form);
      setMessage("✅ Profile updated successfully!");
      setError("");
    } catch {
      setError("❌ Failed to update profile.");
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 shadow-xl p-6 hidden md:flex flex-col">
        <h2 className="text-3xl font-bold mb-6 text-emerald-600 dark:text-emerald-400">FitTrack</h2>
        <nav className="space-y-4">
          {tabs.map((tab) => (
            <motion.button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-3 p-2 rounded-md w-full text-left font-medium transition-all duration-300 ${
                activeTab === tab.key
                  ? "bg-emerald-500 text-white shadow"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {tab.icon} {tab.label}
            </motion.button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-x-hidden">
        <motion.h1
          className="text-3xl font-bold mb-6 text-gray-800 dark:text-white"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome, {user.username}
        </motion.h1>

        <AnimatePresence mode="wait">
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              <OverviewTab user={user} form={form} />
            </motion.div>
          )}

          {activeTab === "edit" && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              <EditProfileTab
                form={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                message={message}
                error={error}
              />
            </motion.div>
          )}

          {activeTab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              <StatsTab />
            </motion.div>
          )}

          {activeTab === "goals" && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              <FitnessGoalPage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default UserProfile;
