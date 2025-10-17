import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AccountTypes = ["Saving", "Current", "Corporate"];
const PaymentTypes = ["Bank", "UPI", "Cash", "Barter", "Crypto", "QR"];

export default function BankForm({ handleCancel, onSaved }) {
  // === API base (use capital B to match your upload route) ===
  const apiBase = "https://fms-qkmw.onrender.com/fms/api/v0/Banks";

  // === Local state ===
  const [banks, setBanks] = useState([]);
  const [logoUploading, setLogoUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const initialForm = {
    bankId: "", // UI-only ID (auto-generated)
    bankName: "",
    paymentType: "Bank", // Bank | UPI | Cash | Barter | Crypto | QR
    accountType: "", // Saving | Current | Corporate (only for Bank)
    bankAccNum: "",
    accountHolderName: "",
    ifsc: "",
    swift: "",
    qrDetails: "",
    active: true,
  };

  const [form, setForm] = useState(initialForm);

  const disableBankFields =
    form.paymentType === "Cash" ||
    form.paymentType === "Barter" ||
    form.paymentType === "Crypto" ||
    form.paymentType === "QR" ||
    form.paymentType === "UPI"; // IFSC/SWIFT/Account No not needed for UPI/QR

  // === Helpers ===
  const generateAccountNo = useCallback((list) => {
    const last = list
      .map((c) => {
        const raw = c?.bankId || c?.BankAccountNo || "";
        const n = parseInt(String(raw).split("_")[1], 10);
        return Number.isNaN(n) ? 0 : n;
      })
      .reduce((m, n) => Math.max(m, n), 0);
    return `BANK_${String(last + 1).padStart(3, "0")}`;
  }, []);

  const fetchBanks = useCallback(async () => {
    try {
      const { data } = await axios.get(apiBase);
      const rows = data?.data || [];
      setBanks(rows);
      setForm((prev) => ({ ...prev, bankId: generateAccountNo(rows) }));
    } catch (e) {
      toast.error("Couldn’t fetch banks");
    }
  }, [apiBase, generateAccountNo]);

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  const validators = {
    bankAccNum: /^[0-9]{0,18}$/, // allow up to 18 digits
    bankName: /^.{0,100}$/, // allow spaces and long names
    ifsc: /^[A-Z0-9]{0,12}$/,
    swift: /^[A-Z0-9]{0,16}$/,
    qrDetails: /^[A-Za-z0-9.@]{0,50}$/,
    accountHolderName: /^[A-Za-z\s.]{0,100}$/,
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    let val = value;

    // special routing when paymentType changes
    if (name === "paymentType") {
      const next = val;
      if (["Cash", "Barter", "Crypto", "QR", "UPI"].includes(next)) {
        setForm((prev) => ({
          ...prev,
          paymentType: next,
          accountType: "",
          bankAccNum: "",
          ifsc: "",
          swift: "",
        }));
        return;
      }
      setForm((prev) => ({ ...prev, paymentType: next }));
      return;
    }

    // Uppercase fields that should be uppercase
    if (["ifsc", "swift"].includes(name)) {
      val = val.toUpperCase();
    }

    // Capitalize first letter for account holder name
    if (name === "accountHolderName" && val) {
      val = val.charAt(0).toUpperCase() + val.slice(1);
    }

    // Validate if validator exists
    if (validators[name] && !validators[name].test(val)) return;

    setForm((prev) => ({ ...prev, [name]: val }));
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
        onUploadProgress: (evt) => {
          const pct = Math.round((evt.loaded * 100) / (evt.total || 1));
          setUploadProgress({ [file.name]: pct });
        },
      });

      toast.success("File uploaded successfully! ✅");
      await fetchBanks();
    } catch (error) {
      console.error(error);
      toast.error("Error uploading logo!");
    } finally {
      setTimeout(() => {
        setLogoUploading(false);
        setUploadProgress({});
      }, 500);
    }
  };

  const createBank = async (e) => {
    e.preventDefault();

    // build bankDetails object depending on paymentType
    const bankDetails = {
      type: form.paymentType, // "Bank", "UPI", etc.
      bankAccNum: form.bankAccNum || "",
      bankName: form.bankName || "",
      accountHolderName: form.accountHolderName || "",
      ifsc: form.ifsc || "",
      swift: form.swift || "",
      qrDetails: form.qrDetails || "",
      accountType: form.accountType || "",
      active: !!form.active,
    };

    const payload = {
      bankId: form.bankId, // optional backend can ignore or store
      bankName: form.bankName,
      active: !!form.active,
      paymentType: form.paymentType,
      accountType: form.accountType,
      bankDetails: [bankDetails],
    };

    try {
      const { data } = await axios.post(apiBase, payload, {
        headers: { "Content-Type": "application/json" },
      });
      const newBank = data?.data || payload;

      toast.success("Bank saved", {
        autoClose: 1200,
      });

      setBanks((prev) => [...prev, newBank]);
      onSaved && onSaved(newBank);

      // reset with new generated id
      const nextId = generateAccountNo([...banks, newBank]);
      setForm({ ...initialForm, bankId: nextId });
    } catch (err) {
      console.error("Error creating bank:", err?.response || err);
      const msg =
        err?.response?.data?.message ||
        "Couldn’t save bank. Please check the inputs.";
      toast.error(msg, { autoClose: 2000 });
    }
  };

  const handleReset = () => {
    const newBankCode = generateAccountNo(banks);
    setForm({ ...initialForm, bankId: newBankCode });
  };

  return (
    <div>
      <ToastContainer />
      <div className="flex justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <label className="text-blue-600 text-sm cursor-pointer">
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files?.[0])}
                accept="image/*"
              />
              {logoUploading
                ? `Uploading… ${Object.values(uploadProgress)[0] ?? 0}%`
                : "Upload Logo"}
            </label>
          </div>
          <h3 className="text-xl font-semibold">Bank Form</h3>
        </div>
      </div>

      <form
        onSubmit={createBank}
        className="bg-white shadow-none rounded-lg divide-y divide-gray-200"
      >
        <section className="p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Bank Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Bank ID */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Bank ID
              </label>
              <input
                name="bankId"
                value={form.bankId}
                readOnly
                placeholder="Auto-generated"
                className="mt-1 w-full cursor-not-allowed p-2 border rounded focus:ring-2 focus:ring-blue-200 bg-gray-100"
              />
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Bank Name
              </label>
              <input
                name="bankName"
                value={form.bankName}
                onChange={handleChange}
                placeholder="e.g. HDFC Bank"
                required={form.paymentType === "Bank"}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

        

            {/* Account Type (only for Bank) */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Account Type
              </label>
              <select
                name="accountType"
                value={form.accountType}
                onChange={handleChange}
                disabled={form.paymentType !== "Bank"}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
              >
                <option value="">Select type</option>
                {AccountTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Account No */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Account No
              </label>
              <input
                name="bankAccNum"
                value={form.bankAccNum}
                onChange={handleChange}
                placeholder="e.g. 1234567890"
                required={form.paymentType === "Bank"}
                disabled={disableBankFields}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
              />
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Account Holder Name
              </label>
              <input
                name="accountHolderName"
                value={form.accountHolderName}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                required={form.paymentType === "Bank"}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* IFSC */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                IFSC Code
              </label>
              <input
                name="ifsc"
                value={form.ifsc}
                onChange={handleChange}
                placeholder="e.g. HDFC0001234"
                required={form.paymentType === "Bank"}
                disabled={disableBankFields}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
              />
            </div>

            {/* SWIFT */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                SWIFT Code
              </label>
              <input
                name="swift"
                value={form.swift}
                onChange={handleChange}
                placeholder="e.g. HDFCINBBXXX"
                disabled={disableBankFields}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
              />
            </div>

            {/* Active */}
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

        <div className="py-6 px-6 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Reset
          </button>

          <div className="flex gap-3">
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
