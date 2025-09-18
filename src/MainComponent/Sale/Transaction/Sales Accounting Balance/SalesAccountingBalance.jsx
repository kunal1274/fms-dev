import React, { useEffect, useState } from "react";
import axios from "axios";

import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const SalesAccountingBalance = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const salesOrderUrl = "https://fms-qkmw.onrender.com/fms/api/v0/salesorders";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(salesOrderUrl);
        setData(res.data?.data || []);
      } catch (err) {
        setError("Failed to load sales accounting balance.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Sales Accounting Balance", 14, 10);
    doc.autoTable({
      head: [
        [
          "Customer Code",
          "Customer Name",
          "Currency",
          "From Date",
          "To Date",
          "Opening Balance",
          "Total Sales Invoiced",
          "Payments Received",
          "Credit Notes",
          "Adjustments",
          "Closing Balance",
          "Overdue Amount",
          "Salesperson Name",
          "Order Id",
        ],
      ],
      body: data.map((row) => [
        row.customerCode,
        row.customerName,
        row.currency,
        row.fromDate,
        row.toDate,
        row.openingBalance,
        row.totalSalesInvoiced,
        row.paymentsReceived,
        row.creditNotes,
        row.adjustments,
        row.closingBalance,
        row.overdueAmount,
        row.salespersonName,
        row.orderId,
      ]),
    });
    doc.save("sales_accounting_balance.pdf");
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Sales Accounting Balance"
    );
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(dataBlob, "sales_accounting_balance.xlsx");
  };

  if (loading) return <div className="mt-4 text-sm">Loading...</div>;
  if (error) return <div className="mt-4 text-sm text-red-600">{error}</div>;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-2">
        {/* Title on left */}
        <h2 className="text-lg font-semibold">Sales Accounting Balance</h2>

        {/* Buttons on right */}
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

      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-xs">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {[
                "Customer Code",
                "Customer Name",
                "Currency",
                "From Date",
                "To Date",
                "Opening Balance",
                "Total Sales Invoiced",
                "Payments Received",
                "Credit Notes",
                "Adjustments",
                "Closing Balance",
                "Overdue Amount",
                "Salesperson Name",
                "Order Id",
              ].map((heading, index) => (
                <th key={index} className="border px-2 py-1 text-left">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border px-2 py-1">{row.customerCode}</td>
                <td className="border px-2 py-1">{row.customerName}</td>
                <td className="border px-2 py-1">{row.currency}</td>
                <td className="border px-2 py-1">{row.fromDate}</td>
                <td className="border px-2 py-1">{row.toDate}</td>
                <td className="border px-2 py-1">{row.openingBalance}</td>
                <td className="border px-2 py-1">{row.totalSalesInvoiced}</td>
                <td className="border px-2 py-1">{row.paymentsReceived}</td>
                <td className="border px-2 py-1">{row.creditNotes}</td>
                <td className="border px-2 py-1">{row.adjustments}</td>
                <td className="border px-2 py-1">{row.closingBalance}</td>
                <td className="border px-2 py-1">{row.overdueAmount}</td>
                <td className="border px-2 py-1">{row.salespersonName}</td>
                <td className="border px-2 py-1">{row.orderId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesAccountingBalance;
