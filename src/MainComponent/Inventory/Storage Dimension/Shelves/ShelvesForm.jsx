import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function ShelvesForm({ handleCancel }) {
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    type: "Physical",
    rack: "", // ✅ changed from Racks
    remarks: "",
  });

  const [racks, setRacks] = useState([]);

  const apiBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/shelves";
  const racksUrl = "https://fms-qkmw.onrender.com/fms/api/v0/racks";

  useEffect(() => {
    const fetchRacks = async () => {
      try {
        const res = await axios.get(racksUrl);
        const racksArray = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
          ? res.data.data
          : [];

        setRacks(racksArray);
      } catch (error) {
        console.error("Failed to fetch Racks:", error);
        toast.error("Failed to load racks.");
        setRacks([]);
      }
    };

    fetchRacks();
  }, []);

  const handleReset = () => {
    setForm({
      code: "",
      name: "",
      description: "",
      type: "Physical",
      rack: "",
      remarks: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const createShelves = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name.trim(), // trimmed once here
        description: form.description,
        type: form.type,
        rack: form.rack, // correct usage
        Shelves: form.Shelves,
        remarks: form.remarks,
        active: form.active,
        BinAddress: form.BinAddress,
        createdBy: form.createdBy || "admin",
        updatedBy: form.updatedBy || "admin",
      };

      const res = await axios.post(apiBaseUrl, payload);

      toast.success("Shelves created successfully!", {
        autoClose: 1000,
        onClose: handleCancel,
      });

      if (res.data?.code) {
        setForm((prev) => ({ ...prev, code: res.data.code }));
      }
    } catch (err) {
      console.error("Shelves creation failed:", err);
      toast.error("Failed to create shelves.");
    }
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <h3 className="text-xl font-semibold mb-4">Shelves Form</h3>
      <form
        onSubmit={createShelves}
        className="bg-white rounded-lg divide-y divide-gray-200"
      >
        <section className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Code
            </label>
            <input
              name="code"
              value={form.code}
              readOnly
              placeholder="Auto-generated"
              className="mt-1 w-full cursor-not-allowed p-2 border rounded bg-gray-100"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Shelves Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Central Shelves"
              required
              className="mt-1 w-full p-2 border rounded"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Type
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className="mt-1 w-full p-2 border rounded"
            >
              <option value="">Select type</option>
              <option value="Physical">Physical</option>
              <option value="Virtual">Virtual</option>
            </select>
          </div>

          {/* Racks Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Rack
            </label>
            <select
              name="rack" // ✅ changed
              value={form.rack}
              onChange={handleChange}
              required
              className="mt-1 w-full p-2 border rounded"
            >
              <option value="">Select a rack</option>
              {racks.map((rack) => (
                <option key={rack._id} value={rack._id}>
                  {rack.code || "NoCode"} - {rack.name || "Unnamed"}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full p-2 border rounded"
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full p-2 border rounded"
            />
          </div>
        </section>

        {/* Footer Actions */}
        <div className="py-6 flex justify-between">
          <button type="button" onClick={handleReset} className="text-gray-500">
            Reset
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Create
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
