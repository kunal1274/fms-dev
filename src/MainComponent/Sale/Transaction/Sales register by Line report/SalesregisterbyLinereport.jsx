import React, { useEffect, useState } from "react";
import axios from "axios";

const SalesregisterbyLinereport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const salesOrderUrl = "https://fms-qkmw.onrender.com/fms/api/v0/salesorders";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(salesOrderUrl);
        setData(res.data?.data || []);
      } catch (err) {
        setError("Failed to load sales accounting balance.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="mt-4 text-sm">Loading...</div>;
  if (error) return <div className="mt-4 text-sm text-red-600">{error}</div>;

  const tableHeaders = [
    "InvoiceNumber",
    "InvoiceDate",
    "PostingDate",
    "TransactionType",
    "InvoiceStatus",
    "SalesOrderNumber",
    "CustomerCode",
    "CustomerName",
    "CustomerGSTIN",
    "CustomerAddress",
    "CustomerType",
    "LineNumber",
    "ItemCode",
    "ItemName",
    "Quantity",
    "UnitOfMeasure",
    "UnitPrice",
    "DiscountAmount",
    "TaxPercentage",
    "TaxAmount",
    "Amount",
    "TotalAmount",
    "PostingAccountCode",
    "Salesperson",
    "RevenueRecognitionDate",
    "PaymentTerm",
    "PaymentStatus",
    "ReceivableBalance",
    "Site",
    "Warehouse",
    "CreatedBy",
    "CreatedDateTime",
    "ModifiedBy",
    "ModifiedDateTime",
    "TransporterDetails",
    "DeliveryDate",
  ];

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">
        Sales Register by Line Report
      </h2>
      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-xs">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {tableHeaders.map((heading, index) => (
                <th key={index} className="border px-2 py-1 text-left">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {tableHeaders.map((field, index) => (
                  <td key={index} className="border px-2 py-1">
                    {row[field] ?? "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesregisterbyLinereport;
