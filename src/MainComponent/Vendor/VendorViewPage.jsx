import React, { useState, useEffect } from "react";
import axios from "axios";

import { useParams } from "react-router-dom";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./c.css";
const baseUrl = "https://fms-qkmw.onrender.com";
const secondUrl = "/fms/api/v0";
const thirdUrl = "/vendors";
const mergedUrl = `${baseUrl}${secondUrl}${thirdUrl}`;
const businessTypes = [
  "Individual",
  "Manufacturing",
  "ServiceProviderr",
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
const VendorViewPage = ({
  vendorId,
  vendor,
  goBack,
  handleSaveVendor,
  toggleView,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [name, setName] = useState(0);
  const [bankAccount, setBankAccount] = useState(0);
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
        "https://fms-qkmw.onrender.com/fms/api/v0/vendors/upload-logo",
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
      await fetchVendors(); // If you want to refresh after upload
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
 const handleBankDetailChange = async (index, field, value) => {
    const updatedBankDetails = [...formData.bankDetails];
    let currentBank = updatedBankDetails[index];

    // --- Input formatting rules ---
    if (field === "bankName") value = value.toUpperCase().slice(0, 25);
    if (field === "bankAccNum") value = value.replace(/\D/g, "").slice(0, 16);
    if (field === "ifsc") value = value.toUpperCase().slice(0, 12);
    if (field === "swift") value = value.toUpperCase().slice(0, 10);
    if (field === "qrDetails") value = value.toLowerCase();
    if (field === "accountHolderName") value = value.slice(0, 28);

    // --- Handle special logic for bankType ---
    if (field === "bankType") {
      if (value === "Cash") {
        updatedBankDetails[index] = {
          bankType: "Cash",
          _prevData: { ...currentBank },
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
        const restoreData = currentBank._prevData || currentBank;
        updatedBankDetails[index] = {
          ...restoreData,
          bankType: "Bank",
          qrDetails: "",
          isDisabled: false,
          disableUPI: true,
        };
        updatedBankDetails[index]._prevData = { ...restoreData };
      } else if (value === "BankAndUpi") {
        const restoreData = currentBank._prevData || currentBank;
        updatedBankDetails[index] = {
          ...restoreData,
          bankType: "BankAndUpi",
          isDisabled: false,
          disableUPI: false,
        };
        delete updatedBankDetails[index]._prevData;

        // 🔥 Re-fetch QR details from API when BankAndUpi is selected
        try {
          const res = await axios.get(`${mergedUrl}/${CompaniesId}`);
          const latestData = res.data.data || res.data;

          if (latestData.bankDetails?.[index]?.qrDetails) {
            updatedBankDetails[index].qrDetails =
              latestData.bankDetails[index].qrDetails;
          }
        } catch (err) {
          toast.error("Failed to fetch latest QR details");
        }
      }
    } else {
      updatedBankDetails[index][field] = value;
    }

    setFormData((prev) => ({ ...prev, bankDetails: updatedBankDetails }));
  };
  const [formData, setFormData] = useState({ ...vendor });
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    code: "",
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
    qrDetails: "",
    bankAccount: "",
    bankHolder: "",
    ifsc: "",
    swift: "",
    upi: "",
    bankDetails: {
      type: "",
      bankNum: "",
      name: "",
      ifsc: "",
      swift: "",
      active: "",
    },
    panNum: "",
    registrationNum: "",
    globalPartyId: {
      code: "",
      _id: "",
    }, // ← add this
    active: true,
  });

  const [vendorDetail, setVendorDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const { id } = useParams(); // Use id from URL if needed
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = value;

    // Handle checkbox
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    // Restrict phone number input
    if (
      ["contactNum", "contactPersonPhone"].includes(name) &&
      !/^\d{0,10}$/.test(val)
    ) {
      return;
    }

    // Restrict numeric fields
    if (
      [
        "bankAccNum",
        "creditLimit",
        "contactNum",
        "contactPersonPhone",
      ].includes(name) &&
      !/^\d*$/.test(val)
    ) {
      return;
    }

    // Uppercase conversions
    const toUpper = [
      "bankName",
      "panNum",
      "registrationNum",
      "ifsc",
      "swift",
      "upi",
      "qrDetails",
      "Tannumber",
    ];
    if (toUpper.includes(name)) {
      val = val.toUpperCase();
    }

    // Length limits
    if (name === "bankAccNum" && val.length > 18) return;
    if (name === "contactNum" && val.length > 10) return;
    if (["email", "employeeEmail"].includes(name) && val.length > 100) return;

    // Letters & spaces only
    if (
      ["name", "employeeName", "bankName", "group"].includes(name) &&
      val &&
      !/^[A-Za-z\s]*$/.test(val)
    ) {
      return;
    }

    // Capitalize first letter
    if (["name", "employeeName"].includes(name) && val) {
      val = val.charAt(0).toUpperCase() + val.slice(1);
    }

    // Pattern validations
    if (name === "ifsc" && !/^[A-Z0-9]{0,12}$/.test(val)) return;
    if (name === "swift" && !/^[A-Z0-9]{0,10  }$/.test(val)) return;
    if (name === "qrDetails" && (!/^[A-Z0-9.@]*$/.test(val) || val.length > 25))
      return;
    if (name === "Tannumber" && !/^[A-Z0-9]{0,10}$/.test(val)) return;
    if (name === "panNum" && !/^[A-Z0-9]{0,10}$/.test(val)) return;
    if (name === "registrationNum" && !/^[A-Z0-9]{0,15}$/.test(val)) return;

    val = typeof val === "string" ? val.trim() : val;

    // Handle bankType field
    if (name === "bankType") {
      const noBank = ["Cash", "Barter", "Crypto", "UPI"].includes(val);
      setFormData((prev) => ({
        ...prev,
        bankType: val,
        bankDetails: noBank
          ? []
          : prev.bankDetails.map((b) => ({
              ...b,
              ...(noBank && {
                bankName: "",
                bankAccNum: "",
                accountHolderName: "",
                ifsc: "",
                swift: "",
                qrDetails: "",
              }),
            })),
      }));
      return;
    }

    // Final state update
    setFormData((prev) => ({ ...prev, [name]: val }));
  };


  
  const disableBankFields =
    formData.bankType === "Cash" ||
    formData.bankType === "Barter" ||
    formData.bankType === "UPI" || // Make sure this is trimmed — not " UPI"
    formData.bankType === "Crypto";
  const handleUpdate = async () => {
    if (window.confirm("Are you sure you want to update this Vendor?")) {
      setLoading(true);

      // Create a custom green spinner icon for the toast
      const loaderIcon = (
        <div
          style={{
            display: "inline-block",
            width: "20px",
            height: "20px",
            border: "3px solid #4CAF50",
            borderTop: "3px solid transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
      );

      // Show a loading toast with our custom icon
      const toastId = toast.loading("Updating...", {
        icon: loaderIcon,
        position: "top-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
      });

      try {
        const response = await axios.put(`${mergedUrl}/${vendorId}`, formData, {
          withCredentials: false,
        });

        if (response.status === 200) {
          setVendorDetail(response.data);
          setIsEditing(false);
          toast.update(toastId, {
            render: "Vendor updated successfully!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
            progress: undefined,
          });
        } else {
          console.error(`Unexpected response status: ${response.status}`);
          toast.update(toastId, {
            render: "Failed to update Vendor. Please try again.",
            type: "error",
            isLoading: false,
            autoClose: 3000,
            progress: undefined,
          });
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "An unexpected error occurred.";
        console.error("Error updating Vendor:", err);
        toast.update(toastId, {
          render: errorMessage,
          type: "error",
          isLoading: false,
          autoClose: 3000,
          progress: undefined,
        });
      } finally {
        setLoading(false);
        // toggleView();
      }
    }
  };

  useEffect(() => {
    async function fetchVendorDetail() {
      console.log("▶️ fetchVendorDetail start", { vendorId, id });
      try {
        console.log("🔄 About to call axios.get");
        const response = await axios.get(
          `https://fms-qkmw.onrender.com/fms/api/v0/vendors/${vendorId || id}`
        );
        console.log("✅ axios.get returned", response);

        if (response.status === 200) {
          console.log("✅ Status 200, data:", response.data);
          console.log("➡️ Calling setvendorDetail");
          setVendorDetail(response.data.data);
          console.log("➡️ Calling setFormData");
          // setFormData(response.data.data);
          setFormData({
            ...form,
            ...response.data.data, // spread fetched Vendor data
          });
          console.log("✅ State updated with vendorDetail and formData");
        } else {
          console.log(
            "⚠️ Unexpected status",
            response.status,
            response.statusText
          );
          setError(`Unexpected response status: ${response.status}`);
        }
      } catch (error) {
        console.error("❌ Error fetching vendor details", error);
        const errorMessage =
          error.response?.data?.message ||
          "An unexpected error occurred. Please try again.";
        console.log("❗ Resolved errorMessage:", errorMessage);
        setError(errorMessage);
      } finally {
        console.log(
          "🔚 fetchvendorDetail finally block – setting loading to false"
        );
        setLoading(false);
      }
    }

    console.log("🔄 useEffect triggered");
    fetchVendorDetail();
  }, [vendorId, id]);

  const handleEdit = () => {
    setIsEdited(true);
    setIsEditing(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-black-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-500 text-lg font-medium">
          Vendor view page
        </p>
      </div>
    );
  }

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
          <h3 className="text-xl font-semibold">Vendor View Page</h3>
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
                Vendor Code
              </label>
              <input
                name="vendorcode"
                value={formData.code}
                readOnly
                placeholder="Auto-generated"
                className="mt-1 w-full cursor-not-allowed  p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Vendor Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
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
            </div>
          </div>{" "}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                disabled={!isEditing}
                rows="4"
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Company Contact No
                </label>
                <input
                  type="text"
                  name="contactNum"
                  value={formData.contactNum || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
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
              </div>
            </div>
          </div>{" "}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Group
                </label>
                <input
                  name="group"
                  value={formData.groups || ""}
                  onChange={handleChange}
                  placeholder="e.g. Retail, Wholesale"
                  disabled
                  className="mt-1 w-full cursor-not-allowed  p-2 border rounded focus:ring-2 focus:ring-blue-200"
                />
              </div>

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
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Any additional notes…"
                rows={4}
                disabled={!isEditing}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
        </section>
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
                value={formData.creditLimit}
                maxLength={10}
                onChange={handleChange}
                disabled={!isEditing}
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
                value={formData.paymentTerms}
                disabled={!isEditing}
                onChange={handleChange}
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
          </div>
        </section>
        {/* Payment & Financial */}
        {/* Bank Details */}{" "}
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
                value={formData.contactPersonName}
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
                value={formData.contactPersonPhone}
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
                value={formData.contactPersonEmail}
                onChange={handleChange}
                placeholder="e.g. john.doe@example.com"
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
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

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    UPI ID / QR Details
                  </label>
                  <input
                    name="qrDetails"
                    value={b.qrDetails || ""}
                    onChange={(e) =>
                      handleBankDetailChange(i, "qrDetails", e.target.value)
                    }
                    disabled={
                      !isEditing ||
                      b.bankType === "Cash" ||
                      b.bankType === "Bank"
                    }
                    placeholder="e.g. username@upi"
                    className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 ${
                      !isEditing ||
                      b.bankType === "Cash" ||
                      b.bankType === "Bank"
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
                maxLength={10}
                name="panNum"
                value={formData.panNum || ""}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Convert to uppercase
                  if (value.length <= 10) {
                    // Correctly update the formData state
                    setFormData({ ...formData, panNum: value }); // Ensure the correct key is being updated
                  }
                }}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Registration No
              </label>
              <input
                type="text"
                name="registrationNum"
                value={formData.registrationNum || ""}
                maxLength={16}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Convert to uppercase
                  if (value.length <= 16) {
                    // Correctly update the formData state
                    setFormData({ ...formData, registrationNum: value }); // Ensure the correct key is being updated
                  }
                }}
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
                value={formData.tanNumber || ""}
                maxLength={10}
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
          {" "}
          <button
            type="button"
            onClick={handleEdit}
            className="px-6 py-2 bg-green-200 rounded hover:bg-gray-300 transition"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={goBack}
            className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Go Back
          </button>
          <button
            onClick={handleUpdate}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorViewPage;
