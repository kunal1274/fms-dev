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
  const apiBase = "https://fms-qkmw.onrender.com/fms/api/v0/customers";

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
      bankAccNum: /^[A-Z0-9]{0,15}$/,
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
  // if you want to force uppercase, uncomment next line:
  // value = value.toUpperCase();

  // Limit digits for phone fields

  // ─── Save ────────────────────────────────────────────────

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
          <h3 className="text-xl font-semibold">Customer Form</h3>
        </div>
      </div>

      <form
        onSubmit={createCustomer}
        className="bg-white shadow-none rounded-lg divide-y divide-gray-200"
      >
        {/* Business Details */}
        <section className="p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Business Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Customer Code
              </label>
              <input
                name="customercode"
                value={form.code}
                readOnly
                placeholder="Auto-generated"
                className="mt-1 w-full cursor-not-allowed  p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Customer Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. XYZ Enterprises Pvt. Ltd."
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Global Party id
              </label>
              <input
                name="globalPartyId"
                value={form.globalPartyId}
                onChange={handleChange}
                placeholder="Auto-generated"
                readOnly
                className="mt-1 cursor-not-allowed  w-full p-2 curser-notallow border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Business Type
              </label>
              <select
                name="businessType"
                value={form.businessType}
                onChange={handleChange}
                options={businessTypes}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select type</option>
                {businessTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Contact No
              </label>
              <input
                name="contactNum"
                value={form.contactNum}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Email ID
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. info@xyzenterprises.com"
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Address
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="e.g. 123 MG Road, Bengaluru, Karnataka, 560001"
                rows={4}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                placeholder="e.g. Any additional notes…"
                rows={4}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Group
              </label>
              <input
                name="group"
                value={form.group}
                onChange={handleChange}
                placeholder="e.g. Retail, Wholesale"
                disabled
                className="mt-1 w-full p-2 border cursor-not-allowed  rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-2 ml-1">
              <label className="text-blue-600 font-medium">Active</label>
              <input
                name="active"
                checked={form.active}
                onChange={handleChange}
                type="checkbox"
                className="w-4 h-4"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4"></div>{" "}
          </div>
        </section>
        <section className="p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Contact Person
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Contatct Person Name
              </label>
              <input
                name="contactPersonName"
                value={form.contactPersonName}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Phone No.
              </label>
              <input
                name="contactPersonPhone"
                value={form.contactPersonPhone}
                onChange={handleChange}
                placeholder="e.g. +91 91234 56789"
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Email.id
              </label>
              <input
                name="contactPersonEmail"
                type="email"
                value={form.contactPersonEmail}
                onChange={handleChange}
                placeholder="e.g. john.doe@example.com"
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
        </section>

        {/* Payment & Financial */}
        <section className="p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Payment & Financial Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Credit Limit
              </label>
              <input
                name="creditLimit"
                value={form.creditLimit}
                onChange={handleChange}
                placeholder="e.g. 1,00,000"
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Terms of payment
              </label>
              <select
                name="paymentTerms"
                value={form.paymentTerms}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select type</option>
                {paymentTerms.map((type) => (
                  <option key={type.trim()} value={type.trim()}>
                    {type.trim()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Currency
              </label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select type</option>
                {currency.map((type) => (
                  <option key={type.trim()} value={type.trim()}>
                    {type.trim()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
        {/* Bank Details */}
        <section className="p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Bank Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Bank Type
              </label>
              <select
                name="bankType"
                value={form.bankType}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select type</option>
                {bankTypes.map((type) => (
                  <option key={type.trim()} value={type.trim()}>
                    {type.trim() === "BankAndUpi"
                      ? "Bank And UPI"
                      : type.trim()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Bank Name
              </label>
              <input
                name="bankName"
                value={form.bankName}
                onChange={handleChange}
                placeholder="e.g. State Bank of India"
                disabled={disableBankFields}
                className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 ${
                  disableBankFields ? "cursor-not-allowed bg-gray-100" : ""
                }`}
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Bank Account
              </label>
              <input
                name="bankAccNum"
                value={form.bankAccNum}
                onChange={handleChange}
                placeholder="e.g. 0123456789012345"
                disabled={disableBankFields}
                className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 ${
                  disableBankFields ? "cursor-not-allowed bg-gray-100" : ""
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Account Holder Name
              </label>
              <input
                name="accountHolderName"
                value={form.accountHolderName}
                onChange={handleChange}
                placeholder="e.g. ABC Company Pvt Ltd"
                disabled={disableBankFields}
                className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 ${
                  disableBankFields ? "cursor-not-allowed bg-gray-100" : ""
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                IFSC
              </label>
              <input
                name="ifsc"
                value={form.ifsc}
                onChange={handleChange}
                placeholder="e.g. SBIN0001234"
                disabled={disableBankFields}
                className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 ${
                  disableBankFields ? "cursor-not-allowed bg-gray-100" : ""
                }`}
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Swift Code
              </label>
              <input
                name="swift"
                value={form.swift}
                onChange={handleChange}
                placeholder="e.g. SBININBBXXX"
                disabled={disableBankFields}
                className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 ${
                  disableBankFields ? "cursor-not-allowed bg-gray-100" : ""
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                UPI ID
              </label>
              <input
                name="qrDetails"
                value={form.qrDetails}
                onChange={handleChange}
                placeholder="e.g. abc@hdfcbank"
                disabled={disableBankFields}
                className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 ${
                  disableBankFields ? "cursor-not-allowed bg-gray-100" : ""
                }`}
              />
            </div>
          </div>
        </section>

        {/* Tax Information */}

        <section className="p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Tax Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                PAN No
              </label>
              <input
                name="panNum"
                value={form.panNum}
                onChange={handleChange}
                placeholder="e.g. ABCDE1234F"
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Registration No
              </label>
              <input
                label="Registration No."
                name="registrationNum"
                value={form.registrationNum}
                onChange={handleChange}
                placeholder="e.g.  REG123456789"
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Tan number
              </label>
              <input
                name="Tannumber"
                value={form.Tannumber}
                onChange={handleChange}
                placeholder="e.g. ABCDE1234F"
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
        </section>
        {/* Action Buttons */}
        <div className="py-6 flex items-center justify-between">
          {/* Left side - Reset Button */}
          <div>
            <button
              type="button"
              onClick={handleReset}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Reset
            </button>
          </div>

          {/* Right side - Go Back and Create Buttons */}
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
