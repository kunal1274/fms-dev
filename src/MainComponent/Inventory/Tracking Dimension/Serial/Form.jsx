import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Utility to clean empty fields
const removeEmptyFields = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== ""));

const initialForm = {
  serialNumber: "",
  itemCode: "",
  itemName: "",
  status: "",
  manufactureDate: "",
  warrantyStartDate: "",
  expiryDate: "",
  Location: "",
  warehouses: "",
  invoiceNumber: "",
  shippingDate: "",
  remarks: "",
  createdBy: "admin",
  createdDate: new Date().toLocaleString(),
};

export default function SerialsForm({ onSaved, handleCancel }) {
  const [form, setForm] = useState(initialForm);
  const [warehouses, setWarehouses] = useState([]);

  const warehousesUrl = "https://fms-qkmw.onrender.com/fms/api/v0/warehouses";
  const apiBase = "https://fms-qkmw.onrender.com/fms/api/v0/serirls";

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await axios.get(warehousesUrl);
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setWarehouses(data);
      } catch (error) {
        console.error("Failed to fetch warehouses:", error);
        toast.error("Failed to load warehouses.");
      }
    };

    fetchWarehouses();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleReset = () => {
    setForm({ ...initialForm });
  };

  const createSerials = async (e) => {
    e.preventDefault();
    if (!form.serialNumber || !form.itemCode) {
      toast.error("Serial Number and Item Code are required");
      return;
    }

    const cleanedPayload = removeEmptyFields(form);

    try {
      const res = await axios.post(apiBase, cleanedPayload);
      toast.success("Serial created successfully");
      if (onSaved) onSaved(res.data);
      setForm(initialForm);
    } catch (error) {
      console.error("Failed to create Serial:", error);
      toast.error("Serial creation failed");
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="flex justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <button
              type="button"
              className="text-blue-600 mt-2 text-sm hover:underline"
            >
              Upload Photo
            </button>
          </div>
          <h3 className="text-xl font-semibold">Serial Creation</h3>
        </div>
      </div>

      <form onSubmit={createSerials} className="space-y-6">
        {/* Serial Details */}
        <section className="p-6 bg-white rounded">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Serial Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Serial Number
              </label>
              <input
                name="serialNumber"
                value={form.serialNumber}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Item Code
              </label>
              <input
                name="itemCode"
                value={form.itemCode}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Item Name
              </label>
              <input
                name="itemName"
                value={form.itemName}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
                <option value="quarantined">Quarantined</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </section>

        {/* Dates */}
        <section className="p-6 bg-white rounded">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Dates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Manufacture Date
              </label>
              <input
                type="date"
                name="manufactureDate"
                value={form.manufactureDate}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Warranty Start Date
              </label>
              <input
                type="date"
                name="warrantyStartDate"
                value={form.warrantyStartDate}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Expiry Date
              </label>
              <input
                type="date"
                name="expiryDate"
                value={form.expiryDate}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
          </div>
        </section>

        {/* Location & Quality */}
        <section className="p-6 bg-white rounded">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Locationing & Quality
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Storage Location
              </label>
              <input
                name="Location"
                value={form.Location}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Warehouse
              </label>
              <select
                name="warehouses"
                value={form.warehouses}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded"
              >
                <option value="">Select a warehouse</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse._id} value={warehouse._id}>
                    {warehouse.code} - {warehouse.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Customer Info */}
        <section className="p-6 bg-white rounded">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Customer Info
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Invoice Number
              </label>
              <input
                name="invoiceNumber"
                value={form.invoiceNumber}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Shipping Date
              </label>
              <input
                type="date"
                name="shippingDate"
                value={form.shippingDate}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Remarks
              </label>
              <textarea
                name="remarks"
                rows={3}
                value={form.remarks}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Created By / Created Date
              </label>
              <input
                name="createdBy"
                value={`${form.createdBy} / ${form.createdDate}`}
                readOnly
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-600"
              />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-between items-center py-6">
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-700"
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
}
