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
    warehouse: "", // ObjectId of selected warehouse
    zone: "", // ObjectId of selected zone
    locationAddress: "",
    locationLatLng: "",
    remarks: "",
    archived: false,
    company: "", // ObjectId of selected company
    groups: [], // Array of ObjectIds (multi-select)
    active: true,
    extras: {},
  };
  const [warehouses, setWarehouses] = useState([]);
  const [zones, setZones] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [groupsList, setGroupsList] = useState([]);
  // ─── Data ────────────────────────────────────────────────
  const [locations, setLocations] = useState([]);
  useEffect(() => {
    const fetchAllLookups = async () => {
      try {
        const [
          { data: whData },
          { data: zoneData },
          { data: compData },
          { data: grpData },
        ] = await Promise.all([
          axios.get(WAREHOUSES_URL),
          axios.get(ZONES_URL),
          axios.get(COMPANIES_URL),
          axios.get(GROUPS_URL),
        ]);

        setWarehouses(whData || []);
        setZones(zoneData || []);
        setCompanies(compData || []);
        setGroupsList(grpData || []);
      } catch (err) {
        console.error("Error fetching lookups:", err);
        toast.error("Error loading form data");
      }
    };

    fetchAllLookups();
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

  // ─── Load existing Locations once ────────────────────────

  const createLocation = async (e) => {
    e.preventDefault();

    // Build payload exactly as schema expects (omit `code`; backend will generate)
    const payload = {
      name: form.name,
      description: form.description,
      type: form.type,
      warehouse: form.warehouse || null,
      zone: form.zone || null,
      locationAddress: form.locationAddress,
      locationLatLng: form.locationLatLng,
      remarks: form.remarks,
      archived: form.archived,
      company: form.company || null,
      groups: form.groups,
      active: form.active,
      extras: form.extras,
    };

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
            </div>{" "} <div>
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
            </div>
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
                Location lattitude
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
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Warehouse
              </label>
              <select
                name="warehouse"
                value={form.warehouse}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((wh) => (
                  <option key={wh._id} value={wh._id}>
                    {wh.name}
                  </option>
                ))}
              </select>
            </div>{" "}
          
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Company
              </label>
              <select
                name="company"
                value={form.company}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select Company</option>
                {companies.map((co) => (
                  <option key={co._id} value={co._id}>
                    {co.name}
                  </option>
                ))}
              </select>
            </div>{" "}
          <div>
              <label className="block text-sm font-medium text-gray-600">
       Groups
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
            </div>{" "}    <div>
            <label>Created By (User ID)</label>
            <input
              name="createdBy"
              value={form.createdBy}
              onChange={handleChange}
              placeholder="e.g. 642f9c1234abc456def78901"
              className="mt-1 w-full p-2 border rounded"
            />
          </div>
          {/* Updated By */}
          <div>
            <label>Updated By (User ID)</label>
            <input
              name="updatedBy"
              value={form.updatedBy}
              onChange={handleChange}
              placeholder="e.g. 642f9c1234abc456def78901"
              className="mt-1 w-full p-2 border rounded"
            />
          </div>
             <div className="flex items-center">
              <input
                name="active"
                checked={form.active}
                onChange={handleChange}
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-600">
                Archive
              </label>
            </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-600">
               Extra
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

export default LocationForm;
