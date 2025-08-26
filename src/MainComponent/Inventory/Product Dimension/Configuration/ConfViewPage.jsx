import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./c.css";

const baseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/Configurations";


const ConfViewPage = ({ ConfId: propConfId, toggleView, goBack }) => {
  const { id } = useParams();
  const confId = propConfId || id;

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
  const [error, setError] = useState(null);

  // Fetch Conf data
  useEffect(() => {
    const fetchConf = async () => {
      try {
        const res = await axios.get(`${baseUrl}/${confId}`);
        if (res.status === 200) {
          const data = res.data.data;
          setForm((prev) => ({
            ...prev,
            ...data,
            values: data.values && data.values.length > 0 ? data.values : [""],
          }));
        } else {
          setError(`Unexpected response status: ${res.status}`);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch Conf data.");
      } finally {
        setLoading(false);
      }
    };
    fetchConf();
  }, [confId]);

  // Input field change handler
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setForm((prev) => ({ ...prev, files: Array.from(files) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle Conf value updates
  const handleValueChange = (index, value) => {
    const updated = [...form.values];
    updated[index] = value;
    setForm((prev) => ({ ...prev, values: updated }));
  };

  const addValueField = () => {
    setForm((prev) => ({ ...prev, values: [...prev.values, ""] }));
  };

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
      const payload = { ...form, values: cleanValues };
      const res = await axios.put(`${baseUrl}/${confId}`, payload);
      if (res.status === 200) {
        toast.success("Conf updated successfully!");
        setIsEditing(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-600 text-lg">Loading Conf data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white">
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Conf View Page</h2>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Code
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
            Name *
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type *
          </label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full p-2 border rounded"
          >
            <option value="Virtual">Virtual</option>
            <option value="Physical">Physical</option>
          </select>
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

           <div className="sm:col-span-2 flex justify-end gap-4 mt-6">
          {" "}
          <button
            type="button"
            onClick={handleEdit}
            className="px-6 py-2 bg-green-200 rounded hover:bg-gray-300 transition"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={goBack}
            className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Go Back
          </button>
          <button
            onClick={handleUpdate}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfViewPage;
