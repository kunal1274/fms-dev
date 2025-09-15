import React, { useEffect, useState } from "react";
import axios from "axios";

const purchasesOrderUrl =
  "https://fms-qkmw.onrender.com/fms/api/v0/purchasesorders";

export default function VendorBalance() {
  const [balances, setBalances] = useState([
    // ✅ Dummy Data
    {
      vendorId: "V001",
      vendorName: "ABC Traders",
      invoiceDate: new Date().toISOString(),
      invoiceNumber: "INV-1001",
      invoiceAmount: 1200.5,
      paymentPaid: 600.25,
      balanceDue: 600.25,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week later
      status: "Partially Paid",
    },
    {
      vendorId: "V002",
      vendorName: "XYZ Supplies",
      invoiceDate: new Date().toISOString(),
      invoiceNumber: "INV-1002",
      invoiceAmount: 800,
      paymentPaid: 0,
      balanceDue: 800,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks later
      status: "Unpaid",
    },
    {
      vendorId: "V003",
      vendorName: "LMN Enterprises",
      invoiceDate: new Date().toISOString(),
      invoiceNumber: "INV-1003",
      invoiceAmount: 500,
      paymentPaid: 500,
      balanceDue: 0,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days later
      status: "Paid",
    },
  ]);

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

        // ✅ Append API data without removing dummy data
        setBalances((prev) => [...prev, ...rows]);
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
