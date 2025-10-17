import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

import { useParams } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
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
const bankTypes = ["BankAndUpi", "Cash", "Bank"];
const VendorViewPagee = ({
  vendorId,
  vendor,
  goBack,
  handleSaveVendor,
  toggleView,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const bankDetailsBackup = useRef({});
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
        "https://fms-qkmw.onrender.com/fms/api/v0/vendors/logoImage",
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

  const [formData, setFormData] = useState({ ...vendor });
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    code: "",
    name: "",
    businessType: "",
    address: "",
    contactNum: "",
    businessInfo: {},
    taxInfo: {},
    banks: [{ bankName: "", accountNo: "", ifsc: "" }],
    addresses: [],
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
    creditLimit: "",
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
          const res = await axios.get(`${mergedUrl}/${vendorId}`);
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
  const sanitizeBankField = (field, raw) => {
    let v = raw;
    switch (field) {
      case "bankAccNum":
        // Keep only letters and digits, uppercase letters, max length 20
        return v
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "")
          .slice(0, 20);
      case "Tannumber":
        return v
          .toUpperCase()
          .replace(/[^0-9]/g, "")
          .slice(0, 20);
      case "bankName": // Bank Name
        // uppercase only, max 60 chars
        return v.toUpperCase().slice(0, 60);

      case "accountHolderName":
        // capitalize first letter (leave rest as typed)
        return v.length > 0 ? v.charAt(0).toUpperCase() + v.slice(1) : "";

      case "ifsc":
        // uppercase only, max 11 (IFSC is 11 chars)
        return v
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "")
          .slice(0, 11);

      case "swift":
        // uppercase only, alphanumeric, max 20
        return v
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "")
          .slice(0, 20);

      case "qrDetaZZils":
        // uppercase, allow letters/numbers/@ . _
        return v
          .toUpperCase()
          .replace(/[^A-Z0-9@._]/g, "")
          .slice(0, 25);

      default:
        return raw;
    }
  };

  const disableBankFields =
    formData.bankType === "Cash" ||
    formData.bankType === "Barter" ||
    formData.bankType === "Crypto";

  const [vendorDetail, setVendorDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const { id } = useParams(); // Use id from URL if needed

  // 3) Toggle edit/save
  const toggleEdit = () => setIsEditing((prev) => !prev);
  const handleSave = () => {
    axios
      .put(`${baseUrl}/companies/${id}`, formData)
      .then(() => {
        toast.success("Company updated!");
        setIsEditing(false);
      })
      .catch(() => toast.error("Update failed"));
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
  const handlePhoneChange = (value) => {
    handleChange({ target: { name: "contactNum", value } });
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = value.replace(/^\s+/, " ");

    // Handle checkbox input
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    // Numeric fields and length limits
    const numericFields = [
      "bankAccNum",
      "creditLimit",
      "contactNum",
      "contactNum",
    ];
    const phoneFields = ["contactNum", "contactNum"];
    const maxLengths = {
      bankAccNum: 18,
      contactNum: 10,
      contactNum: 10,
      email: 100,
      employeeEmail: 100,
    };

    if (numericFields.includes(name) && !/^\d*$/.test(val)) return;
    if (phoneFields.includes(name) && !/^\d{0,10}$/.test(val)) return;
    if (maxLengths[name] && val.length > maxLengths[name]) return;

    // Only letters and spaces
    const lettersOnly = ["name", "employeeName", "bankName", "group"];
    if (lettersOnly.includes(name) && val && !/^[A-Za-z\s]*$/.test(val)) return;

    // Capitalize first letter
    if (["name", "employeeName"].includes(name) && val) {
      val = val.charAt(0).toUpperCase() + val.slice(1);
    }
    if (
      ["name", "contactPersonName", "accountHolderName"].includes(name) &&
      val
    ) {
      val = val.charAt(0).toUpperCase() + val.slice(1);
    }

    // Always uppercase for these fields
    const toUpper = [
      "bankName",
      "panNum",
      "registrationNum",
      "ifsc",
      "swift",
      "upi",
      "qrDetails",
      "tanNumber",
    ];
    if (toUpper.includes(name)) {
      val = val.toUpperCase();
    }

    // Pattern-specific validations
    const patternValidators = {
      ifsc: /^[A-Z0-9]{0,12}$/,
      swift: /^[A-Z0-9]{0,10}$/,
      Tannumber: /^[A-Z0-9]{0,10}$/,
      panNum: /^[A-Z0-9]{0,10}$/,
      registrationNum: /^[A-Z0-9]{0,15}$/,
    };
    if (patternValidators[name] && !patternValidators[name].test(val)) return;

    // Handle bankType logic
    if (name === "bankType") {
      const noBank = ["Cash", "Barter", "Crypto"].includes(val);
      setFormData((prev) => ({
        ...prev,
        bankType: val,
        bankDetails: prev.bankDetails.map((b) => ({
          ...b,
          type: val,
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

    // Final form update
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleUpdate = async () => {
    if (window.confirm("Are you sure you want to update this vendor?")) {
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
        const response = await axios.put(
          `${mergedUrl}/${vendorId}`,
          formData,
          { withCredentials: false }
        );

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
            render: "Failed to update vendor. Please try again.",
            type: "error",
            isLoading: false,
            autoClose: 3000,
            progress: undefined,
          });
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "An unexpected error occurred.";
        console.error("Error updating vendor:", err);
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
          `https://fms-qkmw.onrender.com/fms/api/v0/vendors/${
            vendorId || id
          }`
        );
        console.log("✅ axios.get returned", response);

        if (response.status === 200) {
          console.log("✅ Status 200, data:", response.data);
          console.log("➡️ Calling setVendorDetail");
          setVendorDetail(response.data.data);
          console.log("➡️ Calling setFormData");
          // setFormData(response.data.data);
          setFormData({
            ...form,
            ...response.data.data, // spread fetched vendor data
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
          "🔚 fetchVendorDetail finally block – setting loading to false"
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
            </div>{" "}
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
                readOnly
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
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Contact No
              </label>
              <PhoneInput
                country="in"
                name="contactNum"
                inputMode="numeric"
                value={formData.contactNum || ""}
                disabled={!isEditing}
                onChange={handlePhoneChange}
                inputProps={{ name: "contactNum", required: true }}
                containerClass="mt-1 w-full"
                inputClass="!w-full !pl-18 !pr-7 !py-3 !border !rounded-lg !focus:ring-2 !focus:ring-black-200"
                buttonClass="!border !rounded-l-lg "
                dropdownClass="!shadow-lg"
                enableSearch
                prefix="+"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Email ID
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
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Group
              </label>
              <input
                name="group"
                value={formData.groups || ""}
                maxLength={10}
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
              <PhoneInput
                country="in"
                // CHANGED: keep storage as +E164, show without "+"
                value={formData.contactPersonPhone || ""}
                onChange={(val, country) => {
                  const e164 = val ? `+${val}` : "";
                  setForm((prev) => ({
                    ...prev,
                    contactPersonPhone: e164,
                  }));
                }}
                inputProps={{ name: "contactPersonPhone", required: true }}
                containerClass="mt-1 w-full"
                inputClass="!w-full !pl-18 !pr-7 !py-4 !border !rounded-lg !focus:ring-2 !focus:ring-black-200"
                buttonClass="!border !rounded-l-lg "
                dropdownClass="!shadow-lg"
                placeholder="e.g. +91 91234 56789"
                enableSearch
                prefix="+"
              />
            </div>{" "}
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
                value={form.creditLimit || formData.creditLimit}
                onChange={handleChange}
                inputMode="numeric"
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
        {/* Bank Details */}

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
                  // Uppercase + strip non-alphanumerics + enforce max 16 chars
                  const clean = e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, 16);
                  setFormData((prev) => ({ ...prev, registrationNum: clean }));
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
                name="tanNum"
                value={formData.tanNum || ""}
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

export default VendorViewPagee;
