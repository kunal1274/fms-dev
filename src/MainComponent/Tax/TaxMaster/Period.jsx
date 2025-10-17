import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * PeriodForm
 * Props:
 *  - handleCancel: () => void
 *  - onSaved?: (createdPeriod) => void
 *  - apiRoot?: string   // optional override of API root
 */
export default function PeriodForm({ handleCancel, onSaved, apiRoot }) {
  /** ---------- API ROOTS (single source) ---------- */
  const API_ROOT = apiRoot || "https://fms-qkmw.onrender.com/fms/api/v0";
  // Try common variants automatically; we'll pick the first that succeeds.
  const apiCandidates = useMemo(
    () => [
      `${API_ROOT}/periods`,
      `${API_ROOT}/Periodes`,
      `${API_ROOT}/Periods`,
    ],
    [API_ROOT]
  );

  const [apiBase, setApiBase] = useState(apiCandidates[0]);
  const uploadUrl = `${apiBase}/upload-logo`;

  /** ---------- Helpers ---------- */
  const generateCode = useCallback((list) => {
    // Expecting codes like Period_001, Period_002...
    const lastNum = list
      .map((t) => parseInt(String(t?.code || "").split("_")[1], 10))
      .filter((n) => !Number.isNaN(n))
      .reduce((m, n) => Math.max(m, n), 0);
    return `Period_${String(lastNum + 1).padStart(3, "0")}`;
  }, []);

  /** ---------- State ---------- */
  const initialForm = {
    code: "",
    name: "",
    fiscal_year_id: "",
    start_date: "", // YYYY-MM-DD
    end_date: "", // YYYY-MM-DD
    period_number: "", // number as string for input control
    is_open: true,
    is_adjustment_period: false,
    active: true,
  };

  const [form, setForm] = useState(initialForm);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  /** ---------- Discover working endpoint + load once ---------- */
  const fetchPeriods = useCallback(async () => {
    for (const candidate of apiCandidates) {
      try {
        const { data } = await axios.get(candidate);
        const list = data?.data || data || [];
        setApiBase(candidate);
        setPeriods(list);
        setForm((prev) => ({ ...prev, code: generateCode(list) }));
        return; // success
      } catch (e) {
        // try next candidate
      }
    }
    toast.error("Couldn’t fetch periods (no working endpoint found).");
  }, [apiCandidates, generateCode]);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

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

      await axios.post(`${apiBase}/upload-logo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const percent = Math.round((evt.loaded * 100) / evt.total);
          setUploadProgress({ [file.name]: percent });
        },
      });

      toast.success("File uploaded successfully! ✅");
      await fetchPeriods();
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

  /** ---------- Validators ---------- */
  const validators = {
    name: /^.{0,100}$/,
    fiscal_year_id: /^.{0,50}$/,
    period_number: /^(?:\d{1,2}|[12]\d{2})?$/, // simple: up to 3 digits
    // start_date & end_date validated by Date check on submit
  };

  /** ---------- Change handlers ---------- */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    if (validators[name] && !validators[name].test(value)) return;

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /** ---------- Submit ---------- */
  const createPeriod = async (e) => {
    e.preventDefault();

    // required fields
    if (!form.name?.trim()) {
      toast.error("Period Name is required");
      return;
    }
    if (!form.fiscal_year_id?.trim()) {
      toast.error("Fiscal Year ID is required");
      return;
    }
    if (!form.start_date) {
      toast.error("Start date is required");
      return;
    }
    if (!form.end_date) {
      toast.error("End date is required");
      return;
    }

    // date checks
    const from = new Date(form.start_date);
    const to = new Date(form.end_date);
    if (to < from) {
      toast.error("End date cannot be earlier than start date");
      return;
    }

    // number checks
    if (form.period_number && Number.isNaN(Number(form.period_number))) {
      toast.error("Period number must be numeric");
      return;
    }

    // prepare payload (cast period_number)
    const payload = {
      ...form,
      period_number:
        form.period_number === "" ? null : Number(form.period_number),
    };

    try {
      setLoading(true);
      const { data } = await axios.post(apiBase, payload, {
        headers: { "Content-Type": "application/json" },
      });
      const created = data?.data ?? data;

      toast.success("Period saved", {
        autoClose: 1000,
        onClose: () => handleCancel?.(),
      });

      setPeriods((prev) => [...prev, created]);
      onSaved?.(created);

      // prepare for next entry
      setForm({ ...initialForm, code: generateCode([...periods, created]) });
    } catch (err) {
      console.error("Error creating Period:", err?.response || err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Couldn’t save Period. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /** ---------- Reset ---------- */
  const handleReset = () => {
    const code = generateCode(periods);
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
          <h3 className="text-xl font-semibold">Period Configuration</h3>
        </div>
      </div>

      <form
        onSubmit={createPeriod}
        className="bg-white shadow-none rounded-lg divide-y divide-gray-200"
      >
        {/* Details */}
        <section className="p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Period Code (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Period Code
              </label>
              <input
                name="code"
                value={form.code}
                readOnly
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Period Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Period Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Fiscal Year ID */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Fiscal_year_id
              </label>
              <input
                name="fiscal_year_id"
                value={form.fiscal_year_id}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Start_date
              </label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                End_date
              </label>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Period Number */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Period_number
              </label>
              <input
                type="number"
                name="period_number"
                value={form.period_number}
                onChange={handleChange}
                min="1"
                step="1"
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Is Open */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Is_open
              </label>
              <input
                type="checkbox"
                name="is_open"
                checked={form.is_open}
                onChange={handleChange}
                className="mt-2 w-4 h-4"
              />
            </div>

            {/* Is Adjustment Period */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Is_adjustment_period
              </label>
              <input
                type="checkbox"
                name="is_adjustment_period"
                checked={form.is_adjustment_period}
                onChange={handleChange}
                className="mt-2 w-4 h-4"
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
