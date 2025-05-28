import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";

const SerialsForm = ({ handleCancel }) => {
  const [form, setForm] = useState({});
  const apiBase = "https://fms-qkmw.onrender.com/fms/api/v0/Serials";

  // ─── Data ────────────────────────────────────────────────
  const [Serialss, setSerials] = useState([]);

  // ─── Helpers ─────────────────────────────────────────────

  // ─── Load existing Serialss once ────────────────────────
  const handleChange = () => {};
  const createSerials = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      bankDetails: bankDetailsPayload,
    };

    try {
      const { data } = await axios.post(apiBase, payload, {
        headers: { "Content-Type": "application/json" },
      });
      const newSerials = data.data;

      toast.success("Serials saved", {
        autoClose: 1200,
        onClose: () => handleCancel(),
      });

      setSerialss((prev) => [...prev, newSerials]);

      onSaved?.(newSerials);
    } catch (err) {
      console.error("Error creating Serials:", err.response || err);
      // const msg = err.response?.data?.message || "Couldn’t save Serials"; // ← define msg properly
      // toast.error(msg, { autoClose: 2000 });
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
              <label className="block text-sm font-medium text-gray-600">
                Serials Code
              </label>
              <input
                name="Serialscode"
                value={form.code}
                readOnly
                placeholder="Auto-generated"
                className="mt-1 w-full cursor-not-allowed  p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Serials Name
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
                description
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
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                placeholder="e.g. Any additional notes…"
                rows={4}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                type
              </label>
              <input
                name="type"
                value={form.type}
                onChange={handleChange}
                placeholder="e.g. Retail, Wholesale"
                disabled
                className="mt-1 w-full p-2 border cursor-not-allowed  rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                location
              </label>
              <input
                name="type"
                value={form.type}
                onChange={handleChange}
                placeholder="e.g. Retail, Wholesale"
                disabled
                className="mt-1 w-full p-2 border cursor-not-allowed  rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-2 ml-1">
              <label className="text-blue-600 font-medium">Active</label>
              <input
                name="active"
                checked={form.active}
                onChange={handleChange}
                type="checkbox"
                className="w-4 h-4"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                shelf
              </label>
              <input
                name="contactPersonPhone"
                value={form.contactPersonPhone}
                onChange={handleChange}
                placeholder="e.g. +91 91234 56789"
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
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
