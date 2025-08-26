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
const thirdUrl = "/customers";
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
const CustomerViewPagee = ({
  customerId,
  customer,
  goBack,
  handleSaveCustomer,
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
        "https://fms-qkmw.onrender.com/fms/api/v0/customers/logoImage",
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

  const [formData, setFormData] = useState({ ...customer });
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

  const addBankDetail = () => {
    setFormData((prev) => ({
      ...prev,
      bankDetails: [
        ...(prev.bankDetails || []),
        {
          type: "",
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

  const handleBankDetailChange = (index, field, rawValue) => {
    const clean = sanitizeBankField(field, rawValue);

    setFormData((prev) => {
      const copy = [...(prev.bankDetails || [])];
      let row = { ...copy[index] };

      if (field === "type") {
        const newType = clean;
        const isNoBank = ["Cash", "Barter"].includes(newType);

        if (isNoBank) {
          // stash the old data
          bankDetailsBackup.current[index] = { ...row };
          // clear out
          row = {
            type: newType,
            bankName: "",
            bankAccNum: "",
            accountHolderName: "",
            ifsc: "",
            swift: "",
            qrDetails: "",
          };
        } else {
          // restoring if we have a backup
          const backed = bankDetailsBackup.current[index];
          if (backed) {
            row = { ...backed, type: newType };
            delete bankDetailsBackup.current[index];
          } else {
            row.type = newType;
          }
        }
      } else {
        // normal field edit
        row = { ...row, [field]: clean };
      }

      copy[index] = row;
      return { ...prev, bankDetails: copy };
    });
  };

  const disableBankFields =
    formData.bankType === "Cash" ||
    formData.bankType === "Barter" ||
    formData.bankType === "Crypto";

  const [customerDetail, setCustomerDetail] = useState(null);
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
      "contactPersonPhone",
    ];
    const phoneFields = ["contactNum", "contactPersonPhone"];
    const maxLengths = {
      bankAccNum: 18,
      contactNum: 10,
      contactPersonPhone: 10,
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
      // Capitalize first letter, leave the rest as-is
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
    if (window.confirm("Are you sure you want to update this customer?")) {
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
          `${mergedUrl}/${customerId}`,
          formData,
          { withCredentials: false }
        );

        if (response.status === 200) {
          setCustomerDetail(response.data);
          setIsEditing(false);
          toast.update(toastId, {
            render: "Customer updated successfully!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
            progress: undefined,
          });
        } else {
          console.error(`Unexpected response status: ${response.status}`);
          toast.update(toastId, {
            render: "Failed to update customer. Please try again.",
            type: "error",
            isLoading: false,
            autoClose: 3000,
            progress: undefined,
          });
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "An unexpected error occurred.";
        console.error("Error updating customer:", err);
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
    async function fetchCustomerDetail() {
      console.log("▶️ fetchCustomerDetail start", { customerId, id });
      try {
        console.log("🔄 About to call axios.get");
        const response = await axios.get(
          `https://fms-qkmw.onrender.com/fms/api/v0/customers/${
            customerId || id
          }`
        );
        console.log("✅ axios.get returned", response);

        if (response.status === 200) {
          console.log("✅ Status 200, data:", response.data);
          console.log("➡️ Calling setCustomerDetail");
          setCustomerDetail(response.data.data);
          console.log("➡️ Calling setFormData");
          // setFormData(response.data.data);
          setFormData({
            ...form,
            ...response.data.data, // spread fetched customer data
          });
          console.log("✅ State updated with customerDetail and formData");
        } else {
          console.log(
            "⚠️ Unexpected status",
            response.status,
            response.statusText
          );
          setError(`Unexpected response status: ${response.status}`);
        }
      } catch (error) {
        console.error("❌ Error fetching customer details", error);
        const errorMessage =
          error.response?.data?.message ||
          "An unexpected error occurred. Please try again.";
        console.log("❗ Resolved errorMessage:", errorMessage);
        setError(errorMessage);
      } finally {
        console.log(
          "🔚 fetchCustomerDetail finally block – setting loading to false"
        );
        setLoading(false);
      }
    }

    console.log("🔄 useEffect triggered");
    fetchCustomerDetail();
  }, [customerId, id]);

  const handleEdit = () => {
    setIsEdited(true);
    setIsEditing(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-black-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-500 text-lg font-medium">
          Customer view page
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
          <h3 className="text-xl font-semibold">Customer View Page</h3>
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
                Customer Code
              </label>
              <input
                name="customercode"
                value={formData.code}
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
                Contact No
              </label>
              <PhoneInput
                country="in"
                name="contactNum"
                inputMode="numeric"
                value={formData.contactNum || ""}
                disabled={!isEditing}
                onChange={handleChange}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4"></div>
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
                  maxLength={10}
                  onChange={handleChange}
                  placeholder="e.g. Retail, Wholesale"
                  disabled
                  className="mt-1 w-full cursor-not-allowed  p-2 border rounded focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>{" "}
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
               name="contactPersonPhone"
                inputMode="numeric"
                value={formData.contactPersonPhone}
                onChange={handleChange}
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
        <section className="p-6 ">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-700 mb-4">
              Bank Details
            </h2>{" "}
            <button
              type="button"
              onClick={addBankDetail}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
            >
              + Add Bank
            </button>{" "}
          </div>
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
                      value={formData.bankType || form.bankType || " "}
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
                      name="bankName"
                      value={b.bankName || ""}
                      maxLength={50}
                      onChange={(e) =>
                        handleBankDetailChange(i, "bankName", e.target.value)
                      }
                      disabled={disableBankFields || !isEditing}
                      className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 ${
                        disableBankFields
                          ? "cursor-not-allowed bg-gray-100"
                          : ""
                      }`}
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
                      name="bankAccNum"
                      value={b.bankAccNum || ""}
                      maxLength={20}
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        const sanitizedValue = rawValue
                          .toUpperCase()
                          .replace(/[^0-9]/g, "") // Remove all non-alphanumeric characters except uppercase letters and digits
                          .slice(0, 20); // Ensure max 20 chars even after sanitize
                        handleBankDetailChange(i, "bankAccNum", sanitizedValue);
                      }}
                      placeholder="e.g. SBIN0001234"
                      disabled={disableBankFields || !isEditing}
                      className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 ${
                        disableBankFields
                          ? "cursor-not-allowed bg-gray-100"
                          : ""
                      }`}
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
                      name="accountHolderName"
                      value={b.accountHolderName || ""}
                      maxLength={30}
                      onChange={(e) =>
                        handleBankDetailChange(
                          i,
                          "accountHolderName",
                          e.target.value
                        )
                      }
                      placeholder="e.g. SBIN0001234"
                      disabled={disableBankFields || !isEditing}
                      className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 ${
                        disableBankFields
                          ? "cursor-not-allowed bg-gray-100"
                          : ""
                      }`}
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
                      maxLength={20}
                      value={b.ifsc || ""}
                      onChange={(e) =>
                        handleBankDetailChange(i, "ifsc", e.target.value)
                      }
                      placeholder="e.g. SBIN0001234"
                      disabled={disableBankFields || !isEditing}
                      className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 ${
                        disableBankFields
                          ? "cursor-not-allowed bg-gray-100"
                          : ""
                      }`}
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
                      maxLength={11}
                      onChange={(e) =>
                        handleBankDetailChange(i, "swift", e.target.value)
                      }
                      placeholder="e.g. SBININBBXXX"
                      disabled={disableBankFields || !isEditing}
                      className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 ${
                        disableBankFields
                          ? "cursor-not-allowed bg-gray-100"
                          : ""
                      }`}
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
                      name="qrDetails"
                      value={
                        b.qrDetails && b.qrDetails.trim() !== ""
                          ? b.qrDetails
                          : "-"
                      }
                      onChange={(e) =>
                        handleBankDetailChange(i, "qrDetails", e.target.value)
                      }
                      placeholder="e.g. abc@hdfcbank"
                      maxLength={25}
                      disabled={disableBankFields || !isEditing}
                      className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 ${
                        disableBankFields
                          ? "cursor-not-allowed bg-gray-100"
                          : ""
                      }`}
                    />
                  </div>
                </div>
              ))}
          </div>
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

export default CustomerViewPagee;
