import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const Info = ({ label, value }) => (
  <div className="flex justify-between p-3 bg-white dark:bg-gray-800 rounded shadow">
    <span className="font-semibold text-gray-600 dark:text-gray-300">{label}</span>
    <span className="text-gray-900 dark:text-gray-100">{value || "—"}</span>
  </div>
);

const StatsTab = () => {
  const [todayStat, setTodayStat] = useState({
    steps: "",
    calories: "",
    water_intake_liters: "",
    sleep_hours: "",
  });
  const [summary, setSummary] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTodayStat();
    fetchSummary();
  }, []);

  const fetchTodayStat = async () => {
    try {
      const res = await axios.get("/api/stats/today/");
      setTodayStat(res.data);
    } catch {
      setTodayStat({
        steps: "",
        calories: "",
        water_intake_liters: "",
        sleep_hours: "",
      });
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await axios.get("/api/stats/summary/");
      setSummary(res.data);
    } catch {
      setSummary({});
    }
  };

  const handleStatSubmit = async () => {
    try {
      await axios.post("/api/stats/daily-stats/", todayStat);
      setMessage("✅ Stat saved successfully!");
      setError("");
      fetchTodayStat();
      fetchSummary();
    } catch {
      setError("❌ Failed to save stat.");
      setMessage("");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Today's Stat</h2>

      {message && <p className="text-green-600 dark:text-green-300">{message}</p>}
      {error && <p className="text-red-600 dark:text-red-300">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {["steps", "calories", "water_intake_liters", "sleep_hours"].map((field) => (
          <div key={field}>
            <label className="block text-sm mb-1 capitalize">{field.replace(/_/g, " ")}</label>
            <input
              type="number"
              name={field}
              value={todayStat[field] || ""}
              onChange={(e) => setTodayStat({ ...todayStat, [field]: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleStatSubmit}
        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
      >
        Save Today's Stat
      </button>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">7-Day Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Info label="Total Steps" value={summary.total_steps} />
          <Info label="Total Calories" value={summary.total_calories} />
          <Info label="Avg Sleep Hours" value={summary.average_sleep_hours} />
        </div>
      </div>
    </div>
  );
};

export default StatsTab;
