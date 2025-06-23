import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, Label
} from "recharts";
import { Flame, Droplet, Moon, Footprints } from "lucide-react";

const mockToday = {
  steps: 8700,
  calories: 1800,
  water_intake_liters: 2.5,
  sleep_hours: 6.5,
};

const mockDaily = Array.from({ length: 7 }, (_, i) => ({
  date: `Day ${i + 1}`,
  steps: 5000 + i * 500,
  calories: 1500 + i * 50,
  water_intake_liters: 2 + (i % 2) * 0.5,
  sleep_hours: 6 + (i % 3),
}));

const mockSummary = {
  weekly: {
    total_steps: 54000,
    total_calories: 13200,
    average_sleep_hours: 7.2,
    total_water_intake: 18.5,
  },
  monthly: {
    total_steps: 210000,
    total_calories: 56000,
    average_sleep_hours: 7.0,
    total_water_intake: 75,
  },
};

const TARGETS = {
  steps: 10000,
  calories: 2000,
  water_intake_liters: 3,
  sleep_hours: 8,
};

const icons = {
  steps: <Footprints className="w-4 h-4 inline mr-1" />,
  calories: <Flame className="w-4 h-4 inline mr-1" />,
  water_intake_liters: <Droplet className="w-4 h-4 inline mr-1" />,
  sleep_hours: <Moon className="w-4 h-4 inline mr-1" />,
};

const PIE_COLORS = ["#22c55e", "#f59e0b", "#8b5cf6", "#3b82f6"];

const ProgressCard = ({ metric, value, target }) => {
  const percent = Math.min((value / target) * 100, 100);
  const label = metric.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md text-center">
      <div className="text-sm font-medium mb-2">{icons[metric]} {label}</div>
      <div className="text-2xl font-bold text-blue-600">{value}</div>
      <div className="text-xs text-gray-500 mb-1">Goal: {target}</div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
        <div
          className="h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="flex justify-between text-sm py-1">
    <span>{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

const StatsTab = () => {
  const [today, setToday] = useState({});
  const [dailyData, setDailyData] = useState([]);
  const [summary, setSummary] = useState({});
  const [activeTab, setActiveTab] = useState("daily");

  useEffect(() => {
    setToday(mockToday);
    setDailyData(mockDaily);
    setSummary(mockSummary);
  }, []);

  const getPieData = (type) => {
    const data = summary[type] || {};
    const multiplier = type === "monthly" ? 30 : 7;

    return [
      { name: "Steps", value: data.total_steps || 0 },
      { name: "Calories", value: data.total_calories || 0 },
      { name: "Sleep (hrs)", value: (data.average_sleep_hours || 0) * multiplier },
      { name: "Water (L)", value: data.total_water_intake || 0 },
    ];
  };

  const renderPieChart = (type) => (
    <div>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={getPieData(type)}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={40}
            label={({ name, value, percent }) =>
              `${name}: ${value.toFixed(1)} (${(percent * 100).toFixed(1)}%)`
            }
            labelLine={false}
            minAngle={10}
          >
            {PIE_COLORS.map((color, index) => (
              <Cell key={index} fill={color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm space-y-2">
        <Info label="Steps" value={summary[type]?.total_steps ?? 0} />
        <Info label="Calories" value={summary[type]?.total_calories || 0} />
        <Info label="Avg Sleep" value={summary[type]?.average_sleep_hours || 0} />
        <Info label="Water (L)" value={summary[type]?.total_water_intake || 0} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center mb-4 text-gray-800 dark:text-white">
        📊 Your Fitness Dashboard
      </h2>

      {/* Streak Indicator */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-xl text-center shadow-md">
        <p className="text-lg font-semibold">🔥 5-Day Goal Streak</p>
        <p className="text-sm">Keep it going!</p>
      </div>

      {/* Progress Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.keys(TARGETS).map(key => (
          <ProgressCard
            key={key}
            metric={key}
            value={+today[key] || 0}
            target={TARGETS[key]}
          />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-3 mt-6">
        {["daily", "weekly", "monthly"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full font-medium text-sm transition ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Daily Line Chart */}
      {activeTab === "daily" && (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey="steps" stroke="#22c55e" />
            <Line dataKey="calories" stroke="#f59e0b" />
            <Line dataKey="sleep_hours" stroke="#8b5cf6" />
            <Line dataKey="water_intake_liters" stroke="#3b82f6" />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Weekly/Monthly Pie Charts */}
      {activeTab === "weekly" && renderPieChart("weekly")}
      {activeTab === "monthly" && renderPieChart("monthly")}
    </div>
  );
};

export default StatsTab;

