import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AislesForm = ({ handleCancel }) => {
  const apiBase = "https://fms-qkmw.onrender.com/fms/api/v0/aisles";
  const apiLocationBase = "https://fms-qkmw.onrender.com/fms/api/v0/locations";

  const initialForm = {
    code: "", // To be auto-generated or backend populated
    name: "",
    type: "Physical",
    location: "",
    description: "",
    remarks: "",
    active: true,
  };

  const [form, setForm] = useState(initialForm);
  const [location, setLocation] = useState([]);

  // ─── Fetch Locations ─────────────────────
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get(apiLocationBase);
        setLocation(response.data || []);
      } catch (error) {
        console.error("Error fetching locations:", error);
        toast.error("Failed to load locations.");
      }
    };

    fetchLocations();
  }, []);

  // ─── Form Change Handler ─────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ─── Submit Form ─────────────────────────
  const createAisles = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      const response = await axios.post(apiBase, payload);
      toast.success("Aisle created successfully!");
      setForm(initialForm); // Reset form
    } catch (error) {
      console.error("Error creating aisle:", error);
      toast.error("Failed to create aisle.");
    }
  };

  // ─── Reset Form ──────────────────────────
  const handleReset = () => {
    setForm(initialForm);
  };

  return (
    <div className="">
      <ToastContainer />
      {/* Header */}
      <div className="flex justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <button
              type="button"
              className="text-blue-600 text-sm hover:underline"
            >
              Upload Photo
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11c1.656 0 3-1.344 3-3s-1.344-3-3-3-3 1.344-3 3 1.344 3 3 3zm0 2c-2.761 0-5 2.239-5 5v3h10v-3c0-2.761-2.239-5-5-5z"
                />
              </svg>
            </button>
          </div>
          <h3 className="text-xl font-semibold">Aisles Form</h3>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={createAisles}
        className="bg-white rounded-lg divide-y divide-gray-200"
      >
        <section className="p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Aisles Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Aisles Code
              </label>
              <input
                name="code"
                value={form.code}
                readOnly
                placeholder="Auto-generated"
                className="mt-1 w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Aisles Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Rack A1"
                required
                className="mt-1 w-full p-2 border rounded"
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
                className="mt-1 w-full p-2 border rounded"
              >
                <option value="Physical">Physical</option>
                <option value="Virtual">Virtual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Location
              </label>
              <select
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded"
              >
                <option value="">Select</option>
                {location.map((loc) => (
                  <option key={loc._id} value={loc._id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter a brief description"
                rows={3}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                placeholder="Any notes…"
                rows={3}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <label className="text-sm text-gray-700">Active</label>
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
                className="w-4 h-4"
              />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="py-6 px-6 flex justify-between items-center">
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
              className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Go Back
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AislesForm;
