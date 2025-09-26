import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SummaryCard = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-lg font-semibold text-gray-800">{value}</span>
  </div>
);

const JournaRevenueOrderform = ({ handleCancel }) => {
  const [form, setForm] = useState({
    orderDate: "",
    postingPeriod: "",
    postingDate: "",
    status: "Draft",
  });

  const [saleOrderNum, setSaleOrderNum] = useState("JRNL-2025-001");
  const [advance, setAdvance] = useState("");
  const [selectedCustomerDetails] = useState({
    address: "123 Main Street",
    currency: "INR",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = (e) => {
    e.preventDefault();
    toast.success("Journal created successfully!");
  };

  return (
    <div>
      <ToastContainer />

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
            <svg
              className="h-8 w-8 text-gray-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M12 11c1.656 0 3-1.344 3-3s-1.344-3-3-3-3 1.344-3 3 1.344 3 3 3zm0 2c-2.761 0-5 2.239-5 5v3h10v-3c0-2.761-2.239-5-5-5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold">Journal / Revenue Journal</h3>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleCreate} className="bg-white rounded-lg">
        <section className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Journal Code
              </label>
              <input
                type="text"
                value={saleOrderNum}
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Journal Name
              </label>
              <input
                type="text"
                placeholder="Journal Name"
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Creation Date
              </label>
              <input
                type="date"
                name="orderDate"
                value={form.orderDate}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Description
              </label>
              <textarea
                value={selectedCustomerDetails.address}
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Currency
              </label>
              <input
                type="text"
                value={selectedCustomerDetails.currency}
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Posting Period
              </label>
              <input
                type="text"
                name="postingPeriod"
                value={form.postingPeriod}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Posting Date
              </label>
              <input
                type="text"
                name="postingDate"
                value={form.postingDate}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Order Status
              </label>
              <input
                type="text"
                value={form.status}
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500"
                readOnly
              />
            </div>
          </div>
        </section>

        {/* Table Section */}
        <section className="p-6">
          <div className="max-h-96 overflow-y-auto border rounded-lg bg-white">
            <table className="min-w-full text-sm text-gray-700 border-collapse">
              <thead className="bg-gray-100 text-gray-900 uppercase text-xs font-semibold sticky top-0 z-10">
                <tr>
                  {[
                    "S.N",
                    "Account",
                    "Account ID",
                    "Name",
                    "Description",
                    "Debit",
                    "Credit",
                    "Posting Account ID.",
                    "Posting Account",
                    "Tax %",
                    "TCS/TDS %",
                    "Total Amount",
                  ].map((header, idx) => (
                    <th key={idx} className="border px-2 py-1 text-center">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  {[...Array(12)].map((_, idx) => (
                    <td key={idx} className="border px-2 py-1 text-center">
                      <input
                        type="text"
                        className="w-full border rounded px-2 py-1"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Summary Section */}
        <section className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
            <SummaryCard label="  Tax_Code " value="  Order ID" />
            <SummaryCard label="Total Tax Amount  " value="101" />
            <SummaryCard label="Invoice Number" value="INV-2025-01" />
            <SummaryCard label="Posted Date" value="2025-07-03" />
            <SummaryCard label="Approval Status" value="Pending" />
            <SummaryCard label="Order_ID" value="INV-2025" />
            <SummaryCard label="Invoice_Date" value="NV-2024-09" />
            <SummaryCard label="Total Amount" value="909" />

            <SummaryCard label="Approval Amount" value="99" />
          </div>
        </section>

        {/* Action Buttons */}
        <div className="py-6 flex justify-between px-6">
          <button type="button" className="text-gray-500 hover:text-gray-700">
            Reset
          </button>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Go Back
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default JournaRevenueOrderform;
