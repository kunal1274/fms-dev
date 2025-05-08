import React, { useState, useEffect } from "react";
import axios from "axios";

import { useParams } from "react-router-dom";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./c.css";
const baseUrl = "https://fms-qkmw.onrender.com";
const secondUrl = "/fms/api/v0";
const thirdUrl = "/companies";
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
const CompanyViewPage = ({
  ComapniesId,
  company,
  goBack,
  handleSavecompany,
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
        "https://fms-qkmw.onrender.com/fms/api/v0/companies/supload-logo",
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
      await fetchcompanys(); // If you want to refresh after upload
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

  const [formData, setFormData] = useState({ ...company });
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    code: "",
    name: "",
    businessType: "",
    address: "",
    contactNum: "",
    email: "",
    contactNumber: "",
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
    taxInfo: {
      gstNumber: "",
      tanNumber: "",
      panNumber: "",
    },
    globalPartyId: {
      code: "",
      _id: "",
    }, // ← add this
    active: true,
  });
  const disableBankFields =
    formData.bankType === "Cash" ||
    formData.bankType === "Barter" ||
    formData.bankType === "UPI" || // Make sure this is trimmed — not " UPI"
    formData.bankType === "Crypto";
  const [companyDetail, setCompanyDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const { id } = useParams(); // Use id from URL if needed
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === "checkbox" ? checked : value;

    // ✅ TaxInfo fields
    const taxFields = ["panNumber", "gstNumber", "tanNumber"];
    if (taxFields.includes(name)) {
      val = val.toUpperCase();
      setFormData((prev) => ({
        ...prev,
        taxInfo: {
          ...prev.taxInfo,
          [name]: val,
        },
      }));
      return;
    }

    // ✅ Phone number: 10 digits only
    if (
      ["contactNum", "contactPersonPhone", "contactNumber"].includes(name) &&
      !/^\d{0,10}$/.test(val)
    ) {
      return;
    }

    // ✅ Email fields – allow valid email format and max 100 chars
    if (["email", "employeeEmail"].includes(name)) {
      if (val.length > 100) return;
      if (val.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        return; // basic email format validation
      }
    }

    // ✅ Uppercase certain fields
    if (["panNum", "registrationNum", "ifsc", "swift", "upi"].includes(name)) {
      val = val.toUpperCase();
    }

    // ✅ Name fields — only letters and spaces
    if (
      ["name", "employeeName", "bankName", "bankHolder"].includes(name) &&
      val &&
      !/^[A-Za-z\s]*$/.test(val)
    ) {
      return;
    }

    // ✅ Capitalize first letter for these
    if (["name", "employeeName", "bankHolder"].includes(name) && val) {
      val = val.charAt(0).toUpperCase() + val.slice(1);
    }

    // ✅ Group validation
    if (name === "group" && val && !/^[A-Za-z\s]*$/.test(val)) {
      return;
    }
    if (name === "Tannumber" && !/^[A-Z0-9]{0,10}$/.test(val)) return;
    // ✅ PAN and registration length restriction
    if (name === "panNum" && !/^[A-Z0-9]{0,10}$/.test(val)) return;
    if (name === "registrationNum" && !/^[A-Z0-9]{0,15}$/.test(val)) return;

    // ✅ Free-text fields — directly allowed:
    const freeTextFields = [
      "website",
      "primaryGSTAddress",
      "secondaryOfficeAddress",
      "tertiaryShippingAddress",
      "remarks",
    ];
    if (freeTextFields.includes(name)) {
      setFormData((prev) => ({
        ...prev,
        [name]: val,
      }));
      return;
    }

    // ✅ Default case
    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
  };
  const handleBankDetailChange = (index, field, value) => {
    setFormData((prevData) => {
      const updatedBankDetails = [...(prevData.bankDetails || [])];
      if (updatedBankDetails[index]) {
        updatedBankDetails[index] = {
          ...updatedBankDetails[index],
          [field]: value,
        };
      }
      return {
        ...prevData,
        bankDetails: updatedBankDetails,
      };
    });
  };
  const handleUpdate = async () => {
    if (window.confirm("Are you sure you want to update this company?")) {
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
          `${mergedUrl}/${ComapniesId}`,
          formData,
          { withCredentials: false }
        );

        if (response.status === 200) {
          setCompanyDetail(response.data);
          setIsEditing(false);
          toast.update(toastId, {
            render: "Company updated successfully!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
            progress: undefined,
          });
        } else {
          console.error(`Unexpected response status: ${response.status}`);
          toast.update(toastId, {
            render: "Failed to update Company. Please try again.",
            type: "error",
            isLoading: false,
            autoClose: 3000,
            progress: undefined,
          });
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "An unexpected error occurred.";
        console.error("Error updating Company:", err);
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
    async function fetchCompanyDetail() {
      console.log("▶️ fetchCompanyDetail start", { ComapniesId, id });
      try {
        console.log("🔄 About to call axios.get");
        const response = await axios.get(
          `https://fms-qkmw.onrender.com/fms/api/v0/companies/${
            ComapniesId || id
          }`
        );
        console.log("✅ axios.get returned", response);

        if (response.status === 200) {
          console.log("✅ Status 200, data:", response.data);
          console.log("➡️ Calling setCompanyDetail");
          setCompanyDetail(response.data.data);
          console.log("➡️ Calling setFormData");
          // setFormData(response.data.data);
          setFormData({
            ...form,
            ...response.data.data, // spread fetched Company data
          });
          console.log("✅ State updated with CompanyDetail and formData");
        } else {
          console.log(
            "⚠️ Unexpected status",
            response.status,
            response.statusText
          );
          setError(`Unexpected response status: ${response.status}`);
        }
      } catch (error) {
        console.error("❌ Error fetching Company details", error);
        const errorMessage =
          error.response?.data?.message ||
          "An unexpected error occurred. Please try again.";
        console.log("❗ Resolved errorMessage:", errorMessage);
        setError(errorMessage);
      } finally {
        console.log(
          "🔚 fetchCompanyDetail finally block – setting loading to false"
        );
        setLoading(false);
      }
    }

    console.log("🔄 useEffect triggered");
    fetchCompanyDetail();
  }, [ComapniesId, id]);

  const handleEdit = () => {
    setIsEdited(true);
    setIsEditing(true);
  };

  if (loading) {
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
                  name="companyName "
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
              </div>{" "}
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Company Contact No
                </label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
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
                  Address
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

          {/* Bank Details */}
          <section className="p-6">
            <h2 className="text-lg font-medium text-gray-700 mb-4">
              Bank Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              {formData.bankDetails?.length > 0 &&
                formData.bankDetails.map((b, i) => (
                  <div key={i}>
                    {/* … other fields … */}

                    {/* Account Holder Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Bank Type
                      </label>
                      <select
                        name="bankType"
                        value={formData.bankType || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        required
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
                  </div>
                ))}
              {formData.bankDetails?.length > 0 &&
                formData.bankDetails.map((b, i) => (
                  <div key={i}>
                    {/* … other fields … */}

                    {/* Account Holder Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Bank Name
                      </label>
                      <input
                        name="name"
                        value={b.name || ""}
                        onChange={(e) =>
                          handleBankDetailChange(i, "name", e.target.value)
                        }
                        disabled={!isEditing}
                        placeholder="e.g. 1234567890"
                        className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>
                ))}
              {formData.bankDetails?.length > 0 &&
                formData.bankDetails.map((b, i) => (
                  <div>
                    {/* … other inputs … */}

                    {/* IFSC */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Bank Account
                      </label>
                      <input
                        name="bankNum"
                        value={b.bankNum || ""}
                        onChange={(e) =>
                          handleBankDetailChange(i, "bankNum", e.target.value)
                        }
                        placeholder="e.g. SBIN0001234"
                        disabled={!isEditing}
                        className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>
                ))}
              {formData.bankDetails?.length > 0 &&
                formData.bankDetails.map((b, i) => (
                  <div>
                    {/* … other inputs … */}

                    {/* IFSC */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Account Holder Name
                      </label>
                      <input
                        name="name "
                        onChange={(e) =>
                          handleBankDetailChange(i, "name", e.target.value)
                        }
                        placeholder="e.g. SBIN0001234"
                        disabled={!isEditing}
                        className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>
                ))}
              {formData.bankDetails?.length > 0 &&
                formData.bankDetails.map((b, i) => (
                  <div>
                    {/* … other inputs … */}

                    {/* IFSC */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        IFSC
                      </label>
                      <input
                        name="ifsc"
                        value={b.ifsc || ""}
                        onChange={(e) =>
                          handleBankDetailChange(i, "ifsc", e.target.value)
                        }
                        placeholder="e.g. SBIN0001234"
                        disabled={!isEditing}
                        className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>
                ))}
              {formData.bankDetails?.length > 0 &&
                formData.bankDetails.map((b, i) => (
                  <div>
                    {/* … other inputs … */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Swift
                      </label>
                      <input
                        name="swift"
                        value={b.swift || ""}
                        onChange={(e) =>
                          handleBankDetailChange(i, "swift", e.target.value)
                        }
                        placeholder="e.g. SBININBBXXX"
                        disabled={!isEditing}
                        className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>
                ))}
              {formData.bankDetails?.length > 0 &&
                formData.bankDetails.map((b, i) => (
                  <div>
                    {/* … other fields … */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        UPI ID
                      </label>
                      <input
                        name="upi"
                        value={
                          b.qrDetails && b.qrDetails.trim() !== ""
                            ? b.qrDetails
                            : " "
                        }
                        onChange={(e) =>
                          handleBankDetailChange(i, "upi", e.target.value)
                        }
                        disabled={!isEditing}
                        placeholder="e.g. abc@hdfcbank"
                        className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </section>

          {/* Tax Information */}

          <section className="p-6">
            <h2 className="text-lg font-medium text-gray-700 mb-4">
              {/* Tax Infromation */}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  PAN No
                </label>
                <input
                  type="text"
                  name="panNum"
                  value={formData.panNum || ""}
                  onChange={handleChange}
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
  }

  return (
    <div className="space-y-6 ">
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
                name="companyName "
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
            </div>{" "}
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
            </div>{" "}
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
                Address
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
                Secondary Office Address
              </label>
              <textarea
                name="secondaryOfficeAddress"
                value={formData.secondaryOfficeAddress || ""}
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

        {/* Bank Details */}
        <section className="p-6">
          <h2 className="text-lg font-medium text-gray-700 ">Bank Details</h2>
          {formData.bankDetails?.length > 0 &&
            formData.bankDetails.slice(0, 1).map((b, i) => (
              <div key={i} className="rounded-lg mt-2">
                <h3 className="text-sm font-semibold text-grey-700 "></h3>
                <div className="grid grid-cols-1 mt-3 sm:grid-cols-3 gap-6">
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
                      disabled={!isEditing}
                      placeholder="e.g. HDFC Bank"
                      className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  {/* Account Number */}
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
                      disabled={!isEditing}
                      placeholder="e.g. 1234567890"
                      className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
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
                      disabled={!isEditing}
                      placeholder="e.g. John Doe"
                      className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
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
                      disabled={!isEditing}
                      placeholder="e.g. SBIN0001234"
                      className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
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
                      disabled={!isEditing}
                      placeholder="e.g. SBININBBXXX"
                      className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  {/* UPI ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      UPI ID
                    </label>
                    <input
                      name="upi"
                      value={b.qrDetails || ""}
                      onChange={(e) =>
                        handleBankDetailChange(i, "qrDetails", e.target.value)
                      }
                      disabled={!isEditing}
                      placeholder="e.g. user@upi"
                      className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>
              </div>
            ))}
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

export default CompanyViewPage;
