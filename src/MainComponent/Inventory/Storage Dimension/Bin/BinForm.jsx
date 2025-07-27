import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function BinForm({ handleCancel }) {
  const [form, setForm] = useState({
    code: "", // auto-generated
    name: "",
    description: "",
    type: "Physical",
    shelf: "",
    BinAddress: "",
    remarks: "",
    archived: false,
    company: "",
    groups: [],
    createdBy: "admin",
    updatedBy: "admin",
    active: true,
    extras: "",
    files: [],
  });

  const [shelves, setShelves] = useState([]);

  const apiBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/bins";
  const shelvesUrl = "https://fms-qkmw.onrender.com/fms/api/v0/shelves";

  useEffect(() => {
    const fetchShelves = async () => {
      try {
        const res = await axios.get(shelvesUrl);
        console.log("Raw shelves response:", res.data);

        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
          ? res.data.data
          : [];

        if (data.length === 0) {
          console.warn("❗ Shelves list is empty.");
        } else {
          console.log("✅ Parsed shelves:", data);
        }

        setShelves(data);
      } catch (error) {
        console.error("❌ Failed to fetch shelves:", error);
        toast.error("Failed to load shelves.");
      }
    };

    fetchShelves();
  }, []);

  const handleReset = () => {
    setForm((prev) => ({
      ...prev,
      name: "",
      description: "",
      shelf: "",
      remarks: "",
      BinAddress: "",
      extras: "",
      files: [],
    }));
  };

  const handleChange = (e) => {
    const { name, type, checked, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "file" ? files : value,
    }));
  };

  const createBin = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        code: form.code,
        name: form.name.trim(),
        description: form.description,
        type: form.type,
        shelf: form.shelf,
    

        
        remarks: form.remarks,
    
       
        active: form.active,
       
      };

      await axios.post(apiBaseUrl, payload);
      toast.success("Bin created successfully!", {
        autoClose: 1000,
        onClose: handleCancel,
      });
    } catch (err) {
      console.error("Bin creation failed:", err);
      toast.error("Failed to create bin.");
    }
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <h3 className="text-xl font-semibold mb-4">Create New Bin</h3>

      <form
        onSubmit={createBin}
        className="bg-white rounded-lg divide-y divide-gray-200"
      >
        <section className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Code
            </label>
            <input
              name="code"
              value={form.code}
              readOnly
              placeholder="Auto-generated"
              className="mt-1 w-full cursor-not-allowed p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Bin Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. Central Bin"
              className="mt-1 w-full p-2 border rounded"
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
              required
              className="mt-1 w-full p-2 border rounded"
            >
              <option value="">Select type</option>
              <option value="Physical">Physical</option>
              <option value="Virtual">Virtual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Shelf
            </label>
            <select
              name="shelf"
              value={form.shelf}
              onChange={handleChange}
              required
              className="mt-1 w-full p-2 border rounded"
            >
              <option value="">Select a Shelf</option>
              {shelves.map((shelf) => (
                <option key={shelf._id} value={shelf._id}>
                  {shelf.code} - {shelf.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full p-2 border rounded"
            />
          </div>
        </section>

        <div className="py-6 flex justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-gray-500 hover:underline"
          >
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
