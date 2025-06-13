import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueries,
} from "@tanstack/react-query";

// Initialize React Query client
const queryClient = new QueryClient();

const currencyOptions = ["INR", "USD", "EUR", "GBP"];

const api = {
  items: "https://fms-qkmw.onrender.com/fms/api/v0/items",
  sites: "https://fms-qkmw.onrender.com/fms/api/v0/sites",
  locations: "https://fms-qkmw.onrender.com/fms/api/v0/locations",
  warehouses: "https://fms-qkmw.onrender.com/fms/api/v0/warehouses",
  zones: "https://fms-qkmw.onrender.com/fms/api/v0/zones",
  racks: "https://fms-qkmw.onrender.com/fms/api/v0/racks",
  shelves: "https://fms-qkmw.onrender.com/fms/api/v0/shelves",
  aisles: "https://fms-qkmw.onrender.com/fms/api/v0/aisles",
  bins: "https://fms-qkmw.onrender.com/fms/api/v0/bins",
};

const initialForm = {
  itemCode: "",
  name: "",
  description: "",
  globalPartyId: "",
  type: "",
  price: "",
  unit: "",
  financialGroup: "",
  hierarchicalCategory: "",
  externalCode: "",
  active: false,
  site: "",
  warehouse: "",
  zone: "",
  location: "",
  aisle: "",
  rack: "",
  shelf: "",
  bin: "",
  pallet: "",
  colour: "",
  size: "",
  configuration: "",
  style: "",
  version: "",
  batch: "",
  serial: "",
  manufacturingDate: "",
  expiryDate: "",
};

function ItemForm({ handleSaveItem, onCancel }) {
  // ITEMS
  const itemsQuery = useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const res = await axios.get(api.items);
      return Array.isArray(res.data.data) ? res.data.data : [];
    },
    initialData: [],
    onError: (err) => {
      console.error("Error fetching items:", err);
      toast.error("Error loading items");
    },
  });

  // METADATA
  const metaQueries = useQueries({
    queries: Object.entries({
      sites: api.sites,
      locations: api.locations,
      warehouses: api.warehouses,
      zones: api.zones,
      racks: api.racks,
      shelves: api.shelves,
      aisles: api.aisles,
      bins: api.bins,
    }).map(([key, url]) => ({
      queryKey: [key],
      queryFn: async () => {
        const res = await axios.get(url);
        return Array.isArray(res.data.data) ? res.data.data : [];
      },
      initialData: [],
      onError: (err) => {
        console.error(`Error fetching ${key}:`, err);
        toast.error(`Error loading ${key}`);
      },
    })),
  });

  const isLoading =
    itemsQuery.isLoading || metaQueries.some((q) => q.isLoading);
  const isError = itemsQuery.isError || metaQueries.some((q) => q.isError);
  const [form, setForm] = useState(initialForm);

  // Generate next item code
  const generateItemCode = useCallback((list) => {
    const maxIndex = list
      .map((i) => parseInt(i.itemCode?.split("_")[1], 10))
      .filter((n) => !isNaN(n))
      .reduce((m, n) => Math.max(m, n), 0);
    console.log("Generated new item code based on list:", maxIndex + 1);
    return `ITEM_${String(maxIndex + 1).padStart(3, "0")}`;
  }, []);

  useEffect(() => {
    if (itemsQuery.isSuccess) {
      setForm((f) => ({ ...f, itemCode: generateItemCode(itemsQuery.data) }));
    }
  }, [itemsQuery.data, itemsQuery.isSuccess, generateItemCode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(
      `Field changed: ${name} =>`,
      type === "checkbox" ? checked : value
    );
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleReset = () => {
    console.log("Form reset");
    setForm({ ...initialForm, itemCode: generateItemCode(itemsQuery.data) });
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
        rackAisle: form.aisle,
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
    console.log("Creating item with payload:", payload);
    try {
      const res = await axios.post(api.items, payload, {
        headers: { "Content-Type": "application/json" },
      });
      toast.success("Item saved!", { autoClose: 1200, onClose: onCancel });
      handleSaveItem(res.data.data);
    } catch (err) {
      console.error("Error saving item:", err);
      toast.error(err.response?.data?.message || "Couldn't save item");
    }
  };

  if (isLoading) return <div>Loading…</div>;
  if (isError) return <div>Error loading data</div>;

  const [sites, locations, warehouses, zones, racks, shelves, aisles, bins] =
    metaQueries.map((q) => q.data);

  return (
    <div className="max-w-2xl mx-auto">
      <ToastContainer />
      <h3 className="text-xl font-semibold mb-4">Create New Item</h3>
      <form onSubmit={createItem} className="space-y-6">
        {/* Basic Info Section */}
        <section className="p-6 bg-white rounded shadow-sm">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Basic Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col">
              <span className="text-sm text-gray-600">Item Code</span>
              <input
                name="itemCode"
                value={form.itemCode}
                readOnly
                className="mt-1 p-2 border rounded bg-gray-100"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-sm text-gray-600">Name</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="mt-1 p-2 border rounded"
                placeholder="Item name…"
                required
              />
            </label>
            {/* Price, Type, Currency etc. */}
            <label className="flex flex-col">
              <span className="text-sm text-gray-600">Price</span>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="mt-1 p-2 border rounded"
                placeholder="Unit price…"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-sm text-gray-600">Currency</span>
              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className="mt-1 p-2 border rounded"
              >
                <option value="">Select currency</option>
                {currencyOptions.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {/* Storage Dimension Section */}
        <section className="p-6 bg-white rounded shadow-sm">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Storage Dimension
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ["site", sites],
              ["warehouse", warehouses],
              ["zone", zones],
              ["location", locations],
              ["aisle", aisles],
              ["rack", racks],
              ["shelf", shelves],
              ["bin", bins],
            ].map(([field, list]) => (
              <label key={field} className="flex flex-col">
                <span className="text-sm text-gray-600 capitalize">
                  {field}
                </span>
                <select
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  className="mt-1 p-2 border rounded"
                >
                  <option value="">Select {field}</option>
                  {list.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name || opt.code || opt.id}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <label className="flex flex-col">
              <span className="text-sm text-gray-600">Pallet</span>
              <input
                name="pallet"
                value={form.pallet}
                onChange={handleChange}
                className="mt-1 p-2 border rounded"
                placeholder="Pallet code…"
              />
            </label>
          </div>
        </section>

        {/* Tracking Dimension Section */}
        <section className="p-6 bg-white rounded shadow-sm">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Tracking Dimension
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col">
              <span className="text-sm text-gray-600">Batch</span>
              <input
                type="text"
                name="batch"
                value={form.batch}
                onChange={handleChange}
                className="mt-1 p-2 border rounded"
                placeholder="Batch…"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-sm text-gray-600">Serial</span>
              <input
                type="text"
                name="serial"
                value={form.serial}
                onChange={handleChange}
                className="mt-1 p-2 border rounded"
                placeholder="Serial…"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-sm text-gray-600">Manufacturing Date</span>
              <input
                type="date"
                name="manufacturingDate"
                value={form.manufacturingDate}
                onChange={handleChange}
                className="mt-1 p-2 border rounded"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-sm text-gray-600">Expiry Date</span>
              <input
                type="date"
                name="expiryDate"
                value={form.expiryDate}
                onChange={handleChange}
                className="mt-1 p-2 border rounded"
              />
            </label>
          </div>
        </section>

        <div className="flex justify-between items-center pt-6">
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
              onClick={onCancel}
              className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Item
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// Wrapper that provides React Query context
export default function ItemFormWrapper(props) {
  return (
    <QueryClientProvider client={queryClient}>
      <ItemForm {...props} />
    </QueryClientProvider>
  );
}
