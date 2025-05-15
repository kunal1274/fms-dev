import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./c.css";

const baseUrl = "https://fms-qkmw.onrender.com";
const secondUrl = "/fms/api/v0";
const thirdUrl = "/Sites";
const mergedUrl = `${baseUrl}${secondUrl}${thirdUrl}`;

const SiteViewPagee = ({ SiteId, goBack }) => {
  const [form, setForm] = useState({
    SiteAccountNo: "",
    name: "",
    email: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { id } = useParams();

  // Fetch existing site data
  useEffect(() => {
    const fetchSite = async () => {
      try {
        const resp = await axios.get(`${mergedUrl}/${SiteId || id}`);
        const data = resp.data.data || resp.data;
        setForm({
          SiteAccountNo: data.SiteAccountNo || "",
          name: data.name || "",
          email: data.email || "",
          description: data.description || "",
        });
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            "Failed to load site data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchSite();
  }, [SiteId, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    if (!window.confirm("Are you sure you want to update this Site?")) return;
    setLoading(true);
    const toastId = toast.loading("Updating…");
    try {
      await axios.put(`${mergedUrl}/${SiteId || id}`, form);
      toast.update(toastId, {
        render: "Site updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      setIsEditing(false);
    } catch (err) {
      toast.update(toastId, {
        render:
          err.response?.data?.message || "Update failed. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-500 text-lg">Loading Site…</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <ToastContainer />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <button
              type="button"
              className="text-blue-600 hover:underline"
              /* TODO: hook up file upload handler */
            >
              Upload Photo
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 inline-block ml-1"
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
              </svg>
            </button>
          </div>
          <h3 className="text-2xl font-semibold">Site View Page</h3>
        </div>
        <div className="space-x-2">
          <button
            onClick={handleEdit}
            disabled={isEditing}
            className="px-4 py-2 bg-green-200 rounded hover:bg-green-300 transition"
          >
            Edit
          </button>
          <button
            onClick={goBack}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Go Back
          </button>
          <button
            onClick={handleUpdate}
            disabled={!isEditing}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Update
          </button>
        </div>
      </div>

      {/* Business Details Form */}
      <form className="bg-white shadow rounded p-6 space-y-6">
        <section>
          <h2 className="text-xl font-medium text-gray-700 mb-4">
            Business Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Site Code */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Site Code
              </label>
              <input
                name="SiteAccountNo"
                value={form.SiteAccountNo}
                readOnly
                placeholder="Auto-generated"
                className="mt-1 w-full cursor-not-allowed p-2 border rounded bg-gray-100"
              />
            </div>
            {/* Site Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Site Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 ${
                  !isEditing ? "bg-gray-50" : ""
                }`}
              />
            </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Email ID
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 ${
                  !isEditing ? "bg-gray-50" : ""
                }`}
              />
            </div>
            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600">
                Site Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                disabled={!isEditing}
                rows={4}
                required
                className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 ${
                  !isEditing ? "bg-gray-50" : ""
                }`}
              />
            </div>
          </div>
        </section>
      </form>
    </div>
  );
};

export default SiteViewPagee;
