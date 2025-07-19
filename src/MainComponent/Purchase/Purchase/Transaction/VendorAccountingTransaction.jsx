import React, { useEffect, useState } from "react";
import axios from "axios";

const purchasesOrderUrl =
  "https://fms-qkmw.onrender.com/fms/api/v0/purchasesorders";

const PurchasesAccountingTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(purchasesOrderUrl);
        setTransactions(res.data?.data || []);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">
        Vendor Accounting Transaction
      </h2>

      {loading && <p className="text-sm">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <table className="min-w-[1500px] border border-gray-300 text-xs">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {[
              "Transaction ID",
              "Date",
              "Vendor ID",
              "Vendor Name",
              "Invoice Number",
              "Product/Service",
              "Quantity",
              "Unit Price",
              "Subtotal",
              "Discount",
              "Tax (%)",
              "Tax Amount",
              "Total Amount",
              "Payment Made",
              "Balance Due",
              "Payment Method",
              "Status",
            ].map((heading) => (
              <th
                key={heading}
                className="border px-2 py-1 text-left whitespace-nowrap"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn, idx) => {
            const {
              _id,
              createdAt,
              vendor,
              invoiceNumber,
              items = [],
              discount = 0,
              taxAmount = 0,
              total = 0,
              combinedPaid = 0,
              paymentMethod = "N/A",
              status = "Unpaid",
            } = txn;

            const item = items[0] || {};
            const quantity = item.quantity || 0;
            const unitPrice = item.unitPrice || 0;
            const subtotal = quantity * unitPrice;
            const balanceDue = total - combinedPaid;
            const taxPercent = item.taxPercent || 0;

            return (
              <tr key={idx}>
                <td className="border px-2 py-1">{_id}</td>
                <td className="border px-2 py-1">
                  {new Date(createdAt).toLocaleDateString()}
                </td>
                <td className="border px-2 py-1">{vendor?.code || "N/A"}</td>
                <td className="border px-2 py-1">{vendor?.name || "N/A"}</td>
                <td className="border px-2 py-1">{invoiceNumber || "N/A"}</td>
                <td className="border px-2 py-1">{item.name || "N/A"}</td>
                <td className="border px-2 py-1">{quantity}</td>
                <td className="border px-2 py-1">{unitPrice}</td>
                <td className="border px-2 py-1">{subtotal.toFixed(2)}</td>
                <td className="border px-2 py-1">{discount}</td>
                <td className="border px-2 py-1">{taxPercent}</td>
                <td className="border px-2 py-1">{taxAmount}</td>
                <td className="border px-2 py-1">{total.toFixed(2)}</td>
                <td className="border px-2 py-1">{combinedPaid.toFixed(2)}</td>
                <td className="border px-2 py-1">{balanceDue.toFixed(2)}</td>
                <td className="border px-2 py-1">{paymentMethod}</td>
                <td className="border px-2 py-1">{status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PurchasesAccountingTransaction;
