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

  useEffect(() => {
    // Simulated API delay
    setTimeout(() => {
      setData([
        {
          itemId: "ITM001",
          itemName: "Steel Rod",
          itemCategory: "Raw Material",
          uom: "KG",
          siteId: "SITE001",
          warehouseId: "WH001",
          quantityOnHand: 1500,
          quantityReserved: 200,
          quantityAvailable: 1300,
          quantityInTransit: 500,
          quantityOnOrder: 1000,
          quantityAllocated: 100,
          unitCost: 50,
          inventoryValue: 75000,
          transactionDate: "2025-08-01",
          createdBy: "admin",
          updatedBy: "manager",
          batchNumber: "BATCH-2025-01",
          serialNumber: "",
          expiryDate: "",
          leadTimeDays: 7,
        },
        {
          itemId: "ITM002",
          itemName: "Copper Wire",
          itemCategory: "Raw Material",
          uom: "MTR",
          siteId: "SITE002",
          warehouseId: "WH002",
          quantityOnHand: 800,
          quantityReserved: 50,
          quantityAvailable: 750,
          quantityInTransit: 200,
          quantityOnOrder: 400,
          quantityAllocated: 25,
          unitCost: 120,
          inventoryValue: 96000,
          transactionDate: "2025-08-05",
          createdBy: "john",
          updatedBy: "admin",
          batchNumber: "BATCH-2025-02",
          serialNumber: "SR-45872",
          expiryDate: "",
          leadTimeDays: 10,
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) return <div className="mt-4 text-sm">Loading...</div>;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">
        Inventory Balance — On-hand Stock
      </h2>

      <table className="min-w-full border border-gray-300 text-xs">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {[
              "Item id",
              "Item name",
              "Item category",
              "Unit (UOM)",
              "Site id",
              "Warehouse id",
              "Quantity on hand",
              "Quantity reserved",
              "Quantity available",
              "Quantity in transit",
              "Quantity on order",
              "Quantity allocated",
              "Unit cost",
              "Inventory value",
              "Transaction date",
              "Created by",
              "Updated by",
              "Batch number",
              "Serial number",
              "Expiry date",
              "Lead time days",
            ].map((h) => (
              <th key={h} className="border px-2 py-1 text-left">
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{row.itemId}</td>
              <td className="border px-2 py-1">{row.itemName}</td>
              <td className="border px-2 py-1">{row.itemCategory}</td>
              <td className="border px-2 py-1">{row.uom}</td>
              <td className="border px-2 py-1">{row.siteId}</td>
              <td className="border px-2 py-1">{row.warehouseId}</td>
              <td className="border px-2 py-1">
                {numberFmt(row.quantityOnHand)}
              </td>
              <td className="border px-2 py-1">
                {numberFmt(row.quantityReserved)}
              </td>
              <td className="border px-2 py-1">
                {numberFmt(row.quantityAvailable)}
              </td>
              <td className="border px-2 py-1">
                {numberFmt(row.quantityInTransit)}
              </td>
              <td className="border px-2 py-1">
                {numberFmt(row.quantityOnOrder)}
              </td>
              <td className="border px-2 py-1">
                {numberFmt(row.quantityAllocated)}
              </td>
              <td className="border px-2 py-1">{numberFmt(row.unitCost)}</td>
              <td className="border px-2 py-1">
                {numberFmt(row.inventoryValue)}
              </td>
              <td className="border px-2 py-1">
                {dateFmt(row.transactionDate)}
              </td>
              <td className="border px-2 py-1">{row.createdBy}</td>
              <td className="border px-2 py-1">{row.updatedBy}</td>
              <td className="border px-2 py-1">{row.batchNumber}</td>
              <td className="border px-2 py-1">{row.serialNumber}</td>
              <td className="border px-2 py-1">{dateFmt(row.expiryDate)}</td>
              <td className="border px-2 py-1">{row.leadTimeDays}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
