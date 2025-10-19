import React from "react";

export default function Select({ label, value, onChange, options = [], ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="block w-full p-2 border rounded text-sm"
        {...props}
      >
        <option value="">-- Select --</option>
        {options.map((opt, index) => (
          <option key={index} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
