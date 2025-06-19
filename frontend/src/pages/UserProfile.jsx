import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { UserCircle, BarChart3, Settings, Save } from "lucide-react";

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

  const Info = ({ label, value }) => (
    <div className="flex justify-between p-3 bg-white dark:bg-gray-800 rounded shadow">
      <span className="font-semibold text-gray-600 dark:text-gray-300">{label}</span>
      <span className="text-gray-900 dark:text-gray-100">{value || "—"}</span>
    </div>
  );

  const Input = ({ label, name, type = "text", value, onChange }) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full p-2 rounded-md border bg-white dark:bg-gray-800 dark:text-white"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-white flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 shadow-xl p-6 hidden md:flex flex-col">
        <h2 className="text-2xl font-bold mb-6">FitTrack</h2>
        <nav className="space-y-4">
          <button onClick={() => setActiveTab("profile")} className={`flex items-center gap-3 p-2 rounded-md ${activeTab === "profile" ? 'bg-green-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <UserCircle /> Profile
          </button>
          <button onClick={() => setActiveTab("edit")} className={`flex items-center gap-3 p-2 rounded-md ${activeTab === "edit" ? 'bg-green-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <Settings /> Edit
          </button>
          <button onClick={() => setActiveTab("stats")} className={`flex items-center gap-3 p-2 rounded-md ${activeTab === "stats" ? 'bg-green-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <BarChart3 /> Progress
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-4">Welcome, {user.username}</h1>

        {/* Tabs */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Profile Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Info label="Email" value={user.email} />
              <Info label="Age" value={form.age} />
              <Info label="Gender" value={form.gender} />
              <Info label="Height (cm)" value={form.height_cm} />
              <Info label="Weight (kg)" value={form.weight_kg} />
              <Info label="Goal" value={form.goal} />
            </div>
          </div>
        )}

        {activeTab === "edit" && (
          <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
            <h2 className="text-xl font-semibold">Edit Your Profile</h2>
            {message && <p className="text-green-600 dark:text-green-300">{message}</p>}
            {error && <p className="text-red-600 dark:text-red-300">{error}</p>}

            <Input label="Age" name="age" type="number" value={form.age} onChange={handleChange} />
            <Input label="Gender" name="gender" value={form.gender} onChange={handleChange} />
            <Input label="Height (cm)" name="height_cm" type="number" value={form.height_cm} onChange={handleChange} />
            <Input label="Weight (kg)" name="weight_kg" type="number" value={form.weight_kg} onChange={handleChange} />
            <Input label="Goal" name="goal" value={form.goal} onChange={handleChange} />

            <button type="submit" className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2">
              <Save className="w-5 h-5" /> Save Changes
            </button>
          </form>
        )}

        {activeTab === "stats" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Progress (Coming Soon)</h2>
            <p className="text-gray-500">Your workout and nutrition stats will appear here.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserProfile;
