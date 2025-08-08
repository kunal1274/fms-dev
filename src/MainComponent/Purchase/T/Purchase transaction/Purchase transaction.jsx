import React, { useEffect, useState } from "react";
import axios from "axios";

const transactionTypes = [
  "Purchase Order",
  "Purchase Return",
  "PurchaseDebit note",
  "Purchase Credit note",
  "Vendor Payment",
  "Purchase Invoice",
  "Reverse Journals",
  "Revenue Journals",
  "Refunds or Adjustments",
  "Correct/ cancel/ reverse",

];

const tableHeaders = [
  "Referance ID",

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
  "Position Transaction",
  "Position Voucher",
  "Physical Transaction",
  "Physical Voucher",
  "Financial Transaction",
];

const formatCurrency = (num) =>
  Number(num || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-IN") : "";

const CustomerTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const salesOrderUrl = "https://fms-qkmw.onrender.com/fms/api/v0/salesorders";

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`${salesOrderUrl}/transactions`);
        setTransactions(res.data?.data || []);
      } catch (err) {
        setError("Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="overflow-auto mt-4">
      <h2 className="text-lg font-bold mb-2">Customer Transactions</h2>

      {loading && <p className="text-sm">Loading...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <table className="min-w-[2000px] border border-gray-300 text-xs">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {tableHeaders.map((heading) => (
              <th key={heading} className="border px-2 py-1 text-left">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? (
            transactions.map((tx, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border px-2 py-1">{idx + 1}</td>
                <td className="border px-2 py-1">{tx.transactionType}</td>
                <td className="border px-2 py-1">{tx.referenceId}</td>
                <td className="border px-2 py-1">{tx.transactionId}</td>
                <td className="border px-2 py-1">
                  {formatDate(tx.transactionDate)}
                </td>
                <td className="border px-2 py-1">{tx.customerId}</td>
                <td className="border px-2 py-1">{tx.customerName}</td>
                <td className="border px-2 py-1">{tx.itemName}</td>
                <td className="border px-2 py-1">{tx.itemNumber}</td>
                <td className="border px-2 py-1">{tx.quantity}</td>
                <td className="border px-2 py-1">
                  {formatCurrency(tx.unitPrice)}
                </td>
                <td className="border px-2 py-1">
                  {formatCurrency(tx.discount)}
                </td>
                <td className="border px-2 py-1">
                  {formatCurrency(tx.taxAmount)}
                </td>
                <td className="border px-2 py-1">
                  {formatCurrency(tx.charges)}
                </td>
                <td className="border px-2 py-1">
                  {formatCurrency(tx.commission)}
                </td>
                <td className="border px-2 py-1">
                  {formatCurrency(tx.totalAmount)}
                </td>
                <td className="border px-2 py-1">{tx.paymentMethod}</td>
                <td className="border px-2 py-1">{tx.paymentStatus}</td>
                <td className="border px-2 py-1">{tx.orderStatus}</td>
                <td className="border px-2 py-1">{tx.invoiceNumber}</td>
                <td className="border px-2 py-1">
                  {formatCurrency(tx.revenue)}
                </td>
                <td className="border px-2 py-1">{tx.positionTransaction}</td>
                <td className="border px-2 py-1">{tx.positionVoucher}</td>
                <td className="border px-2 py-1">{tx.physicalTransaction}</td>
                <td className="border px-2 py-1">{tx.physicalVoucher}</td>
                <td className="border px-2 py-1">{tx.financialTransaction}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={tableHeaders.length} className="text-center p-2">
                No transactions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTransaction;
