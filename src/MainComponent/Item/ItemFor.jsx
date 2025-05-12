import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";

const currency = ["INR", "USD", "EUR", "GBP"];

const initialForm = {
  itemCode: "",
  name: "",
  globalPartyId: "",
  type: "",
  price: "",
  unit: "",
  financialGroup: "",
  hierarchicalCategory: "",
  externalCode: "",
  description: "",
  active: true,
  // Storage Dimension
  site: "",
  warehouse: "",
  zone: "",
  location: "",
  rackAisle: "",
  rack: "",
  shelf: "",
  bin: "",
  pallet: "",
  // Product Dimension
  colour: "",
  size: "",
  configuration: "",
  style: "",
  version: "",
  // Tracking Dimension
  batch: "",
  serial: "",
  manufacturingDate: "",
  expiryDate: "",
};

export default function ItemForm({ handleCancel, onSaved }) {
  const apiBase = "https://fms-qkmw.onrender.com/fms/api/v0/items";

  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);

  // Fetch existing items and set next item code
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get(apiBase);
        const list = res.data.data || [];
        setItems(list);
        const next = generateItemCode(list);
        setForm((prev) => ({ ...prev, itemCode: next }));
      } catch (err) {
        console.error("Error fetching items:", err);
      }
    };
    fetchItems();
  }, []);

  const generateItemCode = (list) => {
    if (!list.length) return "ITEM_0001";
    const nums = list
      .map((i) => {
        const parts = i.itemCode?.split("_");
        return parts.length > 1 ? parseInt(parts[1], 10) : NaN;
      })
      .filter((n) => !isNaN(n));
    const max = nums.length ? Math.max(...nums) : 0;
    return `ITEM_${String(max + 1).padStart(4, "0")}`;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const handleReset = () => {
    const next = generateItemCode(items);
    setForm({ ...initialForm, itemCode: next });
  };

  const createItem = async (e) => {
    e.preventDefault();

    const payload = {
      itemCode: form.itemCode,
      name: form.name,
      globalPartyId: form.globalPartyId,
      type: form.type,
      price: form.price,
      unit: form.unit,
      financialGroup: form.financialGroup,
      hierarchicalCategory: form.hierarchicalCategory,
      externalCode: form.externalCode,
      description: form.description,
      active: form.active,
      storageDimension: {
        site: form.site,
        warehouse: form.warehouse,
        zone: form.zone,
        location: form.location,
        rackAisle: form.rackAisle,
        rack: form.rack,
        shelf: form.shelf,
        bin: form.bin,
        pallet: form.pallet,
      },
      productDimension: {
        colour: form.colour,
        size: form.size,
        configuration: form.configuration,
        style: form.style,
        version: form.version,
      },
      trackingDimension: {
        batch: form.batch,
        serial: form.serial,
        manufacturingDate: form.manufacturingDate,
        expiryDate: form.expiryDate,
      },
    };

    try {
      const res = await axios.post(apiBase, payload, {
        headers: { "Content-Type": "application/json" },
      });
      const newItem = res.data.data;
      toast.success("Item saved", {
        autoClose: 1200,
        onClose: () => handleCancel(),
      });
      setItems((prev) => [...prev, newItem]);
      onSaved?.(newItem);
    } catch (err) {
      console.error("Error creating item:", err.response || err);
      toast.error(err.response?.data?.message || "Couldn’t save item", {
        autoClose: 2000,
      });
    }
  };

  return (
    <div>
      <ToastContainer />
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
      <form onSubmit={createItem} className="space-y-6">
        {/* Item Details */}
        <section className="p-6 bg-white rounded Item">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Item Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Item Code
              </label>
              <input
                name="itemCode"
                value={form.itemCode}
                readOnly
                className="mt-1 w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
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
                required
                className="mt-1 w-full p-2 border rounded"
              >
                <option value="">Select type</option>
                <option value="Goods">Goods</option>
                <option value="Services">Services</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Item Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Global Party ID
              </label>
              <input
                name="globalPartyId"
                value={form.globalPartyId}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Price
              </label>
              <input
                name="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded"
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
                required
                className="mt-1 w-full p-2 border rounded"
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
                name="financialGroup"
                value={form.financialGroup}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Hierarchical Category
              </label>
              <input
                name="hierarchicalCategory"
                value={form.hierarchicalCategory}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div className="">
              <label className="block text-sm font-medium text-gray-600">
                External Code
              </label>
              <input
                name="externalCode"
                value={form.externalCode}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div className="flex items-center ml-2">
              <input
                name="active"
                type="checkbox"
                checked={form.active}
                onChange={handleChange}
                className="h-4 w-4"
              />
              <label className="ml-2 text-sm font-medium text-gray-600">
                Active
              </label>
            </div>
          </div>
        </section>

        {/* Storage Dimension */}
        <section className="p-6 bg-white rounded Item">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Storage Dimension
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Site
              </label>
              <input
                name="site"
                value={form.site}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Warehouse
              </label>
              <input
                name="warehouse"
                value={form.warehouse}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Zone
              </label>
              <input
                name="zone"
                value={form.zone}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Location
              </label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Rack / Aisle
              </label>
              <input
                name="rackAisle"
                value={form.rackAisle}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Rack
              </label>
              <input
                name="rack"
                value={form.rack}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Shelf
              </label>
              <input
                name="shelf"
                value={form.shelf}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Bin
              </label>
              <input
                name="bin"
                value={form.bin}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Pallet
              </label>
              <input
                name="pallet"
                value={form.pallet}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
          </div>
        </section>

        {/* Product Dimension */}
        <section className="p-6 bg-white rounded Item">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Product Dimension
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Colour
              </label>
              <input
                name="colour"
                value={form.colour}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Size
              </label>
              <input
                name="size"
                value={form.size}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Configuration
              </label>
              <select
                name="configuration"
                value={form.configuration}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              >
                <option value="">Select configuration</option>
                {currency.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Style
              </label>
              <input
                name="style"
                value={form.style}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Version
              </label>
              <input
                name="version"
                value={form.version}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
          </div>
        </section>

        {/* Tracking Dimension */}
        <section className="p-6 bg-white rounded Item">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Tracking Dimension
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Batch
              </label>
              <input
                name="batch"
                value={form.batch}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Serial
              </label>
              <input
                name="serial"
                value={form.serial}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Manufacturing Date
              </label>
              <input
                name="manufacturingDate"
                type="date"
                value={form.manufacturingDate}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Expiry Date
              </label>
              <input
                name="expiryDate"
                type="date"
                value={form.expiryDate}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-between items-center py-6">
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Reset
          </button>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Go Back
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
