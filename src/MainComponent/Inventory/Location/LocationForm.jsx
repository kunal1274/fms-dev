import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

const LocationForm = ({ handleCancel }) => {
  const [form, setForm] = useState({});
  const apiBase = "https://fms-qkmw.onrender.com/fms/api/v0/location";
  // const navigate = useNavigate();
  const initialForm = {
    name: "",
    description: "",
    type: "Physical", // default per schema

    zone: "", // ObjectId of selected zone
    locationAddress: "",
    locationLatLng: "",
    remarks: "",
    archived: false,
  };
  const [zones, setZones] = useState([]);

  // ─── Data ────────────────────────────────────────────────
  const [locations, setLocations] = useState([]);
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await axios.get(ZonesUrl);
        setZones(res.data || []);
      } catch (error) {
        console.error("Failed to fetch Zones:", error);
        toast.error("Failed to load Zones.");
      }
    };
    fetchZones();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, options } = e.target;

    if (type === "checkbox") {
      // boolean field
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "select-multiple") {
      // multi-select (e.g. groups[])
      const selectedOptions = Array.from(options)
        .filter((opt) => opt.selected)
        .map((opt) => opt.value);
      setForm((prev) => ({ ...prev, [name]: selectedOptions }));
    } else {
      // normal text/select
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };
  // ─── Helpers ─────────────────────────────────────────────
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await axios.get(ZonesUrl);
        setZones(response.data || []);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(companiesUrl);
        // setZones(response.data || []);
        setCompanies(response.data || []);
      } catch (error) {
        console.error("Error fetching Company 63:", error);
      }
    };
    fetchZones();
    fetchCompanies();
  }, []);

  // ─── Load existing Locations once ────────────────────────

  const createLocation = async (e) => {
    e.preventDefault();

    // Build payload exactly as schema expects (omit `code`; backend will generate)
    const payload = {};

    try {
      await axios.post(LOCATION_API_BASE, payload);

      toast.success("Location created successfully", {
        autoClose: 1000,
        onClose: handleCancel,
      });
    } catch (err) {
      console.error("Create error:", err.response || err);
      const msg = err.response?.data?.message || "Couldn’t create location";
      toast.error(msg);
    }
  };

  // ─── Reset / Cancel ──────────────────────────────────────
  const resetForm = (nextAccNo) =>
    setForm({
      ...form,
    });

  const handleReset = () => {
    const newLocationCode = generateAccountNo(Locations);
    setForm({ ...initialForm, locationAccountNo: newlocationCode });
  };
  const handleEdit = () => {
    navigate("/locationview", { state: { location: formData } });
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
          <h3 className="text-xl font-semibold">Location Form</h3>
        </div>
      </div>

      <form
        onSubmit={createLocation}
        className="bg-white shadow-none rounded-lg divide-y divide-gray-200"
      >
        {/* Business Details */}
        <section className="p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Location Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Location Code
              </label>
              <input
                name="locationcode"
                value={form.code}
                readOnly
                placeholder="Auto-generated"
                className="mt-1 w-full cursor-not-allowed  p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Location Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. XYZ Enterprises Pvt. Ltd."
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
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
                <option value="Physical">Physical</option>
                <option value="Virtual">Virtual</option>
              </select>
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Zone
              </label>
              <select
                name="zone"
                value={form.zone}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select Zone</option>
                {zones.map((zn) => (
                  <option key={zn._id} value={zn._id}>
                    {zn.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Location Description
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
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="e.g. 123 MG Road, Bengaluru, Karnataka, 560001"
                rows={4}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
            <div className="flex items-center">
              <input
                name="active"
                checked={form.active}
                onChange={handleChange}
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-600">
                Active
              </label>
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

export default LocationForm;
