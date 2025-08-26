import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./c.css";

const baseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/versions";

const ProductDimVersionViewPage = ({
  ProductVersionId: propProductVersionId,
  toggleView,
  goBack,
}) => {
  const { id } = useParams();
  const ProductVersionId = propProductVersionId || id;

  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    type: "Virtual",
    values: [""],
    combination: "",
    extras: "",
    files: [],
    active: true,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Fetch Product Version data
  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const res = await axios.get(`${baseUrl}/${ProductVersionId}`);
        if (res.status === 200) {
          const data = res.data.data;
          setForm({
            ...data,
            values: data.values && data.values.length > 0 ? data.values : [""],
          });
        } else {
          setError(`Unexpected response status: ${res.status}`);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch Product Version data."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchVersion();
  }, [ProductVersionId]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setForm((prev) => ({ ...prev, files: Array.from(files) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle version value changes
  const handleValueChange = (index, value) => {
    const updated = [...form.values];
    updated[index] = value;
    setForm((prev) => ({ ...prev, values: updated }));
  };

  const addValueField = () =>
    setForm((prev) => ({ ...prev, values: [...prev.values, ""] }));

  const removeValueField = (index) => {
    const updated = form.values.filter((_, i) => i !== index);
    setForm((prev) => ({
      ...prev,
      values: updated.length > 0 ? updated : [""],
    }));
  };

  const handleEdit = () => setIsEditing(true);

  const handleUpdate = async () => {
    if (!isEditing) return toast.error("Click 'Edit' before updating.");

    const cleanValues = form.values.filter((v) => v.trim() !== "");
    if (!form.name.trim() || !form.type || cleanValues.length === 0) {
      toast.error("Please fill all required fields correctly.");
      return;
    }

    try {
      setUpdating(true);
      const payload = { ...form, values: cleanValues };
      const res = await axios.put(`${baseUrl}/${ProductVersionId}`, payload);
      if (res.status === 200) {
        toast.success("Product Version updated successfully!");
        setIsEditing(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-600 text-lg">
          Loading Product Version data...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded shadow-md">
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Product Version Details</h2>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Version Code
          </label>
          <input
            name="code"
            value={form.code}
            readOnly
            className="w-full p-2 border rounded bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Version Name *
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">
            Type
          </label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            disabled={!isEditing}
            className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
          >
            <option value="Physical">Physical</option>
            <option value="Virtual">Virtual</option>
          </select>
        </div>

        {/* Values section */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Values *
          </label>
          {form.values.map((val, index) => (
            <div key={index} className="flex items-center gap-2 mt-1">
              <input
                value={val}
                onChange={(e) => handleValueChange(index, e.target.value)}
                disabled={!isEditing}
                className="w-full p-2 border rounded"
              />
              {isEditing && form.values.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeValueField(index)}
                  className="text-red-500 px-2 py-1"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {isEditing && (
            <button
              type="button"
              onClick={addValueField}
              className="mt-2 px-4 py-1 bg-blue-500 text-white rounded"
            >
              + Add Value
            </button>
          )}
        </div>

        {/* Action buttons */}
        <div className="sm:col-span-2 flex justify-end gap-4 mt-6">
          {!isEditing ? (
            <button
              type="button"
              onClick={handleEdit}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Edit
            </button>
          ) : (
            <button
              type="button"
              onClick={handleUpdate}
              disabled={updating}
              className={`px-6 py-2 text-white rounded transition ${
                updating ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {updating ? "Updating..." : "Update"}
            </button>
          )}
          <button
            type="button"
            onClick={goBack}
            className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
          >
            Go Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductDimVersionViewPage;
