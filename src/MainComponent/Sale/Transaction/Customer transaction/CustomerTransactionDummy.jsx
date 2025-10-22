import React, { useEffect, useState } from "react";
import axios from "axios";

import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const tableHeaders = [
  "S.N",
  "Transaction Type/ Name",
  "Reference ID",
  "Transaction ID",
  "Transaction Date",
  "Customer ID",
  "Customer Name",
  "Item/ Account Name",
  "Item No/ Account No",
  "Quantity",
  "Unit Price",
  "Discount",
  "Tax Amount",
  "Charges",
  "Commission",
  "Total Amount",
  "Payment Method",
  "Payment Status",
  "Order Status",
  "Invoice Number",
  "Revenue",
  "Position Transaction",
  "Position Voucher",
  "Physical Transaction",
  "Physical Voucher",
  "Financial Transaction",
];

const formatCurrency = (num) =>
  Number(num || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-IN") : "";

const CustomerTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Dummy data
  const dummyTransactions = [
    {
      transactionType: "Sale order",
      referenceId: "REF123",
      OrderId:"jshj",
      transactionId: "TXN001",
      transactionDate: "2025-09-10",
      customerId: "CUST001",
      customerName: "Ravi Kumar",
      itemName: "Laptop",
      itemNumber: "ITM101",
      quantity: 2,
      unitPrice: 55000,
      discount: 5000,
      taxAmount: 9000,
      charges: 1000,
      commission: 2000,
      totalAmount: 118000,
      paymentMethod: "Credit Card",
      paymentStatus: "Paid",
      orderStatus: "Completed",
      invoiceNumber: "INV1001",
      revenue: 118000,
      positionTransaction: "PT001",
      positionVoucher: "PV001",
      physicalTransaction: "Yes",
      physicalVoucher: "Voucher123",
      financialTransaction: "FIN001",
    },
    {
      transactionType: "Customer Receipt",
      referenceId: "REF124",
      transactionId: "TXN002",
      transactionDate: "2025-09-11",
      customerId: "CUST002",
      customerName: "Anjali Sharma",
      itemName: "Mobile Phone",
      itemNumber: "ITM202",
      quantity: 1,
      unitPrice: 35000,
      discount: 2000,
      taxAmount: 5000,
      charges: 500,
      commission: 1500,
      totalAmount: 38500,
      paymentMethod: "UPI",
      paymentStatus: "Pending",
      orderStatus: "Processing",
      invoiceNumber: "INV1002",
      revenue: 38500,
      positionTransaction: "PT002",
      positionVoucher: "PV002",
      physicalTransaction: "No",
      physicalVoucher: "Voucher124",
      financialTransaction: "FIN002",
    },
  ];

  useEffect(() => {
    setTransactions(dummyTransactions);
  }, []);

  const getId = (tx) => tx.transactionId;

  const filteredCreditNotes = transactions.filter((tx) => {
    const matchesSearch =
      tx.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter
      ? tx.paymentStatus === statusFilter
      : true;
    return matchesSearch && matchesStatus;
  });

  const isRangeValid =
    startDate && endDate && new Date(endDate) > new Date(startDate);

  // ✅ PDF Export
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Customer Transactions Report", 14, 10);

    const rows = filteredCreditNotes.map((tx, idx) => [
      idx + 1,
      tx.transactionType,
      tx.referenceId,
      tx.transactionId,
      formatDate(tx.transactionDate),
      tx.customerId,
      tx.customerName,
      tx.itemName,
      tx.itemNumber,
      tx.quantity,
      formatCurrency(tx.unitPrice),
      formatCurrency(tx.discount),
      formatCurrency(tx.taxAmount),
      formatCurrency(tx.charges),
      formatCurrency(tx.commission),
      formatCurrency(tx.totalAmount),
      tx.paymentMethod,
      tx.paymentStatus,
      tx.orderStatus,
      tx.invoiceNumber,
      formatCurrency(tx.revenue),
      tx.positionTransaction,
      tx.positionVoucher,
      tx.physicalTransaction,
      tx.physicalVoucher,
      tx.financialTransaction,
    ]);

    doc.autoTable({
      head: [tableHeaders],
      body: rows,
      startY: 20,
      styles: { fontSize: 7, cellPadding: 1 },
    });

    doc.save("customer_transactions.pdf");
    toast.success("PDF Exported!");
  };

  // ✅ Excel Export
  const exportToExcel = () => {
    const worksheetData = [
      tableHeaders,
      ...filteredCreditNotes.map((tx, idx) => [
        idx + 1,
        tx.transactionType,
        tx.referenceId,
        tx.transactionId,
        formatDate(tx.transactionDate),
        tx.customerId,
        tx.customerName,
        tx.itemName,
        tx.itemNumber,
        tx.quantity,
        tx.unitPrice,
        tx.discount,
        tx.taxAmount,
        tx.charges,
        tx.commission,
        tx.totalAmount,
        tx.paymentMethod,
        tx.paymentStatus,
        tx.orderStatus,
        tx.invoiceNumber,
        tx.revenue,
        tx.positionTransaction,
        tx.positionVoucher,
        tx.physicalTransaction,
        tx.physicalVoucher,
        tx.financialTransaction,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "customer_transactions.xlsx");

    toast.success("Excel Exported!");
  };

  return (
    <div>
      <ToastContainer />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
        {/* Title on left */}
        <h2 className="text-lg font-bold">Customer Transactions</h2>

        {/* Buttons on right */}
        <div className="mt-2 sm:mt-0 space-x-2">
          <button
            onClick={generatePDF}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
          >
            Export PDF
          </button>
          <button
            onClick={exportToExcel}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* Scroll wrapper */}
      <div className="mx-auto w-[150vw] max-w-[1500px] rounded-lg border bg-white ">
        <div className="h-[400px] overflow-x-auto overflow-y-auto">
          <table className="min-w-[2000px] border border-gray-300 text-xs">
            <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
              <tr>
                {tableHeaders.map((heading) => (
                  <th key={heading} className="border px-2 py-1 text-left">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCreditNotes.length > 0 ? (
                filteredCreditNotes.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border px-2 py-1">{idx + 1}</td>
                    <td className="border px-2 py-1">{tx.transactionType}</td>
                    <td className="border px-2 py-1">{tx.referenceId}</td>
                    <td className="border px-2 py-1">{tx.transactionId}</td>
                    <td className="border px-2 py-1">
                      {formatDate(tx.transactionDate)}
                    </td>
                    <td className="border px-2 py-1">{tx.customerId}</td>
                    <td className="border px-2 py-1">{tx.customerName}</td>
                    <td className="border px-2 py-1">{tx.itemName}</td>
                    <td className="border px-2 py-1">{tx.itemNumber}</td>
                    <td className="border px-2 py-1">{tx.quantity}</td>
                    <td className="border px-2 py-1">
                      {formatCurrency(tx.unitPrice)}
                    </td>
                    <td className="border px-2 py-1">
                      {formatCurrency(tx.discount)}
                    </td>
                    <td className="border px-2 py-1">
                      {formatCurrency(tx.taxAmount)}
                    </td>
                    <td className="border px-2 py-1">
                      {formatCurrency(tx.charges)}
                    </td>
                    <td className="border px-2 py-1">
                      {formatCurrency(tx.commission)}
                    </td>
                    <td className="border px-2 py-1">
                      {formatCurrency(tx.totalAmount)}
                    </td>
                    <td className="border px-2 py-1">{tx.paymentMethod}</td>
                    <td className="border px-2 py-1">{tx.paymentStatus}</td>
                    <td className="border px-2 py-1">{tx.orderStatus}</td>
                    <td className="border px-2 py-1">{tx.invoiceNumber}</td>
                    <td className="border px-2 py-1">
                      {formatCurrency(tx.revenue)}
                    </td>
                    <td className="border px-2 py-1">
                      {tx.positionTransaction}
                    </td>
                    <td className="border px-2 py-1">{tx.positionVoucher}</td>
                    <td className="border px-2 py-1">
                      {tx.physicalTransaction}
                    </td>
                    <td className="border px-2 py-1">{tx.physicalVoucher}</td>
                    <td className="border px-2 py-1">
                      {tx.financialTransaction}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={tableHeaders.length} className="text-center p-2">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>{" "}
      </div>
    </div>
  );
};

export default CustomerTransaction;
