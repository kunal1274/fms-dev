import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";

/* ---------- Constants (unchanged lists) ---------- */
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
const bankTypes = ["BankAndUpi", "Cash", "Bank"];

/* ---------- Helpers (put OUTSIDE the component) ---------- */
// disable all bank fields when type is non-bank
const isBankFieldsDisabled = (type) =>
  ["Cash", "Barter", "Crypto", "UPI"].includes(String(type || "").trim());

// enable UPI input only for UPI/BankAndUpi
const isUpiEnabled = (type) =>
  ["UPI", "BankAndUpi"].includes(String(type || "").trim());

// sanitize one bank row to match server rules
const sanitizeBank = (b = {}, codeFromForm = "") => {
  const t = String(b.type || "").trim();

  const up = (s) =>
    String(s || "")
      .toUpperCase()
      .trim();
  const keep = (s) => String(s || "").trim();

  // strip spaces; allow only A-Z a-z 0-9 @ . _ -
  const cleanAcc = keep(b.bankAccNum).replace(/\s+/g, "");
  const accValid = /^[A-Za-z0-9@._-]*$/.test(cleanAcc);

  return {
    code: codeFromForm,
    type: t,
    bankAccNum: accValid ? cleanAcc : "",
    bankName: up(b.bankName),
    accountHolderName: keep(b.accountHolderName),
    ifsc: up(b.ifsc),
    swift: up(b.swift),
    qrDetails: keep(b.qrDetails),
    active: true,
  };
};

/* ---------- NEW: Robust next account number generator ---------- */
const nextCustomerCode = (list = []) => {
  // Look for patterns like CUST_001 (3+ digits). If not found, default to CUST_001
  const takeNum = (val) => {
    if (!val) return NaN;
    const m =
      String(val).match(/(?:^|[^A-Z0-9])CUST[_-]?(\d{1,6})(?:[^0-9]|$)/i) ||
      String(val).match(/_(\d{1,6})$/); // fallback: *_### at end
    return m ? parseInt(m[1], 10) : NaN;
  };

  let maxN = 0;
  for (const c of Array.isArray(list) ? list : []) {
    const n1 = takeNum(c?.customerAccountNo);
    const n2 = takeNum(c?.code);
    if (!Number.isNaN(n1)) maxN = Math.max(maxN, n1);
    if (!Number.isNaN(n2)) maxN = Math.max(maxN, n2);
  }
};

export default function CustomerForm({ handleCancel, onSaved }) {
  /* ---------- State ---------- */
  const [form, setForm] = useState({
    code: "",
    name: "",
    businessType: "",
    address: "",
    contactNum: "",
    email: "",
    tanNumber: "",
    bankDetails: [
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
    currency: "INR",
    panNum: "",
    registrationNum: "",
    globalPartyId: "",
    active: true,
    qrDetails: "",
    customerAccountNo: "", // will be generated
  });

  const [customers, setCustomers] = useState([]);

  /* ---------- NEW: uploader states referenced by handleFileUpload ---------- */
  const [logoUploading, setLogoUploading] = useState(false); // logic only; UI unchanged
  const [uploadProgress, setUploadProgress] = useState({}); // logic only; UI unchanged

  const apiBase = "https://fms-qkmw.onrender.com/fms/api/v0/customers";

  /* ---------- Helpers ---------- */
  const generateAccountNo = useCallback((list) => {
    // CHANGED: return next code string instead of computing and discarding
    return nextCustomerCode(list);
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const { data } = await axios.get(apiBase);
      const arr = Array.isArray(data?.data) ? data.data : [];
      setCustomers(arr);
      setForm((prev) => ({
        ...prev,
        customerAccountNo: prev.customerAccountNo || generateAccountNo(arr), // don't overwrite if already set
      }));
    } catch (err) {
      console.error("Fetch customers failed:", {
        status: err.response?.status,
        data: err.response?.data,
      });
      toast.error(
        err.response?.data?.message || err.message || "Couldn’t fetch customers"
      );
    }
  }, [apiBase, generateAccountNo]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const addBankDetail = () => {
    setForm((prev) => ({
      ...prev,
      bankDetails: [
        ...prev.bankDetails,
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

  const handleFileUpload = async (file) => {
    if (!file) {
      toast.error("No file selected!");
      return;
    }
    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append("logoImage", file);

      await axios.post(`${apiBase}/upload-logo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress({ [file.name]: percentCompleted });
        },
      });

      toast.success("File uploaded successfully! ✅");
      await fetchCustomers();
      handleCancel?.();
    } catch (error) {
      console.error("Upload failed:", {
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error("Error uploading logo!");
    } finally {
      setTimeout(() => {
        setLogoUploading(false);
        setUploadProgress({});
      }, 500);
    }
  };

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

    // Validators (top-level fields only)
    const validators = {
      // NOTE: bankAccNum here is the top-level one (unused in payload). We still keep it aligned.
      bankAccNum: /^[A-Za-z0-9@._-]{0,25}$/,
      bankName: /^[A-Z0-9\s]{0,50}$/,
      panNum: /^[A-Z0-9]{0,10}$/,
      registrationNum: /^[A-Z0-9]{0,15}$/,
      ifsc: /^[A-Z0-9]{0,12}$/,
      swift: /^[A-Z0-9]{0,10}$/,
      tanNumber: /^[A-Z0-9]{0,10}$/,
      qrDetails: /^[A-Za-z0-9.@]{0,25}$/,
      name: /^.*$/,
      employeeName: /^[A-Za-z\s]*$/,
      email: /^.{0,100}$/,
      employeeEmail: /^.{0,100}$/,
      contactNum: /^\d{0,10}$/, // not used when PhoneInput sets +E164
      contactPersonPhone: /^\d{0,10}$/, // not used when PhoneInput sets +E164
      creditLimit: /^\d{0,10}$/,
    };

    // checkbox
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    // Reset bank-related top-level fields if bankType is Cash-like (legacy fields)
    if (
      name === "bankType" &&
      ["Cash", "Barter", "Crypto", "UPI"].includes(String(val || "").trim())
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

    // Uppercase specific fields (NOT including account numbers)
    if (
      [
        "bankName",
        "panNumber",
        "gstNumber",
        "tanNumber",
        "bankAccNum",
        "bankName",
        "companyCode",
        "ifsc",
        "swift",
        "panNum",
        "registrationNum",
        "ifsc",
        "swift",
        "tanNumber",
      ].includes(name)
    ) {
      val = String(val).toUpperCase();
    }

    // Validate input
    if (validators[name] && !validators[name].test(val)) {
      if (name === "name") {
        toast.error(
          "Invalid characters in Customer Name. Allowed: letters, numbers, spaces, . & ( ) -"
        );
      }
      return;
    }

    // Set form state
    setForm((prev) => ({ ...prev, [name]: val }));
  };
  const handleAddBank = () => {
    setForm((prev) => ({
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
  const handleBankChange = (index, field, value) => {
    setForm((prev) => {
      const updatedBanks = [...prev.bankDetails];
      updatedBanks[index][field] = value;
      return { ...prev, bankDetails: updatedBanks };
    });
  };
  const createCustomer = async (e) => {
    e.preventDefault();

    // Map and sanitize bank details from the array actually used in the UI
    const banks = (form.bankDetails || [])
      .map((b) => sanitizeBank(b, form.code || form.customerAccountNo))
      .filter((b) => b.type); // drop empty rows (no type)

    // Client guardrails
    for (const b of banks) {
      if (
        (b.type === "Bank" || b.type === "BankAndUpi") &&
        (!b.bankName || !b.accountHolderName || !b.bankAccNum)
      ) {
        toast.error(
          "Please fill Bank Name, Account Holder, and Account Number for Bank types."
        );
        return;
      }
      if (b.type === "UPI" && !b.qrDetails) {
        toast.error("Please provide a UPI ID for UPI type.");
        return;
      }
    }

    // TAN: server expects tanNum (exactly 10 chars)
    const tanNum = String(form.tanNumber || "")
      .toUpperCase()
      .trim();
    if (tanNum.length !== 10) {
      toast.error("TAN must be exactly 10 characters (e.g., ABCDE1234F).");
      return;
    }

    // Build payload (avoid unused top-level bank fields)
    const payload = {
      code: form.code || form.customerAccountNo, // fall back to generated if code is empty
      name: form.name,
      businessType: form.businessType,
      address: form.address,
      contactNum: form.contactNum, // already +E164 from PhoneInput
      email: form.email,
      group: form.group,
      remarks: form.remarks,
      employeeName: form.employeeName,
      contactPersonName: form.contactPersonName,
      employeePhone: form.employeePhone,
      paymentTerms: form.paymentTerms,
      contactPersonPhone: form.contactPersonPhone, // +E164 from PhoneInput below
      employeeEmail: form.employeeEmail,
      creditLimit: Number(form.creditLimit || 0),
      currency: form.currency,
      panNum: String(form.panNum || "")
        .toUpperCase()
        .trim(),
      registrationNum: String(form.registrationNum || "")
        .toUpperCase()
        .trim(),
      tanNum,
      active: !!form.active,
      bankDetails: banks,
    };

    try {
      const { data } = await axios.post(apiBase, payload, {
        headers: { "Content-Type": "application/json" },
      });
      const newCustomer = data?.data;

      toast.success("Customer saved", {
        autoClose: 1200,
        onClose: () => handleCancel?.(),
      });

      setCustomers((prev) => [...prev, newCustomer]);
      onSaved?.(newCustomer);

      // Optionally bump the code for the next entry locally
      setForm((prev) => ({
        ...prev,
        customerAccountNo: nextCustomerCode([...customers, newCustomer]),
      }));
    } catch (err) {
      console.error("Error creating customer:", {
        status: err.response?.status,
        data: err.response?.data,
      });
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Couldn’t save customer";
      toast.error(msg, { autoClose: 2500 });
    }
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
    currency: "INR",
    panNum: "",
    registrationNum: "",
    active: true,
    // CHANGED: keep a starter row so Reset preserves the section structure
    bankDetails: [
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
    tanNumber: "",
  };

  const resetForm = (nextAccNo) =>
    setForm((prev) => ({
      ...initialForm,
      customerAccountNo: nextAccNo ?? generateAccountNo(customers),
      // keep globalPartyId if you want it preserved
      globalPartyId: prev.globalPartyId || "",
    }));

  const handleReset = () => {
    const newCustomerCode = generateAccountNo(customers);
    setForm({ ...initialForm, customerAccountNo: newCustomerCode });
  };

  /* ---------- Render ---------- */
  return (
    <div className="">
      <ToastContainer />
      {/* Header Buttons */}
      <div className="flex justify-between sticky top-0 z-20 bg-white border-b">
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
                value={form.customerAccountNo}
                readOnly
                placeholder="Auto-generated"
                className="mt-1 w-full p-2 border rounded bg-gray-100 cursor-not-allowed focus:ring-0"
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
                className="mt-1 w-full p-2 border rounded bg-gray-100 cursor-not-allowed focus:ring-0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Business Type
              </label>
              <select
                name="businessType"
                value={form.businessType ?? ""}
                onChange={handleChange}
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
              <PhoneInput
                country="in"
                value={form.contactNum?.replace(/^\+/, "") || ""} // show without "+" per lib
                onChange={(val, country) => {
                  const e164 = val ? `+${val}` : "";
                  setForm((prev) => ({
                    ...prev,
                    countryCode: country?.dialCode
                      ? `+${country.dialCode}`
                      : "",
                    contactNum: e164, // always store with "+"
                  }));
                }}
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
                Alternate Contact No
              </label>

              {/* Country selector on the left + full world list */}
              <PhoneInput
                country="in" // default India
                value={form.contactNum} // keep the "+91..." format here
                onChange={(val, country, e, formattedValue) => {
                  const dial = country?.dialCode ? `+${country.dialCode}` : "";
                  const e164 = val ? `+${val}` : "";
                  setForm((prev) => ({
                    ...prev,
                    countryCode: dial,
                    contactNum: e164, // always store with "+"
                  }));
                }}
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
                Alternate Email ID
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
                Billing Address
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
                Shipping Address
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
                className="mt-1 w-full p-2 border   rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-2 ml-1">
              <label className="text-blue-600 font-medium">Active</label>
              <input
                name="active"
                checked={!!form.active}
                onChange={handleChange}
                type="checkbox"
                className="w-4 h-4"
              />
            </div>
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
              <PhoneInput
                country="in"
                // CHANGED: keep storage as +E164, show without "+"
                value={form.contactPersonPhone?.replace(/^\+/, "") || ""}
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
                value={form.paymentTerms ?? ""}
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
              <label className="block text sm font-medium text-gray-600">
                Currency
              </label>
              <select
                name="currency"
                value={form.currency ?? ""}
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-700">Bank Details</h2>
            <button
              type="button"
              onClick={handleAddBank}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
            >
              + Add Bank
            </button>
          </div>

          {form.bankDetails.map((bank, index) => {
            // disable rules based on THIS bank row
            const disableBankFields =
              bank.bankType === "Cash" ||
              bank.bankType === "Barter" ||
              bank.bankType === "UPI" ||
              bank.bankType === "Crypto";

            const disableUpiField = bank.bankType === "Bank";

            return (
              <div
                key={index}
                className="relative grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6 border p-4 rounded-lg"
              >
                <button
                  type="button"
                  onClick={() => handleDeleteBank(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
                {/* Bank Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Bank Type
                  </label>
                  <select
                    value={bank.bankType}
                    onChange={(e) =>
                      handleBankChange(index, "bankType", e.target.value)
                    }
                    className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-black-200"
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

                {/* Bank Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Bank Name
                  </label>
                  <input
                    value={bank.bankName}
                    onChange={(e) =>
                      handleBankChange(index, "bankName", e.target.value)
                    }
                    placeholder="e.g. State Bank of India"
                    disabled={disableBankFields}
                    className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-black-200 ${
                      disableBankFields ? "cursor-not-allowed bg-gray-100" : ""
                    }`}
                  />
                </div>

                {/* Bank Account */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Bank Account
                  </label>
                  <input
                    value={bank.bankAccNum}
                    onChange={(e) =>
                      handleBankChange(index, "bankAccNum", e.target.value)
                    }
                    placeholder="e.g. 0123456789012345"
                    disabled={disableBankFields}
                    className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-black-200 ${
                      disableBankFields ? "cursor-not-allowed bg-gray-100" : ""
                    }`}
                  />
                </div>

                {/* Account Holder Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Account Holder Name
                  </label>
                  <input
                    value={bank.accountHolderName}
                    onChange={(e) =>
                      handleBankChange(
                        index,
                        "accountHolderName",
                        e.target.value
                      )
                    }
                    placeholder="e.g. ABC Company Pvt Ltd"
                    disabled={disableBankFields}
                    className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-black-200 ${
                      disableBankFields ? "cursor-not-allowed bg-gray-100" : ""
                    }`}
                  />
                </div>

                {/* IFSC */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    IFSC
                  </label>
                  <input
                    value={bank.ifsc}
                    onChange={(e) =>
                      handleBankChange(index, "ifsc", e.target.value)
                    }
                    placeholder="e.g. SBIN0001234"
                    disabled={disableBankFields}
                    className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-black-200 ${
                      disableBankFields ? "cursor-not-allowed bg-gray-100" : ""
                    }`}
                  />
                </div>

                {/* Swift */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Swift Code
                  </label>
                  <input
                    value={bank.swift}
                    onChange={(e) =>
                      handleBankChange(index, "swift", e.target.value)
                    }
                    placeholder="e.g. SBININBBXXX"
                    disabled={disableBankFields}
                    className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-black-200 ${
                      disableBankFields ? "cursor-not-allowed bg-gray-100" : ""
                    }`}
                  />
                </div>

                {/* UPI */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    UPI ID
                  </label>
                  <input
                    value={bank.qrDetails}
                    onChange={(e) =>
                      handleBankChange(index, "qrDetails", e.target.value)
                    }
                    placeholder="e.g. abc@hdfcbank"
                    disabled={disableBankFields || disableUpiField}
                    className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-black-200 ${
                      disableBankFields || disableUpiField
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
                onPaste={(e) => {
                  e.preventDefault();
                  const pasted = e.clipboardData
                    .getData("text")
                    .toUpperCase()
                    .trim();
                  setForm((prev) => ({ ...prev, panNum: pasted }));
                }}
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
                onPaste={(e) => {
                  e.preventDefault();
                  const pasted = e.clipboardData
                    .getData("text")
                    .toUpperCase()
                    .trim();
                  setForm((prev) => ({ ...prev, registrationNum: pasted }));
                }}
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
                onPaste={(e) => {
                  e.preventDefault();
                  const pasted = e.clipboardData
                    .getData("text")
                    .toUpperCase()
                    .trim();
                  setForm((prev) => ({ ...prev, tanNumber: pasted }));
                }}
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
