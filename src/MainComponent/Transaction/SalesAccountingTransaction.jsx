// components/SalesAccountingTransaction.jsx
import React from "react";

const transactions = [
  {
    id: "TXN-0001",
    date: "01-06-2025",
    customerId: "CUST001",
    customerName: "John Doe",
    invoiceNumber: "INV-1001",
    product: "Website Design",
    quantity: "1",
    unitPrice: "$1,200.00",
    subtotal: "$1,200.00",
    discount: "$0.00",
    tax: "10%",
    taxAmount: "$120.00",
    total: "$1,320.00",
    paid: "$1,320.00",
    balance: "$0.00",
    method: "Bank Transfer",
    status: "Paid",
  },
  {
    id: "TXN-0002",
    date: "02-06-2025",
    customerId: "CUST002",
    customerName: "Jane Smith",
    invoiceNumber: "INV-1002",
    product: "Software License",
    quantity: "3",
    unitPrice: "$300.00",
    subtotal: "$900.00",
    discount: "$50.00",
    tax: "5%",
    taxAmount: "$42.50",
    total: "$892.50",
    paid: "$500.00",
    balance: "$392.50",
    method: "Credit Card",
    status: "Partial",
  },
];

const SalesAccountingTransaction = () => {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">Sales Accounting Transactions</h2>
      <table className="min-w-[1500px] border border-gray-300 text-xs">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {[
              "Transaction ID",
              "Date",
              "Customer ID",
              "Customer Name",
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
              <th key={heading} className="border px-2 py-1 text-left whitespace-nowrap">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn, idx) => (
            <tr key={idx}>
              {Object.values(txn).map((val, i) => (
                <td key={i} className="border px-2 py-1">
                  {val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesAccountingTransaction;

