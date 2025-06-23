import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import { UserCircle, BarChart3, Settings } from "lucide-react";
import OverviewTab from "./OverviewTab";
import EditProfileTab from "./EditProfileTab";
import StatsTab from "./StatsTab";

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
    axios.get("/api/users/profile/")
      .then(res => {
        const { username, email, ...profile } = res.data || {};
        setUser({ username, email });
        setForm(profile);
      })
      .catch(() => setError("Failed to load profile."));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
        <h2 className="text-2xl font-bold mb-6">FitTrack</h2>
        <nav className="space-y-4">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-3 p-2 rounded-md ${activeTab === "profile" ? 'bg-green-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <UserCircle /> Profile
          </button>
          <button
            onClick={() => setActiveTab("edit")}
            className={`flex items-center gap-3 p-2 rounded-md ${activeTab === "edit" ? 'bg-green-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <Settings /> Edit
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex items-center gap-3 p-2 rounded-md ${activeTab === "stats" ? 'bg-green-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <BarChart3 /> Progress
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-4">Welcome, {user.username}</h1>

        {activeTab === "profile" && <OverviewTab user={user} form={form} />}
        {activeTab === "edit" && (
          <EditProfileTab
            form={form}
            onChange={handleChange}
            onSubmit={handleSubmit}
            message={message}
            error={error}
          />
        )}
        {activeTab === "stats" && <StatsTab />}
      </main>
    </div>
  );
};

export default UserProfile;
