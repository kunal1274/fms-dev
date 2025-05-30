import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ZoneForm({ handleCancel }) {
  const [form, setForm] = useState({
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

  const [warehouses, setWarehouses] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [groupsList, setGroupsList] = useState([]);

  const apiBase = "https://fms-qkmw.onrender.com/fms/api/v0/zones";
  const warehousesBase = "https://fms-qkmw.onrender.com/fms/api/v0/warehouses";
  const companiesBase = "https://fms-qkmw.onrender.com/fms/api/v0/companies";
  const groupsBase = "https://fms-qkmw.onrender.com/fms/api/v0/global-groups";

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [whRes, compRes, grpRes] = await Promise.all([
          axios.get(warehousesBase),
          axios.get(companiesBase),
          axios.get(groupsBase),
        ]);

        // normalize each list
        const normalize = (res) =>
          Array.isArray(res.data?.data)
            ? res.data.data
            : Array.isArray(res.data)
            ? res.data
            : [];

        setWarehouses(normalize(whRes));
        setCompanies(normalize(compRes));
        setGroupsList(normalize(grpRes));
      } catch (err) {
        console.error(err);
        toast.error("Error loading lookup data");
      }
    };
    fetchLookups();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, options } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "groups") {
      const selected = [...options]
        .filter((o) => o.selected)
        .map((o) => o.value);
      setForm((prev) => ({ ...prev, groups: selected }));
    } else if (name === "files") {
      setForm((prev) => ({ ...prev, files: Array.from(e.target.files) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleReset = () => {
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
  };

  const createZone = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      payload.append("code", form.code);
      payload.append("name", form.name);
      payload.append("description", form.description);
      payload.append("type", form.type);
      payload.append("warehouse", form.warehouse);
      payload.append("zoneAddress", form.zoneAddress);
      payload.append("remarks", form.remarks);
      payload.append("archived", form.archived);
      payload.append("company", form.company);
      form.groups.forEach((g) => payload.append("groups", g));
      payload.append("createdBy", form.createdBy);
      payload.append("updatedBy", form.updatedBy);
      payload.append("active", form.active);
      try {
        const extrasObj = JSON.parse(form.extras);
        payload.append("extras", JSON.stringify(extrasObj));
      } catch {
        // ignore invalid JSON
      }
      form.files.forEach((file) => payload.append("files", file));

      await axios.post(apiBase, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Zone created successfully");
      handleCancel();
    } catch (err) {
      console.error("Create error:", err.response || err);
      const msg = err.response?.data?.message || "Error creating zone";
      toast.error(msg);
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
            <label className="block text-sm font-medium text-gray-600">
              Zone Code
            </label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="e.g. ZN-001"
              required
              className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
            />
          </div>
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Zone Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Central Zone"
              required
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
              className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
            >
              <option value="Physical">Physical</option>
              <option value="Virtual">Virtual</option>
            </select>
          </div>
          {/* Warehouse Select */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Warehouse
            </label>
            <select
              name="warehouse"
              value={form.warehouse}
              onChange={handleChange}
              required
              className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Select warehouse</option>
              {warehouses.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
          {/* Company Select */}
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
              <option value="">Select company</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {/* Groups Multi-Select */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Groups
            </label>
            <select
              name="groups"
              multiple
              value={form.groups}
              onChange={handleChange}
              className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 h-32"
            >
              {groupsList.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          {/* Zone Address */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-600">
              Address
            </label>
            <input
              name="zoneAddress"
              value={form.zoneAddress}
              onChange={handleChange}
              placeholder="Enter address"
              className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
            />
          </div>
          {/* Remarks */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-600">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
            />
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
              rows={4}
              className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
            />
          </div>
          {/* Extras JSON */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-600">
              Extras (JSON)
            </label>
            <textarea
              name="extras"
              value={form.extras}
              onChange={handleChange}
              rows={3}
              placeholder='e.g. {"key":"value"}'
              className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
            />
          </div>
          {/* Files Upload */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-600">
              Upload Files
            </label>
            <input
              name="files"
              type="file"
              multiple
              onChange={handleChange}
              className="mt-1 w-full"
            />
          </div>
          {/* Archived & Active */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                name="archived"
                type="checkbox"
                checked={form.archived}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-600">Archived</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                name="active"
                type="checkbox"
                checked={form.active}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-600">Active</span>
            </label>
          </div>
          {/* Created/Updated By */}
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
}
