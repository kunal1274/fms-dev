import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

// Dummy data (you can replace this with API response later)
const dummyData = {
  invoiceId: "INV-2002",
  status: "Draft",
  creationDate: "2025-09-11T10:00:00Z",
  customer: {
    id: "CUST-010",
    name: "XYZ Ltd",
    currency: "USD",
    address: "456 Corporate Ave, New York, USA",
    email: "billing@xyz.com",
    contactNum: "+1-987-654-3210",
  },
  remarks: "Demo invoice for testing edit and delete.",
  transactionType: "Invoice",
  ledgerAccount: "General Sales Ledger",
  invoiceDate: "2025-09-11",
  items: [
    {
      id: "ITEM-101",
      code: "P-101",
      name: "Service A",
      description: "Consulting Service",
      site: "Main Office",
      warehouse: "N/A",
      unit: "HRS",
      quantity: 20,
      price: 50,
      discount: 10,
      tax: 15,
      tcs: 0,
      amountBeforeTax: 900,
      totalAmount: 1035,
    },
    {
      id: "ITEM-102",
      code: "P-102",
      name: "Software License",
      description: "Annual License",
      site: "HQ",
      warehouse: "Digital",
      unit: "PCS",
      quantity: 2,
      price: 300,
      discount: 0,
      tax: 18,
      tcs: 0,
      amountBeforeTax: 600,
      totalAmount: 708,
    },
  ],
  summary: {
    totalLines: 2,
    totalNetAmount: 1500,
    totalDiscountAmount: 100,
    totalTaxAmount: 243,
    totalWithholdingTax: 0,
    totalLineAmount: 1743,
  },
};

const SummaryCard = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-lg font-semibold text-gray-800">{value}</span>
  </div>
);

const FreeTaxingInvoice = () => {
  const navigate = useNavigate();

  // States
  const [invoice, setInvoice] = useState(dummyData);
  const [backup, setBackup] = useState(dummyData); // for cancel
  const [isEditing, setIsEditing] = useState(false);

  // Fix: define missing states so inputs won’t throw errors
  const [purchaseOrderNum, setPurchaseOrderNum] = useState("PO-1001");
  const [advance, setAdvance] = useState(0);
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(
    dummyData.customer
  );

  // Handlers
  const handleEdit = () => {
    setBackup(invoice); // backup current
    setIsEditing(true);
  };

  const handleCancel = () => {
    setInvoice(backup); // restore backup
    setIsEditing(false);
    toast.info("Edits cancelled");
  };

  const handleUpdate = () => {
    setIsEditing(false);
    toast.success("Invoice updated successfully!");
  };

  const handleDelete = () => {
    setInvoice(null); // remove invoice
    toast.error("Invoice deleted!");
  };

  const goBack = () => {
    navigate(-1);
  };

  if (!invoice) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 text-lg">Invoice has been deleted.</p>
        <button
          onClick={goBack}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="">
      <ToastContainer />

      {/* Header Buttons */}
      <div className="flex justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <button
              type="button"
              className="text-blue-600 mt-2 text-sm hover:underline"
            >
              Upload Photo
            </button>
          </div>
          <h3 className="text-xl font-semibold"> Free Taxing Invoice</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={!isEditing}
            className={`h-8 px-3 border rounded transition ${
              isEditing
                ? "bg-red-400 text-white hover:bg-red-500"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={goBack}
            className="h-8 px-3 border bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Go Back
          </button>

          <button
            type="button"
            onClick={() => {
              if (isEditing) {
                handleUpdate();
              } else {
                handleEdit();
              }
            }}
            className={`h-8 px-3 border rounded transition ${
              isEditing
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-green-200 hover:bg-gray-300"
            }`}
          >
            {isEditing ? "Update" : "Edit"}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="h-8 px-3 border rounded bg-red-500 text-white hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Form */}
      <form className="bg-white shadow-none rounded-lg divide-y divide-gray-200">
        {/* Business Details */}
        <section className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Invoice Details */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Free Tax Invoice no/ ID
                </label>
                <input
                  type="text"
                  name="purchaseOrder"
                  value={purchaseOrderNum || ""}
                  placeholder="Purchase Order"
                  className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Invoice ID
                </label>
                <input
                  type="text"
                  value={invoice.invoiceId}
                  onChange={(e) =>
                    setInvoice({ ...invoice, invoiceId: e.target.value })
                  }
                  readOnly={!isEditing}
                  className={`mt-1 w-full p-2 border rounded ${
                    isEditing
                      ? ""
                      : "bg-gray-100 text-gray-500 cursor-not-allowed"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Creation Date & Time
                </label>
                <input
                  type="text"
                  value={invoice.creationDate}
                  onChange={(e) =>
                    setInvoice({ ...invoice, creationDate: e.target.value })
                  }
                  readOnly={!isEditing}
                  className={`mt-1 w-full p-2 border rounded ${
                    isEditing
                      ? ""
                      : "bg-gray-100 text-gray-500 cursor-not-allowed"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Order Status
                </label>
                <input
                  type="text"
                  value={invoice.status || ""}
                  placeholder="Order Status"
                  className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Purchase Agreement No (if applicable)
                </label>
                <input
                  type="text"
                  value={"AG-2001"}
                  placeholder="Agreement"
                  className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Remarks
                </label>
                <textarea
                  rows="4"
                  value={invoice.remarks}
                  readOnly
                  className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Customer & Financial Details */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Customer Account
                </label>
                <select className="mt-1 w-full border rounded p-2">
                  <option>{selectedCustomerDetails.id}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={selectedCustomerDetails?.name || ""}
                  className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
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
                  className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Customer Address
                </label>
                <textarea
                  rows="4"
                  value={selectedCustomerDetails?.address || ""}
                  readOnly
                  className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Transaction type
                </label>
                <input
                  type="text"
                  value={invoice.transactionType}
                  className="w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Total Invoice Amount
                </label>
                <input
                  type="text"
                  value={invoice.summary.totalLineAmount}
                  className="w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Posted Ledger Account
                </label>
                <input
                  type="text"
                  value={advance}
                  onChange={(e) =>
                    setAdvance(Number(e.target.value.replace(/\D/g, "")) || 0)
                  }
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Invoice Date
                </label>
                <input
                  type="text"
                  value={invoice.invoiceDate}
                  className="w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                  readOnly
                />
              </div>
            </div>
          </div>
        </section>

        {/* Line Items Table */}
        <section className="p-6">
          <div className="max-h-96 overflow-y-auto mt-4 border rounded-lg bg-white">
            <div className="space-y-6 p-4">
              <table className="min-w-full border-collapse text-sm text-gray-700">
                <thead className="bg-gray-100 text-gray-900 uppercase text-xs font-semibold sticky top-0 z-10">
                  <tr>
                    {[
                      "S.N",
                      "Item Code",
                      "Item Name",
                      "Description",
                      "Posting Account",
                      "Site",
                      "Warehouse",
                      "Qty",
                      "Unit",
                      "Price",
                      "Discount %",
                      "Amount",
                      "Tax %",
                      "TCS/TDS %",
                      "Total Amount",
                    ].map((header, index) => (
                      <th
                        key={index}
                        className="border border-gray-300 px-2 py-1 text-center"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="border text-center px-2 py-1">
                        {idx + 1}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {item.code}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {item.name}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {item.description}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {invoice.ledgerAccount}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {item.site}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {item.warehouse}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const updatedItems = [...invoice.items];
                            updatedItems[idx].quantity = Number(e.target.value);
                            setInvoice({ ...invoice, items: updatedItems });
                          }}
                          readOnly={!isEditing}
                          className={`w-full border rounded text-center px-2 py-1 ${
                            isEditing
                              ? ""
                              : "bg-gray-100 text-gray-500 cursor-not-allowed"
                          }`}
                        />
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {item.unit}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {item.price}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {item.discount}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {item.amountBeforeTax}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {item.tax}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {item.tcs}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {item.totalAmount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
};

export default FreeTaxingInvoice;
