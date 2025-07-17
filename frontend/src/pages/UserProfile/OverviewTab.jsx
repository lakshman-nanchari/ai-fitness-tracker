import React from "react";
import { motion } from "framer-motion";

const Info = ({ label, value }) => (
  <motion.div
    className="flex justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow transition-colors"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <span className="font-semibold text-gray-700 dark:text-gray-300">{label}</span>
    <span className="text-emerald-600 dark:text-emerald-400">{value || "—"}</span>
  </motion.div>
);

const OverviewTab = ({ user, form }) => {
  const infoItems = [
    { label: "Email", value: user.email },
    { label: "Age", value: form.age },
    { label: "Gender", value: form.gender },
    { label: "Height (cm)", value: form.height_cm },
    { label: "Weight (kg)", value: form.weight_kg },
    { label: "Goal", value: form.goal },
  ];

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.h2
        className="text-xl font-semibold text-emerald-700 dark:text-emerald-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        Profile Overview
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {infoItems.map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
          >
            <Info label={item.label} value={item.value} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default OverviewTab;
