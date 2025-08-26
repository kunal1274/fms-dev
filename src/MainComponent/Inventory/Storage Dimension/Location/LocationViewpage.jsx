import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./c.css";

const mergedUrl = `https://fms-qkmw.onrender.com/fms/api/v0/locations`;
const warehouseUrl = `https://fms-qkmw.onrender.com/fms/api/v0/warehouses`;

const LocationViewPage = ({ locationId, Location, goBack }) => {
  const { id } = useParams();
  const effectiveId = locationId || id;

  const initialForm = {
    code: "",
    name: "",
    type: "Physical",
    company: "",
    description: "",
    remarks: "",
    active: false,
    archived: false,
    warehouse: "",
    groups: [],
    bankDetails: [],
  };

  const [form, setForm] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [warehouses, setWarehouses] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setForm((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleUpdate = async () => {
    const confirmUpdate = window.confirm(
      "Are you sure you want to update this location?"
    );
    if (!confirmUpdate) return;

    const toastId = toast.loading("Updating location...");
    try {
      const response = await axios.put(`${mergedUrl}/${effectiveId}`, form);
      if (response.status === 200) {
        toast.update(toastId, {
          render: "location updated successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        setIsEditing(false);
      }
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.message || "Update failed",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const handleEdit = () => setIsEditing(true);

  useEffect(() => {
    const fetchlocationDetail = async () => {
      try {
        const response = await axios.get(`${mergedUrl}/${effectiveId}`);
        if (response.status === 200) {
          setForm(response.data.data || initialForm);
        } else {
          setError(`Unexpected response status: ${response.status}`);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    const fetchWarehouses = async () => {
      try {
        const res = await axios.get(warehouseUrl);
        if (res.status === 200) setWarehouses(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch warehouses", err);
      }
    };

    fetchlocationDetail();
    fetchWarehouses();
  }, [effectiveId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <ToastContainer />
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">location View Page</h3>
      </div>

      <form className="bg-white shadow-none rounded-lg divide-y divide-gray-200">
        <section className="p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            location Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* location Code - Readonly */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                location Code
              </label>
              <input
                name="code"
                value={form.code}
                readOnly
                disabled
                className="mt-1 w-full p-2 border bg-gray-100 rounded cursor-not-allowed"
              />
            </div>

            {/* location Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                location Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                location Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                disabled={!isEditing}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
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
                disabled={!isEditing}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
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
                disabled={!isEditing}
                className="mt-1 w-full p-2 border rounded"
              >
                <option value="">Select type</option>
                <option value="Physical">Physical</option>
                <option value="Virtual">Virtual</option>
              </select>
            </div>

            {/* Warehouse */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Warehouse
              </label>
              <select
                name="warehouse"
                value={form.warehouse}
                onChange={handleChange}
                disabled={!isEditing}
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

            {/* Active Checkbox */}
            <div className="flex items-center space-x-2 mt-6">
              <label className="text-sm font-medium text-gray-600">
                Active
              </label>
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
                disabled={!isEditing}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="py-6 flex justify-end gap-4">
            {!isEditing ? (
              <button
                type="button"
                onClick={handleEdit}
                className="px-6 py-2 bg-green-200 rounded hover:bg-green-300 transition"
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-red-200 rounded hover:bg-red-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Update
                </button>
              </>
            )}

            <button
              type="button"
              onClick={goBack}
              className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            >
              Go Back
            </button>
          </div>
        </section>
      </form>
    </div>
  );
};

export default LocationViewPage;
