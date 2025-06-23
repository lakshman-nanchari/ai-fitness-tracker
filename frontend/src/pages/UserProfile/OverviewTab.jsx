import React from "react";

const Info = ({ label, value }) => (
  <div className="flex justify-between p-3 bg-white dark:bg-gray-800 rounded shadow">
    <span className="font-semibold text-gray-600 dark:text-gray-300">{label}</span>
    <span className="text-gray-900 dark:text-gray-100">{value || "—"}</span>
  </div>
);

const OverviewTab = ({ user, form }) => {
  return (
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
  );
};

export default OverviewTab;
