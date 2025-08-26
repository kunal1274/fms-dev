import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ProductDimVersionForm({ handleCancel }) {
  const apiBase = "https://fms-qkmw.onrender.com/fms/api/v0/versions";

  const initialForm = {
    code: "",
    name: "",
    description: "",
    type: "Physical",
    values: [""],
  };

  const [form, setForm] = useState(initialForm);

  // Handle basic field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle dynamic value field changes
  const handleValueChange = (index, value) => {
    setForm((prev) => {
      const updatedValues = [...prev.values];
      updatedValues[index] = value;
      return { ...prev, values: updatedValues };
    });
  };

  const addValueField = () => {
    setForm((prev) => ({ ...prev, values: [...prev.values, ""] }));
  };

  const removeValueField = (index) => {
    setForm((prev) => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index),
    }));
  };

  const handleReset = () => {
    setForm(initialForm);
  };

  // Submit form
  const createProductVersion = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!form.type.trim()) {
      toast.error("Type is required");
      return;
    }

    const cleanValues = form.values.filter((v) => v.trim() !== "");
    if (cleanValues.length === 0) {
      toast.error("At least one non-empty value is required");
      return;
    }

    try {
      const payload = { ...form, values: cleanValues };

      await axios.post(apiBase, payload, {
        headers: { "Content-Type": "application/json" },
      });

      toast.success("Version created successfully");
      handleCancel();
    } catch (err) {
      console.error("Create error:", err.response || err);
      const msg = err.response?.data?.message || "Error creating Version";
      // toast.error(msg);
    }
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <h3 className="text-xl font-semibold mb-4">Create New Version</h3>
      <form
        onSubmit={createProductVersion}
        className="bg-white rounded-lg divide-y divide-gray-200"
      >
        <section className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Version Code
            </label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="e.g. CFG_001"
              className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Version Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. LG Washing Machine"
              required
              className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Type
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
            >
              <option value="Physical">Physical</option>
              <option value="Virtual">Virtual</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-600">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Enter description..."
              className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-600">
              Values
            </label>
            {form.values.map((val, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  value={val}
                  onChange={(e) => handleValueChange(index, e.target.value)}
                  placeholder={`Value ${index + 1}`}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                />
                {form.values.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeValueField(index)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addValueField}
              className="mt-2 px-4 py-1 bg-green-500 text-white rounded"
            >
              + Add Value
            </button>
          </div>
        </section>

        <div className="py-6 flex items-center justify-between px-6">
          <button
            type="button"
            onClick={handleReset}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Reset
          </button>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            >
              Go Back
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Create
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
