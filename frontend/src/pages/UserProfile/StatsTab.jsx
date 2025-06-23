import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from "recharts";

const TARGETS = {
  steps: 10000,
  calories: 2000,
  water: 3,
  sleep: 8,
};

const metricLabels = {
  steps: "Steps",
  calories: "Calories Burned",
  water_intake_liters: "Water (L)",
  sleep_hours: "Sleep (hrs)",
};

const ProgressBar = ({ label, value, target }) => {
  const percent = Math.min((value / target) * 100, 100);
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm font-medium mb-1">
        <span>{label}</span>
        <span>{value} / {target}</span>
      </div>
      <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
        <div
          style={{ width: `${percent}%` }}
          className="h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
        />
      </div>
    </div>
  );
};

const StatsTab = () => {
  const [today, setToday] = useState({});
  const [dailyData, setDailyData] = useState([]);
  const [weekly, setWeekly] = useState({});
  const [monthly, setMonthly] = useState({});
  const [activeTab, setActiveTab] = useState("daily");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [t, d, w, m] = await Promise.all([
        axios.get("/api/stats/today/"),
        axios.get("/api/stats/daily/"),
        axios.get("/api/stats/weekly/"),
        axios.get("/api/stats/monthly/"),
      ]);
      setToday(t.data);
      setDailyData(d.data);
      setWeekly(w.data);
      setMonthly(m.data);
    } catch {
      setErr("Failed to load stats.");
    }
  };

  const saveToday = async () => {
    try {
      await axios.post("/api/stats/daily-stats/", today);
      setMsg("👍 Saved!");
      setErr("");
      fetchStats();
    } catch {
      setErr("❌ Save failed.");
      setMsg("");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📊 Fitness Dashboard</h2>

      {msg && <p className="text-green-600">{msg}</p>}
      {err && <p className="text-red-600">{err}</p>}

      {/* Today's Inputs */}
      <div>
        <h3 className="text-xl font-semibold mb-2">📆 Today's Stats</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.keys(metricLabels).map(key => (
            <div key={key}>
              <label className="block mb-1 text-sm">{metricLabels[key]}</label>
              <input
                type="number"
                value={today[key] ?? ""}
                onChange={e => setToday(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
              />
            </div>
          ))}
        </div>
        <button
          onClick={saveToday}
          className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Save
        </button>
      </div>

      {/* Progress Bars */}
      <div>
        <h3 className="text-xl font-semibold mb-2">🎯 Progress Today</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Object.entries(TARGETS).map(([k, tgt]) => (
            <ProgressBar
              key={k}
              label={metricLabels[k]}
              value={+today[k] || 0}
              target={tgt}
            />
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mt-6">
        {["daily", "weekly", "monthly"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Chart View */}
      {activeTab === "daily" && dailyData.length > 0 && (
        <div className="mt-6">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="steps" stroke="#22c55e" name="Steps" />
              <Line dataKey="water_intake_liters" stroke="#3b82f6" name="Water (L)" />
              <Line dataKey="sleep_hours" stroke="#8b5cf6" name="Sleep (hrs)" />
              <Line dataKey="calories" stroke="#f59e0b" name="Calories" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === "weekly" && dailyData.length > 0 && (
        <div className="mt-6">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="steps" fill="#22c55e" name="Steps" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === "monthly" && monthly && (
        <div className="mt-6">
          <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
            <Info label="Steps" value={monthly.total_steps} />
            <Info label="Calories" value={monthly.total_calories} />
            <Info label="Avg Sleep" value={monthly.average_sleep_hours} />
            <Info label="Water (L)" value={monthly.total_water_intake} />
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsTab;
