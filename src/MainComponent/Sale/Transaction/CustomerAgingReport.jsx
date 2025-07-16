import React, { useEffect, useState } from "react";
import axios from "axios";

const CustomerAgingReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const salesOrderUrl = "https://fms-qkmw.onrender.com/fms/api/v0/salesorders";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${salesOrderUrl}`);
        setData(res.data?.data || []);
      } catch (err) {
        setError("Failed to load aging report.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="mt-4 text-sm">Loading...</div>;
  if (error) return <div className="mt-4 text-sm text-red-600">{error}</div>;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">Customer Aging Report</h2>
      <table className="min-w-full border border-gray-300 text-xs">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {[
              "S/N",
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
              <td className="border px-2 py-1">{idx + 1}</td>
              <td className="border px-2 py-1">{row.customer?.code}</td>
              <td className="border px-2 py-1">{row.customer?.name}</td>
              <td className="border px-2 py-1">{row.invoiceNumber}</td>
              <td className="border px-2 py-1">{row.invoiceDate}</td>
              <td className="border px-2 py-1">{row.dueDate}</td>
              <td className="border px-2 py-1">{row.invoiceAmount}</td>
              <td className="border px-2 py-1">{row.paymentReceived}</td>
              <td className="border px-2 py-1">{row.balanceDue}</td>
              <td className="border px-2 py-1">{row.days_0_30}</td>
              <td className="border px-2 py-1">{row.days_31_60}</td>
              <td className="border px-2 py-1">{row.days_61_90}</td>
              <td className="border px-2 py-1">{row.days_90_plus}</td>
              <td className="border px-2 py-1">{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerAgingReport;
