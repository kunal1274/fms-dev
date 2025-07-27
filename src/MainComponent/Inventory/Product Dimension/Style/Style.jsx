import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Style({ handleCancel }) {
  const apiBase = "https://fms-qkmw.onrender.com/fms/api/v0/Styles";

  const initialForm = {
    code: "",
    name: "",
    description: "",
    combination: "",
    extras: "", // Optional JSON string
    files: [], // File list
  };

  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      setForm((prev) => ({ ...prev, files: Array.from(files) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleReset = () => {
    setForm(initialForm);
  };

  const createProductStyle = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();

      payload.append("code", form.code);
      payload.append("name", form.name);
      payload.append("description", form.description);
      payload.append("combination", form.combination);

      if (form.extras) {
        try {
          const extrasObj = JSON.parse(form.extras);
          payload.append("extras", JSON.stringify(extrasObj));
        } catch {
          toast.warn("Invalid JSON in 'extras' field. Ignoring.");
        }
      }

      form.files.forEach((file) => payload.append("files", file));

      await axios.post(apiBase, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Style created successfully");
      handleCancel();
    } catch (err) {
      console.error("Create error:", err.response || err);
      const msg = err.response?.data?.message || "Error creating Style";
      toast.error(msg);
    }
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <h3 className="text-xl font-semibold mb-4">Create New Style</h3>
      <form
        onSubmit={createProductStyle}
        className="bg-white rounded-lg divide-y divide-gray-200"
      >
        <section className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Style Code
            </label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="e.g. CLR-001"
              required
              className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Style Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Red Glossy"
              required
              className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
            />
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
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-600">
              Combination
            </label>
            <input
              name="combination"
              value={form.combination}
              onChange={handleChange}
              placeholder="e.g. Red + White"
              className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
            />
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
