//

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ShelvesForm = ({ handleCancel }) => {
  const [form, setForm] = useState({
    ShelvesAccountNo: "",
    name: "",
    updatedBy: "",
    siteId: "",
    value: "",
    location: "",
    remarks: "",
    extras: "",
    archived: false,
    group: "",
    createdBy: "",

    type: "",
    description: "",
    active: false,
  });

  const [shelvess, setShelvess] = useState([]);
  const [sites, setSites] = useState([]);

  const apiBase = "https://fms-qkmw.onrender.com/fms/api/v0/Shelves";

  const generateAccountNo = (list) => `AISL-${list.length + 1}`;

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await axios.get(warehousesUrl);
        setWarehouses(response.data || []);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(companiesUrl);
        // setWarehouses(response.data || []);
        setCompanies(response.data || []);
      } catch (error) {
        console.error("Error fetching Company 63:", error);
      }
    };
    fetchWarehouses();
    fetchCompanies();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleReset = () => {
    setForm((prev) => ({
      ...prev,
      ShelvesAccountNo: generateAccountNo(Shelvess),
    }));
  };

  const createShelves = async (e) => {
    e.preventDefault();

    const payload = {
      ShelvesAccountNo: formShelvesAccountNo || "",
      name: form.name || "",
      type: form.type || "",
      siteId: form.siteId || "",
      description: form.description || "",
      updatedBy: form.updatedBy || "",
      value: form.value || "",
      location: form.location || "",
      remarks: form.remarks || "",
      extras: form.extras || "",
      archived: form.archived || false,
      group: form.group || "",
      createdBy: form.createdBy || "",
      active: form.active || false,
    };

    try {
      await axios.post(apiBase, payload);

      toast.success("Shelves created successfully", {
        autoClose: 1000,
        onClose: handleCancel,
      });
    } catch (err) {
      console.error("Create error:", err.response || err);
      toast.error(err.response?.data?.message || "Couldn’t create Shelves");
    }
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <button
              type="button"
              className="text-blue-600 text-sm hover:underline"
            >
              Upload Photo
            </button>
          </div>
          <h3 className="text-xl font-semibold">Shelves Form</h3>
        </div>
      </div>
      <form
        onSubmit={createShelves}
        className="bg-white rounded-lg divide-y divide-gray-200"
      >
        <section className="p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Shelves Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Shelves Code */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Shelves Code
              </label>
              <input
                name="ShelvesAccountNo"
                value={form.ShelvesAccountNo}
                readOnly
                disabled
                placeholder="Auto-generated"
                className="mt-1 w-full cursor-not-allowed p-2 border rounded focus:ring-2 focus:ring-blue-200"
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
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Created By
              </label>
              <input
                name="createdBy"
                value={form.createdBy}
                onChange={handleChange}
                placeholder="User ID"
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            {/* Updated By */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Updated By
              </label>
              <input
                name="updatedBy"
                value={form.updatedBy}
                onChange={handleChange}
                placeholder="User ID"
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            {/* Site Select */}
            {/* Value */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Shelves Value
              </label>
              <input
                name="value"
                value={form.value}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Bin
              </label>
              <input
                name="value"
                value={form.value}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Location
              </label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Remarks
              </label>
              <input
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            {/* Extras */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Extras
              </label>
              <input
                name="extras"
                value={form.extras}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            {/* Archived Checkbox */}
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium text-gray-600">
                Archived
              </label>
              <input
                name="archived"
                type="checkbox"
                checked={form.archived}
                onChange={handleChange}
                className="mt-1 w-4 h-4"
              />
            </div>
            {/* Group Select */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Group
              </label>
              <select
                name="group"
                value={form.group}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select group</option>
                <option value="Physical">Physical</option>
                <option value="Virtual">Virtual</option>
              </select>
            </div>
            {/* Created By */}
            {/* Type Select */}
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
                <option value="">Select type</option>
                <option value="Physical">Physical</option>
                <option value="Virtual">Virtual</option>
              </select>
            </div>
            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter description"
                rows={4}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            {/* Active Checkbox */}
            <div className="flex items-center gap-2 ml-1">
              <label className="text-blue-600 font-medium">Active</label>
              <input
                name="active"
                type="checkbox"
                checked={form.active}
                onChange={handleChange}
                className="w-4 h-4"
              />
            </div>
          </div>
        </section>
        {/* Action Buttons */}
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
};

export default ShelvesForm;
