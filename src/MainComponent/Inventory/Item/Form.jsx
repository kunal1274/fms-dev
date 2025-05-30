import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";

const currency = ["INR", "USD", "EUR", "GBP"];

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
  // storage dimensions
  site: "",
  warehouse: "",
  zone: "",
  location: "",
  aisle: "",
  rack: "",
  shelf: "",
  bin: "",
  pallet: "",
  // product dimensions
  colour: "",
  size: "",
  configuration: "",
  style: "",
  version: "",
  // tracking dimensions
  batch: "",
  serial: "",
  manufacturingDate: "",
  expiryDate: "",
};

export default function ItemForm({ onSaved, handleCancel }) {
  const [form, setForm] = useState(initialForm);
  const [items, setItems] = useState([]);

  // Dropdown data lists
  const [sites, setSites] = useState([]);
  const [locations, setLocations] = useState([]);
  const [racks, setRacks] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [zones, setZones] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [aisles, setAisles] = useState([]);
  const [bins, setBins] = useState([]);

  // API endpoints
  const apiItemBase = "https://fms-qkmw.onrender.com/fms/api/v0/items";
  const apiSiteBase = "https://fms-qkmw.onrender.com/fms/api/v0/sites";
  // const apiLocationBase = "https://fms-qkmw.onrender.com/fms/api/v0/location";
  // const apiRackBase = "https://fms-qkmw.onrender.com/fms/api/v0/rack";
  // const apiShelvesBase = "https://fms-qkmw.onrender.com/fms/api/v0/shelves";
  // const apiZoneBase = "https://fms-qkmw.onrender.com/fms/api/v0/zone";
  // const apiWarehouseBase = "https://fms-qkmw.onrender.com/fms/api/v0/warehouse";
  const apiAislesBase = "https://fms-qkmw.onrender.com/fms/api/v0/aisles";
  // const apiBinBase = "https://fms-qkmw.onrender.com/fms/api/v0/bin";
  useEffect(() => {
    const fetchapiShelvesBase = async () => {
      try {
        const response = await axios.get(apiShelvesBase);
        setShelves(response.data || []);
      } catch (error) {
        console.error("Error fetching items 73V:", error);
      }
    };
    const fetchapiWarehouseBase = async () => {
      try {
        const response = await axios.get(apiWarehouseBase);
        setWarehouses(response.data || []);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    const fetchapiRackBase = async () => {
      try {
        const response = await axios.get(apiRackBase);
        setRacks(response.data || []);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    const fetchapiZoneBase = async () => {
      try {
        const response = await axios.get(apiZoneBase);
        setZones(response.data || []);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    const fetchBinBases = async () => {
      try {
        const response = await axios.get(apiBinBase);
        setBins(response.data || []);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    const fetchapiAislesBase = async () => {
      try {
        const response = await axios.get(apiAislesBase);
        setAisles(response.data || []);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    const fetchLocationBase = async () => {
      try {
        const response = await axios.get(apiLocationBase);
        setLocations(response.data || []);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    const fetchapiSiteBase = async () => {
      try {
        const response = await axios.get(apiSiteBase);
        setSites(response.data || []);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(companiesUrl);
        // setWarehouses(response.data || []);
        setBins(response.data || []);
      } catch (error) {
        console.error("Error fetching Company 63:", error);
      }
    };
    fetchLocationBase();
    fetchapiSiteBase();
    fetchLocationBase();
    fetchapiWarehouseBase();
    fetchapiZoneBase();
    fetchapiAislesBase();
    fetchapiRackBase();
    fetchBinBases();
    fetchapiShelvesBase();
    fetchapiWarehouseBase();
  }, []);
  // Helpers
  const generateItemCode = useCallback((list) => {
    const last = list
      .map((i) => parseInt(i.itemCode?.split("_")[1], 10))
      .filter((n) => !isNaN(n))
      .reduce((m, n) => Math.max(m, n), 0);
    return `ITEM_${String(last + 1).padStart(3, "0")}`;
  }, []);

  // Fetch functions
  const fetchItems = async () => {
    try {
      const { data } = await axios.get(apiItemBase);
      setItems(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Couldn’t fetch items");
    }
  };

  const fetchList = async (url, setter, label) => {
    try {
      const { data } = await axios.get(url);
      setter(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error(`Couldn’t fetch ${label}`);
    }
  };

  // Initial load

  // Generate code when items loaded
  useEffect(() => {
    if (items.length) {
      setForm((prev) => ({ ...prev, itemCode: generateItemCode(items) }));
    }
  }, [items, generateItemCode]);

  // Handle change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Submit
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

    try {
      const res = await axios.post(apiItemBase, payload, {
        headers: { "Content-Type": "application/json" },
      });
      const newItem = res.data.data;
      toast.success("Item saved!", { autoClose: 1200, onClose: handleCancel });
      setItems((prev) => [...prev, newItem]);
      onSaved?.(newItem);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Couldn’t save item");
    }
  };

  // Reset
  const handleReset = () => {
    const next = generateItemCode(items);
    setForm({ ...initialForm, itemCode: next });
  };

  return (
    <div className="">
      <ToastContainer />
      {/* Header Buttons */}
      <div className="flex justify-between ">
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
              </svg>{" "}
            </button>
          </div>
          <h3 className="text-xl font-semibold"> Item Form</h3>
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
            {/* Site */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Site
              </label>
              <select
                name="site"
                value={form.site}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select a site…</option>
                {sites.length ? (
                  sites.map((s) => (
                    <option key={s._id} value={s._id}>
                      {`${s.siteAccountNo || s.SiteAccountNo} – ${s.name}`}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading sites...</option>
                )}
              </select>
            </div>

            {/* Warehouse */}
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
                <option value="">Select a warehouse…</option>
                {warehouses.length ? (
                  warehouses.map((w) => (
                    <option key={w._id} value={w._id}>
                      {`${w.name} – ${w.name}`}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading warehouses...</option>
                )}
              </select>
            </div>

            {/* Zone */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Zone
              </label>
              <select
                name="zone"
                value={form.zone}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select a zone…</option>
                {zones.length ? (
                  zones.map((z) => (
                    <option key={z._id} value={z._id}>
                      {`${z.zoneAccountNo || z.ZoneAccountNo} – ${z.name}`}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading zones...</option>
                )}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Location
              </label>
              <select
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select a location…</option>
                {locations.length ? (
                  locations.map((l) => (
                    <option key={l._id} value={l._id}>
                      {`${l.locationAccountNo || l.LocationAccountNo} – ${
                        l.name
                      }`}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading locations...</option>
                )}
              </select>
            </div>

            {/* Aisle */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Aisle
              </label>
              <select
                name="aisle"
                value={form.aisle}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select an aisle…</option>
                {aisles.length ? (
                  aisles.map((a) => (
                    <option key={a._id} value={a._id}>
                      {`${a.aisleAccountNo || a.AisleAccountNo} – ${a.name}`}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading aisles...</option>
                )}
              </select>
            </div>

            {/* Rack */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Rack
              </label>
              <select
                name="rack"
                value={form.rack}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select a rack…</option>
                {racks.length ? (
                  racks.map((r) => (
                    <option key={r._id} value={r._id}>
                      {`${r.rackAccountNo || r.RackAccountNo} – ${r.name}`}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading racks...</option>
                )}
              </select>
            </div>

            {/* Shelf */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Shelf
              </label>
              <select
                name="shelf"
                value={form.shelf}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select a shelf…</option>
                {shelves.length ? (
                  shelves.map((s) => (
                    <option key={s._id} value={s._id}>
                      {`${s.shelfAccountNo || s.ShelfAccountNo} – ${s.name}`}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading shelves...</option>
                )}
              </select>
            </div>

            {/* Bin */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Bin
              </label>
              <select
                name="bin"
                value={form.bin}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select a bin…</option>
                {bins.length ? (
                  bins.map((b) => (
                    <option key={b._id} value={b._id}>
                      {`${b.binAccountNo || b.BinAccountNo} – ${b.name}`}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading bins...</option>
                )}
              </select>
            </div>

            {/* Pallet */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Pallet
              </label>
              <input
                type="text"
                name="pallet"
                value={form.pallet}
                onChange={handleChange}
                placeholder="Enter pallet code…"
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
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
            {/* Colour */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Colour
              </label>
              <input
                type="text"
                name="colour"
                value={form.colour}
                onChange={handleChange}
                placeholder="e.g., Red, Blue..."
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Size
              </label>
              <input
                type="text"
                name="size"
                value={form.size}
                onChange={handleChange}
                placeholder="e.g., S, M, L, XL"
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Configuration */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Configuration
              </label>
              <select
                name="configuration"
                value={form.configuration}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select configuration</option>
                {currency.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Style */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Style
              </label>
              <input
                type="text"
                name="style"
                value={form.style}
                onChange={handleChange}
                placeholder="e.g., Casual, Formal..."
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Version */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Version
              </label>
              <input
                type="text"
                name="version"
                value={form.version}
                onChange={handleChange}
                placeholder="e.g., v1.0, v2.0..."
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
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
              <select
                name="  Batch"
                value={form.Batch}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select a site…</option>
                {sites.length ? (
                  sites.map((s) => (
                    <option key={s._id} value={s._id}>
                      {(s.siteAccountNo || s.SiteAccountNo) + " – " + s.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading sites...</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Serial
              </label>
              <select
                name=" Serial"
                value={form.Serial}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select a site…</option>
                {sites.length ? (
                  sites.map((s) => (
                    <option key={s._id} value={s._id}>
                      {(s.siteAccountNo || s.SiteAccountNo) + " – " + s.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading sites...</option>
                )}
              </select>
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
