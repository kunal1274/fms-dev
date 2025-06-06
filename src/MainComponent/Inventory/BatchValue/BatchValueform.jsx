import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  FaFilter,
  FaSearch,
  FaSortAmountDown,
  FaPlusCircle,
  FaTrashAlt,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";

export default function BatchForm({ handleCancel }) {
  const apiBase = "https://fms-qkmw.onrender.com/fms/api/v0/batches";
  // (Adjust endpoint if your backend route is different)

  // ─── Form state ─────────────────────────────────────────────────
  // Top‐level batch fields (code will be generated server‐side)
  const [form, setForm] = useState({
    code: "", // leave blank—server will generate
    name: "",
    description: "",
    type: "Physical", // "Physical" or "Virtual"
    active: false,
    archived: false,
    // groups, company, files, extras omitted for simplicity.
    // Add them here if you need to associate batch->group or batch->company, etc.
  });

  // Each "value" is one sub‐batch entry
  const emptyValue = {
    num: "",
    name: "",
    mfgDate: "",
    expDate: "",
    status: "Ready", // one of ["Created","Ready","Closed","Obsolete"]
    serialTracking: false,
    serialNumbers: [""], // array of strings
    attributes: "", // we'll collect as a JSON‐string (Map<string,mixed> on server)
    archived: false,
  };

  const [values, setValues] = useState([{ ...emptyValue }]);

  // ─── Handlers ────────────────────────────────────────────────────
  const handleTopLevelChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleValueChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => {
      const copy = [...prev];
      if (name === "serialTracking") {
        copy[index].serialTracking = checked;
        // if disabling serialTracking, clear serialNumbers
        if (!checked) copy[index].serialNumbers = [""];
      } else {
        copy[index][name] = type === "checkbox" ? checked : value;
      }
      return copy;
    });
  };

  const handleSerialNumberChange = (vIndex, idx, e) => {
    const { value } = e.target;
    setValues((prev) => {
      const copy = [...prev];
      copy[vIndex].serialNumbers[idx] = value;
      return copy;
    });
  };

  const addSerialNumberField = (vIndex) => {
    setValues((prev) => {
      const copy = [...prev];
      copy[vIndex].serialNumbers.push("");
      return copy;
    });
  };

  const removeSerialNumberField = (vIndex, idx) => {
    setValues((prev) => {
      const copy = [...prev];
      if (copy[vIndex].serialNumbers.length > 1) {
        copy[vIndex].serialNumbers.splice(idx, 1);
      }
      return copy;
    });
  };

  const addValue = () => {
    setValues((prev) => [...prev, { ...emptyValue }]);
  };

  const removeValue = (idx) => {
    setValues((prev) => {
      const copy = [...prev];
      copy.splice(idx, 1);
      return copy.length ? copy : [{ ...emptyValue }];
    });
  };

  // ─── On submit, assemble payload exactly matching batch.model.js ───
  const createBatch = async (e) => {
    e.preventDefault();

    // 1) Validate expDate > mfgDate for each value
    for (let v of values) {
      if (!v.mfgDate || !v.expDate) {
        toast.error(
          "All batch entries must have manufacturing and expiration dates."
        );
        return;
      }
      if (new Date(v.expDate) <= new Date(v.mfgDate)) {
        toast.error(
          `Expiry date must be after manufacturing date for batch number "${v.num}".`
        );
        return;
      }
      if (!v.num.trim()) {
        toast.error("Each batch entry must have a non-empty 'num'.");
        return;
      }
      // If serialTracking is true, ensure at least one non-empty serialNumber
      if (v.serialTracking) {
        const nonEmpty = v.serialNumbers.filter((s) => s.trim() !== "");
        if (nonEmpty.length === 0) {
          toast.error(
            `Enable serialTracking to supply at least one serial number for batch "${v.num}".`
          );
          return;
        }
      }
    }

    // 2) Check for duplicate 'num' (case‐insensitive)
    const allNums = values.map((v) => v.num.toLowerCase().trim());
    const dup = allNums.find((n, i) => allNums.indexOf(n) !== i);
    if (dup) {
      toast.error(`Duplicate batch number in values: "${dup}".`);
      return;
    }

    // 3) Build "values" array exactly as schema expects:
    // For each v, convert attributes (JSON‐string) → object
    const payloadValues = values.map((v) => {
      let attrObj = {};
      if (v.attributes.trim()) {
        try {
          attrObj = JSON.parse(v.attributes);
        } catch (err) {
          toast.error(`Invalid JSON in attributes for batch "${v.num}".`);
          throw new Error("Invalid attributes JSON");
        }
      }
      return {
        num: v.num,
        name: v.name || undefined,
        mfgDate: v.mfgDate,
        expDate: v.expDate,
        status: v.status,
        serialTracking: v.serialTracking,
        serialNumbers: v.serialTracking
          ? v.serialNumbers.filter((s) => s.trim() !== "")
          : [],
        attributes: attrObj,
        archived: v.archived,
      };
    });

    const payload = {
      // do not send code—backend auto‐generates if missing
      name: form.name,
      description: form.description,
      type: form.type,
      active: form.active,
      archived: form.archived,
      values: payloadValues,
      // groups, company, files, extras omitted.
    };

    try {
      await axios.post(apiBase, payload);
      toast.success("Batch created successfully!", {
        autoClose: 1000,
        onClose: handleCancel,
      });
    } catch (err) {
      console.error("Create error:", err.response || err);
      toast.error(err.response?.data?.message || "Couldn't create batch");
    }
  };

  const apiAislesBase = "https://fms-qkmw.onrender.com/fms/api/v0/aisles";
  const [aisles, setAisles] = useState([]);
  // ─── Data ────────────────────────────────────────────────
  const [Batchs, setBatchs] = useState([]);
  useEffect(() => {
    const fetchapiAislesBase = async () => {
      try {
        const response = await axios.get(apiAislesBase);
        setAisles(response.data.data || []);
      } catch (error) {
        console.error("Error fetching Aisles19:", error);
      }
    };

    fetchapiAislesBase();
  }, []);
  // ─── Helpers ─────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name.trim()]: type === "checkbox" ? checked : value,
    }));
  };
  const createBatchs = async (e) => {
    e.preventDefault();
    const payload = {
      AccountNo: form.AccountNo,
      name: form.name,
      type: form.type,
      Id: form.Id, // Assuming this is what you meant
      description: form.description,
    };

    try {
      await axios.post(apiBase, payload);

      toast.success("Batchs created successfully", {
        autoClose: 1000, // dismiss after 1 second
        onClose: handleCancel, // then run handleCancel()
      });
    } catch (err) {
      console.error("Create error Batchs :", err.response || err);
      toast.error(err.response?.data?.message || "Couldn’t create warehouse");
    }
  };
  // ─── Load existing Batchs once ────────────────────────

  // ─── Reset / Cancel ──────────────────────────────────────

  const handleReset = () => {
    const newBatchCode = generateAccountNo(Batchs);
    setForm({ ...initialForm, BatchAccountNo: newBatchCode });
  };
  const handleEdit = () => {
    navigate("/Batchview", { state: { Batch: formData } });
  };

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
          <h3 className="text-xl font-semibold">Batch Value Form</h3>
        </div>
      </div>

      <form
        onSubmit={createBatchs}
        className="bg-white shadow-none rounded-lg divide-y divide-gray-200"
      >
        {/* Business Details */}
        <section className="p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Batch Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Batch Code
              </label>
              <input
                name="Batchcode"
                value={form.code}
                readOnly
                placeholder="Auto-generated"
                className="mt-1 w-full cursor-not-allowed  p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Batch Name
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
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter a brief description..."
                rows={4}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                placeholder="Enter any notes or additional information..."
                rows={4}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Attributes
              </label>
              <input
                name="attributes"
                value={form.attributes}
                onChange={handleChange}
                placeholder="e.g. Color: Red, Size: Large"
                disabled
                className="mt-1 w-full p-2 border cursor-not-allowed rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Status
              </label>
              <input
                name="Status"
                value={form.Status}
                onChange={handleChange}
                placeholder="e.g. Active, Inactive"
                disabled
                className="mt-1 w-full p-2 border cursor-not-allowed rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Serial Number
              </label>
              <input
                name="serialNumber"
                value={form.serialNumber}
                onChange={handleChange}
                placeholder="Enter serial number"
                disabled
                className="mt-1 w-full p-2 border cursor-not-allowed rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Manufacturing Date
              </label>
              <input
                type="date" // Optional: use "date" type if appropriate
                name="mfgDate"
                value={form.mfgDate}
                onChange={handleChange}
                placeholder="MM/DD/YYYY"
                disabled
                className="mt-1 w-full p-2 border cursor-not-allowed rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Expiration Date
              </label>
              <input
                name="expDate"
                value={form.expDate}
                onChange={handleChange}
                placeholder="MM/DD/YYYY"
                disabled
                className="mt-1 w-full p-2 border cursor-not-allowed rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-2 ml-1">
              <label className="text-blue-600 font-medium">Active</label>
              <input
                name="active"
                checked={form.active}
                onChange={handleChange}
                type="checkbox"
                className="w-4 h-4"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Aisles
              </label>
              <select
                name=" aisles"
                value={form.aisles}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select aisles</option>
                {aisles.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
        <section className="p-6">
          <h3 className="text-xl font-medium text-gray-700 mb-4">
            Batch Group Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Batch Code (read-only; generated server-side) */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Batch Code
              </label>
              <input
                name="code"
                value={form.code}
                readOnly
                placeholder="Auto-generated by server"
                className="mt-1 w-full bg-gray-100 cursor-not-allowed p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Batch Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleTopLevelChange}
                placeholder="e.g. Finished Goods Lot A"
                required
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleTopLevelChange}
                placeholder="Enter batch group description..."
                rows={3}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleTopLevelChange}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="Physical">Physical</option>
                <option value="Virtual">Virtual</option>
              </select>
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-4">
              Batch Values
            </h3>
            {values.map((v, vIndex) => (
              <div
                key={vIndex}
                className="mb-8 border border-gray-200 rounded-lg p-4 relative"
              >
                {/* Remove this value */}
                <button
                  type="button"
                  onClick={() => removeValue(vIndex)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <FaTrashAlt />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Batch # (num)
                    </label>
                    <input
                      name="num"
                      value={v.num}
                      onChange={(e) => handleValueChange(vIndex, e)}
                      placeholder="e.g. BN-0001"
                      required
                      className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Name (optional)
                    </label>
                    <input
                      name="name"
                      value={v.name}
                      onChange={(e) => handleValueChange(vIndex, e)}
                      placeholder="Optional batch label"
                      className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Manufacturing Date
                    </label>
                    <input
                      type="date"
                      name="mfgDate"
                      value={v.mfgDate}
                      onChange={(e) => handleValueChange(vIndex, e)}
                      required
                      className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Expiration Date
                    </label>
                    <input
                      type="date"
                      name="expDate"
                      value={v.expDate}
                      onChange={(e) => handleValueChange(vIndex, e)}
                      required
                      className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Status
                    </label>
                    <select
                      name="status"
                      value={v.status}
                      onChange={(e) => handleValueChange(vIndex, e)}
                      className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="Created">Created</option>
                      <option value="Ready">Ready</option>
                      <option value="Closed">Closed</option>
                      <option value="Obsolete">Obsolete</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 mt-5">
                    <input
                      id={`serialTracking-${vIndex}`}
                      name="serialTracking"
                      type="checkbox"
                      checked={v.serialTracking}
                      onChange={(e) => handleValueChange(vIndex, e)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`serialTracking-${vIndex}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Serial Tracking
                    </label>
                  </div>

                  {/* If serialTracking, show serialNumbers inputs */}
                  {v.serialTracking && (
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Serial Numbers
                      </label>
                      {v.serialNumbers.map((sn, snIdx) => (
                        <div key={snIdx} className="flex items-center mb-2">
                          <input
                            type="text"
                            value={sn}
                            onChange={(e) =>
                              handleSerialNumberChange(vIndex, snIdx, e)
                            }
                            placeholder="Enter serial number"
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                            required={v.serialTracking}
                          />
                          {v.serialNumbers.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeSerialNumberField(vIndex, snIdx)
                              }
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              <FaTrashAlt />
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addSerialNumberField(vIndex)}
                        className="flex items-center text-blue-600 hover:underline text-sm"
                      >
                        <FaPlusCircle className="mr-1" /> Add Serial Number
                      </button>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-600">
                      Attributes (JSON)
                    </label>
                    <textarea
                      name="attributes"
                      value={v.attributes}
                      onChange={(e) => handleValueChange(vIndex, e)}
                      placeholder='e.g. {"color":"red","size":"L"}'
                      rows={2}
                      className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter a valid JSON object. It’ll be stored as a Map on the
                      backend.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 mt-5">
                    <input
                      id={`archived-${vIndex}`}
                      name="archived"
                      type="checkbox"
                      checked={v.archived}
                      onChange={(e) => handleValueChange(vIndex, e)}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`archived-${vIndex}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Archived
                    </label>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addValue}
              className="flex items-center text-blue-600 hover:underline text-sm"
            >
              <FaPlusCircle className="mr-1" /> Add Another Batch Value
            </button>
            <div className="flex items-center space-x-2 mt-5">
              <input
                id="active"
                name="active"
                type="checkbox"
                checked={form.active}
                onChange={handleTopLevelChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <label
                htmlFor="active"
                className="text-sm font-medium text-gray-700"
              >
                Active
              </label>
            </div>

            <div className="flex items-center space-x-2 mt-5">
              <input
                id="archived"
                name="archived"
                type="checkbox"
                checked={form.archived}
                onChange={handleTopLevelChange}
                className="w-4 h-4 text-red-600 border-gray-300 rounded"
              />
              <label
                htmlFor="archived"
                className="text-sm font-medium text-gray-700"
              >
                Archived
              </label>
            </div>
          </div>
        </section>{" "}
   
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
