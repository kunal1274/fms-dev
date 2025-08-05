import React, { useEffect, useState } from "react";
import axios from "axios";

const Salemarginereport = () => {
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
        setError("Failed to load sales margin report.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="mt-4 text-sm">Loading...</div>;
  if (error) return <div className="mt-4 text-sm text-red-600">{error}</div>;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">Sales Margin Report</h2>
      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-xs">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {[
                "Company code",
                "Sales Order Number",
                "Sales Date",
                "Customer Code",
                "Customer Name",
                "Product Code",
                "Product Name",
                "Sold Quantity",
                "Unit Price",
                "Total Sales Amount",
                "Unit Cost (COGS)",
                "Total Cost (COGS)",
                "Gross Profit",
                "Gross Margin (%)",
                "Salesperson Name",
                "Currency",
                "Invoice Number",
              ].map((heading, index) => (
                <th key={index} className="border px-2 py-1 text-left">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border px-2 py-1">{row.companyCode}</td>
                <td className="border px-2 py-1">{row.salesOrderNumber}</td>
                <td className="border px-2 py-1">{row.salesDate}</td>
                <td className="border px-2 py-1">{row.customerCode}</td>
                <td className="border px-2 py-1">{row.customerName}</td>
                <td className="border px-2 py-1">{row.productCode}</td>
                <td className="border px-2 py-1">{row.productName}</td>
                <td className="border px-2 py-1">{row.soldQuantity}</td>
                <td className="border px-2 py-1">{row.unitPrice}</td>
                <td className="border px-2 py-1">{row.totalSalesAmount}</td>
                <td className="border px-2 py-1">{row.unitCost}</td>
                <td className="border px-2 py-1">{row.totalCost}</td>
                <td className="border px-2 py-1">
                  {(row.totalSalesAmount - row.totalCost).toFixed(2)}
                </td>
                <td className="border px-2 py-1">
                  {row.totalSalesAmount
                    ? (
                        ((row.totalSalesAmount - row.totalCost) /
                          row.totalSalesAmount) *
                        100
                      ).toFixed(2) + "%"
                    : "0%"}
                </td>
                <td className="border px-2 py-1">{row.salespersonName}</td>
                <td className="border px-2 py-1">{row.currency}</td>
                <td className="border px-2 py-1">{row.invoiceNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Salemarginereport;
