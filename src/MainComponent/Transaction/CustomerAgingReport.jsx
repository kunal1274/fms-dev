// components/CustomerAgingReport.jsx
import React from "react";

const CustomerAgingReport = () => {
  const data = [
    {
      id: "CUST002",
      name: "Jane Smith",
      invoiceNumber: "INV-1002",
      invoiceDate: "02-06-2025",
      dueDate: "02-07-2025",
      invoiceAmount: "$892.50",
      paymentReceived: "$500.00",
      balanceDue: "$392.50",
      "0–30": "$392.50",
      "31–60": "$0.00",
      "61–90": "$0.00",
      "90+": "$0.00",
      status: "Partial",
    },
  ];

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">Customer Aging Report</h2>
      <table className="min-w-full border border-gray-300 text-xs">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {[
              "Customer ID",
              "Customer Name",
              "Invoice Number",
              "Invoice Date",
              "Due Date",
              "Invoice Amount",
              "Payment Received",
              "Balance Due",
              "0–30 Days",
              "31–60 Days",
              "61–90 Days",
              "90+ Days",
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
              {Object.values(row).map((val, i) => (
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

export default CustomerAgingReport;

