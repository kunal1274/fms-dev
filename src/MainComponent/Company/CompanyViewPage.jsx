import React, { useState, useEffect } from "react";
import axios from "axios";

import { useParams } from "react-router-dom";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./c.css";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const baseUrl = "https://fms-qkmw.onrender.com";
const secondUrl = "/fms/api/v0";
const thirdUrl = "/companies";
const mergedUrl = `${baseUrl}${secondUrl}${thirdUrl}`;

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
const bankTypes = ["BankAndUpi", "Cash", "Bank"];

const CompanyViewPage = ({ CompaniesId, goBack }) => {
  const [formData, setFormData] = useState({
    companyCode: "",
    companyName: "",
    businessType: "",
    primaryGSTAddress: "",
    secondaryOfficeAddress: "",
    tertiaryShippingAddress: "",
    website: "",
    contactNum: "",
    email: "",
    currency: "",
    remarks: "",
    active: true,
    taxInfo: { panNumber: "", gstNumber: "", tanNumber: "" },
    globalPartyId: { code: "" },
    bankDetails: [],
  });
  const [prevFormData, setPrevFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  // const [isEditing, setIsEditing] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logoUploading, setLogoUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${mergedUrl}/${CompaniesId}`);
        const data = res.data.data || res.data;
        setFormData({
          ...formData,
          ...data,
          taxInfo: data.taxInfo || {
            panNumber: "",
            gstNumber: "",
            tanNumber: "",
          },
          globalPartyId: data.globalPartyId || { code: "" },
          bankDetails: data.bankDetails || [],
        });
      } catch (err) {
        toast.error("Error loading company details");
      } finally {
        setLoading(false);
      }
    };
    if (CompaniesId) fetchCompany();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [CompaniesId]);
  const handleDeleteBank = (index) => {
    if (!window.confirm("Are you sure you want to delete this bank detail?"))
      return;
    setFormData((prev) => ({
      ...prev,
      bankDetails: prev.bankDetails.filter((_, i) => i !== index),
    }));
  };

  const validators = {
    bankAccNum: /^[0-9]{0,15}$/,
    bankName: /^[A-Z0-9\s]{0,50}$/,
    panNumber: /^[A-Z0-9]{0,10}$/,
    gstNumber: /^[A-Z0-9]{0,15}$/,
    tanNumber: /^[A-Z0-9]{0,10}$/,
    ifsc: /^[A-Z0-9]{0,12}$/,
    swift: /^[A-Z0-9]{0,10}$/,
    qrDetails: /^[A-Za-z0-9.@]{0,25}$/,
    companyName: /^[A-Za-z\s]*$/,
    employeeName: /^[A-Za-z\s]*$/,
    email: /^.{0,100}$/,
    employeeEmail: /^.{0,100}$/,
    contactNum: /^\d{0,10}$/,
    contactPersonPhone: /^\d{0,10}$/,
    creditLimit: /^\d{0,10}$/,
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === "checkbox" ? checked : value;

    // Capitalize first letter for name fields
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

    // Uppercase for tax and bank codes
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

    // Handle taxInfo separately
    if (["panNumber", "gstNumber", "tanNumber"].includes(name)) {
      const sanitized = val.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        taxInfo: { ...prev.taxInfo, [name]: sanitized },
      }));
      return;
    }

    // Handle checkbox
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    // Reset bank fields if bankType is Cash or UPI
    if (name === "bankType" && ["Cash", "UPI"].includes(val.trim())) {
      setFormData((prev) => ({
        ...prev,
        bankName: "",
        bankAccNum: "",
        accountHolderName: "",
        ifsc: "",
        swift: "",
        upi: "",
        [name]: val,
      }));
      return;
    }

    // Default: update field
    setFormData((prev) => ({ ...prev, [name]: val }));
  };
  const handleAddBank = () => {
    setFormData((prev) => ({
      ...prev,
      bankDetails: [
        ...prev.bankDetails,
        {
          bankType: "",
          bankName: "",
          bankAccNum: "",
          accountHolderName: "",
          ifsc: "",
          swift: "",
          qrDetails: "",
        },
      ],
    }));
  };

  const handleBankDetailChange = (index, field, value) => {
    const updatedBankDetails = [...formData.bankDetails];

    if (field === "bankName") {
      // Uppercase, max 25 chars, allow spaces
      value = value.toUpperCase().slice(0, 25);
    }

    if (field === "bankAccNum") {
      // Only numbers, max 16 digits
      value = value.replace(/\D/g, "").slice(0, 16);
    }

    if (field === "ifsc") {
      // Uppercase, max 12 chars
      value = value.toUpperCase().slice(0, 12);
    }

    if (field === "swift") {
      // Uppercase, max 10 chars
      value = value.toUpperCase().slice(0, 10);
    }

    if (field === "qrDetails") {
      // Lowercase only
      value = value.toLowerCase();
    }

    if (field === "accountHolderName") {
      // Max 28 characters
      value = value.slice(0, 28);
    }
    let currentBank = updatedBankDetails[index];

    if (field === "bankType") {
      if (value === "Cash") {
        // Store previous bank data and clear fields
        updatedBankDetails[index] = {
          bankType: "Cash",
          _prevData: { ...currentBank }, // store previous data
          bankName: "",
          bankAccNum: "",
          accountHolderName: "",
          ifsc: "",
          swift: "",
          qrDetails: "",
          isDisabled: true,
          disableUPI: true,
        };
      } else if (value === "Bank") {
        // Save QR before clearing
        updatedBankDetails[index] = {
          ...currentBank,
          _prevData: { ...currentBank }, // keep old QR and other data
          bankType: "Bank",
          qrDetails: "", // clear QR
          disableUPI: true,
          isDisabled: false,
        };
      } else if (value === "BankAndUpi") {
        // Restore previous data and allow UPI
        const restoreData = currentBank._prevData || currentBank;
        updatedBankDetails[index] = {
          ...restoreData,
          bankType: "BankAndUpi",
          disableUPI: false,
          isDisabled: false,
        };
        delete updatedBankDetails[index]._prevData;
      }
    } else {
      updatedBankDetails[index][field] = value;
    }

    setFormData({ ...formData, bankDetails: updatedBankDetails });
  };

  const handleFileUpload = async (file) => {
    if (!file) return toast.error("No file selected!");
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append("logoImage", file);
      await axios.post(`${mergedUrl}/${CompaniesId}/upload-logo`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (ev) => {
          const pct = Math.round((ev.loaded * 100) / ev.total);
          setUploadProgress({ [file.name]: pct });
        },
      });
      toast.success("Logo uploaded!");
      // re-fetch details
      const { data } = await axios.get(`${mergedUrl}/${CompaniesId}`);
      setFormData((prev) => ({ ...prev, ...data.data }));
    } catch {
      toast.error("Upload failed");
    } finally {
      setTimeout(() => {
        setLogoUploading(false);
        setUploadProgress({});
      }, 500);
    }
  };

  const handleUpdate = async () => {
    if (!window.confirm("Update this company?")) return;
    setLoading(true);
    const toastId = toast.loading("Updating…");
    try {
      await axios.put(`${mergedUrl}/${CompaniesId}`, formData);
      toast.update(toastId, {
        render: "Updated!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      setIsEditing(false);
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.message || "Update failed",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading…</div>;

  const handleEdit = () => {
    setIsEditing(!isEditing);
    setPrevFormData(formData); // save current state
    setIsEditing(true); // switch to edit mode
    setIsEdited(true);

    // You can also trigger your edit logic here
  };
  const handleCancel = () => {
    if (prevFormData) {
      setFormData(prevFormData); // restore saved data
    }
    setIsEditing(false);
  };
  return (
    <div>
      <ToastContainer />
      {/* Header Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2 ">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center  justify-center">
            <button
              type="button"
              className="text-blue-600 mt-1 text-xs hover:underline"
            >
              Upload Photo
            </button>
          </div>
          <h3 className="text-xl font-semibold">Company View Page</h3>
        </div>
      </div>

      <form className="bg-white shadow-none rounded-lg divide-y divide-gray-200">
        {/* Business Details */}
        <section className="p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Business Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Company Code
              </label>
              <input
                name="Companycode"
                value={formData.companyCode}
                readOnly
                placeholder="Auto-generated"
                className="mt-1 w-full cursor-not-allowed  p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Global Party id
              </label>
              <input
                name="globalPartyId"
                value={
                  (formData.globalPartyId && formData.globalPartyId.code) ||
                  "Not Available"
                }
                onChange={handleChange}
                placeholder="Auto-generated"
                disabled
                className="mt-1 cursor-not-allowed w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Business Type
              </label>
              <select
                name="businessType"
                value={formData.businessType || ""} // ✅ Correct binding
                onChange={handleChange}
                required
                disabled={!isEditing}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
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

              {/* Country selector on the left + full world list */}
              <PhoneInput
                country="in"
                value={formData.contactNum || ""}
                disabled={!isEditing}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, contactNum: value }))
                }
                inputProps={{ name: "contactNum", required: true }}
                containerClass="mt-1 w-full"
                inputClass="!w-full !pl-18 !pr-7 !py-2 !border !rounded-lg !focus:ring-2 !focus:ring-black-200"
                buttonClass="!border !rounded-l-lg "
                dropdownClass="!shadow-lg"
                enableSearch
                prefix="+"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Alternate Contact No
              </label>
              <PhoneInput
                country="in"
                value={formData.alternateContactNum || ""}
                disabled={!isEditing}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    alternateContactNum: value,
                  }))
                }
                inputProps={{ name: "alternateContactNum" }}
                containerClass="mt-1 w-full"
                inputClass="!w-full !pl-18 !pr-7 !py-2 !border !rounded-lg !focus:ring-2 !focus:ring-black-200"
                buttonClass="!border !rounded-l-lg "
                dropdownClass="!shadow-lg"
                enableSearch
                prefix="+"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Company Email ID
              </label>
              <input
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                placeholder="e.g. info@xyzenterprises.com"
                required
                disabled={!isEditing}
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
                placeholder="e.g. info@xyzenterprises.com"
                required
                disabled={!isEditing}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Company Website
              </label>
              <input
                name="website"
                type="email"
                value={formData.website || ""}
                onChange={handleChange}
                placeholder="e.g. Retail, Wholesale"
                disabled
                className="mt-1 w-full cursor-not-allowed  p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                disabled={!isEditing}
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
          </div>{" "}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Business/Office Address
              </label>
              <textarea
                name="primaryGSTAddress"
                value={formData.primaryGSTAddress || ""}
                onChange={handleChange}
                disabled={!isEditing}
                rows="4"
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Billing Address
              </label>
              <textarea
                name="secondaryOfficeAddress"
                value={formData.secondaryOfficeAddress || ""}
                onChange={handleChange}
                placeholder="e.g. Sector 98, Noida, Uttar Pradesh, 201301"
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
                value={formData.tertiaryShippingAddress || ""}
                onChange={handleChange}
                placeholder="Any additional notes…"
                rows={4}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks || ""}
                onChange={handleChange}
                placeholder="Any additional notes…"
                rows={4}
                disabled={!isEditing}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <div className="flex gap-3 ml-1">
                <label className="block h-5  mt-1  font-large text-blue-600">
                  Active
                </label>
                <input
                  name="active"
                  checked={formData.active}
                  disabled={!isEditing}
                  onChange={handleChange}
                  type="checkbox"
                  className=" w-4 h-4 mt-2 gap-2"
                />
              </div>
            </div>{" "}
          </div>
        </section>
        <section className="p-6">
          {" "}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-700">Bank Details</h2>
            <button
              type="button"
              onClick={handleAddBank}
              disabled={!isEditing} // ✅ disable unless editing
              className={`px-3 py-1 text-sm rounded 
        ${
          isEditing
            ? "bg-green-500 text-white hover:bg-green-600"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
            >
              + Add Bank
            </button>
          </div>
          {formData.bankDetails?.map((b, i) => {
            const disableBankFields =
              b.bankType === "Cash" ||
              b.bankType === "Barter" ||
              b.bankType === "UPI" ||
              b.bankType === "Crypto";

            return (
              <div
                key={b.id || i}
                className="relative grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6 border p-4 rounded-lg"
              >
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteBank(i)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                )}

                {/* Bank Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Bank Type
                  </label>
                  <select
                    name="bankType"
                    value={b.bankType || ""}
                    onChange={(e) =>
                      handleBankDetailChange(i, "bankType", e.target.value)
                    }
                    disabled={!isEditing}
                    className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                  >
                    {bankTypes.map((type) => (
                      <option key={type.trim()} value={type.trim()}>
                        {type.trim() === "BankAndUpi"
                          ? "Bank And UPI"
                          : type.trim()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bank Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Bank Name
                  </label>
                  <input
                    name="bankName"
                    value={b.bankName || ""}
                    onChange={(e) =>
                      handleBankDetailChange(i, "bankName", e.target.value)
                    }
                    disabled={!isEditing || disableBankFields}
                    placeholder="e.g. HDFC Bank"
                    className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 ${
                      !isEditing || disableBankFields
                        ? "cursor-not-allowed bg-gray-100"
                        : ""
                    }`}
                  />
                </div>

                {/* Bank Account Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Bank Account Number
                  </label>
                  <input
                    name="bankAccNum"
                    value={b.bankAccNum || ""}
                    onChange={(e) =>
                      handleBankDetailChange(i, "bankAccNum", e.target.value)
                    }
                    disabled={!isEditing || disableBankFields}
                    placeholder="e.g. 0123456789012345"
                    className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 ${
                      !isEditing || disableBankFields
                        ? "cursor-not-allowed bg-gray-100"
                        : ""
                    }`}
                  />
                </div>

                {/* Account Holder Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Account Holder Name
                  </label>
                  <input
                    name="accountHolderName"
                    value={b.accountHolderName || ""}
                    onChange={(e) =>
                      handleBankDetailChange(
                        i,
                        "accountHolderName",
                        e.target.value
                      )
                    }
                    disabled={!isEditing || disableBankFields}
                    placeholder="e.g. John Doe"
                    className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 ${
                      !isEditing || disableBankFields
                        ? "cursor-not-allowed bg-gray-100"
                        : ""
                    }`}
                  />
                </div>

                {/* IFSC Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    IFSC Code
                  </label>
                  <input
                    name="ifsc"
                    value={b.ifsc || ""}
                    onChange={(e) =>
                      handleBankDetailChange(i, "ifsc", e.target.value)
                    }
                    disabled={!isEditing || disableBankFields}
                    placeholder="e.g. SBIN0001234"
                    className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 ${
                      !isEditing || disableBankFields
                        ? "cursor-not-allowed bg-gray-100"
                        : ""
                    }`}
                  />
                </div>

                {/* SWIFT Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    SWIFT Code
                  </label>
                  <input
                    name="swift"
                    value={b.swift || ""}
                    onChange={(e) =>
                      handleBankDetailChange(i, "swift", e.target.value)
                    }
                    disabled={!isEditing || disableBankFields}
                    placeholder="e.g. SBININBBXXX"
                    className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 ${
                      !isEditing || disableBankFields
                        ? "cursor-not-allowed bg-gray-100"
                        : ""
                    }`}
                  />
                </div>

                {/* UPI ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    UPI ID
                  </label>
                  <input
                    name="qrDetails"
                    value={b.qrDetails || ""}
                    onChange={(e) =>
                      handleBankDetailChange(i, "qrDetails", e.target.value)
                    }
                    disabled={
                      !isEditing ||
                      b.bankType === "Bank" ||
                      b.bankType === "Cash"
                    } // disable when Bank or Cash
                    placeholder="e.g. user@upi"
                    className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 ${
                      !isEditing || disableBankFields
                        ? "cursor-not-allowed bg-gray-100"
                        : ""
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </section>

        {/* Tax Information */}

        <section className="p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Tax Infromation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                PAN No
              </label>
              <input
                type="text"
                name="panNumber" // ← exact match
                value={formData.taxInfo?.panNumber || ""} // read from taxInfo.panNumber
                onChange={handleChange} // delegate to your centralized handler
                disabled={!isEditing}
                maxLength={10} // PAN is max 10 chars
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Registration No
              </label>
              <input
                type="text"
                name="gstNumber"
                value={formData.taxInfo?.gstNumber || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Tan no
              </label>
              <input
                type="text"
                name="tanNumber"
                value={formData.taxInfo?.tanNumber || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          {/*  */}
        </section>

        {/* Action Buttons */}
        <div className="py-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={!isEditing} // disable when not editing
            className={`px-6 py-2 rounded transition ${
              isEditing
                ? "bg-red-400 text-white hover:bg-red-500" // editable → light red
                : "bg-gray-300 text-gray-600 cursor-not-allowed" // not editable → grey
            }`}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={goBack}
            className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Go Back
          </button>

          <button
            type="button"
            onClick={() => {
              if (isEditing) {
                handleUpdate(); // already editing → update
              } else {
                handleEdit(); // not editing → switch to edit mode
              }
            }}
            className={`px-6 py-2 rounded transition ${
              isEditing
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-green-200 hover:bg-gray-300"
            }`}
          >
            {isEditing ? "Update" : "Edit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyViewPage;
