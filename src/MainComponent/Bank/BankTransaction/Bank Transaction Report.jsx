import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const numberFmt = (v) =>
  typeof v === "number" && !Number.isNaN(v) ? v.toLocaleString() : v ?? "";

const moneyFmt = (v) =>
  typeof v === "number" && !Number.isNaN(v)
    ? v.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : v ?? "";

const dateFmt = (v) => {
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toISOString().slice(0, 10); // YYYY-MM-DD
};

export default function BankTransactionReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { key: "TransactionID", label: "Txn ID" },
    { key: "TransactionDate", label: "Txn Date", fmt: dateFmt },
    { key: "bankName", label: "Bank Name" },
    { key: "bankAccountNumber", label: "Bank A/C No." },
    { key: "transactionType", label: "Txn Type" },
    { key: "referenceNumber", label: "Reference No." },
    { key: "description", label: "Description" },
    { key: "partyName", label: "Party Name" },
    { key: "glAccount", label: "GL Account" },
    { key: "currencyCode", label: "Currency" },
    { key: "amount", label: "Amount", fmt: moneyFmt },
    { key: "debitAmount", label: "Debit", fmt: moneyFmt },
    { key: "creditAmount", label: "Credit", fmt: moneyFmt },
    { key: "openingBalance", label: "Opening Bal", fmt: moneyFmt },
    { key: "closingBalance", label: "Closing Bal", fmt: moneyFmt },
    { key: "transactionMode", label: "Mode" },
    { key: "status", label: "Status" },
    { key: "reconciliationStatus", label: "Reconciled" },
  ];

  useEffect(() => {
    const t = setTimeout(() => {
      setData([
        {
          transactionId: "TXN-0001",
          transactionDate: "2025-08-05",
          bankName: "HDFC Bank",
          bankAccountNumber: "XXXXXX1234",
          transactionType: "NEFT",
          referenceNumber: "NEFT987654",
          description: "Vendor payment — INV#445",
          partyName: "Acme Supplies",
          glAccount: "110201 — Bank HDFC",
          currencyCode: "INR",
          amount: -25000,
          debitAmount: 0,
          creditAmount: 25000,
          openingBalance: 500000,
          closingBalance: 475000,
          transactionMode: "Outhouse",
          status: "Posted",
          reconciliationStatus: "Yes",
        },
        {
          transactionId: "TXN-0002",
          transactionDate: "2025-08-06",
          bankName: "HDFC Bank",
          bankAccountNumber: "XXXXXX1234",
          transactionType: "IMPS",
          referenceNumber: "IMPS123456",
          description: "Customer receipt — REC#992",
          partyName: "Blue Moon Retail",
          glAccount: "110201 — Bank HDFC",
          currencyCode: "INR",
          amount: 18000,
          debitAmount: 18000,
          creditAmount: 0,
          openingBalance: 475000,
          closingBalance: 493000,
          transactionMode: "Inhouse",
          status: "Posted",
          reconciliationStatus: "No",
        },
      ]);
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  const totals = useMemo(() => {
    return data.reduce(
      (acc, r) => {
        acc.debit += Number(r.debitAmount || 0);
        acc.credit += Number(r.creditAmount || 0);
        return acc;
      },
      { debit: 0, credit: 0 }
    );
  }, [data]);

  // ✅ Export to Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const sheetData = [
      columns.map((c) => c.label),
      ...data.map((row) =>
        columns.map((c) => (c.fmt ? c.fmt(row[c.key]) : row[c.key]))
      ),
    ];
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(sheetData),
      "Bank Transactions"
    );
    XLSX.writeFile(wb, "Bank_Transaction_Report.xlsx");
  };

  // ✅ Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.text("Bank Transaction Report", 14, 10);
    const tableData = data.map((row) =>
      columns.map((c) => (c.fmt ? c.fmt(row[c.key]) : row[c.key]))
    );
    doc.autoTable({
      head: [columns.map((c) => c.label)],
      body: tableData,
      startY: 14,
      styles: { fontSize: 7 },
      theme: "grid",
      headStyles: { fillColor: [220, 220, 220] },
    });
    doc.save("Bank_Transaction_Report.pdf");
  };

  if (loading) return <div className="mt-4 text-sm">Loading...</div>;

  return (
    <div className="mt-8">
      {" "}
      <div className="flex items-center justify-between">
        {/* Title */}
        <h2 className="text-lg font-semibold mb-2">Bank Transaction Report</h2>

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
   
      <div className="overflow-x-auto rounded-lg border mt-2 border-gray-200">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="border-b px-2 py-2 text-left font-medium"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-2 py-3 text-center text-gray-500"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row.transactionId ?? idx}
                  className="odd:bg-white even:bg-gray-50"
                >
                  {columns.map((c) => {
                    const raw = row[c.key];
                    const value = c.fmt ? c.fmt(raw, row) : raw ?? "";
                    return (
                      <td key={c.key} className="px-2 py-2 border-b">
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>

          {data.length > 0 && (
            <tfoot>
              <tr className="bg-gray-100 font-semibold">
                <td
                  className="px-2 py-2 border-t"
                  colSpan={columns.findIndex((c) => c.key === "debitAmount")}
                >
                  Totals
                </td>
                <td className="px-2 py-2 border-t">{moneyFmt(totals.debit)}</td>
                <td className="px-2 py-2 border-t">
                  {moneyFmt(totals.credit)}
                </td>
                <td
                  className="px-2 py-2 border-t"
                  colSpan={
                    columns.length -
                    (columns.findIndex((c) => c.key === "creditAmount") + 1)
                  }
                />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
