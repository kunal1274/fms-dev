import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ItemForm({ handleCancel, onSaved }) {
  const tabNames = ["General", "Dimension"];
  const [activeTab, setActiveTab] = useState(tabNames[0]);

  const [form, setForm] = useState({
    // General
    itemNum: "",
    name: "",
    type: "",
    price: "",
    unit: "",
    financialGroup: "",
    hierarchicalCategory: "",
    description: "",
    active: false,
    // Dimension
    size: "",
    site: "",
    batch: "",
    serial: "",
    expiryDate: "",
    // Product
    configuration: "",
    colour: "",
  });

  const [items, setItems] = useState([]);
  const apiBase = "https://fms-qkmw.onrender.com/fms/api/v0/items";

  // Generate a new item number
  const generateAccountNo = useCallback((list) => {
    const lastIndex = list
      .map((c) => parseInt(c.itemNum?.split("_")[1], 10))
      .filter((n) => !isNaN(n))
      .reduce((max, n) => Math.max(max, n), 0);
    return `ITEM_${String(lastIndex + 1).padStart(3, "0")}`;
  }, []);

  // Load existing items
  useEffect(() => {
    async function load() {
      try {
        const { data } = await axios.get(apiBase);
        const existing = data.data || [];
        setItems(existing);
        setForm((prev) => ({ ...prev, itemNum: generateAccountNo(existing) }));
      } catch (error) {
        console.error(error);
        toast.error("Couldn't fetch items");
      }
    }
    load();
  }, [apiBase, generateAccountNo]);

  // Unified change handler
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    let val = type === "checkbox" ? checked : value;

    switch (name) {
      case "name":
        val = val
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        break;
      case "itemNum":
        val = val.toUpperCase();
        break;
      case "price":
        if (!/^\d*\.?\d*$/.test(val)) return;
        break;
      case "size":
        if (!/^\d+(?:[xX]\d+)?$/.test(val)) return;
        break;
      case "site":
        if (!/^[A-Za-z\s-]*$/.test(val)) return;
        break;
      case "batch":
        if (!/^[A-Za-z0-9]*$/.test(val)) return;
        break;
      case "serial":
        if (!/^[A-Za-z0-9-]*$/.test(val)) return;
        break;
      // expiryDate (date input) has native validation
      default:
        break;
    }

    setForm((prev) => ({ ...prev, [name]: val }));
  }, []);

  // Submit handler
  const createItem = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(apiBase, form, {
        headers: { "Content-Type": "application/json" },
      });
      const newItem = data.data;
      toast.success("Item saved", {
        autoClose: 1200,
        onClose: handleCancel,
      });
      setItems((prev) => [...prev, newItem]);
      onSaved?.(newItem);
    } catch (err) {
      console.error("Error creating item:", err.response || err);
      const msg = err.response?.data?.message || "Couldn't save item";
      toast.error(msg, { autoClose: 2000 });
    }
  };

  // Reset form
  const handleReset = () => {
    const newNum = generateAccountNo(items);
    setForm({
      itemNum: newNum,
      name: "",
      type: "",
      price: "",
      unit: "",
      financialGroup: "",
      hierarchicalCategory: "",
      description: "",
      active: false,
      size: "",
      site: "",
      batch: "",
      serial: "",
      expiryDate: "",
      configuration: "",
      colour: "",
    });
  };

  return (
    <div>
      <ToastContainer />
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
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
              </svg>
            </button>
          </div>
          <h3 className="text-xl font-semibold">Item Form</h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6">
        <ul className="flex space-x-6 list-none p-0 m-0">
          {tabNames.map((tab) => (
            <li
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer pb-2 transition-colors ${
                activeTab === tab
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab}
            </li>
          ))}
        </ul>
      </div>

      <form
        onSubmit={createItem}
        className="bg-white rounded-lg divide-y divide-gray-200 mt-4"
      >
        {/* General Tab */}
        {activeTab === "General" && (
          <section className="p-6">
            <h2 className="text-lg font-medium text-gray-700 mb-4">
              General Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Item Code
                </label>
                <input
                  name="itemNum"
                  readOnly
                  value={form.itemNum}
                  className="mt-1 w-full cursor-not-allowed p-2 border rounded focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Item Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Item Name"
                  required
                  className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Classification
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Select type</option>
                  <option value="Goods">Goods</option>
                  <option value="Services">Services</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Price
                </label>
                <input
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="e.g. 99.99"
                  required
                  className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Unit
                </label>
                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Select unit</option>
                  <option value="kgs">KG - Kilogram</option>
                  <option value="mt">MT - Metric Tonnes</option>
                  <option value="ea">EA - Each</option>
                  <option value="lbs">LBS - Pounds</option>
                  <option value="hr">HR - Hour</option>
                  <option value="min">MIN - Minutes</option>
                  <option value="qty">QTY - Quantity</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Financial Group
                </label>
                <input
                  type="text"
                  name="financialGroup"
                  value={form.financialGroup}
                  onChange={handleChange}
                  placeholder="e.g. Group Name"
                  className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Hierarchical Category
                </label>
                <input
                  type="text"
                  name="hierarchicalCategory"
                  value={form.hierarchicalCategory}
                  onChange={handleChange}
                  placeholder="e.g. Category Name"
                  className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-600">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="e.g. Detailed description"
                  rows={4}
                  className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                />
              </div>
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
        )}

        {/* Dimension Tab */}
        {activeTab === "Dimension" && (
          <div>
            <section className="p-6">
              <h2 className="text-lg font-medium text-gray-700 mb-4">
                Storage Dimension
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Size
                  </label>
                  <input
                    name="size"
                    value={form.size}
                    onChange={handleChange}
                    placeholder="e.g. 100x200"
                    className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Warehouse
                  </label>
                  <input
                    name="site"
                    value={form.site}
                    onChange={handleChange}
                    placeholder="e.g. New Delhi"
                    className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            </section>
            <section className="p-6">
              <h2 className="text-lg font-medium text-gray-700 mb-4">
                Product Dimension
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Configuration
                  </label>
                  <input
                    name="configuration"
                    value={form.configuration}
                    onChange={handleChange}
                    placeholder="e.g. Model X"
                    className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                  />
                </div>{" "}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Version
                  </label>
                  <input
                    name="colour"
                    value={form.colour}
                    onChange={handleChange}
                    placeholder="e.g. Red"
                    className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Size
                  </label>
                  <input
                    name="colour"
                    value={form.colour}
                    onChange={handleChange}
                    placeholder="e.g. Red"
                    className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                  />
                </div>{" "}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Colour
                  </label>
                  <input
                    name="colour"
                    value={form.colour}
                    onChange={handleChange}
                    placeholder="e.g. Red"
                    className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            </section>
            <section className="p-6">
              <h2 className="text-lg font-medium text-gray-700 mb-4">
                Tracking Dimension
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Batch
                  </label>
                  <input
                    name="configuration"
                    value={form.configuration}
                    onChange={handleChange}
                    placeholder="e.g. Model X"
                    className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                  />
                </div>{" "}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Serial
                  </label>
                  <input
                    name="colour"
                    value={form.colour}
                    onChange={handleChange}
                    placeholder="e.g. Red"
                    className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                  />
                </div>{" "}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Manufacturing
                  </label>
                  <input
                    name="expiryDate"
                    type="date"
                    value={form.expiryDate}
                    onChange={handleChange}
                    className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                  />
                </div>{" "}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Expiry Date
                  </label>
                  <input
                    name="expiryDate"
                    type="date"
                    value={form.expiryDate}
                    onChange={handleChange}
                    className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                  />
                </div>{" "}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Location
                  </label>
                  <input
                    type="text"
                    value={form.expiryDate}
                    onChange={handleChange}
                    className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Cart
                  </label>
                  <input
                    type="text"
                    value={form.expiryDate}
                    onChange={handleChange}
                    className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Bin
                  </label>
                  <input
                    type="text"
                    value={form.expiryDate}
                    onChange={handleChange}
                    className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            </section>
          </div>
        )}

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
