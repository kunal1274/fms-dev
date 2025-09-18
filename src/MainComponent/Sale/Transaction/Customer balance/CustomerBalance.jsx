import React, { useEffect, useState } from "react";
import axios from "axios";

import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const salesOrderUrl = "https://fms-qkmw.onrender.com/fms/api/v0/salesorders";

const CustomerBalance = () => {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const response = await axios.get(salesOrderUrl);
        const salesOrders = response.data.data;

        // Group sales by customer code
        const grouped = {};

        for (const order of salesOrders) {
          const customer = order.customer;
          const code = customer?.code || "UNKNOWN";

          if (!grouped[code]) {
            grouped[code] = {
              code,
              name: customer?.name || "",
              totalInvoice: 0,
              totalPaid: 0,
              balanceDue: 0,
              lastInvoiceDate: order.createdAt,
              status: order.settlementStatus,
            };
          }

          grouped[code].totalInvoice += order.netAmtAfterTax || 0;
          grouped[code].totalPaid += order.totalPaid || 0;
          grouped[code].balanceDue += order.netPaymentDue || 0;

          // Update latest invoice info
          if (
            new Date(order.createdAt) > new Date(grouped[code].lastInvoiceDate)
          ) {
            grouped[code].lastInvoiceDate = order.createdAt;
            grouped[code].status = order.settlementStatus;
          }
        }

        setBalances(Object.values(grouped));
      } catch (err) {
        console.error("Error fetching balances:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, []);

  // ---- Export Handlers ----
  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.text("Customer Balance Summary", 14, 15);

    const tableColumn = [
      "S.N",
      "Customer Code",
      "Customer Name",
      "Total Invoice",
      "Total Paid",
      "Balance Due",
      "Last Invoice Date",
      "Status",
    ];

    const tableRows = balances.map((row, index) => [
      index + 1,
      row.code,
      row.name,
      row.totalInvoice.toFixed(2),
      row.totalPaid.toFixed(2),
      row.balanceDue.toFixed(2),
      new Date(row.lastInvoiceDate).toLocaleDateString(),
      row.status,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("customer_balance_summary.pdf");
  };

  const handleExportExcel = () => {
    const worksheetData = balances.map((row, index) => ({
      "S.N": index + 1,
      "Customer Code": row.code,
      "Customer Name": row.name,
      "Total Invoice": row.totalInvoice.toFixed(2),
      "Total Paid": row.totalPaid.toFixed(2),
      "Balance Due": row.balanceDue.toFixed(2),
      "Last Invoice Date": new Date(row.lastInvoiceDate).toLocaleDateString(),
      Status: row.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customer Balance");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(data, "customer_balance_summary.xlsx");
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        {/* Title aligned left */}
        <h2 className="text-lg font-semibold">Customer Balance Summary</h2>

        {/* Buttons aligned right */}
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

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {[
                "S.N",
                "Customer Code",
                "Customer Name",
                "Total Invoice Amount",
                "Total Paid",
                "Balance Due",
                "Last Invoice Date",
                "Status",
              ].map((heading) => (
                <th key={heading} className="border px-3 py-2 text-left">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {balances.map((row, index) => (
              <tr key={row.code}>
                <td className="border px-3 py-2">{index + 1}</td>
                <td className="border px-3 py-2">{row.code}</td>
                <td className="border px-3 py-2">{row.name}</td>
                <td className="border px-3 py-2">
                  {row.totalInvoice.toFixed(2)}
                </td>
                <td className="border px-3 py-2">{row.totalPaid.toFixed(2)}</td>
                <td className="border px-3 py-2">
                  {row.balanceDue.toFixed(2)}
                </td>
                <td className="border px-3 py-2">
                  {new Date(row.lastInvoiceDate).toLocaleDateString()}
                </td>
                <td className="border px-3 py-2">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CustomerBalance;
