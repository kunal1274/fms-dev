import React, { useState } from "react";

const SalesAccountingBalance = () => {
  // Dummy data only
  const dummyData = [
    {
      customerCode: "CUST001",
      customerName: "ABC Traders",
      currency: "USD",
      fromDate: "2023-01-01",
      toDate: "2023-12-31",
      openingBalance: 5000,
      totalSalesInvoiced: 12000,
      paymentsReceived: 8000,
      creditNotes: 1000,
      adjustments: -500,
      overdueAmount: 2000,
      salespersonName: "John Doe",
      orderId: "ORD-1001",
    },
    {
      customerCode: "CUST002",
      customerName: "XYZ Supplies",
      currency: "EUR",
      fromDate: "2023-01-01",
      toDate: "2023-12-31",
      openingBalance: 3000,
      totalSalesInvoiced: 9000,
      paymentsReceived: 6000,
      creditNotes: 500,
      adjustments: 100,
      overdueAmount: 1500,
      salespersonName: "Jane Smith",
      orderId: "ORD-1002",
    },
    {
      customerCode: "CUST003",
      customerName: "Global Tech",
      currency: "GBP",
      fromDate: "2023-01-01",
      toDate: "2023-12-31",
      openingBalance: 10000,
      totalSalesInvoiced: 25000,
      paymentsReceived: 20000,
      creditNotes: 2000,
      adjustments: 500,
      overdueAmount: 3000,
      salespersonName: "Michael Lee",
      orderId: "ORD-1003",
    },
  ];

  const [data] = useState(dummyData);

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">Sales Accounting Balance</h2>
      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-xs">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {[
                "Customer Code",
                "Customer Name",
                "Currency",
                "From Date",
                "To Date",
                "Opening Balance",
                "Total Sales Invoiced",
                "Payments Received",
                "Credit Notes",
                "Adjustments",
                "Closing Balance",
                "Overdue Amount",
                "Salesperson Name",
                "Order Id",
              ].map((heading, index) => (
                <th key={index} className="border px-2 py-1 text-left">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              // Compute closing balance using formula
              const closingBalance =
                (Number(row.openingBalance) || 0) +
                (Number(row.totalSalesInvoiced) || 0) -
                (Number(row.paymentsReceived) || 0) -
                (Number(row.creditNotes) || 0) +
                (Number(row.adjustments) || 0);

              return (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border px-2 py-1">{row.customerCode}</td>
                  <td className="border px-2 py-1">{row.customerName}</td>
                  <td className="border px-2 py-1">{row.currency}</td>
                  <td className="border px-2 py-1">{row.fromDate}</td>
                  <td className="border px-2 py-1">{row.toDate}</td>
                  <td className="border px-2 py-1">{row.openingBalance}</td>
                  <td className="border px-2 py-1">{row.totalSalesInvoiced}</td>
                  <td className="border px-2 py-1">{row.paymentsReceived}</td>
                  <td className="border px-2 py-1">{row.creditNotes}</td>
                  <td className="border px-2 py-1">{row.adjustments}</td>
                  <td className="border px-2 py-1 font-medium">
                    {closingBalance}
                  </td>
                  <td className="border px-2 py-1">{row.overdueAmount}</td>
                  <td className="border px-2 py-1">{row.salespersonName}</td>
                  <td className="border px-2 py-1">{row.orderId}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesAccountingBalance;
