import React, { useEffect, useState } from "react";
import axios from "axios";

import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const CustomerAgingReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const salesOrderUrl = "https://fms-qkmw.onrender.com/fms/api/v0/salesorders";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${salesOrderUrl}`);
        setData(res.data?.data || []);
      } catch (err) {
        setError("Failed to load aging report.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Customer Aging Report", 14, 10);
    doc.autoTable({
      head: [
        [
          "S/N",
          "Customer ID",
          "Customer Name",
          "Invoice Number",
          "Invoice Date",
          "Due Date",
          "Invoice Amount",
          "Payment Received",
          "Balance Due",
          "0–30 Days",
          "31–60 Days",
          "61–90 Days",
          "90+ Days",
          "Status",
        ],
      ],
      body: data.map((row, idx) => [
        idx + 1,
        row.customer?.code,
        row.customer?.name,
        row.invoiceNumber,
        row.invoiceDate,
        row.dueDate,
        row.invoiceAmount,
        row.paymentReceived,
        row.balanceDue,
        row.days_0_30,
        row.days_31_60,
        row.days_61_90,
        row.days_90_plus,
        row.status,
      ]),
      startY: 20,
      styles: { fontSize: 8 },
    });
    doc.save("Customer_Aging_Report.pdf");
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((row, idx) => ({
        SN: idx + 1,
        CustomerID: row.customer?.code,
        CustomerName: row.customer?.name,
        InvoiceNumber: row.invoiceNumber,
        InvoiceDate: row.invoiceDate,
        DueDate: row.dueDate,
        InvoiceAmount: row.invoiceAmount,
        PaymentReceived: row.paymentReceived,
        BalanceDue: row.balanceDue,
        "0–30 Days": row.days_0_30,
        "31–60 Days": row.days_31_60,
        "61–90 Days": row.days_61_90,
        "90+ Days": row.days_90_plus,
        Status: row.status,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customer Aging Report");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      "Customer_Aging_Report.xlsx"
    );
  };
  if (loading) return <div className="mt-4 text-sm">Loading...</div>;
  if (error) return <div className="mt-4 text-sm text-red-600">{error}</div>;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        {/* Title */}
        <h2 className="text-lg font-semibold mb-2">Customer Aging Report</h2>

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

      {/* Table */}
      <table className="min-w-full border border-gray-300 text-xs mt-3">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {[
              "S/N",
              "Customer ID",
              "Customer Name",
              "Invoice Number",
              "Invoice Date",
              "Due Date",
              "Invoice Amount",
              "Payment Received",
              "Balance Due",
              "0–30 Days",
              "31–60 Days",
              "61–90 Days",
              "90+ Days",
              "Status",
            ].map((heading) => (
              <th key={heading} className="border px-2 py-1 text-left">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{idx + 1}</td>
              <td className="border px-2 py-1">{row.customer?.code}</td>
              <td className="border px-2 py-1">{row.customer?.name}</td>
              <td className="border px-2 py-1">{row.invoiceNumber}</td>
              <td className="border px-2 py-1">{row.invoiceDate}</td>
              <td className="border px-2 py-1">{row.dueDate}</td>
              <td className="border px-2 py-1">{row.invoiceAmount}</td>
              <td className="border px-2 py-1">{row.paymentReceived}</td>
              <td className="border px-2 py-1">{row.balanceDue}</td>
              <td className="border px-2 py-1">{row.days_0_30}</td>
              <td className="border px-2 py-1">{row.days_31_60}</td>
              <td className="border px-2 py-1">{row.days_61_90}</td>
              <td className="border px-2 py-1">{row.days_90_plus}</td>
              <td className="border px-2 py-1">{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerAgingReport;
