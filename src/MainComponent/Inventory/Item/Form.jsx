import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";

const businessTypes = [
  "Individual",
  "Manufacturing",
  "ServiceProvider",
  "Trading",
  "Distributor",
  "Retailer",
  "Wholesaler",
  "Others",
];
const currency = ["INR", "USD", "EUR", "GBP"];
const paymentTerms = [
  "COD",
  "Net30D",
  "Net7D",
  "Net15D",
  "Net45D",
  "Net60D",
  "Net90D",
  "Advance",
];

const bankTypes = ["BankAndUpi", "Cash", "Bank", "Crypto", "Barter", " UPI"];
export default function CustomerForm({ handleCancel }) {
  const [form, setForm] = useState({
    code: "",
    name: "",
    businessType: "",
    address: "",
    contactNum: "",
    email: "",
    Tannumber: "",
    group: "",
    remarks: "",
    employeeName: "",
    contactPersonName: "",
    employeePhone: "",
    paymentTerms: "",
    contactPersonPhone: "",
    employeeEmail: "",
    creditLimit: "",
    bankType: "",
    accountHolderName: "",
    bankAccNum: "",
    bankName: "",
    ifsc: "",
    contactPersonEmail: "",
    swift: "",
    upi: "",
    currency: "",
    panNum: "",
    registrationNum: "",
    globalPartyId: "",
    active: true,
    qrDetails: "",
  });
  const apiBase = "//fms-qkmw.onrender.com/fms/api/v0/items";

  // ─── Data ────────────────────────────────────────────────
  const [customers, setCustomers] = useState([]);
  const disableBankFields =
    form.bankType === "Cash" ||
    form.bankType === "Barter" ||
    form.bankType === "qrDetails" ||
    form.bankType === "Crypto";
  const [logoUploading, setLogoUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const handleFileUpload = async (file) => {
    if (!file) {
      toast.error("No file selected!");
      return;
    }
    setLogoUploading(true);

    try {
      const formData = new FormData();
      formData.append("logoImage", file);

      await axios.post(
        "https://fms-qkmw.onrender.com/fms/api/v0/customers/upload-logo",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress({ [file.name]: percentCompleted });
          },
        }
      );

      toast.success("File uploaded successfully! ✅");
      handleCancel();
      await fetchCustomers(); // If you want to refresh after upload
    } catch (error) {
      console.error(error);
      toast.error("Error uploading logo!");
    } finally {
      // Delay a little to let user feel "100% uploaded"
      setTimeout(() => {
        setLogoUploading(false); // 👈 this will hide the circle after success
        setUploadProgress({});
      }, 500); // 0.5 second delay
    }
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

  // ─── Helpers ─────────────────────────────────────────────
  const generateAccountNo = useCallback((list) => {
    const last = list
      .map((c) => parseInt(c.customerAccountNo?.split("_")[1], 10))
      .filter((n) => !isNaN(n))
      .reduce((m, n) => Math.max(m, n), 0);
    return `CUST_${String(last + 1).padStart(3, "0")}`;
  }, []);

  // ─── Load existing customers once ────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(apiBase);
        setCustomers(data.data);
        setForm((prev) => ({
          ...prev,
          customerAccountNo: generateAccountNo(data.data),
        }));
        // toast.info("Customer form ready", { autoClose: 800 });
      } catch {
        toast.error("Couldn’t fetch customers");
      }
    })();
  }, [apiBase, generateAccountNo]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = value;

    // Capitalize specific name fields (first letter only)
    if (
      [
        "name",
        "employeeName",
        "accountHolderName",
        "contactPersonName",
      ].includes(name) &&
      val
    ) {
      val = val.charAt(0).toUpperCase() + val.slice(1);
    }

    // Validators
    const validators = {
      bankAccNum: /^[0-9]{0,15}$/,
      bankName: /^[A-Z0-9\s]{0,50}$/, // ✅ Now allows spaces and longer names
      panNum: /^[A-Z0-9]{0,10}$/,
      registrationNum: /^[A-Z0-9]{0,15}$/,
      ifsc: /^[A-Z0-9]{0,12}$/,
      swift: /^[A-Z0-9]{0,10}$/,
      Tannumber: /^[A-Z0-9]{0,10}$/,
      qrDetails: /^[A-Za-z0-9.@]{0,25}$/,
      name: /^[A-Za-z\s]*$/,
      employeeName: /^[A-Za-z\s]*$/,
      email: /^.{0,100}$/,
      employeeEmail: /^.{0,100}$/,
      contactNum: /^\d{0,10}$/, // ✅ Numeric, max 10 digits
      contactPersonPhone: /^\d{0,10}$/, // ✅ Numeric, max 10 digits
      creditLimit: /^\d{0,10}$/, // ✅ Numeric, max 10 digits
    };

    // Handle checkbox separately
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    // Reset bank-related fields if bankType is Cash-like
    if (
      name === "bankType" &&
      ["Cash", "Barter", "Crypto", "UPI"].includes(val.trim())
    ) {
      setForm((prev) => ({
        ...prev,
        bankName: "",
        bankAccNum: "",
        bankHolder: "",
        ifsc: "",
        swift: "",
        upi: "",
        [name]: val,
      }));
      return;
    }

    // Uppercase specific fields
    if (
      [
        "bankAccNum",
        "bankName",
        "panNum",
        "registrationNum",
        "ifsc",
        "swift",
        "Tannumber",
      ].includes(name)
    ) {
      val = val.toUpperCase();
    }

    // Validate input
    if (validators[name] && !validators[name].test(val)) return;

    // Set form state
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const createCustomer = async (e) => {
    e.preventDefault();

    const bankDetailsPayload = [
      {
        code: form.code, // your bank‐detail code
        type: form.bankType, // e.g. "Bank", "UPI", etc.
        bankAccNum: form.bankAccNum, // account number (≤18 digits)
        bankName: form.bankName, // bank’s name
        accountHolderName: form.accountHolderName, // name on the account
        ifsc: form.ifsc, // 12‐char uppercase IFSC
        swift: form.swift, // ≤16‐char uppercase SWIFT
        active: true, // boolean flag
        qrDetails: form.qrDetails, // whatever you store for UPI/QR
      },
    ];

    const payload = {
      ...form,
      bankDetails: bankDetailsPayload,
    };

    try {
      const { data } = await axios.post(apiBase, payload, {
        headers: { "Content-Type": "application/json" },
      });
      const newCustomer = data.data;

      toast.success("Customer saved", {
        autoClose: 1200,
        onClose: () => handleCancel(),
      });

      setCustomers((prev) => [...prev, newCustomer]);

      onSaved?.(newCustomer);
    } catch (err) {
      console.error("Error creating customer:", err.response || err);
      // const msg = err.response?.data?.message || "Couldn’t save customer"; // ← define msg properly
      // toast.error(msg, { autoClose: 2000 });
    }
  };

  // ─── Reset / Cancel ──────────────────────────────────────
  const resetForm = (nextAccNo) =>
    setForm({
      ...form,
      customerAccountNo: nextAccNo ?? generateAccountNo(customers),
      name: "",
      businessType: "",
      address: "",
      contactNum: "",
      email: "",
      group: "",
      remarks: "",
      employeeName: "",
      employeePhone: "",
      employeeEmail: "",
      bankType: "",
      bankName: "",
      bankAccNum: "",
      bankHolder: "",
      ifsc: "",
      swift: "",
      upi: "",
      panNum: "",
      registrationNum: "",
      active: true,
    });
  const initialForm = {
    code: "",
    name: "",
    businessType: "",
    address: "",
    contactNum: "",
    email: "",
    group: "",
    remarks: "",
    employeeName: "",
    contactPersonName: "",
    employeePhone: "",
    paymentTerms: "",
    contactPersonPhone: "",
    employeeEmail: "",
    creditLimit: "",
    bankType: "",
    bankName: "",
    bankAccNum: "",
    bankHolder: "",
    ifsc: "",
    contactPersonEmail: "",
    swift: "",
    upi: "",
    currency: "INR",
    panNum: "",
    registrationNum: "",

    active: true,
  };

  const handleReset = () => {
    const newCustomerCode = generateAccountNo(customers);
    setForm({ ...initialForm, customerAccountNo: newCustomerCode });
  };
  const handleEdit = () => {
    navigate("/customerview", { state: { customer: formData } });
  };

  return (
    <div className="">
      <ToastContainer />
      {/* Header Buttons */}
      <div className="flex justify-between ">
        <div className="flex items-center space-x-2">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            {" "}
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
          <h3 className="text-xl font-semibold">  Item  Form</h3>
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
