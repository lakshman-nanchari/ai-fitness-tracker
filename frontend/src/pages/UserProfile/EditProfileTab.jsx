import React from "react";
import { Save } from "lucide-react";

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

const EditProfileTab = ({ form, onChange, onSubmit, message, error }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-xl">
      <h2 className="text-xl font-semibold">Edit Your Profile</h2>
      {message && <p className="text-green-600 dark:text-green-300">{message}</p>}
      {error && <p className="text-red-600 dark:text-red-300">{error}</p>}

      <Input label="Age" name="age" type="number" value={form.age} onChange={onChange} />
      <Input label="Gender" name="gender" value={form.gender} onChange={onChange} />
      <Input label="Height (cm)" name="height_cm" type="number" value={form.height_cm} onChange={onChange} />
      <Input label="Weight (kg)" name="weight_kg" type="number" value={form.weight_kg} onChange={onChange} />
      <Input label="Goal" name="goal" value={form.goal} onChange={onChange} />

      <button
        type="submit"
        className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
      >
        <Save className="w-5 h-5" /> Save Changes
      </button>
    </form>
  );
};

export default EditProfileTab;
