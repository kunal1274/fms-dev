import React, { useEffect, useState } from "react";
import axios from "axios";

const SalesAccountingBalance = () => {
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
        setError("Failed to load sales accounting balance.");
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
      <h2 className="text-lg font-semibold mb-2">Sales Accounting Balance</h2>
      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-xs">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {[
                "Customer Code",
                "Customer Name",
                "Currency",
                "From Date",
                "To Date",
                "Opening Balance",
                "Total Sales Invoiced",
                "Payments Received",
                "Credit Notes",
                "Adjustments",
                "Closing Balance",
                "Overdue Amount",
                "Salesperson Name",
                "Order Id",
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
                <td className="border px-2 py-1">{row.customerCode}</td>
                <td className="border px-2 py-1">{row.customerName}</td>
                <td className="border px-2 py-1">{row.currency}</td>
                <td className="border px-2 py-1">{row.fromDate}</td>
                <td className="border px-2 py-1">{row.toDate}</td>
                <td className="border px-2 py-1">{row.openingBalance}</td>
                <td className="border px-2 py-1">{row.totalSalesInvoiced}</td>
                <td className="border px-2 py-1">{row.paymentsReceived}</td>
                <td className="border px-2 py-1">{row.creditNotes}</td>
                <td className="border px-2 py-1">{row.adjustments}</td>
                <td className="border px-2 py-1">{row.closingBalance}</td>
                <td className="border px-2 py-1">{row.overdueAmount}</td>
                <td className="border px-2 py-1">{row.salespersonName}</td>
                <td className="border px-2 py-1">{row.orderId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesAccountingBalance;

