import React, { useEffect, useState } from "react";
import axios from "axios";

const PurchaseMarginReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const salesOrderUrl = "https://fms-qkmw.onrender.com/fms/api/v0/salesorders";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(salesOrderUrl);
        setData(res.data?.data || []);
      } catch (err) {
        setError("Failed to load purchase margin report.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="mt-4 text-sm">Loading...</div>;
  if (error) return <div className="mt-4 text-sm text-red-600">{error}</div>;

  return (
    <div className="mt-8 overflow-x-auto">
      <h2 className="text-lg font-semibold mb-2">Purchase Margin Report</h2>
      <table className="min-w-full border border-gray-300 text-xs">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {[
              "Company Code",
              "Purchase Order Number",
              "Purchase Date",
              "Vendor Code",
              "Vendor Name",
              "Product Code",
              "Product Name",
              "Purchased Quantity",
              "Unit Cost",
              "Total Purchase Amount",
              "Standard Cost (COGS)",
              "Total Standard Cost (COGS)",
              "Gross Saving",
              "Saving Margin (%)",
              "Buyer Name",
              "Currency",
              "Invoice Number",
            ].map((heading) => (
              <th key={heading} className="border px-2 py-1 text-left">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            const qty = Number(row?.purchasedQuantity || 0);
            const unitCost = Number(row?.unitCost || 0);
            const standardCost = Number(row?.standardCost || 0);

            const totalPurchaseAmount = qty * unitCost;
            const totalStandardCost = qty * standardCost;
            const grossSaving = totalStandardCost - totalPurchaseAmount;
            const savingMargin =
              totalStandardCost > 0
                ? (grossSaving / totalStandardCost) * 100
                : 0;

            return (
              <tr
                key={idx}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="border px-2 py-1">{row?.companyCode || "-"}</td>
                <td className="border px-2 py-1">
                  {row?.purchaseOrderNumber || "-"}
                </td>
                <td className="border px-2 py-1">{row?.purchaseDate || "-"}</td>
                <td className="border px-2 py-1">{row?.vendorCode || "-"}</td>
                <td className="border px-2 py-1">{row?.vendorName || "-"}</td>
                <td className="border px-2 py-1">{row?.productCode || "-"}</td>
                <td className="border px-2 py-1">{row?.productName || "-"}</td>
                <td className="border px-2 py-1 text-right">{qty}</td>
                <td className="border px-2 py-1 text-right">
                  {unitCost.toFixed(2)}
                </td>
                <td className="border px-2 py-1 text-right">
                  {totalPurchaseAmount.toFixed(2)}
                </td>
                <td className="border px-2 py-1 text-right">
                  {standardCost.toFixed(2)}
                </td>
                <td className="border px-2 py-1 text-right">
                  {totalStandardCost.toFixed(2)}
                </td>
                <td className="border px-2 py-1 text-right">
                  {grossSaving.toFixed(2)}
                </td>
                <td className="border px-2 py-1 text-right">
                  {savingMargin.toFixed(2)}%
                </td>
                <td className="border px-2 py-1">{row?.buyerName || "-"}</td>
                <td className="border px-2 py-1">{row?.currency || "-"}</td>
                <td className="border px-2 py-1">
                  {row?.invoiceNumber || "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseMarginReport;
