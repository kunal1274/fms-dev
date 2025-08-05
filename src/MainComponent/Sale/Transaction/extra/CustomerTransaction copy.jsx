// components/CustomerTransaction.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const salesOrderUrl = "https://fms-qkmw.onrender.com/fms/api/v0/salesorders";

const tableHeaders = [
  "Transaction Type/ Name",
  "Reference ID",
  "Transaction ID",
  "Transaction Date",
  "Customer ID",
  "Customer Name",
  "Item/ Account Name",
  "Item No/ Account No",
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
  "Revenue",
  "Position Transaction",
  "Position Voucher",
  "Physical Transaction",
  "Physical Voucher",
  "Financial Transaction",
];

// Fallback dummy types for preview if no data is available
const transactionTypes = [
  "Sale order",
  "Sales returns",
  "Sales Debit note",
  "Sales Credit note",
  "Free tax invoice",
  "Free tax invoice debit note",
  "Free tax invoice Credit note",
  "Revenue Journals",
  "Reverse Revenue journal",
  "Customer Receipt",
  "Customer refunds",
  "All types of reversal from the above",
  "Correct/ cancel/ reverse",
];

const CustomerTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`${salesOrderUrl}`);
        setTransactions(response.data?.data || []);
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
          {transactions.length > 0
            ? transactions.map((tx, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border px-2 py-1">{tx.transactionType}</td>
                  <td className="border px-2 py-1">{tx.referenceId}</td>
                  <td className="border px-2 py-1">{tx.transactionId}</td>
                  <td className="border px-2 py-1">{tx.transactionDate}</td>
                  <td className="border px-2 py-1">{tx.customerId}</td>
                  <td className="border px-2 py-1">{tx.customerName}</td>
                  <td className="border px-2 py-1">{tx.itemName}</td>
                  <td className="border px-2 py-1">{tx.itemNumber}</td>
                  <td className="border px-2 py-1">{tx.quantity}</td>
                  <td className="border px-2 py-1">{tx.unitPrice}</td>
                  <td className="border px-2 py-1">{tx.discount}</td>
                  <td className="border px-2 py-1">{tx.taxAmount}</td>
                  <td className="border px-2 py-1">{tx.charges}</td>
                  <td className="border px-2 py-1">{tx.commission}</td>
                  <td className="border px-2 py-1">{tx.totalAmount}</td>
                  <td className="border px-2 py-1">{tx.paymentMethod}</td>
                  <td className="border px-2 py-1">{tx.paymentStatus}</td>
                  <td className="border px-2 py-1">{tx.orderStatus}</td>
                  <td className="border px-2 py-1">{tx.invoiceNumber}</td>
                  <td className="border px-2 py-1">{tx.revenue}</td>
                  <td className="border px-2 py-1">{tx.positionTransaction}</td>
                  <td className="border px-2 py-1">{tx.positionVoucher}</td>
                  <td className="border px-2 py-1">{tx.physicalTransaction}</td>
                  <td className="border px-2 py-1">{tx.physicalVoucher}</td>
                  <td className="border px-2 py-1">
                    {tx.financialTransaction}
                  </td>
                </tr>
              ))
            : transactionTypes.map((type, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{type}</td>
                  {[...Array(tableHeaders.length - 1)].map((_, i) => (
                    <td key={i} className="border px-2 py-1 text-gray-500" />
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTransaction;
