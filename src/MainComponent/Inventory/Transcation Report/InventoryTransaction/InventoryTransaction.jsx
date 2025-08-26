import React, { useEffect, useState } from "react";

const numberFmt = (v) =>
  typeof v === "number" && !Number.isNaN(v) ? v.toLocaleString() : v ?? "";

const dateFmt = (v) => {
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toISOString().slice(0, 10); // YYYY-MM-DD
};

export default function InventoryBalanceOnhandStock() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Column config keeps header labels and field keys together
  const columns = [
    { key: "transactionId", label: "TransactionID" },
    { key: "transactionDate", label: "TransactionDate", fmt: dateFmt },
    { key: "postingDate", label: "PostingDate", fmt: dateFmt },
    { key: "transactionType", label: "TransactionType" },
    { key: "referenceNo", label: "Reference No " },
    { key: "itemCode", label: "ItemCode" },
    { key: "itemName", label: "ItemName" },
    { key: "batchNumber", label: "BatchNumber" },
    { key: "serialNumber", label: "SerialNumber" },
    { key: "quantity", label: "Quantity", fmt: numberFmt },
    { key: "uom", label: "UnitOfMeasure" },
    { key: "unitCost", label: "UnitCost", fmt: numberFmt },
    {
      key: "totalCost",
      label: "TotalCost",
      fmt: (v, row) =>
        numberFmt(v ?? (row.quantity ?? 0) * (row.unitCost ?? 0)),
    },
    { key: "inboundWarehouse", label: "Inbond Warehouse" },
    { key: "outboundWarehouse", label: "Outbond Warehouse" },
    { key: "inboundSite", label: "Inbond Site" },
    { key: "outboundSite", label: "Outbond Site" },
    { key: "stockStatus", label: "StockStatus" },
    // If you intended a second type column, clarify the name; using "movementType" here
    { key: "movementType", label: "Transaction Type" },
  ];

  useEffect(() => {
    // Simulated API delay + realistic sample rows
    const t = setTimeout(() => {
      setData([
        {
          transactionId: "TXN-1001",
          transactionDate: "2025-08-01",
          postingDate: "2025-08-02",
          transactionType: "Receipt",
          referenceNo: "GRN-7781",
          itemCode: "ITM001",
          itemName: "Steel Rod",
          batchNumber: "BATCH-A1",
          serialNumber: "",
          quantity: 500,
          uom: "KG",
          unitCost: 62.5,
          // totalCost omitted intentionally to show fallback calc
          inboundWarehouse: "WH001",
          outboundWarehouse: "",
          inboundSite: "SITE001",
          outboundSite: "",
          stockStatus: "Available",
          movementType: "Inbound",
        },
        {
          transactionId: "TXN-1002",
          transactionDate: "2025-08-03",
          postingDate: "2025-08-03",
          transactionType: "Issue",
          referenceNo: "PROD-456",
          itemCode: "ITM001",
          itemName: "Steel Rod",
          batchNumber: "BATCH-A1",
          serialNumber: "",
          quantity: 120,
          uom: "KG",
          unitCost: 62.5,
          totalCost: 7500,
          inboundWarehouse: "",
          outboundWarehouse: "WH001",
          inboundSite: "",
          outboundSite: "SITE001",
          stockStatus: "Consumed",
          movementType: "Outbound",
        },
      ]);
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <div className="mt-4 text-sm">Loading...</div>;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">Inventory Transaction</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-xs">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="border px-2 py-1 text-left">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  className="border px-2 py-3 text-center text-gray-500"
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
                      <td key={c.key} className="border px-2 py-1">
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

