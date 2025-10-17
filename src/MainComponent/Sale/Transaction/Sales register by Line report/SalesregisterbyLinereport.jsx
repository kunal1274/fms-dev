import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const tableHeaders = [
  "InvoiceNumber",
  "InvoiceDate",
  "PostingDate",
  "TransactionType",
  "InvoiceStatus",
  "SalesOrderNumber",
  "CustomerCode",
  "CustomerName",
  "CustomerGSTIN",
  "CustomerAddress",
  "CustomerType",
  "LineNumber",
  "ItemCode",
  "ItemName",
  "Quantity",
  "UnitOfMeasure",
  "UnitPrice",
  "DiscountAmount",
  "TaxPercentage",
  "TaxAmount",
  "Amount",
  "TotalAmount",
  "PostingAccountCode",
  "Salesperson",
  "RevenueRecognitionDate",
  "PaymentTerm",
  "PaymentStatus",
  "ReceivableBalance",
  "Site",
  "Warehouse",
  "CreatedBy",
  "CreatedDateTime",
  "ModifiedBy",
  "ModifiedDateTime",
  "TransporterDetails",
  "DeliveryDate",
];

const formatCurrency = (num) =>
  Number(num || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-IN") : "";

const SalesregisterbyLinereport = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // ✅ Dummy data for testing
  const dummyTransactions = [
    {
      InvoiceNumber: "INV001",
      InvoiceDate: "2025-09-01",
      PostingDate: "2025-09-02",
      TransactionType: "Sale",
      InvoiceStatus: "Posted",
      SalesOrderNumber: "SO123",
      CustomerCode: "C001",
      CustomerName: "ABC Pvt Ltd",
      CustomerGSTIN: "27AAAPL1234C1ZV",
      CustomerAddress: "Mumbai, India",
      CustomerType: "Retail",
      LineNumber: 1,
      ItemCode: "ITM001",
      ItemName: "Product A",
      Quantity: 10,
      UnitOfMeasure: "PCS",
      UnitPrice: 500,
      DiscountAmount: 100,
      TaxPercentage: 18,
      TaxAmount: 720,
      Amount: 5000,
      TotalAmount: 5620,
      PostingAccountCode: "4001",
      Salesperson: "John",
      RevenueRecognitionDate: "2025-09-03",
      PaymentTerm: "Net 30",
      PaymentStatus: "Paid",
      ReceivableBalance: 0,
      Site: "Mumbai",
      Warehouse: "WH1",
      CreatedBy: "Admin",
      CreatedDateTime: "2025-09-01T10:00:00",
      ModifiedBy: "Admin",
      ModifiedDateTime: "2025-09-01T12:00:00",
      TransporterDetails: "XYZ Logistics",
      DeliveryDate: "2025-09-05",
    },
  ];

  useEffect(() => {
    setTransactions(dummyTransactions);
  }, []);

  // ✅ Filtering
  const filteredData = transactions.filter((tx) => {
    const matchesSearch = searchTerm
      ? Object.values(tx)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      : true;
    const matchesStatus = statusFilter
      ? tx.PaymentStatus === statusFilter
      : true;
    return matchesSearch && matchesStatus;
  });

  // ✅ PDF Export
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Sales Register by Line Report", 14, 10);

    const rows = filteredData.map((tx) =>
      tableHeaders.map((key) => tx[key] || "")
    );

    doc.autoTable({
      head: [tableHeaders],
      body: rows,
      startY: 20,
      styles: { fontSize: 7, cellPadding: 1 },
    });

    doc.save("sales_register_report.pdf");
    toast.success("PDF Exported!");
  };

  // ✅ Excel Export
  const exportToExcel = () => {
    const worksheetData = [
      tableHeaders,
      ...filteredData.map((tx) => tableHeaders.map((key) => tx[key] || "")),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(blob, "sales_register_report.xlsx");

    toast.success("Excel Exported!");
  };

  return (
    <div>
      <ToastContainer />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
        <h2 className="text-lg font-bold">Sales Register by Line Report</h2>

        <div className="mt-2 sm:mt-0 space-x-2">
          <button
            onClick={generatePDF}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-green-500 hover:text-white"
          >
            Export PDF
          </button>
          <button
            onClick={exportToExcel}
            className="h-8 px-3 border border-blue-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-white"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* Filters */}
     

      {/* Scrollable Table */}
      <div className="mx-auto w-[150vw] max-w-[1500px] rounded-lg border bg-white">
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
              {filteredData.length > 0 ? (
                filteredData.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {tableHeaders.map((key, colIdx) => (
                      <td key={colIdx} className="border px-2 py-1">
                        {typeof tx[key] === "number"
                          ? formatCurrency(tx[key])
                          : formatDate(tx[key]) !== ""
                          ? formatDate(tx[key])
                          : tx[key] || ""}
                      </td>
                    ))}
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
        </div>
      </div>
    </div>
  );
};

export default SalesregisterbyLinereport;
