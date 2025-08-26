import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaFilter, FaSearch, FaSortAmountDown ,FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";

const SerialsForm = ({ handleCancel }) => {
  const initialForm = {
    code: "", // server will auto‐generate if left blank
    name: "",
    description: "",
    type: "Physical", // default per schema
    active: false,
    archived: false,
    groups: [], // you can populate this if you have a dropdown later
    company: "", // populate if needed
    files: [], // you can implement file uploads separately
    extras: {}, // if you want a Map‐like object
    // ─── sub‐docs ─────────────────────────
    values: [
      {
        num: "",
        mfgDate: "",
        expDate: "",
      },
    ],
  };

  const [form, setForm] = useState(initialForm);
  const apiBase = "https://fms-qkmw.onrender.com/fms/api/v0/Serials";
  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    if (inputType === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleValueChange = (index, e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const newValues = prev.values.map((v, i) =>
        i === index ? { ...v, [name]: value } : v
      );
      return { ...prev, values: newValues };
    });
  };
  const handleAddValue = () => {
    setForm((prev) => ({
      ...prev,
      values: [...prev.values, { num: "", mfgDate: "", expDate: "" }],
    }));
  };
  // ─── Data ────────────────────────────────────────────────
  const [Serialss, setSerials] = useState([]);

  // ─── Helpers ─────────────────────────────────────────────

  // ─── Load existing Serialss once ────────────────────────
  const handleRemoveValue = (index) => {
    setForm((prev) => {
      const newValues = prev.values.filter((_, i) => i !== index);
      return { ...prev, values: newValues };
    });
  };
  const validateBeforeSubmit = () => {
    // 1) Ensure name is present
    if (!form.name.trim()) {
      toast.error("Serials Name is required");
      return false;
    }
    // 2) Check that each subdoc has num, mfgDate, expDate, and expDate > mfgDate
    for (let i = 0; i < form.values.length; i++) {
      const { num, mfgDate, expDate } = form.values[i];
      if (!num.trim() || !mfgDate || !expDate) {
        toast.error(`All fields required for entry #${i + 1}`);
        return false;
      }
      if (new Date(expDate) <= new Date(mfgDate)) {
        toast.error(
          `Expiry date must be after manufacturing date for entry #${i + 1}`
        );
        return false;
      }
    }
    // 3) Ensure no duplicate “num” in values
    const nums = form.values.map((v) => v.num.toLowerCase().trim());
    const dup = nums.find((n, idx) => nums.indexOf(n) !== idx);
    if (dup) {
      toast.error(`Duplicate serial number detected: "${dup}"`);
      return false;
    }
    return true;
  };
  const createSerials = async (e) => {
    e.preventDefault();
    if (!validateBeforeSubmit()) return;

    try {
      // We only send exactly the fields we defined in initialForm.
      const payload = { ...form };
      const { data } = await axios.post(apiBase, payload, {
        headers: { "Content-Type": "application/json" },
      });
      const newSerial = data.data; // assuming your API returns { data: newSerial }

      toast.success("Serial saved successfully", {
        autoClose: 1200,
        onClose: () => handleCancel(),
      });

      onSaved?.(newSerial); // if parent wants the newly created record
    } catch (err) {
      console.error("Error creating Serial:", err.response || err);
      const msg =
        err.response?.data?.message || "Couldn’t save Serial. Try again.";
      toast.error(msg, { autoClose: 2000 });
    }
  };

  // ─── Reset / Cancel ──────────────────────────────────────
  const resetForm = (nextAccNo) =>
    setForm({
      ...form,
    });

  const handleReset = () => {
    const newSerialsCode = generateAccountNo(Serialss);
    setForm({ ...initialForm, SerialsAccountNo: newSerialsCode });
  };
  const handleEdit = () => {
    navigate("/Serialsview", { state: { Serials: formData } });
  };

  return (
    <div className="">
      <ToastContainer />
      {/* Header Buttons */}
      <div className="flex justify-between ">
        <div className="flex items-center space-x-2">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            {" "}
            <button
              type="button"
              className="text-blue-600 mt-2 text-sm hover:underline"
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
              </svg>{" "}
            </button>
          </div>
          <h3 className="text-xl font-semibold">Serials Form</h3>
        </div>
      </div>

      <form
        onSubmit={createSerials}
        className="bg-white shadow-none rounded-lg divide-y divide-gray-200"
      >
        {/* Business Details */}
        <section className="p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Serials Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Serials Code
              </label>
              <input
                type="text"
                name="code"
                value={form.code}
                readOnly
                placeholder="(Auto-generated)"
                className="mt-1 w-full bg-gray-100 cursor-not-allowed p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Serials Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Batch Group A"
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Optional notes..."
                rows={3}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
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
            <div className="flex items-center">
              <input
                id="active"
                name="active"
                type="checkbox"
                checked={form.active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label
                htmlFor="active"
                className="ml-2 block text-sm font-medium text-gray-700"
              >
                Active
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="archived"
                name="archived"
                type="checkbox"
                checked={form.archived}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label
                htmlFor="archived"
                className="ml-2 block text-sm font-medium text-gray-700"
              >
                Archived
              </label>
            </div>
          </div>
        </section>
        <section className="p-6 space-y-4 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-700">
            Individual Serials
          </h2>

          {form.values.map((entry, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
            >
              {/* Serial Number (num) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Serial # {idx + 1} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="num"
                  value={entry.num}
                  onChange={(e) => handleValueChange(idx, e)}
                  placeholder="e.g. SN123456"
                  required
                  className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* Manufacturing Date (mfgDate) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Manufacturing Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="mfgDate"
                  value={entry.mfgDate}
                  onChange={(e) => handleValueChange(idx, e)}
                  required
                  className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* Expiration Date (expDate) */}
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Expiration Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="expDate"
                    value={entry.expDate}
                    onChange={(e) => handleValueChange(idx, e)}
                    required
                    className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                {form.values.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveValue(idx)}
                    className="mt-6 text-red-500 hover:text-red-700"
                    title="Remove this serial entry"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add New Serial Entry */}
          <div>
            <button
              type="button"
              onClick={handleAddValue}
              className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FaPlus className="mr-1" />
              Add Another Serial
            </button>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="py-6 flex items-center justify-between">
          {/* Left side - Reset Button */}
          <div>
            <button
              type="button"
              onClick={handleReset}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Reset
            </button>
          </div>

          {/* Right side - Go Back and Create Buttons */}
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

export default SerialsForm;
