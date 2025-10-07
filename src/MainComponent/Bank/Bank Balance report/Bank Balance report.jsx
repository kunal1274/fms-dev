import React, { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

/** ---------- formatters ---------- */
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
  return Number.isNaN(d.getTime()) ? v : d.toISOString().slice(0, 10);
};

export default function BankTransactionReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { key: "bankAccountNumber", label: "A/C No." },
    { key: "bankName", label: "Bank" },

    { key: "currencyCode", label: "Currency" },
    { key: "openingBalance", label: "Opening Bal.", fmt: moneyFmt },
    { key: "totalCredits", label: "Credits", fmt: moneyFmt },
    { key: "totalDebits", label: "Debits", fmt: moneyFmt },
    { key: "closingBalance", label: "Closing Bal.", fmt: moneyFmt },
    { key: "reconciledBalance", label: "Reconciled Bal.", fmt: moneyFmt },
    { key: "unreconciledAmount", label: "Unreconciled Amt.", fmt: moneyFmt },
    { key: "lastTransactionDate", label: "Last Txn", fmt: dateFmt },
    { key: "glAccount", label: "GL Account" },
    { key: "companyCode", label: "Company" },
  ];

  useEffect(() => {
    const t = setTimeout(() => {
      setData([
        {
          bankAccountNumber: "XXXXXX1234",
          bankName: "HDFC Bank",

          currencyCode: "INR",
          openingBalance: 250000.0,
          totalCredits: 125000.5,

          totalDebits: 95000.25,
          closingBalance: 280000.25,
          reconciledBalance: 279500.25,
          unreconciledAmount: 500.0,
          lastTransactionDate: "2025-08-07",
          glAccount: "110100 – Bank Main",
          companyCode: "ACME",
        },
        {
          bankName: "ICICI Bank",
          bankAccountNumber: "XXXXXX5678",
          currencyCode: "INR",
          openingBalance: 100000.0,
          totalCredits: 30000.0,
          totalDebits: 15000.0,
          closingBalance: 115000.0,
          reconciledBalance: 114500.0,
          unreconciledAmount: 500.0,
          lastTransactionDate: "2025-08-08",
          glAccount: "110101 – Bank Ops",
          companyCode: "ACME",
        },
      ]);
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  const totals = useMemo(() => {
    return data.reduce(
      (acc, r) => {
        acc.debit += Number(r.totalDebits || 0);
        acc.credit += Number(r.totalCredits || 0);
        return acc;
      },
      { debit: 0, credit: 0 }
    );
  }, [data]);

  /** ---------- Export Handlers ---------- */
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Bank Balance Report", 14, 15);

    const tableData = data.map((row) =>
      columns.map((c) => (c.fmt ? c.fmt(row[c.key]) : row[c.key] ?? ""))
    );

    doc.autoTable({
      startY: 20,
      head: [columns.map((c) => c.label)],
      body: tableData,
      styles: { fontSize: 8 },
    });

    // Totals row
    doc.text(
      `Total Credits: ${moneyFmt(totals.credit)} | Total Debits: ${moneyFmt(
        totals.debit
      )}`,
      14,
      doc.lastAutoTable.finalY + 10
    );

    doc.save("Bank_Balance_Report.pdf");
  };

  const handleExportExcel = () => {
    const worksheetData = [
      columns.map((c) => c.label),
      ...data.map((row) =>
        columns.map((c) => (c.fmt ? c.fmt(row[c.key]) : row[c.key] ?? ""))
      ),
      [],
      [
        "Totals",
        "",
        "",
        "",
        "",
        "",
        moneyFmt(totals.credit),
        moneyFmt(totals.debit),
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, "Bank_Balance_Report.xlsx");
  };

  if (loading) return <div className="mt-4 text-sm">Loading...</div>;

  const debitIdx = columns.findIndex((c) => c.key === "totalDebits");
  const creditIdx = columns.findIndex((c) => c.key === "totalCredits");
  const leftMostIdx =
    debitIdx === -1 && creditIdx === -1
      ? columns.length
      : Math.min(
          debitIdx === -1 ? Infinity : debitIdx,
          creditIdx === -1 ? Infinity : creditIdx
        );

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold mb-2">Bank Balance Report</h2>
        <div className="space-x-2">
          <button
            onClick={handleExportPDF}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-100"
          >
            Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-100"
          >
            Export Excel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
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
                  className="px-2 py-3 text-center text-gray-500"
                  colSpan={columns.length}
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

          {data.length > 0 && leftMostIdx < columns.length && (
            <tfoot>
              <tr className="bg-gray-100 font-semibold">
                <td className="px-2 py-2 border-t" colSpan={leftMostIdx}>
                  Totals
                </td>
                {columns.slice(leftMostIdx).map((c) => {
                  const isCredit = c.key === "totalCredits";
                  const isDebit = c.key === "totalDebits";
                  let content = "";
                  if (isDebit) content = moneyFmt(totals.debit);
                  if (isCredit) content = moneyFmt(totals.credit);
                  return (
                    <td key={c.key} className="px-2 py-2 border-t">
                      {content}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
