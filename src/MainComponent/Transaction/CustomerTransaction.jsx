// components/CustomerTransaction.jsx
import React from "react";

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
  return (
    <div className="overflow-auto">
      <h2 className="text-lg font-bold mb-2">Customer Transactions</h2>
      <table className="min-w-[2000px] border border-gray-300 text-xs">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {[
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
            ].map((heading) => (
              <th key={heading} className="border px-2 py-1 text-left">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactionTypes.map((type, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{type}</td>
              {[...Array(24)].map((_, i) => (
                <td key={i} className="border px-2 py-1 text-gray-500"></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTransaction;
