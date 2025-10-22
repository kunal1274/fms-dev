import React, { useEffect, useMemo, useState } from "react";

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
  return Number.isNaN(d.getTime()) ? v : d.toISOString().slice(0, 10); // YYYY-MM-DD
};

export default function BankTransactionReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Keep headers + keys + optional formatter together (keys are camelCase!)
  const columns = [
    { key: "transactionId", label: "Txn ID" },
    { key: "transactionDate", label: "Txn Date", fmt: dateFmt },
    { key: "bankName", label: "Bank" },
    { key: "bankAccountNumber", label: "A/C No." },
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
    // Simulated API delay + realistic sample rows
    const t = setTimeout(() => {
      setData([
        {
          transactionId: "TXN-0001",
          transactionDate: "2025-08-05",
          bankName: "HDFC Bank",
          bankAccountNumber: "XXXXXX1234",
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
          transactionId: "TXN-0002",
          transactionDate: "2025-08-06",
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

  if (loading) return <div className="mt-4 text-sm">Loading...</div>;

  // figure out where the debit/credit columns are to build the footer colSpans
  const debitIdx = columns.findIndex((c) => c.key === "totalDebits");
  const creditIdx = columns.findIndex((c) => c.key === "totalCredits");
  const leftMostIdx =
    debitIdx === -1 && creditIdx === -1
      ? columns.length // no totals columns
      : Math.min(
          debitIdx === -1 ? Infinity : debitIdx,
          creditIdx === -1 ? Infinity : creditIdx
        );

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">Bank Balance Report</h2>

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
                {/* Span up to the first of Credits/Debits */}
                <td className="px-2 py-2 border-t" colSpan={leftMostIdx}>
                  Totals
                </td>

                {/* Render cells until we hit both credit & debit positions */}
                {columns.slice(leftMostIdx).map((c, i) => {
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
