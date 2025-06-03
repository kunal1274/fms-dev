import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

export default function SiteForm({ handleCancel, onSaved }) {
  // ─── Form State ────────────────────────────────────────
  const initialForm = {
    SiteAccountNo: "",
    name: "",
    email: "",
    description: "",
  };
  const [form, setForm] = useState(initialForm);

  // ─── API Base ───────────────────────────────────────────Fem
  const apiBase = "https://fms-qkmw.onrender.com/fms/api/v0/sites";
  const warehousesUrl = "https://fms-qkmw.onrender.com/fms/api/v0/warehouses";
  // ─── List of existing sites ─────────────────────────────
  const [sites, setSites] = useState([]);
const [warehouses, setWarehouses] = useState([]);
  // ─── Fetch existing sites on mount ──────────────────────
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await axios.get(warehousesUrl);
        setWarehouses(response.data || []);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchWarehouses();
  }, []);
  // ─── Handle input changes ────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ─── Submit new site ────────────────────────────────────
  const createSite = async (e) => {
    e.preventDefault();
    const payload = {
      SiteAccountNo: form.SiteAccountNo,
      name: form.name,
      type: form.type,
      site: form.siteId,
      description: form.description,
    };

    try {
      await axios.post(apiBase, payload);

      toast.success("Site created successfully", {
        autoClose: 1000, // dismiss after 1 second
        onClose: handleCancel, // then run handleCancel()
      });
    } catch (err) {
      console.error("Create error:", err.response || err);
      toast.error(err.response?.data?.message || "Couldn’t create Site");
    }
  };

  // ─── Reset form for new entry ────────────────────────────
  const handleReset = () => {
    const nextAcc = generateAccountNo(sites);
    setForm({ ...initialForm, SiteAccountNo: nextAcc });
  };

  return (
    <div>
      <ToastContainer />
      <div className="flex items-center space-x-2 mb-4">
        <h3 className="text-xl font-semibold">Site Form</h3>
      </div>

      <form
        onSubmit={createSite}
        className="bg-white rounded-lg divide-y divide-gray-200"
      >
        <section className="p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Business Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Site Code
              </label>
              <input
                name="code"
                value={form.code}
                readOnly
                placeholder="Auto-generated"
                className="mt-1 w-full cursor-not-allowed p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Site Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. XYZ Enterprises Pvt. Ltd."
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
                required
                className="mt-1 w-full p-2 border rounded"
              >
                <option value="">Select type</option>
                <option value="Physical">Physical</option>
                <option value="Virtual">Virtual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Warehouse
              </label>
              <select
                name="warehouse"
                value={form.warehouse}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select a warehouse…</option>
                {warehouses.length ? (
                  warehouses.map((w) => (
                    <option key={w._id} value={w._id}>
                      {`${w.name} – ${w.name}`}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading warehouses...</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Site Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="e.g. 123 MG Road, Bengaluru, Karnataka, 560001"
                rows={4}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
        </section>

        <div className="py-6 flex items-center justify-between">
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
