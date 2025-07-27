import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "https://fms-qkmw.onrender.com/fms/api/v0/ProductVersions";
const SITES_API = "https://fms-qkmw.onrender.com/fms/api/v0/sites";

export default function ProductVersionViewPage({ ProductVersionId: propId, goBack }) {
  // Determine ID from prop or URL
  const { id: paramId } = useParams();
  const ProductVersionId = propId || paramId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [ProductVersion, setProductVersion] = useState(null);
  const [formData, setFormData] = useState({});
  const [sites, setSites] = useState([]);

  const [logoUploading, setLogoUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch ProductVersion detail
  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      try {
        const resp = await axios.get(`${API_BASE}/${ProductVersionId}`);
        const data = resp.data.data || resp.data;
        setProductVersion(data);
        setFormData({ ...data });
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    if (ProductVersionId) fetchDetail();
  }, [ProductVersionId]);

  // Fetch list of sites for dropdown
  useEffect(() => {
    async function fetchSites() {
      try {
        const resp = await axios.get(SITES_API);
        setSites(resp.data.data || resp.data || []);
      } catch (err) {
        console.error("Failed to load sites:", err);
      }
    }
    fetchSites();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => setIsEditing(true);

  const handleUpdate = async () => {
    if (!window.confirm("Are you sure you want to update this ProductVersion?"))
      return;
    setLoading(true);
    const toastId = toast.loading("Updating...");
    try {
      const resp = await axios.put(`${API_BASE}/${ProductVersionId}`, formData);
      const updated = resp.data.data || resp.data;
      setProductVersion(updated);
      setFormData(updated);
      setIsEditing(false);
      toast.update(toastId, {
        render: "Updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      console.error(err);
      toast.update(toastId, {
        render: err.response?.data?.message || "Update failed",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return toast.error("No file selected");
    setLogoUploading(true);
    try {
      const data = new FormData();
      data.append("logoImage", file);
      const resp = await axios.post(`${API_BASE}/logoImage`, data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) =>
          setUploadProgress(Math.round((e.loaded * 100) / e.total)),
      });
      toast.success("Logo uploaded");
      const updated = resp.data.data || resp.data;
      setProductVersion(updated);
      setFormData(updated);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setLogoUploading(false);
      setUploadProgress(0);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-white rounded shadow">
      <ToastContainer />
      <header className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">ProductVersion Details</h2>
        <div className="space-x-2">
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Edit
            </button>
          )}
          <button onClick={goBack} className="px-4 py-2 bg-gray-300 rounded">
            Back
          </button>
          {isEditing && (
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Code (always read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Code
          </label>
          <input
            name="code"
            value={formData.code || ""}
            readOnly
            className="mt-1 block w-full bg-gray-100 p-2 rounded"
          />
        </div>

        {/* Name (always read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            name="name"
            value={formData.name || ""}
            readOnly
            className="mt-1 block w-full bg-gray-100 p-2 rounded"
          />
        </div>

        {/* Type (always read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <input
            name="type"
            value={formData.type || ""}
            readOnly
            className="mt-1 block w-full bg-gray-100 p-2 rounded"
          />
        </div>

        {/* Description (editable when editing) */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            ProductVersion
             Description
          </label>
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            readOnly={!isEditing}
            rows={4}
            className={`mt-1 block w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 ${
              !isEditing ? "bg-gray-100" : ""
            }`}
          />
        </div>

        {/* Site (select, editable when editing) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Site
          </label>
          <select
            name="siteId"
            value={formData.siteId || ""}
            onChange={handleChange}
            disabled={!isEditing}
            className={`mt-1 block w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 ${
              !isEditing ? "bg-gray-100" : ""
            }`}
          >
            <option value="">Select a site…</option>
            {sites.map((s) => (
              <option key={s._id} value={s._id}>
                {s.SiteAccountNo} – {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Logo Upload */}
        <div className="md:col-span-2 flex items-center space-x-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files[0])}
            disabled={!isEditing || logoUploading}
          />
          {logoUploading && <span>{uploadProgress}%</span>}
        </div>
      </div>
    </div>
  );
}
