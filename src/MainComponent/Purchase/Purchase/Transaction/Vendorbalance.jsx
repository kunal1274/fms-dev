import React, { useEffect, useState } from "react";
import axios from "axios";

const purchasesOrderUrl =
  "https://fms-qkmw.onrender.com/fms/api/v0/purchasesorders";

export default function VendorBalance() {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const response = await axios.get(purchasesOrderUrl);
        const purchaseOrders = response.data.data;

        const rows = purchaseOrders.map((order) => {
          const vendorId = order.vendor?.code || "N/A";
          const vendorName = order.vendor?.name || "N/A";
          const invoiceDate = order.createdAt;
          const invoiceNumber = order.invoiceNumber || order._id;
          const invoiceAmount = order.netAmtAfterTax || 0;
          const paymentPaid = order.totalPaid || 0;
          const balanceDue = order.netPaymentDue || 0;
          const dueDate = order.dueDate || "";
          const status = order.settlementStatus || "Unpaid";

          return {
            vendorId,
            vendorName,
            invoiceDate,
            invoiceNumber,
            invoiceAmount,
            paymentPaid,
            balanceDue,
            dueDate,
            status,
          };
        });

        setBalances(rows);
      } catch (err) {
        console.error("Error fetching vendor balances:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Vendor Balance Summary</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-[1200px] border border-gray-300 text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                {[
                  "Vendor ID / No",
                  "Vendor Name",
                  "Invoice Date",
                  "Invoice Number",
                  "Invoice Amount",
                  "Payment Paid",
                  "Balance Due",
                  "Due Date",
                  "Status",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="border px-3 py-2 text-left whitespace-nowrap"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {balances.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border px-3 py-1">{row.vendorId}</td>
                  <td className="border px-3 py-1">{row.vendorName}</td>
                  <td className="border px-3 py-1">
                    {new Date(row.invoiceDate).toLocaleDateString()}
                  </td>
                  <td className="border px-3 py-1">{row.invoiceNumber}</td>
                  <td className="border px-3 py-1">
                    {row.invoiceAmount.toFixed(2)}
                  </td>
                  <td className="border px-3 py-1">
                    {row.paymentPaid.toFixed(2)}
                  </td>
                  <td className="border px-3 py-1">
                    {row.balanceDue.toFixed(2)}
                  </td>
                  <td className="border px-3 py-1">
                    {row.dueDate
                      ? new Date(row.dueDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="border px-3 py-1">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
