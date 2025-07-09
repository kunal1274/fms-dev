import React, { useEffect, useState } from "react";
import axios from "axios";

const salesOrderUrl = "https://fms-qkmw.onrender.com/fms/api/v0/salesorders";

const CustomerBalance = () => {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const response = await axios.get(salesOrderUrl);
        const salesOrders = response.data.data;

        // Group sales by customer code
        const grouped = {};

        for (const order of salesOrders) {
          const customer = order.customer;
          const code = customer?.code || "UNKNOWN";

          if (!grouped[code]) {
            grouped[code] = {
              code,
              name: customer?.name || "",
              totalInvoice: 0,
              totalPaid: 0,
              balanceDue: 0,
              lastInvoiceDate: order.createdAt,
              status: order.settlementStatus,
            };
          }

          grouped[code].totalInvoice += order.netAmtAfterTax || 0;
          grouped[code].totalPaid += order.totalPaid || 0;
          grouped[code].balanceDue += order.netPaymentDue || 0;

          // Update latest invoice info
          if (
            new Date(order.createdAt) > new Date(grouped[code].lastInvoiceDate)
          ) {
            grouped[code].lastInvoiceDate = order.createdAt;
            grouped[code].status = order.settlementStatus;
          }
        }

        setBalances(Object.values(grouped));
      } catch (err) {
        console.error("Error fetching balances:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Customer Balance Summary</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {[
                "S.N",
                "Customer Code",
                "Customer Name",
                "Total Invoice Amount",
                "Total Paid",
                "Balance Due",
                "Last Invoice Date",
                "Status",
              ].map((heading) => (
                <th key={heading} className="border px-3 py-2 text-left">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {balances.map((row, index) => (
              <tr key={row.code}>
                <td className="border px-3 py-2">{index + 1}</td>
                <td className="border px-3 py-2">{row.code}</td>
                <td className="border px-3 py-2">{row.name}</td>
                <td className="border px-3 py-2">
                  {row.totalInvoice.toFixed(2)}
                </td>
                <td className="border px-3 py-2">{row.totalPaid.toFixed(2)}</td>
                <td className="border px-3 py-2">
                  {row.balanceDue.toFixed(2)}
                </td>
                <td className="border px-3 py-2">
                  {new Date(row.lastInvoiceDate).toLocaleDateString()}
                </td>
                <td className="border px-3 py-2">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CustomerBalance;
