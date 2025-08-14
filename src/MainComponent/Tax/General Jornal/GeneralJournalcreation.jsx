import React, { useMemo, useState } from "react";

/** small helpers */
const fmtMoney = (v) => (Number.isFinite(+v) ? (+v).toFixed(2) : "0.00");

const SummaryCard = ({ label, value }) => (
  <div className="flex flex-col rounded-lg border bg-white p-3">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-lg font-semibold text-gray-800">{value}</span>
  </div>
);

const emptyHeader = {
  journalCode: "",
  creationDate: "",
  journalName: "",
  description: "",
  currency: "INR",
  postingPeriod: "", // yyyy-mm
  status: "Draft",
  postingDate: "",
  taxCode: "GST18",
  invoiceNumber: "",
  postedDate: "",
  approvalStatus: "Pending",
  approvalAmount: 0,
};

const emptyRow = {
  serialNo: "",
  account: "",
  accountId: "",
  name: "",
  description: "",
  debit: "",
  credit: "",
  postingAccountNo: "",
  postingAccount: "",
  tax: "",
  tdsTcs: "",
  totalAmount: "",
};

const Jornalcreation = () => {
  /** header + lines */
  const [header, setHeader] = useState(emptyHeader);
  const [rows, setRows] = useState([{ ...emptyRow }]);

  /** handlers */
  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleRowChange = (idx, name, value) => {
    setRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [name]: value };
      return next;
    });
  };

  const addRow = () => setRows((prev) => [...prev, { ...emptyRow }]);
  const removeRow = (idx) =>
    setRows((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)
    );

  /** derived totals */
  const {
    totalDebit,
    totalCredit,
    totalTax,
    totalTdsTcs,
    totalLineAmount,
    balanced,
  } = useMemo(() => {
    let d = 0,
      c = 0,
      tx = 0,
      tds = 0,
      line = 0;

    rows.forEach((r) => {
      d += Number(r.debit) || 0;
      c += Number(r.credit) || 0;
      tx += Number(r.tax) || 0;
      tds += Number(r.tdsTcs) || 0;
      line += Number(r.totalAmount) || 0;
    });

    return {
      totalDebit: d,
      totalCredit: c,
      totalTax: tx,
      totalTdsTcs: tds,
      totalLineAmount: line,
      balanced: Math.abs(d - c) < 0.005,
    };
  }, [rows]);

  /** what to show as "Total Amount" in summary */
  const computedTotalAmount = useMemo(() => {
    // choose what “Total Amount” means: here we show the sum of line totals
    return totalLineAmount;
  }, [totalLineAmount]);

  return (
    <>
      {/* Header table */}
      <section className="p-6">
        <div className="max-h-96 overflow-y-auto mt-4 border rounded-lg bg-white">
          <div className="space-y-6 p-4">
            <table className="min-w-full border-collapse text-sm text-gray-700">
              <thead className="bg-gray-100 text-gray-900 uppercase text-xs font-semibold sticky top-0 z-10">
                <tr>
                  {[
                    "Journal Code",
                    "Creation Date",
                    "Journal Name",
                    "Description",
                    "Currency",
                    "Posting Period",
                    "Status",
                    "Posting Date",
                  ].map((header, index) => (
                    <th
                      key={index}
                      className="border border-gray-300 px-2 py-1 text-center"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  {/* Journal Code */}
                  <td className="border px-2 py-1">
                    <input
                      name="journalCode"
                      type="text"
                      className="w-full border rounded text-center px-2 py-1"
                      placeholder="JRNL-0001"
                      value={header.journalCode}
                      onChange={handleHeaderChange}
                    />
                  </td>

                  {/* Creation Date */}
                  <td className="border px-2 py-1">
                    <input
                      name="creationDate"
                      type="date"
                      className="w-full border rounded text-center px-2 py-1"
                      value={header.creationDate}
                      onChange={handleHeaderChange}
                    />
                  </td>

                  {/* Journal Name */}
                  <td className="border px-2 py-1">
                    <input
                      name="journalName"
                      type="text"
                      className="w-full border rounded text-center px-2 py-1"
                      placeholder="General Journal"
                      value={header.journalName}
                      onChange={handleHeaderChange}
                    />
                  </td>

                  {/* Description */}
                  <td className="border px-2 py-1">
                    <input
                      name="description"
                      type="text"
                      className="w-full border rounded text-center px-2 py-1"
                      placeholder="Optional description"
                      value={header.description}
                      onChange={handleHeaderChange}
                    />
                  </td>

                  {/* Currency */}
                  <td className="border px-2 py-1">
                    <input
                      name="currency"
                      type="text"
                      className="w-full border rounded text-center px-2 py-1"
                      placeholder="INR"
                      value={header.currency}
                      onChange={handleHeaderChange}
                    />
                  </td>

                  {/* Posting Period */}
                  <td className="border px-2 py-1">
                    <input
                      name="postingPeriod"
                      type="month"
                      className="w-full border rounded text-center px-2 py-1"
                      value={header.postingPeriod}
                      onChange={handleHeaderChange}
                    />
                  </td>

                  {/* Status */}
                  <td className="border px-2 py-1">
                    <select
                      name="status"
                      className="w-full border rounded text-center px-2 py-1"
                      value={header.status}
                      onChange={handleHeaderChange}
                    >
                      <option>Draft</option>
                      <option>Posted</option>
                      <option>Cancelled</option>
                    </select>
                  </td>

                  {/* Posting Date */}
                  <td className="border px-2 py-1">
                    <input
                      name="postingDate"
                      type="date"
                      className="w-full border rounded text-center px-2 py-1"
                      value={header.postingDate}
                      onChange={handleHeaderChange}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Optional extra header fields row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border-t bg-gray-50">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Tax Code
              </label>
              <input
                name="taxCode"
                type="text"
                className="w-full border rounded px-2 py-1 text-sm"
                value={header.taxCode}
                onChange={handleHeaderChange}
                placeholder="GST18"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Invoice Number
              </label>
              <input
                name="invoiceNumber"
                type="text"
                className="w-full border rounded px-2 py-1 text-sm"
                value={header.invoiceNumber}
                onChange={handleHeaderChange}
                placeholder="INV-0001"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Posted Date
              </label>
              <input
                name="postedDate"
                type="date"
                className="w-full border rounded px-2 py-1 text-sm"
                value={header.postedDate}
                onChange={handleHeaderChange}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Approval Status
              </label>
              <select
                name="approvalStatus"
                className="w-full border rounded px-2 py-1 text-sm"
                value={header.approvalStatus}
                onChange={handleHeaderChange}
              >
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs text-gray-500 mb-1">
                Approval Amount
              </label>
              <input
                name="approvalAmount"
                type="number"
                className="w-full border rounded px-2 py-1 text-sm"
                value={header.approvalAmount}
                onChange={handleHeaderChange}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Lines table */}
      <section className="p-6">
        <div className="max-h-96 overflow-y-auto mt-4 border rounded-lg bg-white">
          <div className="space-y-6 p-4">
            <table className="min-w-full border-collapse text-sm text-gray-700">
              <thead className="bg-gray-100 text-gray-900 uppercase text-xs font-semibold sticky top-0 z-10">
                <tr>
                  {[
                    "S.No",
                    "Account",
                    "Account ID",
                    "Name",
                    "Description",
                    "Debit",
                    "Credit",
                    "Posting Account No.",
                    "Posting Account",
                    "Tax",
                    "TDS/TCS",
                    "Total Amount",
                    "Actions",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className="border border-gray-300 px-2 py-1 text-center"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {rows.map((r, idx) => (
                  <tr className="hover:bg-gray-50" key={idx}>
                    {/* S.No */}
                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        name="serialNo"
                        className="w-full border rounded text-center px-2 py-1"
                        value={r.serialNo}
                        onChange={(e) =>
                          handleRowChange(idx, "serialNo", e.target.value)
                        }
                      />
                    </td>

                    {/* Account */}
                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        name="account"
                        className="w-full border rounded text-center px-2 py-1"
                        value={r.account}
                        onChange={(e) =>
                          handleRowChange(idx, "account", e.target.value)
                        }
                      />
                    </td>

                    {/* Account ID */}
                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        name="accountId"
                        className="w-full border rounded text-center px-2 py-1"
                        value={r.accountId}
                        onChange={(e) =>
                          handleRowChange(idx, "accountId", e.target.value)
                        }
                      />
                    </td>

                    {/* Name */}
                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        name="name"
                        className="w-full border rounded text-center px-2 py-1"
                        value={r.name}
                        onChange={(e) =>
                          handleRowChange(idx, "name", e.target.value)
                        }
                      />
                    </td>

                    {/* Description */}
                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        name="description"
                        className="w-full border rounded text-center px-2 py-1"
                        value={r.description}
                        onChange={(e) =>
                          handleRowChange(idx, "description", e.target.value)
                        }
                      />
                    </td>

                    {/* Debit */}
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        name="debit"
                        className="w-full border rounded text-center px-2 py-1"
                        value={r.debit}
                        onChange={(e) =>
                          handleRowChange(idx, "debit", e.target.value)
                        }
                      />
                    </td>

                    {/* Credit */}
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        name="credit"
                        className="w-full border rounded text-center px-2 py-1"
                        value={r.credit}
                        onChange={(e) =>
                          handleRowChange(idx, "credit", e.target.value)
                        }
                      />
                    </td>

                    {/* Posting Account No. */}
                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        name="postingAccountNo"
                        className="w-full border rounded text-center px-2 py-1"
                        value={r.postingAccountNo}
                        onChange={(e) =>
                          handleRowChange(
                            idx,
                            "postingAccountNo",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    {/* Posting Account */}
                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        name="postingAccount"
                        className="w-full border rounded text-center px-2 py-1"
                        value={r.postingAccount}
                        onChange={(e) =>
                          handleRowChange(idx, "postingAccount", e.target.value)
                        }
                      />
                    </td>

                    {/* Tax */}
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        name="tax"
                        className="w-full border rounded text-center px-2 py-1"
                        value={r.tax}
                        onChange={(e) =>
                          handleRowChange(idx, "tax", e.target.value)
                        }
                      />
                    </td>

                    {/* TDS/TCS */}
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        name="tdsTcs"
                        className="w-full border rounded text-center px-2 py-1"
                        value={r.tdsTcs}
                        onChange={(e) =>
                          handleRowChange(idx, "tdsTcs", e.target.value)
                        }
                      />
                    </td>

                    {/* Total Amount */}
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        name="totalAmount"
                        className="w-full border rounded text-center px-2 py-1"
                        value={r.totalAmount}
                        onChange={(e) =>
                          handleRowChange(idx, "totalAmount", e.target.value)
                        }
                      />
                    </td>

                    {/* Actions */}
                    <td className="border px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        className="px-2 py-1 text-xs rounded border"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={addRow}
                className="rounded border px-3 py-1 text-sm"
              >
                + Add Line
              </button>
              {!balanced && (
                <span className="text-xs text-red-600">
                  Not balanced: Debit {fmtMoney(totalDebit)} vs Credit{" "}
                  {fmtMoney(totalCredit)}
                </span>
              )}
              {balanced && rows.length > 0 && (totalDebit || totalCredit) ? (
                <span className="text-xs text-green-700">Balanced ✓</span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg mt-4">
          <SummaryCard label="Tax Code" value={header.taxCode || "-"} />
          <SummaryCard
            label="Total Tax Amount / Line Amount"
            value={`${fmtMoney(totalTax)} / ${fmtMoney(totalLineAmount)}`}
          />
          <SummaryCard
            label="Invoice Number"
            value={header.invoiceNumber || "-"}
          />
          <SummaryCard label="Posted Date" value={header.postedDate || "-"} />
          <SummaryCard
            label="Approval Status"
            value={header.approvalStatus || "-"}
          />
          <SummaryCard
            label="Total Amount (Lines Sum)"
            value={fmtMoney(computedTotalAmount)}
          />
          <SummaryCard
            label="Approval Amount"
            value={fmtMoney(header.approvalAmount)}
          />
          <SummaryCard
            label="Debit / Credit"
            value={`${fmtMoney(totalDebit)} / ${fmtMoney(totalCredit)}`}
          />
        </div>
      </section>
    </>
  );
};

export default Jornalcreation;
