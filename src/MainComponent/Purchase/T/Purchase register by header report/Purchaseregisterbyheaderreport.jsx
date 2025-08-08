import React, { useEffect, useState } from "react";
import axios from "axios";

const PurchaseRegisterByHeaderReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const PurchasesOrderUrl = "https://fms-qkmw.onrender.com/fms/api/v0/Purchasesorders";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(PurchasesOrderUrl);
        setData(res.data?.data || []);
      } catch (err) {
        setError("Failed to load Purchases accounting balance.");
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
      <h2 className="text-lg font-semibold mb-2">
        Purchases Register by Header Report
      </h2>
      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-xs">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {[
                "Purchases Type",
                "Purchases Reference No",
                "Invoice Number",
                "Invoice Date",
                "Vendor Code",
                "Vendor Name",
                "Purchases Person",
                "Payment Terms",
                "Invoice Amount (Gross)",
                "Discount Amount",
                "Tax Amount",
                "Invoice Amount (Net / Total)",
                "Status",
                "Currency",
                "Remarks",
              ].map((heading, index) => (
                <th key={index} className="border px-2 py-1 text-left">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border px-2 py-1">{row.PurchasesType}</td>
                <td className="border px-2 py-1">{row.PurchasesReferenceNo}</td>
                <td className="border px-2 py-1">{row.invoiceNumber}</td>
                <td className="border px-2 py-1">{row.invoiceDate}</td>
                <td className="border px-2 py-1">{row.VendorCode}</td>
                <td className="border px-2 py-1">{row.VendorName}</td>
                <td className="border px-2 py-1">{row.PurchasesPerson}</td>
                <td className="border px-2 py-1">{row.paymentTerms}</td>
                <td className="border px-2 py-1">{row.invoiceAmountGross}</td>
                <td className="border px-2 py-1">{row.discountAmount}</td>
                <td className="border px-2 py-1">{row.taxAmount}</td>
                <td className="border px-2 py-1">{row.invoiceAmountNet}</td>
                <td className="border px-2 py-1">{row.status}</td>
                <td className="border px-2 py-1">{row.currency}</td>
                <td className="border px-2 py-1">{row.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseRegisterByHeaderReport;
