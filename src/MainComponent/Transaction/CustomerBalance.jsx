// components/CustomerBalance.jsx
import React from "react";

const CustomerBalance = () => {
  const data = [
    {
      id: "CUST001",
      name: "John Doe",
      invoiceDate: "01-06-2025",
      invoiceNumber: "INV-1001",
      invoiceAmount: "$1320.00",
      paymentReceived: "$1320.00",
      balanceDue: "$0.00",
      dueDate: "01-07-2025",
      status: "Paid",
    },
  ];

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">Customer Balance</h2>
      <table className="min-w-full border border-gray-300 text-xs">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {[
              "Customer ID / No",
              "Customer Name",
              "Invoice Date",
              "Invoice Number",
              "Invoice Amount",
              "Payment Received",
              "Balance Due",
              "Due Date",
              "Status",
            ].map((heading) => (
              <th key={heading} className="border px-2 py-1 text-left">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{row.id}</td>
              <td className="border px-2 py-1">{row.name}</td>
              <td className="border px-2 py-1">{row.invoiceDate}</td>
              <td className="border px-2 py-1">{row.invoiceNumber}</td>
              <td className="border px-2 py-1">{row.invoiceAmount}</td>
              <td className="border px-2 py-1">{row.paymentReceived}</td>
              <td className="border px-2 py-1">{row.balanceDue}</td>
              <td className="border px-2 py-1">{row.dueDate}</td>
              <td className="border px-2 py-1">{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerBalance;
