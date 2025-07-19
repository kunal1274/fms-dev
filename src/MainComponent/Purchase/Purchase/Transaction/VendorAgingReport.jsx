import React, { useEffect, useState } from "react";
import axios from "axios";

const VendorAgingReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const purchasesOrderUrl =
    "https://fms-qkmw.onrender.com/fms/api/v0/purchasesorders";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(purchasesOrderUrl);
        setData(res.data?.data || []);
      } catch (err) {
        setError("Failed to load aging report.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN");
  };

  const formatAmount = (amt) =>
    amt != null ? parseFloat(amt).toFixed(2) : "-";

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "text-green-600";
      case "partial":
        return "text-yellow-600";
      case "unpaid":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) return <div className="mt-4 text-sm">Loading...</div>;
  if (error) return <div className="mt-4 text-sm text-red-600">{error}</div>;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">Vendor Aging Report</h2>
      <table className="min-w-full border border-gray-300 text-xs">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {[
              "S/N",
              "Vendor ID",
              "Vendor Name",
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
              <td className="border px-2 py-1">{row.Vendor?.code || "-"}</td>
              <td className="border px-2 py-1">{row.Vendor?.name || "-"}</td>
              <td className="border px-2 py-1">{row.invoiceNumber || "-"}</td>
              <td className="border px-2 py-1">
                {formatDate(row.invoiceDate)}
              </td>
              <td className="border px-2 py-1">{formatDate(row.dueDate)}</td>
              <td className="border px-2 py-1">
                {formatAmount(row.invoiceAmount)}
              </td>
              <td className="border px-2 py-1">
                {formatAmount(row.paymentReceived)}
              </td>
              <td className="border px-2 py-1">
                {formatAmount(row.balanceDue)}
              </td>
              <td className="border px-2 py-1">
                {formatAmount(row.days_0_30)}
              </td>
              <td className="border px-2 py-1">
                {formatAmount(row.days_31_60)}
              </td>
              <td className="border px-2 py-1">
                {formatAmount(row.days_61_90)}
              </td>
              <td className="border px-2 py-1">
                {formatAmount(row.days_90_plus)}
              </td>
              <td
                className={`border px-2 py-1 font-semibold ${getStatusColor(
                  row.status
                )}`}
              >
                {row.status || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VendorAgingReport;
