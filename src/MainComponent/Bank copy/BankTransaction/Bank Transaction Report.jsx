import React, { useEffect, useMemo, useState } from "react";

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

  // Keep headers + keys + optional formatter together
  const columns = [
    { key: "transactionId", label: "Txn ID" },
    { key: "transactionDate", label: "Txn Date", fmt: dateFmt },
    { key: "bankName", label: "Bank Name" },
    { key: "bankAccountNumber", label: "Bank A/C No." },
    { key: "transactionType", label: "Txn Type" }, // e.g., NEFT/IMPS/Cash
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
    { key: "transactionMode", label: "Mode" }, // Inhouse/Outhouse/etc.
    { key: "status", label: "Status" }, // Posted/Pending/etc.
    { key: "reconciliationStatus", label: "Reconciled" }, // Yes/No/Partial
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

  if (loading) return <div className="mt-4 text-sm">Loading...</div>;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">Bank Transaction Report</h2>

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

          {data.length > 0 && (
            <tfoot>
              <tr className="bg-gray-100 font-semibold">
                {/* Span up to the Debit column index */}
                <td
                  className="px-2 py-2 border-t"
                  colSpan={columns.findIndex((c) => c.key === "debitAmount")}
                >
                  Totals
                </td>
                {/* Debit */}
                <td className="px-2 py-2 border-t">{moneyFmt(totals.debit)}</td>
                {/* Credit */}
                <td className="px-2 py-2 border-t">
                  {moneyFmt(totals.credit)}
                </td>
                {/* Fill remaining footer cells */}
                <td
                  className="px-2 py-2 border-t"
                  colSpan={
                    columns.length -
                    (columns.findIndex((c) => c.key === "creditAmount") + 1)
                  }
                >
                  {/* empty */}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
