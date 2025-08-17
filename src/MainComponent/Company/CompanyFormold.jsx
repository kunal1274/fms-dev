import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
    bankAccNum: "",
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
  const createCompany = async (e) => {
    e.preventDefault();

    // 1) Build bankDetailsPayload only if at least one bank field is non-empty
    const hasBankInfo = [
      form.bankType,
      form.bankAccNum,
      form.bankName,
      form.accountHolderName,
      form.ifsc,
      form.swift,
      form.qrDetails,
    ].some((val) => val && val.trim() !== "");

    const bankDetailsPayload = hasBankInfo
      ? [
          {
            code: form.companyCode,
            type: form.bankType,
            bankAccNum: form.bankAccNum,
            bankName: form.bankName,
            accountHolderName: form.accountHolderName,
            ifsc: form.ifsc,
            swift: form.swift,
            qrDetails: form.qrDetails,
            active: true,
          },
        ]
      : [];

    // 2) Tax info
    const taxInfo = {
      gstNumber: form.gstNumber,
      tanNumber: form.tanNumber,
      panNumber: form.panNumber,
    };

    // 3) Final payload
    const payload = {
      ...form,
      bankDetails: bankDetailsPayload,
      taxInfo,
    };

    console.log("Submitting payload:", payload);

    try {
      const { data } = await axios.post(apiBase, payload, {
        headers: { "Content-Type": "application/json" },
      });

      const newCompany = data.data;
      toast.success("Company saved successfully", {
        autoClose: 1000,
        onClose: () => handleCancel(),
      });
      setCompany((prev) => [...prev, newCompany]);
    } catch (err) {
      console.error("Error creating Company:", err);

      // Normalize error data
      const errorData =
        err.response?.data?.errors ||
        err.response?.data?.message ||
        err.message;

      if (Array.isArray(errorData)) {
        // Array of validation errors
        errorData.forEach((error) => {
          const msg = error.msg || error.message || JSON.stringify(error);
          toast.error(msg, { autoClose: 3000 });
        });
      } else if (typeof errorData === "object") {
        // Object mapping field → message
        Object.entries(errorData).forEach(([field, message]) => {
          toast.error(`${field}: ${message}`, { autoClose: 3000 });
        });
      } else {
        // Plain string
        toast.error(String(errorData), { autoClose: 3000 });
      }
    }
  };
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

    // Capitalize specific name fields (first letter only)
    if (
      [
        "companyName",
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
      panNumber: /^[A-Z0-9]{0,10}$/,
      gstNumber: /^[A-Z0-9]{0,15}$/,

      tanNumber: /^[A-Z0-9]{0,10}$/,
      ifsc: /^[A-Z0-9]{0,12}$/,
      swift: /^[A-Z0-9]{0,10}$/,
      TanNumber: /^[A-Z0-9]{0,10}$/,
      qrDetails: /^[A-Za-z0-9.@]{0,25}$/,
      companyName: /^[A-Za-z\s]*$/,
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
        "panNumber",
        "gstNumber",
        "tanNumber",
        "bankAccNum",
        "bankName",
        "companyCode",
        "ifsc",
        "swift",
      ].includes(name)
    ) {
      val = val.toUpperCase();
    }

    // Validate input
    if (validators[name] && !validators[name].test(val)) return;

    // Set form state
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  // ─── Save ────────────────────────────────────────────────

  // ─── Reset / Cancel ──────────────────────────────────────
  const resetForm = () => {
    setForm({
      companyCode: "",
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
      bankAccNum: "",
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
    companyName: "",
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
                onChange={handleChange} // ✅ Add this line
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
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
                Company Contact No
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
                Alternate Contact No
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
                Alternate Email ID
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
                Business/Office Address
              </label>
              <textarea
                name="primaryGSTAddress"
                value={form.primaryGSTAddress}
                onChange={handleChange}
                placeholder="e.g Ground 1st and 2nd Floor, 54B Lands End, Sisters Bunglow, ABC company Limited, B J Road Mount Mary Band Stand, Bandra West Mumbai, Mumbai Suburban, Maharashtra, 400050"
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
                placeholder="e.g General Description

“Primary legal entity for GST and statutory reporting.”
“Head office registration – used for all domestic transactions.”

2. Operational Purpose

“Handles manufacturing and domestic sales.”
“Export-focused subsidiary, transactions in USD & EUR.”

3. Special Compliance Notes

“Compliant with MCA audit trail requirements – SOC 2 in progress.”
“Registered for GST – returns filed monthly.”

4. Internal Notes

“Main billing entity; all intercompany billed here.”
“Merged with XYZ Ltd. in FY 2024–25, retained original GSTIN.”"
                rows={4}
                className="mt-1 m w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Billing Address
              </label>
              <textarea
                name="secondaryOfficeAddress"
                value={form.secondaryOfficeAddress}
                onChange={handleChange}
                placeholder="e.g. Unit No. 502, 5th Floor, Tower B
DLF Cyber City, Phase III
Gurugram, Haryana – 122002
India"
                rows={4}
                className="mt-1 m w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Shipping Address
              </label>
              <textarea
                name="tertiaryShippingAddress"
                value={form.tertiaryShippingAddress}
                onChange={handleChange}
                placeholder="e.g. Warehouse No. 14, Ground Floor
IndoSpace Industrial Park, Chakan Phase II
Pune, Maharashtra – 410501
India"
                rows={4}
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
                placeholder="e.g. State Bank of India (Copy & Paste Not Allowed)"
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
