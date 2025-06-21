import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const metadataUrl = "https://fms-qkmw.onrender.com/fms/api/v0/items/metadata";
const API_URL = "https://fms-qkmw.onrender.com/fms/api/v0/items";
const FormSelectMeta = ({
  label,
  name,
  value,
  onChange,
  list = [],
  keyField = "_id",
  displayField = "name",
  required = false,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-600">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
    >
      <option value="">{`Select ${label.toLowerCase()}...`}</option>
      {list.map((item) => (
        <option key={item[keyField]} value={item[keyField]}>
          {item[displayField]}
        </option>
      ))}
    </select>
  </div>
);
const ItemForm = () => {
  const [form, setForm] = useState({
    itemNum: "",
    name: "",
    description: "",
    type: "",
    unit: "",
    price: "",
    purchPrice: "",
    salesPrice: "",
    invPrice: "",
    active: false,
  });

  //   const [items, setItems] = useState([]);
  const [colours, setColours] = useState([]);
  const [items, setItems] = useState([]);
  const [sites, setSites] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [zones, setZones] = useState([]);
  const [locations, setLocations] = useState([]);
  const [aisles, setAisles] = useState([]);
  const [racks, setRacks] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [bins, setBins] = useState([]);
  const [serials, setSerials] = useState([]);
  const [batches, setBatches] = useState([]);
  const [pallets, setPallets] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [styles, setStyles] = useState([]);
  const [versions, setVersions] = useState([]);
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const { data } = await axios.get(metadataUrl);
        const md = data.data || {};
        setSites(md.sites || []);
        setWarehouses(md.warehouses || []);
        setZones(md.zones || []);
        setLocations(md.locations || []);
        setAisles(md.aisles || []);
        setColours(md.colours || []);
        setRacks(md.racks || []);
        setShelves(md.shelves || []);
        setBins(md.bins || []);
        setPallets(md.pallets || []);
        setSizes(md.sizes || []);
        setConfigurations(md.configurations || []);
        setStyles(md.styles || []);
        setVersions(md.versions || []);
        setSerials(md.serials || []);
        setBatches(md.batches || []);
        setPallets(md.pallets || []);
      } catch (err) {
        console.error("Error fetching metadata:", err);
        toast.error("Couldn't load metadata");
      }
    };

    const fetchItems = async () => {
      try {
        const res = await axios.get(API_URL);
        setItems(res.data.data || []);
      } catch (err) {
        console.error("Error loading items:", err);
      }
    };

    fetchMetadata();
    fetchItems();
  }, []);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setForm((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
      purchPrice: parseFloat(form.purchPrice) || 0,
      salesPrice: parseFloat(form.salesPrice) || 0,
      invPrice: parseFloat(form.invPrice) || 0,
    };

    try {
      const response = await axios.post(API_URL, payload);
      console.log("POST Response:", response.data);
      toast.success("Item created successfully!");
      setForm({
        itemNum: "",
        name: "",
        description: "",
        type: "",
        unit: "",
        price: "",
        purchPrice: "",
        salesPrice: "",
        invPrice: "",
        active: false,
      });
    } catch (error) {
      console.error("POST Error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message ||
          "Failed to create item. Please try again."
      );
    }
  };

  return (
    <div>
      <ToastContainer />

      <div className="flex justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <button
              type="button"
              className="text-blue-600 mt-2 text-sm hover:underline"
            >
              Upload Photo
            </button>
          </div>
          <h3 className="text-xl font-semibold">Item Form</h3>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
                name="itemNum"
                value={form.itemNum}
                onChange={handleChange}
                required
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

        {/* Storage Dimensions */}
        <section className="p-6 bg-white a">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Storage Dimensions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormSelectMeta
              label="Site"
              name="site"
              value={form.site}
              onChange={handleChange}
              list={sites}
            />
            <FormSelectMeta
              label="Warehouse"
              name="warehouse"
              value={form.warehouse}
              onChange={handleChange}
              list={warehouses}
            />
            <FormSelectMeta
              label="Zone"
              name="zone"
              value={form.zone}
              onChange={handleChange}
              list={zones}
            />
            <FormSelectMeta
              label="Location"
              name="location"
              value={form.location}
              onChange={handleChange}
              list={locations}
            />
            <FormSelectMeta
              label="Aisle"
              name="aisle"
              value={form.aisle}
              onChange={handleChange}
              list={aisles}
            />
            <FormSelectMeta
              label="Rack"
              name="rack"
              value={form.rack}
              onChange={handleChange}
              list={racks}
            />
            <FormSelectMeta
              label="Shelf"
              name="shelf"
              value={form.shelf}
              onChange={handleChange}
              list={shelves}
            />
            <FormSelectMeta
              label="Bin"
              name="bin"
              value={form.bin}
              onChange={handleChange}
              list={bins}
            />
            <FormSelectMeta
              name="colour"
              label="Colour"
              value={form.colour}
              onChange={handleChange}
              list={colours}
            />
          </div>
        </section>

        {/* Product Dimensions */}
        <section className="p-6 bg-white ">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Product Dimensions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormSelectMeta
              name="pallet"
              label="Pallet"
              value={form.pallet}
              onChange={handleChange}
              list={pallets}
            />
            <FormSelectMeta
              name="size"
              label="Size"
              onChange={handleChange}
              value={form.size}
              list={sizes}
            />
            <FormSelectMeta
              name="configuration"
              label="Configuration"
              onChange={handleChange}
              value={form.configuration}
              list={configurations}
            />
            <FormSelectMeta
              name="style"
              label="Style"
              value={form.style}
              onChange={handleChange}
              list={styles}
            />
            <FormSelectMeta
              name="version"
              label="Version"
              value={form.version}
              onChange={handleChange}
              list={versions}
            />
          </div>
        </section>

        {/* Tracking Dimensions */}
        <section className="p-6 bg-white a">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Tracking Dimensions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormSelectMeta
              name="batch"
              label="Batch"
              value={form.version}
              onChange={handleChange}
              list={versions}
            />
            <FormSelectMeta
              name="Serials"
              label="Serials"
              value={form.version}
              onChange={handleChange}
              list={versions}
            />
            <div className="">
              <label className="block text-sm font-medium text-gray-600">
                Manufacturing Date
              </label>
              <input
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div className="">
              <label className="block text-sm font-medium text-gray-600">
                Expiry Date
              </label>
              <input
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex justify-between items-center py-6">
          <button
            type="button"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Reset
          </button>
          <div className="flex gap-4">
            <button
              type="button"
              //   onClick={handleCancel}
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
};

export default ItemForm;
