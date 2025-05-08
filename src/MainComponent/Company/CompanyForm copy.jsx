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

const bankTypes = ["BankAndUpi", "Cash", "Bank", "Crypto", "Barter", " UPI"];
export default function CompanyForm({ handleCancel }) {
  const [company, setCompany] = useState([]);
  const [form, setForm] = useState({
    companyCode: "",
    companyName: "",
    businessType: "",
    primaryGSTAddress: "",
    secondaryOfficeAddress: "",
    tertiaryShippingAddress: "",
    contactNum: "",
    email: "",
    website: "",
    panNumber: "",
    currency: "INR",

    remarks: "",
    active: true,
    bankType: "",
    bankName: "",
    tanNumber: "",
    bankAccount: "",
    bankHolder: "",
    ifsc: "",
    swift: "",
    upi: "",

    globalPartyId: "",
    taxInfo: {
      gstNumber: "",
      tanNumber: "",
      panNumber: "",
    },
  });
  const apiBase = "https://fms-qkmw.onrender.com/fms/api/v0/companies";

  // ─── Data ────────────────────────────────────────────────

  const disableBankFields =
    form.bankType === "Cash" ||
    form.bankType === "Barter" ||
    form.bankType === " UPI" ||
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
        "https://fms-qkmw.onrender.com/fms/api/v0/Companies/upload-logo",
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
      await fetchCompany(); // If you want to refresh after upload
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = value;

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

    // Limit digits for phone fields
    if (
      ["contactNum", "contactPersonPhone"].includes(name) &&
      !/^\d{0,10}$/.test(val)
    ) {
      return;
    }

    // Ensure numeric only for bankAccNum and creditLimit
    if (["bankAccNum", "creditLimit"].includes(name) && !/^\d*$/.test(val)) {
      return;
    }

    // Convert to uppercase where required
    if (
      [
        "bankName",
        "panNumber",
        "registrationNum",
        "ifsc",
        "swift",
        "upi",
        "qrDetails",
        "tanNumber",
      ].includes(name)
    ) {
      val = val.toUpperCase();
    }
     // GST Number – uppercase alphanumeric only, max length 15
      if (name === "gstNumber") {
        // force uppercase, strip out anything that’s not A–Z or 0–9, then cap at 15 chars
       val = val.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
       // if after cleanup it's somehow invalid, bail out
        if (!/^[A-Z0-9]{0,15}$/.test(val)) return;
      }
    // Bank account number length limit (optional)
    if (name === "bankAccNum" && val.length > 30) {
      return;
    }

    // Email length limit
    if (["email", "employeeEmail"].includes(name) && val.length > 100) {
      return;
    }

    // Name fields – allow only letters and spaces
    if (
      ["name", "employeeName", "bankName", "group"].includes(name) &&
      val &&
      !/^[A-Za-z\s]*$/.test(val)
    ) {
      return;
    }

    // Capitalize first letter
    if (["name", "employeeName", "bankAccNum"].includes(name) && val) {
      val = val.charAt(0).toUpperCase() + val.slice(1);
    }

    // Specific pattern constraints
    if (name === "ifsc" && !/^[A-Z0-9]{0,12}$/.test(val)) return;
    if (name === "swift" && !/^[A-Z0-9]{0,16}$/.test(val)) return;
    if (name === "qrDetails" && (!/^[a-z0-9.@]*$/.test(val) || val.length > 25))
      return;

    if (name === "tanNumber" && !/^[A-Z0-9]{0,10}$/.test(val)) return;
    if (name === "panNumber" && !/^[A-Z0-9]{0,10}$/.test(val)) return;

    const numeric10DigitFields = [
      "contactNumber",
      "contactNum",
      "contactPersonPhone",
      "companyContactNo",
      "phoneNo",
      "phoneNumber",
    ];
    if (numeric10DigitFields.includes(name) && !/^\d{0,10}$/.test(val)) return;

    // Checkbox field
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    // Bank Account – digits only, max 18
    if (name === "bankAccNum" && !/^\d{0,30}$/.test(val)) return;

    // PAN – uppercase, alphanumeric, max 10
    if (name === "panNum") {
      val = val
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 10);
      if (!/^[A-Z0-9]{0,10}$/.test(val)) return;
    }

    // TAN – uppercase, alphanumeric, max 25
    if (name === "tanNumber") {
      val = val
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 10);
      if (!/^[A-Z0-9]{0,10}$/.test(val)) return;
    }

    // Registration Number – uppercase, alphanumeric, max 15
    if ((name === "gstNumber", name === "companyCode")) {
      val = val
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 15);
      // final length/character check
      if (!/^[A-Z0-9]{0,15}$/.test(val)) return;
    }

    // IFSC – uppercase, alphanumeric, max 12
    if (name === "ifsc") {
      val = val.toUpperCase();
      if (!/^[A-Z0-9]{0,12}$/.test(val)) return;
    }

    // SWIFT – uppercase, alphanumeric, max 16
    if (name === "swift") {
      val = val.toUpperCase();
      if (!/^[A-Z0-9]{0,10}$/.test(val)) return;
    }

    // UPI – uppercase, alphanumeric + . and @, max 25
    if (name === "upi") {
      val = val.toUpperCase();
      if (!/^[A-Z0-9.@]*$/.test(val) || val.length > 25) return;
    }

    // Email – max 100 characters
    if (["email", "employeeEmail"].includes(name) && val.length > 100) return;

    // Capitalize first letter for these fields
    if (
      ["companyName", "name", "employeeName", "bankHolder"].includes(name) &&
      val
    ) {
      val = val.charAt(0).toUpperCase() + val.slice(1);
    }

    // Only letters and spaces allowed
    if (
      ["name", "employeeName", "bankName", "group"].includes(name) &&
      val &&
      !/^[A-Za-z\s]*$/.test(val)
    )
      return;

    // Always uppercase for these fields
    if (
      [
        "panNum",
        "registrationNum",
        "ifsc",
        "swift",
        "upi",
        "bankName",
      ].includes(name)
    ) {
      val = val.toUpperCase();
    }

    // bankType – special values trigger reset of bank fields
    if (name === "bankType") {
      const specialTypes = ["Cash", "Barter", "Crypto", "UPI"];
      if (specialTypes.includes(val)) {
        setForm((prev) => ({
          ...prev,
          bankType: val,
          bankName: "",
          bankAccount: "",
          bankHolder: "",
          ifsc: "",
          swift: "",
          upi: "",
        }));
        return;
      }
    }

    // No-op placeholder (address, remarks)
    if (["address", "remarks"].includes(name) && !/^[\s\S]*$/.test(val)) {
      return;
    }

    // Default update
    setForm((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  // ─── Save ────────────────────────────────────────────────

  const createCompany = async (e) => {
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
    const taxInfo = {
      gstNumber: form.gstNumber,
      tanNumber: form.tanNumber,
      panNumber: form.panNumber,
    };
    const payload = {
      ...form,
      bankDetails: bankDetailsPayload,
      taxInfo,
    };

    try {
      const { data } = await axios.post(apiBase, payload, {
        headers: { "Content-Type": "application/json" },
      });
      const newCompany = data.data;

      toast.success("Company saved", {
        autoClose: 1200,
        onClose: () => handleCancel(),
      });

      setCompany((prev) => [...prev, newCompany]);

      onSaved?.(newCompany);
    } catch (err) {
      console.error("Error creating Company:", err.response || err);
      // const msg = err.response?.data?.message || "Couldn’t save Company"; // ← define msg properly
      // toast.error(msg, { autoClose: 2000 });
    }
  };

  // ─── Reset / Cancel ──────────────────────────────────────
  const resetForm = () => {
    // const nextCode = generateCompanyCode(companies);
    setForm({
      companyCode: nextCode,
      companyName: "",
      businessType: "",
      primaryGSTAddress: "",
      secondaryOfficeAddress: "",
      tertiaryShippingAddress: "",
      contactNumber: "",
      email: "",
      website: "",
      currency: "INR",
      remarks: "",
      active: true,
      bankType: "",
      bankName: "",
      bankAccount: "",
      bankHolder: "",
      ifsc: "",
      swift: "",
      upi: "",
      panNum: "",
      registrationNum: "",
      globalPartyId: "",
    });
  };
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
    gstNumber: "",
    currency: "INR",
    panNumber: "",
    registrationNum: "",

    active: true,
  };

  const handleReset = () => {
    const newCompanyCode = generateAccountNo(companys);
    setForm({ ...initialForm, companyAccountNo: newCompanyCode });
  };
  const handleEdit = () => {
    navigate("/companyview", { state: { company: formData } });
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
          <h3 className="text-xl font-semibold">Company Form</h3>
        </div>
      </div>

      <form
        onSubmit={createCompany}
        className="bg-white shadow-none rounded-lg divide-y divide-gray-200"
      >
        {/* Business Details */}
        <section className="p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Company Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Company Code
              </label>
              <input
                name="companyCode"
                value={form.companyCode}
                onChange={handleChange}
                required
                placeholder="e.g. HYDN83683"
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Company Name
              </label>
              <input
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                placeholder="e.g. ABC Company Pvt. Ltd."
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
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
                placeholder="e.g. +91-9876543210"
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Company Email ID
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. contact@abccompany.com"
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Company Website
              </label>
              <input
                name="website"
                type="website"
                value={form.website}
                onChange={handleChange}
                placeholder="e.g. contact@abccompany.com"
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
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
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Address
              </label>
              <textarea
                name="primaryGSTAddress"
                value={form.primaryGSTAddress}
                onChange={handleChange}
                placeholder="e.g. Sector 98, Noida, Uttar Pradesh, 201301"
                rows={4}
                required
                className="mt-1 m w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
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
                placeholder="e.g. Sector 98, Noida, Uttar Pradesh, 201301"
                rows={4}
                required
                className="mt-1 m w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Secondary Office Address
              </label>
              <textarea
                name="secondaryOfficeAddress"
                value={form.secondaryOfficeAddress}
                onChange={handleChange}
                placeholder="e.g. Sector 98, Noida, Uttar Pradesh, 201301"
                rows={4}
                required
                className="mt-1 m w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Tertiary Shipping Address
              </label>
              <textarea
                name="tertiaryShippingAddress"
                value={form.tertiaryShippingAddress}
                onChange={handleChange}
                placeholder="e.g. Sector 98, Noida, Uttar Pradesh, 201301"
                rows={4}
                required
                className="mt-1 m w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
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
                name="panNumber"
                value={form.panNumber}
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
                name="gstNumber"
                value={form.gstNumber}
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
                name="tanNumber"
                value={form.tanNumber}
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
