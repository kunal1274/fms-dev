import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ZoneForm({ handleCancel }) {
  console.log("Line 1: Render ZoneForm component");

  // Initial form state
  const [form, setForm] = useState(() => {
    console.log("Line 5: Initializing form state");
    const initial = {
      name: "",
      description: "",
      type: "Physical",
      warehouse: "",
      zoneAddress: "",
      remarks: "",
      archived: false,
      company: "",
      customer: "",
      groups: [],
      createdBy: "",
      updatedBy: "",
      active: true,
      extras: "",
      files: [],
    };
    console.log("Line 20: Initial form object", initial);
    return initial;
  });

  // Lookup lists
  const [warehouses, setWarehouses] = useState([]);
  const [warehouse, setWarehouse] = useState([]);
  console.log("Line 25: Declared warehouses state");
  const [companies, setCompanies] = useState([]);

  console.log("Line 27: Declared companies state");
  const [groupsList, setGroupsList] = useState([]);
  console.log("Line 29: Declared groupsList state");

  // API endpoints
  console.log("Line 34: Defining API URLs");
  const apiBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/zones";
  const warehousesUrl = "https://fms-qkmw.onrender.com/fms/api/v0/warehouses";
  const companiesUrl = "https://fms-qkmw.onrender.com/fms/api/v0/companies";

  useEffect(() => {
   const fetchWarehouses = async () => {
  try {
    const response = await axios.get(warehousesUrl);
    setWarehouses(response.data || []);

    
  } catch (error) {
    console.error("Error fetching:", error);
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

  // Handle form field changes
  const handleChange = (e) => {
    console.log("Line 76: handleChange triggered");
    const { name, type, checked, value, files, options } = e.target;
    console.log("Line 78: Field change details", {
      name,
      type,
      value,
      checked,
    });
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
      console.log(`Line 81: Checkbox ${name} set to`, checked);
    } else if (name === "groups") {
      const selected = Array.from(options)
        .filter((o) => o.selected)
        .map((o) => o.value);
      setForm((prev) => ({ ...prev, groups: selected }));
      console.log("Line 85: Groups selected", selected);
    } else if (type === "file") {
      setForm((prev) => ({ ...prev, files: Array.from(files) }));
      console.log("Line 88: Files set", files);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      console.log(`Line 91: Field ${name} set to`, value);
    }
  };

  // Reset form to initial values
  const handleReset = () => {
    console.log("Line 96: handleReset triggered");
    setForm({
      code: "",
      name: "",
      description: "",
      type: "Physical",
      warehouse: "",
      zoneAddress: "",
      remarks: "",
      archived: false,
      company: "",

      groups: [],
      createdBy: "",
      updatedBy: "",
      active: true,
      extras: "",
      files: [],
    });
    console.log("Line 117: Form reset complete");
  };

  // Submit form
  const createZone = async (e) => {
    e.preventDefault();

    const payload = {
      codeAccountNo: form.SiteAccountNo || "",
      code: form.code || "",
      name: form.name || "",
      description: form.description || "",
      type: form.type || "Physical",
      site: form.siteId || "",
      warehouse: form.warehouse || "",
      zoneAddress: form.zoneAddress || "",
      remarks: form.remarks || "",
      archived: form.archived ?? false,
      company: form.company || "",
      groups: form.groups || [],
      createdBy: form.createdBy || "",
      updatedBy: form.updatedBy || "",
      active: form.active ?? true,
      extras: form.extras || "",
      files: form.files || [],
    };

    try {
      await axios.post(apiBaseUrl, payload);

      toast.success("Zone created successfully", {
        autoClose: 1000,
        onClose: handleCancel,
      });
    } catch (err) {
      // console.error("Create error:", err.response || err);
      // toast.error(err.response?.data?.message || "Couldn’t create Site");
    }
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <h3 className="text-xl font-semibold mb-4">Zone Form</h3>
      <form
        onSubmit={createZone}
        className="bg-white rounded-lg divide-y divide-gray-200"
      >
        <section className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Zone Code */}
          <div>
            <label>Zone Code</label>
            <input
              name="code"
              // value={form.code}
              onChange={handleChange}
              placeholder="e.g. ZN-001"
              className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Zone Name */}
          <div>
            <label>Zone Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Central Zone"
              required
              className="mt-1 w-full p-2 border rounded"
            />
          </div>

          {/* Type */}
          <div>
            <label>Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="mt-1 w-full p-2 border rounded"
            >
              <option value="Physical">Physical</option>
              <option value="Virtual">Virtual</option>
            </select>
          </div>
          {/* Warehouse */}
          <div>
            <label>Warehouse</label>
            <select
              name="warehouse"
              value={form.warehouse}
              onChange={handleChange}
              required
              className="mt-1 w-full p-2 border rounded"
            >
              <option value="">Select</option>
              {warehouses.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
      <div>
            <label>Location</label>
            <select
              name="warehouse"
              value={form.warehouse}
              onChange={handleChange}
              required
              className="mt-1 w-full p-2 border rounded"
            >
              <option value="">Select</option>
              {warehouses.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
          {/* Groups */}
          <div>
            <label>Groups</label>
            <select
              name="groepen"
              multiple
              value={form.groups}
              onChange={handleChange}
              className="mt-1 w-full p-2 border rounded h-24"
            >
              {groupsList.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          {/* Address */}
          <div className="sm:col-span-2">
            <label>Address</label>
            <input
              name="zoneAddress"
              value={form.zoneAddress}
              onChange={handleChange}
              placeholder="Address"
              className="mt-1 w-full p-2 border rounded"
            />
          </div>
          {/* Remarks */}
          <div className="sm:col-span-2">
            <label>Remarks</label>
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full p-2 border rounded"
            />
          </div>
          {/* Description */}
          <div className="sm:col-span-2">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 w-full p-2 border rounded"
            />
          </div>
          {/* Extras */}
          <div className="sm:col-span-2">
            <label>Extras (JSON)</label>
            <textarea
              name="extras"
              value={form.extras}
              onChange={handleChange}
              rows={3}
              placeholder='{"key":"value"}'
              className="mt-1 w-full p-2(border rounded)"
            />
          </div>
          {/* Files */}
          <div className="sm:col-span-2">
            <label>Files</label>
            <input
              name="files"
              type="file"
              multiple
              onChange={handleChange}
              className="mt-1 w-full"
            />
          </div>
          {/* Checkboxes */}
          <div className="flex items-center gap-4 sm:col-span-2">
            <label>
              <input
                name="archived"
                type="checkbox"
                checked={form.archived}
                onChange={handleChange}
              />{" "}
              Archived
            </label>
            <label>
              <input
                name="active"
                type="checkbox"
                checked={form.active}
                onChange={handleChange}
              />{" "}
              Active
            </label>
          </div>
          {/* Created By */}
          <div>
            <label>Created By</label>
            <input
              name="createdBy"
              value={form.createdBy}
              onChange={handleChange}
              placeholder="User ID"
              className="mt-1 w-full p-2 border rounded"
            />
          </div>
          {/* Updated By */}
          <div>
            <label>Updated By</label>
            <input
              name="updatedBy"
              value={form.updatedBy}
              onChange={handleChange}
              placeholder="User ID"
              className="mt-1 w-full p-2 border rounded"
            />
          </div>
        </section>
        {/* Form actions */}
        <div className="py-6 flex justify-between">
          <button type="button" onClick={handleReset} className="text-gray-500">
            Reset
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Create
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
