import React, { useEffect, useState } from "react";
import axios from "axios";

const purchasesOrderUrl =
  "https://fms-qkmw.onrender.com/fms/api/v0/purchasesorders";

export default function PurchasesAccountingTransaction() {
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

  const tableHeaders = [
    "Transaction Type/ Name",
    "Reference ID",
    "Transaction ID",
    "Transaction Date",
    "Vendor ID",
    "Vendor Name",
    "Item/ Account Name",
    "Item No/ Account no",
    "Quantity",
    "Unit Price",
    "Discount",
    "Tax Amount",
    "Charges",
    "Commission",
    "Total Amount",
    "Payment Method",
    "Payment Status",
    "Order Status",
    "Invoice Number",
    "Expense",
    "Position transaction",
    "Position voucher",
    "Physical transaction",
    "Physical voucher",
    "Financial Transaction",
  ];

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">
        Purchases Accounting Transactions
      </h2>

      {loading && <p className="text-sm">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-auto">
        <table className="min-w-[2000px] border border-gray-300 text-xs">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {tableHeaders.map((heading) => (
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
                referenceId = "",
                vendorId = "",
                vendorName = "",
                items = [],
                discount = 0,
                taxAmount = 0,
                charges = 0,
                commission = 0,
                total = 0,
                paymentMethod = "N/A",
                paymentStatus = "Pending",
                status = "Draft",
                invoiceNumber = "",
                expense = "",
              } = txn;

              const item = items[0] || {};
              const quantity = item.quantity || 0;
              const unitPrice = item.unitPrice || 0;
              const itemName = item.name || "Item";
              const itemCode = item.code || "Item Code";

              return (
                <tr key={idx}>
                  <td className="border px-2 py-1">Purchase Order</td>
                  <td className="border px-2 py-1">{referenceId}</td>
                  <td className="border px-2 py-1">{_id}</td>
                  <td className="border px-2 py-1">
                    {new Date(createdAt).toLocaleDateString()}
                  </td>
                  <td className="border px-2 py-1">{vendorId}</td>
                  <td className="border px-2 py-1">{vendorName}</td>
                  <td className="border px-2 py-1">{itemName}</td>
                  <td className="border px-2 py-1">{itemCode}</td>
                  <td className="border px-2 py-1">{quantity}</td>
                  <td className="border px-2 py-1">{unitPrice}</td>
                  <td className="border px-2 py-1">{discount}</td>
                  <td className="border px-2 py-1">{taxAmount}</td>
                  <td className="border px-2 py-1">{charges}</td>
                  <td className="border px-2 py-1">{commission}</td>
                  <td className="border px-2 py-1">{total}</td>
                  <td className="border px-2 py-1">{paymentMethod}</td>
                  <td className="border px-2 py-1">{paymentStatus}</td>
                  <td className="border px-2 py-1">{status}</td>
                  <td className="border px-2 py-1">{invoiceNumber}</td>
                  <td className="border px-2 py-1">{expense}</td>
                  <td className="border px-2 py-1">-</td>
                  <td className="border px-2 py-1">-</td>
                  <td className="border px-2 py-1">-</td>
                  <td className="border px-2 py-1">-</td>
                  <td className="border px-2 py-1">-</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
