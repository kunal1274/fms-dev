import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * TaxForm
 * Props:
 *  - handleCancel: () => void
 *  - onSaved?: (createdTax) => void
 *  - apiRoot?: string   // optional override of API root
 */
export default function TaxForm({ handleCancel, onSaved, apiRoot }) {
  /** ---------- API ROOTS (single source) ---------- */
  const API_ROOT = apiRoot || "https://fms-qkmw.onrender.com/fms/api/v0";
  const apiBase = `${API_ROOT}/taxes`; // adjust to /taxs if your backend uses that path
  const uploadUrl = `${apiBase}/upload-logo`;

  /** ---------- Helpers ---------- */
  const generateCode = useCallback((list) => {
    // Expecting codes like TAX_001, TAX_002...
    const lastNum = list
      .map((t) => parseInt(String(t?.code || "").split("_")[1], 10))
      .filter((n) => !Number.isNaN(n))
      .reduce((m, n) => Math.max(m, n), 0);
    return `TAX_${String(lastNum + 1).padStart(3, "0")}`;
  }, []);

  /** ---------- State ---------- */
  const initialForm = {
    code: "",
    name: "",
    taxType: "GST", // GST | TDS | TCS | CESS | VAT | Custom
    taxCategory: "Output", // Input | Output | RCM | Exempt | Nil Rated | Non-GST | Other
    applicableModule: "Both", // Sales | Purchase | Both
    effectiveFromDate: "",
    effectiveToDate: "",
    remarks: "",
    gstRate: "",
    hsnSac: "",
    gstApplicability: "Both", // Goods | Services | Both | NA
    gstType: "IGST", // IGST | CGST+SGST | UGST | NA
    sectionCode: "", // e.g., 194C, 194H...
    tdsTcsRate: "",
    frequencyOfDeduction: "Per Invoice", // Per Invoice | On Payment | Monthly | Quarterly | Yearly
    deductorType: "Company", // Individual | Company | Firm | LLP | Others
    active: true,
  };

  const [form, setForm] = useState(initialForm);
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  /** ---------- Load existing taxes once ---------- */
  const fetchTaxes = useCallback(async () => {
    try {
      const { data } = await axios.get(apiBase);
      const list = data?.data || [];
      setTaxes(list);
      setForm((prev) => ({ ...prev, code: generateCode(list) }));
    } catch (e) {
      console.error(e);
      toast.error("Couldn’t fetch taxes");
    }
  }, [apiBase, generateCode]);

  useEffect(() => {
    fetchTaxes();
  }, [fetchTaxes]);

  /** ---------- File Upload ---------- */
  const handleFileUpload = async (file) => {
    if (!file) {
      toast.error("No file selected!");
      return;
    }
    try {
      setLogoUploading(true);
      const formData = new FormData();
      formData.append("logoImage", file);

      await axios.post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const percent = Math.round((evt.loaded * 100) / evt.total);
          setUploadProgress({ [file.name]: percent });
        },
      });

      toast.success("File uploaded successfully! ✅");
      await fetchTaxes();
    } catch (error) {
      console.error(error);
      toast.error("Error uploading file");
    } finally {
      setTimeout(() => {
        setLogoUploading(false);
        setUploadProgress({});
      }, 500);
    }
  };

  /** ---------- Change handlers & validators ---------- */
  const validators = {
    name: /^[A-Za-z0-9\s().\-_/]{0,100}$/,
    gstRate: /^(?:100(?:\.0{1,2})?|[0-9]?\d(?:\.\d{1,2})?)?$/, // 0..100 with up to 2 decimals
    tdsTcsRate: /^(?:100(?:\.0{1,2})?|[0-9]?\d(?:\.\d{1,2})?)?$/,
    hsnSac: /^[A-Za-z0-9]{0,10}$/,
    sectionCode: /^[A-Za-z0-9]{0,10}$/,
    remarks: /^.{0,500}$/,
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    // Uppercase for some fields
    let val = value;
    if (["hsnSac", "sectionCode"].includes(name)) {
      val = val.toUpperCase();
    }

    if (validators[name] && !validators[name].test(val)) return;

    setForm((prev) => ({ ...prev, [name]: val }));
  };

  /** ---------- Submit ---------- */
  const createTax = async (e) => {
    e.preventDefault();

    // simple guards
    if (!form.name?.trim()) {
      toast.error("Tax Name is required");
      return;
    }
    if (form.effectiveFromDate && form.effectiveToDate) {
      const from = new Date(form.effectiveFromDate);
      const to = new Date(form.effectiveToDate);
      if (to < from) {
        toast.error("Effective To Date cannot be earlier than From Date");
        return;
      }
    }
    if (form.gstRate && Number(form.gstRate) > 100) {
      toast.error("GST Rate cannot exceed 100%");
      return;
    }
    if (form.tdsTcsRate && Number(form.tdsTcsRate) > 100) {
      toast.error("TDS/TCS Rate cannot exceed 100%");
      return;
    }

    const payload = { ...form };

    try {
      setLoading(true);
      const { data } = await axios.post(apiBase, payload, {
        headers: { "Content-Type": "application/json" },
      });
      const created = data?.data ?? data;

      toast.success("Tax saved", {
        autoClose: 1000,
        onClose: () => handleCancel?.(),
      });

      setTaxes((prev) => [...prev, created]);
      onSaved?.(created);

      // prepare for next entry
      setForm({ ...initialForm, code: generateCode([...taxes, created]) });
    } catch (err) {
      console.error("Error creating tax:", err?.response || err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Couldn’t save Tax. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /** ---------- Reset ---------- */
  const handleReset = () => {
    const code = generateCode(taxes);
    setForm({ ...initialForm, code });
  };

  /** ---------- UI ---------- */
  return (
    <div className="">
      <ToastContainer />
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center relative overflow-hidden">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => handleFileUpload(e.target.files?.[0])}
              disabled={logoUploading}
            />
            <span className="text-xs text-gray-600 text-center px-2">
              {logoUploading
                ? `${Object.values(uploadProgress)[0] ?? 0}%`
                : "Upload\nLogo"}
            </span>
          </div>
          <h3 className="text-xl font-semibold">Tax Configuration</h3>
        </div>
      </div>

      <form
        onSubmit={createTax}
        className="bg-white shadow-none rounded-lg divide-y divide-gray-200"
      >
        {/* Details */}
        <section className="p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Tax Code (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Tax Code
              </label>
              <input
                name="code"
                value={form.code}
                readOnly
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Tax Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Tax Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Tax Type */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Tax Type
              </label>
              <select
                name="taxType"
                value={form.taxType}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option>GST</option>
                <option>TDS</option>
                <option>TCS</option>
                <option>CESS</option>
                <option>VAT</option>
                <option>Custom</option>
              </select>
            </div>

            {/* Tax Category */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Tax Category
              </label>
              <select
                name="taxCategory"
                value={form.taxCategory}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option>Input</option>
                <option>Output</option>
                <option>RCM</option>
                <option>Exempt</option>
                <option>Nil Rated</option>
                <option>Non-GST</option>
                <option>Other</option>
              </select>
            </div>

            {/* Applicable Module */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Applicable Module
              </label>
              <select
                name="applicableModule"
                value={form.applicableModule}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option>Sales</option>
                <option>Purchase</option>
                <option>Both</option>
              </select>
            </div>

            {/* Effective From */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Effective From Date
              </label>
              <input
                type="date"
                name="effectiveFromDate"
                value={form.effectiveFromDate}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Effective To */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Effective To Date
              </label>
              <input
                type="date"
                name="effectiveToDate"
                value={form.effectiveToDate}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Remarks */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                rows={3}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* GST Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                GST Rate (%)
              </label>
              <input
                name="gstRate"
                value={form.gstRate}
                onChange={handleChange}
                placeholder="e.g. 18"
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* HSN/SAC */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                HSN/SAC Code
              </label>
              <input
                name="hsnSac"
                value={form.hsnSac}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* GST Applicability */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                GST Applicability
              </label>
              <select
                name="gstApplicability"
                value={form.gstApplicability}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option>Goods</option>
                <option>Services</option>
                <option>Both</option>
                <option>NA</option>
              </select>
            </div>

            {/* GST Type */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                GST Type
              </label>
              <select
                name="gstType"
                value={form.gstType}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option>IGST</option>
                <option>CGST+SGST</option>
                <option>UGST</option>
                <option>NA</option>
              </select>
            </div>

            {/* Section Code */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Section Code
              </label>
              <input
                name="sectionCode"
                value={form.sectionCode}
                onChange={handleChange}
                placeholder="e.g. 194C"
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* TDS/TCS Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                TDS/TCS Rate (%)
              </label>
              <input
                name="tdsTcsRate"
                value={form.tdsTcsRate}
                onChange={handleChange}
                placeholder="e.g. 1"
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Frequency of Deduction */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Frequency of Deduction
              </label>
              <select
                name="frequencyOfDeduction"
                value={form.frequencyOfDeduction}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option>Per Invoice</option>
                <option>On Payment</option>
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Yearly</option>
              </select>
            </div>

            {/* Deductor Type */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Deductor Type
              </label>
              <select
                name="deductorType"
                value={form.deductorType}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option>Individual</option>
                <option>Company</option>
                <option>Firm</option>
                <option>LLP</option>
                <option>Others</option>
              </select>
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

        {/* Footer Actions */}
        <div className="py-6 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Reset
          </button>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
              disabled={loading}
            >
              Go Back
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Saving..." : "Create"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
