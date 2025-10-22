import React, { useEffect, useState } from "react";
import axios from "axios";

import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Simple summary card component
const SummaryCard = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-lg font-semibold text-gray-800">{value}</span>
  </div>
);

const ProformaConfirmationInvoice = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [tcs, setTcs] = useState(0);
  const [lineAmt, setLineAmt] = useState("0.00");

  const [items, setItems] = useState([
    {
      _id: "1",
      code: "ITEM001",
      name: "Item One",
      description: "Desc A",
      unit: "Nos",
      price: 100,
    },
    {
      _id: "2",
      code: "ITEM002",
      name: "Item Two",
      description: "Desc B",
      unit: "Kg",
      price: 200,
    },
  ]);

  const advance = 0;

  const amountBeforeTax =
    quantity * price - (quantity * price * discount) / 100;
  const taxAmount = (amountBeforeTax * tax) / 100;
  const tcsAmount = (amountBeforeTax * tcs) / 100;
  const finalAmount = amountBeforeTax + taxAmount + tcsAmount;

  useEffect(() => {
    setLineAmt(finalAmount.toFixed(2));
  }, [quantity, price, discount, tax, tcs]);

  return (
    <div className="p-6 text-sm text-gray-700">
      <div className="flex items-center justify-between">
        {/* Title */}
        <h2 className="text-lg font-bold mb-4">Sales Confirmation Invoice</h2>

        {/* Buttons aligned to the right */}
        <div className="space-x-2">
          <button
            onClick={handleExportPDF}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
          >
            Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* Header Form Section */}
      <section className="p-6 bg-white rounded dd">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            {
              label: "Sale Confirmation No..",
              placeholder: "Auto-generated",
            },
            {
              label: "Sale Confirmation Date",
              placeholder: "DD-MM-YYYY",
            },
            {
              label: "Sales Order No:",
              placeholder: "Auto-generated",
            },
            { label: "Customer Account:", isSelect: true },
            { label: "Customer Name:" },
            { label: "Contact Person:", placeholder: "e.g. John Doe" },

            { label: "Customer Address", isTextarea: true, rows: 4 },
            { label: "Delivery Address", isTextarea: true, rows: 4 },
            { label: "Payment Terms:", placeholder: "Enter address" },
            { label: "Currency:", placeholder: "Enter address" },
            {
              label: "Confirmation Validity date:",
              placeholder: "Enter address",
            },
            {
              label: "Delivery Mode:",
              placeholder: "e.g. Courier",
            },

            {
              label: "Estimated Delivery Date:",
              placeholder: "DD-MM-YYYY",
            },
            { label: "Order Status:", placeholder: "Pending" },
            { label: "Remarks", isTextarea: true, rows: 4 },
          ].map((field, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-600">
                {field.label}
              </label>
              {field.isSelect ? (
                <select className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200">
                  <option>Select Customer</option>
                </select>
              ) : field.isTextarea ? (
                <textarea
                  rows={field.rows}
                  className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                  placeholder={field.placeholder}
                />
              ) : (
                <input
                  type="text"
                  className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 ${
                    field.readOnly ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  placeholder={field.placeholder}
                  readOnly={field.readOnly}
                />
              )}
            </div>
          ))}
          <div className="flex items-center gap-2 ml-1">
            <label className="text-blue-600 font-medium">Active</label>
            <input type="checkbox" className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* Items Table */}
      <section className="p-6 mt-6">
        <div className="border rounded-lg bg-white overflow-x-auto">
          <table className="min-w-full border-collapse text-sm text-gray-700">
            <thead className="bg-gray-100 text-xs font-semibold">
              <tr>
                {[
                  "S.N",
                  "Item Code",
                  "Item Name",
                  "Description",
                  "Site",
                  "Warehouse",
                  "Qty",
                  "Unit",
                  "Price",
                  "Discount %",
                  "Tax %",
                  "TCS/TDS %",
                  "Total Amount",
                ].map((header, index) => (
                  <th key={index} className="border px-2 py-1 text-center">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="border text-center px-2 py-1">1</td>
                <td className="border px-2 py-1 text-center">
                  {selectedItem?.code || ""}
                </td>
                <td className="border px-2 py-1">
                  <select
                    value={selectedItem?._id || ""}
                    onChange={(e) => {
                      const sel = items.find((i) => i._id === e.target.value);
                      setSelectedItem(sel);
                      if (sel) setPrice(Number(sel.price) || 0);
                    }}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="">Select Item</option>
                    {items.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border px-2 py-1 text-center">
                  <input
                    type="text"
                    readOnly
                    value={selectedItem?.description || ""}
                    className="w-full bg-gray-100 border px-2 py-1 rounded text-center"
                  />
                </td>
                <td className="border px-2 py-1 text-center">
                  <input
                    type="text"
                    placeholder="Site"
                    className="w-full border px-2 py-1 rounded text-center"
                  />
                </td>
                <td className="border px-2 py-1 text-center">
                  <input
                    type="text"
                    placeholder="Warehouse"
                    className="w-full border px-2 py-1 rounded text-center"
                  />
                </td>
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full border px-2 py-1 rounded text-center"
                  />
                </td>
                <td className="border px-2 py-1 text-center">
                  <input
                    type="text"
                    readOnly
                    value={selectedItem?.unit || ""}
                    className="w-full bg-gray-100 border px-2 py-1 rounded text-center"
                  />
                </td>
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full border px-2 py-1 rounded text-center"
                  />
                </td>
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full border px-2 py-1 rounded text-center"
                  />
                </td>
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    value={tax}
                    onChange={(e) => setTax(Number(e.target.value))}
                    className="w-full border px-2 py-1 rounded text-center"
                  />
                </td>
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    value={tcs}
                    onChange={(e) => setTcs(Number(e.target.value))}
                    className="w-full border px-2 py-1 rounded text-center"
                  />
                </td>
                <td className="border px-2 py-1 text-center">{lineAmt}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-4 mt-4 rounded-lg">
          <SummaryCard label="Advance" value={advance.toFixed(2)} />
          <SummaryCard
            label="Subtotal / line amount"
            value={amountBeforeTax.toFixed(2)}
          />
          <SummaryCard label="Total Discount (%)" value={discount.toFixed(2)} />
          <SummaryCard label="Total Tax" value={taxAmount.toFixed(2)} />
          <SummaryCard label="Total TDS/TCS" value={tcsAmount.toFixed(2)} />
          <SummaryCard label="Grand Total" value={lineAmt} />
        </div>
      </section>
    </div>
  );
};

export default ProformaConfirmationInvoice;
