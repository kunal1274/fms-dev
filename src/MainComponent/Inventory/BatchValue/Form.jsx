import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const initialForm = {
  batchNumber: "",
  quantity: "",
  uom: "",
  vendorBatchNumber: "",
  status: "",
  manufactureDate: "",
  expiryDate: "",
  qualityStatus: "",
  location: "",
  warehouses: "",
  remarks: "",
  createdByDate: new Date().toLocaleString(),
};

export default function BatchForm({ onSaved, handleCancel }) {
  const [form, setForm] = useState(initialForm);
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);

  // const apiBase ="https://fms-qkmw.onrender.com/fms/api/v0/batches";
  const locationsUrl = "https://fms-qkmw.onrender.com/fms/api/v0/locations";
  const warehousesUrl = "https://fms-qkmw.onrender.com/fms/api/v0/warehouses";

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get(locationsUrl);
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setLocations(data);
      } catch (error) {
        console.error("Failed to fetch locations:", error);
        toast.error("Failed to load locations.");
      }
    };

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

    fetchLocations();
    fetchWarehouses();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const removeEmptyFields = (obj) =>
    Object.entries(obj)
      .filter(([_, v]) => v !== "" && v !== undefined && v !== null)
      .reduce((acc, [k, v]) => {
        acc[k] =
          typeof v === "object" && !Array.isArray(v) ? removeEmptyFields(v) : v;
        return acc;
      }, {});

  const createBatch = async (e) => {
    e.preventDefault();

    if (!form.batchNumber || !form.vendorBatchNumber) {
      toast.error("Batch Number and Vendor Batch Number are required");
      return;
    }

    const cleanedPayload = removeEmptyFields(form);

    try {
      const res = await axios.post(apiBase, cleanedPayload);
      toast.success("Batch created successfully");
      if (onSaved) onSaved(res.data);
      setForm(initialForm);
    } catch (error) {
      console.error("Failed to create batch:", error);
      toast.error("Batch creation failed");
    }
  };

  const handleReset = () => {
    setForm({ ...initialForm });
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
          <h3 className="text-xl font-semibold">Batch Creation</h3>
        </div>
      </div>

      <form onSubmit={createBatch} className="space-y-6">
        {/* Batch Details Section */}
        <section className="p-6 bg-white rounded ">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Batch Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Batch Number
              </label>
              <input
                name="batchNumber"
                value={form.batchNumber}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Quantity
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="quantity"
                  type="number"
                  value={form.quantity}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border rounded"
                />
                <select
                  name="uom"
                  value={form.uom}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border rounded"
                >
                  <option value="">Select UOM</option>
                  <option value="kg">kg</option>
                  <option value="liters">liters</option>
                  <option value="units">units</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Vendor Batch Number
              </label>
              <input
                name="vendorBatchNumber"
                value={form.vendorBatchNumber}
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
        <section className="p-6 bg-white rounded .">
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

        {/* Location and Quality */}
        <section className="p-6 bg-white rounded .">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Locationing & Quality
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Quality Status
              </label>
              <input
                name="qualityStatus"
                value={form.qualityStatus}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
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
                <option value="">Select a location</option>
                {locations.map((location) => (
                  <option key={location._id} value={location._id}>
                    {location.code} - {location.name}
                  </option>
                ))}
              </select>
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
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Created By / Date
              </label>
              <input
                name="createdByDate"
                value={form.createdByDate}
                readOnly
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-600"
              />
            </div>
          </div>
        </section>

        {/* Action Buttons */}
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
