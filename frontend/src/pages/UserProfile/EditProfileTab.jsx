import React from "react";
import { Save } from "lucide-react";
import { motion } from "framer-motion";

const Input = ({ label, name, type = "text", value, onChange }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
    />
  </motion.div>
);

const EditProfileTab = ({ form, onChange, onSubmit, message, error }) => {
  return (
    <motion.form
      onSubmit={onSubmit}
      className="space-y-5 max-w-xl bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.h2
        className="text-xl font-semibold text-gray-800 dark:text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        Edit Your Profile
      </motion.h2>

      {message && (
        <motion.p
          className="text-emerald-600 dark:text-emerald-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {message}
        </motion.p>
      )}

      {error && (
        <motion.p
          className="text-red-600 dark:text-red-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.p>
      )}

      <Input label="Age" name="age" type="number" value={form.age} onChange={onChange} />
      <Input label="Gender" name="gender" value={form.gender} onChange={onChange} />
      <Input label="Height (cm)" name="height_cm" type="number" value={form.height_cm} onChange={onChange} />
      <Input label="Weight (kg)" name="weight_kg" type="number" value={form.weight_kg} onChange={onChange} />
      <Input label="Goal" name="goal" value={form.goal} onChange={onChange} />

      <motion.button
        type="submit"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 shadow-md"
      >
        <Save className="w-5 h-5" /> Save Changes
      </motion.button>
    </motion.form>
  );
};

export default EditProfileTab;
