import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CalendarForm({ handleCancel, onSaved, apiRoot }) {
  /** ---------- API ROOTS (single source) ---------- */
  const API_ROOT = apiRoot || "https://fms-qkmw.onrender.com/fms/api/v0";

  // Try common variants automatically; we'll pick the first that succeeds.
  const apiCandidates = useMemo(
    () => [
      `${API_ROOT}/calendars`,
      `${API_ROOT}/Calendars`,
      `${API_ROOT}/calendar`,
      `${API_ROOT}/Calendar`,
      // keep your previous odd variant last:
      `${API_ROOT}/Calendares`,
    ],
    [API_ROOT]
  );

  const [apiBase, setApiBase] = useState(apiCandidates[0]);
  const uploadUrl = `${apiBase}/upload-logo`;

  /** ---------- Helpers ---------- */
  const generateCode = useCallback((list) => {
    // Expecting codes like Calendar_001, Calendar_002...
    const lastNum = list
      .map((t) => parseInt(String(t?.code || "").split("_")[1], 10))
      .filter((n) => !Number.isNaN(n))
      .reduce((m, n) => Math.max(m, n), 0);
    return `Calendar_${String(lastNum + 1).padStart(3, "0")}`;
  }, []);

  const monthOptions = useMemo(
    () => [
      { value: 1, label: "January" },
      { value: 2, label: "February" },
      { value: 3, label: "March" },
      { value: 4, label: "April" },
      { value: 5, label: "May" },
      { value: 6, label: "June" },
      { value: 7, label: "July" },
      { value: 8, label: "August" },
      { value: 9, label: "September" },
      { value: 10, label: "October" },
      { value: 11, label: "November" },
      { value: 12, label: "December" },
    ],
    []
  );

  const currencyOptions = useMemo(
    () => ["INR", "USD", "EUR", "GBP", "JPY", "AUD", "CAD"],
    []
  );

  /** ---------- State ---------- */
  const initialForm = {
    code: "",
    name: "",
    calendarFormat: "Gregorian", // Gregorian | Fiscal | Custom
    startMonth: 4, // default Apr-Mar fiscal year example
    endMonth: 3,
    startDay: 1,
    endDay: 31,
    region: "India",
    currency: "INR",
    active: true,
  };

  const [form, setForm] = useState(initialForm);
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  /** ---------- Discover working endpoint + load once ---------- */
  const fetchCalendars = useCallback(async () => {
    for (const candidate of apiCandidates) {
      try {
        const { data } = await axios.get(candidate);
        const list = data?.data || data || [];
        setApiBase(candidate);
        setCalendars(list);
        setForm((prev) => ({ ...prev, code: generateCode(list) }));
        return; // success
      } catch {
        // try next candidate
      }
    }
    toast.error("Couldn’t fetch Calendars (no working endpoint found).");
  }, [apiCandidates, generateCode]);

  useEffect(() => {
    fetchCalendars();
  }, [fetchCalendars]);

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
      await fetchCalendars();
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
  const isInt = (v) => Number.isInteger(Number(v));
  const between = (n, min, max) => n >= min && n <= max;

  const validateForm = () => {
    if (!form.name?.trim()) {
      toast.error("Calendar Name is required");
      return false;
    }
    // Month/day ranges
    if (!isInt(form.startMonth) || !between(Number(form.startMonth), 1, 12)) {
      toast.error("Start month must be 1–12");
      return false;
    }
    if (!isInt(form.endMonth) || !between(Number(form.endMonth), 1, 12)) {
      toast.error("End month must be 1–12");
      return false;
    }
    if (!isInt(form.startDay) || !between(Number(form.startDay), 1, 31)) {
      toast.error("Start day must be 1–31");
      return false;
    }
    if (!isInt(form.endDay) || !between(Number(form.endDay), 1, 31)) {
      toast.error("End day must be 1–31");
      return false;
    }
    if (!form.region?.trim()) {
      toast.error("Region is required");
      return false;
    }
    if (!form.currency?.trim()) {
      toast.error("Currency is required");
      return false;
    }
    return true;
  };

  /** ---------- Change handlers ---------- */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    // Coerce numeric fields
    if (["startMonth", "endMonth", "startDay", "endDay"].includes(name)) {
      setForm((prev) => ({
        ...prev,
        [name]: value === "" ? "" : Number(value),
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /** ---------- Submit ---------- */
  const createCalendar = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Prepare payload; rename keys if your backend expects snake_case
    const payload = {
      code: form.code,
      name: form.name,
      calendarFormat: form.calendarFormat,
      startMonth: Number(form.startMonth),
      endMonth: Number(form.endMonth),
      startDay: Number(form.startDay),
      endDay: Number(form.endDay),
      region: form.region,
      currency: form.currency,
      active: !!form.active,
    };

    try {
      setLoading(true);
      const { data } = await axios.post(apiBase, payload, {
        headers: { "Content-Type": "application/json" },
      });
      const created = data?.data ?? data;

      toast.success("Calendar saved", {
        autoClose: 1000,
        onClose: () => handleCancel?.(),
      });

      setCalendars((prev) => [...prev, created]);
      onSaved?.(created);

      // prepare for next entry
      setForm({ ...initialForm, code: generateCode([...calendars, created]) });
    } catch (err) {
      console.error("Error creating Calendar:", err?.response || err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Couldn’t save Calendar. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /** ---------- Reset ---------- */
  const handleReset = () => {
    const code = generateCode(calendars);
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
          <h3 className="text-xl font-semibold">Calendar Configuration</h3>
        </div>
      </div>

      <form
        onSubmit={createCalendar}
        className="bg-white shadow-none rounded-lg divide-y divide-gray-200"
      >
        {/* Details */}
        <section className="p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Calendar Code (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Calendar Code
              </label>
              <input
                name="code"
                value={form.code}
                readOnly
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Calendar Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Calendar Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g., FY 2025-26"
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Calendar Format */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Calendar Format
              </label>
              <select
                name="calendarFormat"
                value={form.calendarFormat}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 bg-white"
              >
                <option value="Gregorian">Gregorian</option>
                <option value="Fiscal">Fiscal</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Region
              </label>
              <input
                name="region"
                value={form.region}
                onChange={handleChange}
                placeholder="e.g., India"
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Start Month */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Start Month
              </label>
              <select
                name="startMonth"
                value={form.startMonth}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 bg-white"
              >
                {monthOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* End Month */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                End Month
              </label>
              <select
                name="endMonth"
                value={form.endMonth}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 bg-white"
              >
                {monthOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Day */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Start Day
              </label>
              <input
                type="number"
                min={1}
                max={31}
                name="startDay"
                value={form.startDay}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* End Day */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                End Day
              </label>
              <input
                type="number"
                min={1}
                max={31}
                name="endDay"
                value={form.endDay}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Currency
              </label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 bg-white"
              >
                {currencyOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
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
