import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const purchasesOrderUrl =
  "https://fms-qkmw.onrender.com/fms/api/v0/purchasesorders";

export default function VendorBalance() {
  const [balances, setBalances] = useState([
    // ✅ Dummy Data
    {
      vendorId: "V001",
      vendorName: "ABC Traders",
      invoiceDate: new Date().toISOString(),
      invoiceNumber: "INV-1001",
      invoiceAmount: 1200.5,
      paymentPaid: 600.25,
      balanceDue: 600.25,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Partially Paid",
    },
    {
      vendorId: "V002",
      vendorName: "XYZ Supplies",
      invoiceDate: new Date().toISOString(),
      invoiceNumber: "INV-1002",
      invoiceAmount: 800,
      paymentPaid: 0,
      balanceDue: 800,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Unpaid",
    },
    {
      vendorId: "V003",
      vendorName: "LMN Enterprises",
      invoiceDate: new Date().toISOString(),
      invoiceNumber: "INV-1003",
      invoiceAmount: 500,
      paymentPaid: 500,
      balanceDue: 0,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Paid",
    },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const response = await axios.get(purchasesOrderUrl);
        const purchaseOrders = response.data.data;

        const rows = purchaseOrders.map((order) => {
          const vendorId = order.vendor?.code || "N/A";
          const vendorName = order.vendor?.name || "N/A";
          const invoiceDate = order.createdAt;
          const invoiceNumber = order.invoiceNumber || order._id;
          const invoiceAmount = order.netAmtAfterTax || 0;
          const paymentPaid = order.totalPaid || 0;
          const balanceDue = order.netPaymentDue || 0;
          const dueDate = order.dueDate || "";
          const status = order.settlementStatus || "Unpaid";

          return {
            vendorId,
            vendorName,
            invoiceDate,
            invoiceNumber,
            invoiceAmount,
            paymentPaid,
            balanceDue,
            dueDate,
            status,
          };
        });

        // ✅ Append API data without removing dummy data
        setBalances((prev) => [...prev, ...rows]);
      } catch (err) {
        console.error("Error fetching vendor balances:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, []);

  // 📌 Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Vendor Balance Summary", 14, 10);
    doc.autoTable({
      head: [
        [
          "Vendor ID / No",
          "Vendor Name",
          "Invoice Date",
          "Invoice Number",
          "Invoice Amount",
          "Payment Paid",
          "Balance Due",
          "Due Date",
          "Status",
        ],
      ],
      body: balances.map((row) => [
        row.vendorId,
        row.vendorName,
        new Date(row.invoiceDate).toLocaleDateString(),
        row.invoiceNumber,
        row.invoiceAmount.toFixed(2),
        row.paymentPaid.toFixed(2),
        row.balanceDue.toFixed(2),
        row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "-",
        row.status,
      ]),
      startY: 20,
    });
    doc.save("vendor_balance_summary.pdf");
  };

  // 📌 Export Excel
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(balances);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vendor Balance");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "vendor_balance_summary.xlsx");
  };

  return (
    <div className="mt-8">
      {/* Header with h2 left, buttons right */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Vendor Balance Summary</h2>
        <div className="space-x-2">
          <button
            onClick={handleExportPDF}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md 
                       transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
          >
            Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md 
                       transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
          >
            Export Excel
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-[1200px] border border-gray-300 text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                {[
                  "Vendor ID / No",
                  "Vendor Name",
                  "Invoice Date",
                  "Invoice Number",
                  "Invoice Amount",
                  "Payment Paid",
                  "Balance Due",
                  "Due Date",
                  "Status",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="border px-3 py-2 text-left whitespace-nowrap"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {balances.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border px-3 py-1">{row.vendorId}</td>
                  <td className="border px-3 py-1">{row.vendorName}</td>
                  <td className="border px-3 py-1">
                    {new Date(row.invoiceDate).toLocaleDateString()}
                  </td>
                  <td className="border px-3 py-1">{row.invoiceNumber}</td>
                  <td className="border px-3 py-1">
                    {row.invoiceAmount.toFixed(2)}
                  </td>
                  <td className="border px-3 py-1">
                    {row.paymentPaid.toFixed(2)}
                  </td>
                  <td className="border px-3 py-1">
                    {row.balanceDue.toFixed(2)}
                  </td>
                  <td className="border px-3 py-1">
                    {row.dueDate
                      ? new Date(row.dueDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="border px-3 py-1">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
