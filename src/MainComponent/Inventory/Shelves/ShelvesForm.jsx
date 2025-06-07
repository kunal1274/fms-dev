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
    type: "",
    siteId: "",
    bin: "",
    location: "",
    remarks: "",
    extras: "",
    archived: false,
    group: "",
    createdBy: "",
    updatedBy: "",
    description: "",
    active: false,
  });
  const [allShelves, setAllShelves] = useState([]);
  const [shelvess, setShelvess] = useState([]);
  const [sites, setSites] = useState([]);
  const [locations, setLocations] = useState([]);
  const [bins, setBins] = useState([]);
  const apiBase = "https://fms-qkmw.onrender.com/fms/api/v0/Shelves";
  const apiSites = "https://fms-qkmw.onrender.com/fms/api/v0/Sites";
  const apiLocations = "https://fms-qkmw.onrender.com/fms/api/v0/Locations";
  const apiBins = "https://fms-qkmw.onrender.com/fms/api/v0/Bins";
  const generateAccountNo = (list) => `AISL-${list.length + 1}`;
  useEffect(() => {
    const fetchShelves = async () => {
      try {
        const response = await axios.get(apiBase);
        // Adjust for your exact payload shape:
        const fetchedShelves = response.data.data || response.data || [];
        setAllShelves(fetchedShelves);
        // Immediately generate the initial account number
        setForm((prev) => ({
          ...prev,
          ShelvesAccountNo: generateAccountNo(fetchedShelves),
        }));
      } catch (err) {
        console.error("Error fetching Shelves list:", err);
        toast.error("Could not load existing Shelves.");
      }
    };

    const fetchSites = async () => {
      try {
        const response = await axios.get(apiSites);
        const fetchedSites = response.data.data || response.data || [];
        setSites(fetchedSites);
      } catch (err) {
        console.error("Error fetching Sites:", err);
        toast.error("Could not load Sites.");
      }
    };

    fetchShelves();
    fetchSites();
  }, []);

  // ---------------------------------------------------------------------------
  // 4) Whenever the user picks a Site (form.siteId), fetch that Site's Locations
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!form.siteId) {
      setLocations([]);
      setBins([]);
      setForm((prev) => ({ ...prev, locationId: "", binId: "" }));
      return;
    }

    const fetchLocations = async () => {
      try {
        // Assuming your API supports filtering by siteId as a query param:
        const response = await axios.get(
          `${apiLocations}?siteId=${form.siteId}`
        );
        const fetchedLocations = response.data.data || response.data || [];
        setLocations(fetchedLocations);
        // Reset downstream fields:
        setForm((prev) => ({ ...prev, locationId: "", binId: "" }));
        setBins([]);
      } catch (err) {
        console.error("Error fetching Locations for site:", err);
        toast.error("Could not load Locations.");
      }
    };

    fetchLocations();
  }, [form.siteId]);

  // ---------------------------------------------------------------------------
  // 5) Whenever the user picks a Location (form.locationId), fetch that Location's Bins
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!form.locationId) {
      setBins([]);
      setForm((prev) => ({ ...prev, binId: "" }));
      return;
    }

    const fetchBins = async () => {
      try {
        // Assuming your API supports filtering by locationId as a query param:
        const response = await axios.get(
          `${apiBins}?locationId=${form.locationId}`
        );
        const fetchedBins = response.data.data || response.data || [];
        setBins(fetchedBins);
        // Reset bin selection:
        setForm((prev) => ({ ...prev, binId: "" }));
      } catch (err) {
        console.error("Error fetching Bins for location:", err);
        toast.error("Could not load Bins.");
      }
    };

    fetchBins();
  }, [form.locationId]);

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
      name: form.name || "",
      type: form.type || "",
      siteId: form.siteId || "",
      bin: form.bin || "",
      location: form.location || "",
      remarks: form.remarks || "",
      extras: form.extras || "",
      archived: form.archived || false,
      group: form.group || "",
      createdBy: form.createdBy || "",
      updatedBy: form.updatedBy || "",
      description: form.description || "",
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
                className="mt-1 w-full cursor-not-allowed p-2 border rounded focus:ring-2 focus:ring-blue-200 bg-gray-100"
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
            </div>  <div>
              <label className="block text-sm font-medium text-gray-600">
                Type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select type</option>
                <option value="Physical">Physical</option>
                <option value="Virtual">Virtual</option>
              </select>
            </div>  <div>
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
            {/* <div>
              <label className="block text-sm font-medium text-gray-600">
                Created By
              </label>
              <input
                name="createdBy"
                value={form.createdBy}
                onChange={handleChange}
                placeholder="Your User ID"
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div> */}
            {/* Updated By */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-600">
                Updated By
              </label>
              <input
                name="updatedBy"
                value={form.updatedBy}
                onChange={handleChange}
                placeholder="User ID (if updating later)"
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div> */}
            {/* Site Select */}
            {/* Value */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-600">
                Site
              </label>
              <select
                name="siteId"
                value={form.siteId}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select site</option>
                {sites.map((site) => (
                  <option key={site._id} value={site._id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div> */}   <div>
              <label className="block text-sm font-medium text-gray-600">
             Discription
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
          
            {/* <div>
              <label className="block text-sm font-medium text-gray-600">
                Bin
              </label>
              <select
                name="binId"
                value={form.binId}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select bin</option>
                {bins.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div> */}
            {/* Location */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-600">
                Location
              </label>
              <select
                name="locationId"
                value={form.locationId}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select location</option>
                {locations.map((loc) => (
                  <option key={loc._id} value={loc._id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div> */}
            {/* Remarks */}
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
            {/* Extras */}
 
            {/* Archived Checkbox */}
            {/* <div className="flex items-center gap-2">
              <input
                name="archived"
                type="checkbox"
                checked={form.archived}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <label className="block text-sm font-medium text-gray-600">
                Archived
              </label>
            </div> */}
            {/* Group Select */}
            {/* <div>
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
            </div> */}
            {/* Created By */}
            {/* Type Select */}
          
            {/* Description */}
         
            {/* Active Checkbox */}
            <div className="flex items-center gap-2 ml-1">
              <input
                name="active"
                type="checkbox"
                checked={form.active}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <label className="text-blue-600 font-medium">Active</label>
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
