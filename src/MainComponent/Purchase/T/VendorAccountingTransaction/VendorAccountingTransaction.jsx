



import React, { useEffect, useState } from "react";
import axios from "axios";

const salesOrderUrl = "https://fms-qkmw.onrender.com/fms/api/v0/salesorders";

const SalesAccountingTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(salesOrderUrl);
        setTransactions(res.data?.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Failed to load transactions.");
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">
        Sales Accounting Transactions
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
              "Payment Received",
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
              Vendor,
              invoiceNumber,
              items = [],
              discount = 0,
              taxAmount = 0,
              total = 0,
              combinedPaid = 0,
              paymentMethod = "N/A",
              status = "Pending",
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
                <td className="border px-2 py-1">{Vendor?.code || "N/A"}</td>
                <td className="border px-2 py-1">{Vendor?.name || "N/A"}</td>
                <td className="border px-2 py-1">{invoiceNumber || "N/A"}</td>
                <td className="border px-2 py-1">{item.name || "N/A"}</td>
                <td className="border px-2 py-1">{quantity}</td>
                <td className="border px-2 py-1">{unitPrice}</td>
                <td className="border px-2 py-1">{subtotal}</td>
                <td className="border px-2 py-1">{discount}</td>
                <td className="border px-2 py-1">{taxPercent}</td>
                <td className="border px-2 py-1">{taxAmount}</td>
                <td className="border px-2 py-1">{total}</td>
                <td className="border px-2 py-1">{combinedPaid}</td>
                <td className="border px-2 py-1">{balanceDue}</td>
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

export default SalesAccountingTransaction;
