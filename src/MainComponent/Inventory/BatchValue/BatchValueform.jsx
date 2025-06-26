import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ZoneForm({ handleCancel }) {
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    type: "Physical",
    site: "",
    warehouse: "",
    zoneAddress: "",
    remarks: "",
    archived: false,
    company: "",
    groups: [],
    createdBy: "",
    updatedBy: "",
    active: true,
    extras: "",
    files: [],
  });

  const [warehouses, setWarehouses] = useState([]);

  const apiBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/zones";
  const warehousesUrl = "https://fms-qkmw.onrender.com/fms/api/v0/warehouses";

  useEffect(() => {
    const fetchwarehouses = async () => {
      try {
        const res = await axios.get(warehousesUrl);
        setWarehouses(res.data || []);
      } catch (error) {
        console.error("Failed to fetch warehouses:", error);
        toast.error("Failed to load warehouses.");
      }
    };
    fetchwarehouses();
  }, []);

  const handleReset = () => {
    setForm({
      code: "",
      name: "",
      description: "",
      type: "Physical",
      site: "",
      warehouse: "",
      zoneAddress: "",
      remarks: "",
      archived: false,
      company: "",
      groups: [],
      createdBy: "",
      updatedBy: "",
      active: true,
      extras: "",
      files: [],
    });
  };

  const handleChange = (e) => {
    const { name, type, checked, value, files, options } = e.target;

    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "groups") {
      const selected = Array.from(options)
        .filter((opt) => opt.selected)
        .map((opt) => opt.value);
      setForm((prev) => ({ ...prev, groups: selected }));
    } else if (type === "file") {
      setForm((prev) => ({ ...prev, files: Array.from(files) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const createZone = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        type: form.type,
        warehouse: form.warehouse,
        description: form.description,
        remarks: form.remarks,
        active: form.active,
       
      

 
   
        zoneAddress: form.zoneAddress,
        createdBy: form.createdBy,
        updatedBy: form.updatedBy,
      };

      await axios.post(apiBaseUrl, payload);

      toast.success("Zone created successfully!", {
        autoClose: 1000,
        onClose: handleCancel,
      });
    } catch (err) {
      console.error("Zone creation failed:", err);
      toast.error("Failed to create zone.");
    }
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <h3 className="text-xl font-semibold mb-4">Zone Form</h3>
      <form
        onSubmit={createZone}
        className="bg-white rounded-lg divide-y divide-gray-200"
      >
        <section className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Zone Code */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Code
            </label>
            <input
              name="code"
              value={form.code}
              readOnly
              placeholder="Auto-generated"
              className="mt-1 w-full cursor-not-allowed p-2 border rounded focus:ring-2 focus:ring-blue-200"
            />
          </div>
          {/* Zone Name */}
          <div>
            <label>Zone Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Central Zone"
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
          {/* Warehouse */}
          <div>
            <label>Warehouse</label>
            <select
              name="warehouse"
              value={form.warehouse}
              onChange={handleChange}
              required
              className="mt-1 w-full p-2 border rounded"
            >
              <option value="">Select a Warehouse</option>
              {warehouses.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.code} - {w.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 w-full p-2 border rounded h-24"
            />
          </div>{" "}
          <div>
            <label>Remarks</label>
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full p-2 border rounded h-24"
            />
          </div>
        </section>
        {/* Form actions */}
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
