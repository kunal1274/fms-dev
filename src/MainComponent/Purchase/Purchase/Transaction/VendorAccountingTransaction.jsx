import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const purchasesOrderUrl =
  "https://fms-qkmw.onrender.com/fms/api/v0/purchaseorders";

const PurchasesAccountingTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(purchasesOrderUrl);
        setTransactions(res.data?.data || []);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // 📌 Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Vendor Accounting Transaction", 14, 10);
    doc.autoTable({
      head: [
        [
          "Transaction ID",
          "Date",
          "Vendor ID",
          "Vendor Name",
          "Invoice Number",
          "Product/Service",
          "Quantity",
          "Unit Price",
          "Subtotal",
          "Discount",
          "Tax (%)",
          "Tax Amount",
          "Total Amount",
          "Payment Made",
          "Balance Due",
          "Payment Method",
          "Status",
        ],
      ],
      body: transactions.map((txn) => {
        const {
          _id,
          createdAt,
          vendor,
          invoiceNumber,
          items = [],
          discount = 0,
          taxAmount = 0,
          total = 0,
          combinedPaid = 0,
          paymentMethod = "N/A",
          status = "Unpaid",
        } = txn;

        const item = items[0] || {};
        const quantity = item.quantity || 0;
        const unitPrice = item.unitPrice || 0;
        const subtotal = quantity * unitPrice;
        const balanceDue = total - combinedPaid;
        const taxPercent = item.taxPercent || 0;

        return [
          _id,
          new Date(createdAt).toLocaleDateString(),
          vendor?.code || "N/A",
          vendor?.name || "N/A",
          invoiceNumber || "N/A",
          item.name || "N/A",
          quantity,
          unitPrice,
          subtotal.toFixed(2),
          discount,
          taxPercent,
          taxAmount,
          total.toFixed(2),
          combinedPaid.toFixed(2),
          balanceDue.toFixed(2),
          paymentMethod,
          status,
        ];
      }),
      startY: 20,
    });
    doc.save("purchases_accounting_transactions.pdf");
  };

  // 📌 Export Excel
  const handleExportExcel = () => {
    const rows = transactions.map((txn) => {
      const {
        _id,
        createdAt,
        vendor,
        invoiceNumber,
        items = [],
        discount = 0,
        taxAmount = 0,
        total = 0,
        combinedPaid = 0,
        paymentMethod = "N/A",
        status = "Unpaid",
      } = txn;

      const item = items[0] || {};
      const quantity = item.quantity || 0;
      const unitPrice = item.unitPrice || 0;
      const subtotal = quantity * unitPrice;
      const balanceDue = total - combinedPaid;
      const taxPercent = item.taxPercent || 0;

      return {
        TransactionID: _id,
        Date: new Date(createdAt).toLocaleDateString(),
        VendorID: vendor?.code || "N/A",
        VendorName: vendor?.name || "N/A",
        InvoiceNumber: invoiceNumber || "N/A",
        ProductService: item.name || "N/A",
        Quantity: quantity,
        UnitPrice: unitPrice,
        Subtotal: subtotal.toFixed(2),
        Discount: discount,
        TaxPercent: taxPercent,
        TaxAmount: taxAmount,
        TotalAmount: total.toFixed(2),
        PaymentMade: combinedPaid.toFixed(2),
        BalanceDue: balanceDue.toFixed(2),
        PaymentMethod: paymentMethod,
        Status: status,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "purchases_accounting_transactions.xlsx");
  };

  return (
    <div className="mt-8">
      {/* Header with h2 left, buttons right */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Vendor Accounting Transaction</h2>
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

      {loading && <p className="text-sm">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <table className="min-w-[1500px] border border-gray-300 text-xs">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {[
              "Transaction ID",
              "Date",
              "Vendor ID",
              "Vendor Name",
              "Invoice Number",
              "Product/Service",
              "Quantity",
              "Unit Price",
              "Subtotal",
              "Discount",
              "Tax (%)",
              "Tax Amount",
              "Total Amount",
              "Payment Made",
              "Balance Due",
              "Payment Method",
              "Status",
            ].map((heading) => (
              <th
                key={heading}
                className="border px-2 py-1 text-left whitespace-nowrap"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn, idx) => {
            const {
              _id,
              createdAt,
              vendor,
              invoiceNumber,
              items = [],
              discount = 0,
              taxAmount = 0,
              total = 0,
              combinedPaid = 0,
              paymentMethod = "N/A",
              status = "Unpaid",
            } = txn;

            const item = items[0] || {};
            const quantity = item.quantity || 0;
            const unitPrice = item.unitPrice || 0;
            const subtotal = quantity * unitPrice;
            const balanceDue = total - combinedPaid;
            const taxPercent = item.taxPercent || 0;

            return (
              <tr key={idx}>
                <td className="border px-2 py-1">{_id}</td>
                <td className="border px-2 py-1">
                  {new Date(createdAt).toLocaleDateString()}
                </td>
                <td className="border px-2 py-1">{vendor?.code || "N/A"}</td>
                <td className="border px-2 py-1">{vendor?.name || "N/A"}</td>
                <td className="border px-2 py-1">{invoiceNumber || "N/A"}</td>
                <td className="border px-2 py-1">{item.name || "N/A"}</td>
                <td className="border px-2 py-1">{quantity}</td>
                <td className="border px-2 py-1">{unitPrice}</td>
                <td className="border px-2 py-1">{subtotal.toFixed(2)}</td>
                <td className="border px-2 py-1">{discount}</td>
                <td className="border px-2 py-1">{taxPercent}</td>
                <td className="border px-2 py-1">{taxAmount}</td>
                <td className="border px-2 py-1">{total.toFixed(2)}</td>
                <td className="border px-2 py-1">{combinedPaid.toFixed(2)}</td>
                <td className="border px-2 py-1">{balanceDue.toFixed(2)}</td>
                <td className="border px-2 py-1">{paymentMethod}</td>
                <td className="border px-2 py-1">{status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PurchasesAccountingTransaction;
