import React, { useEffect, useState } from "react";
import axios from "axios";

const PurchaseRegisterByLineReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const purchasesOrderUrl =
    "https://fms-qkmw.onrender.com/fms/api/v0/Purchasesorders";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(purchasesOrderUrl);
        setData(res.data?.data || []);
      } catch (err) {
        setError("Failed to load Purchases register by line report.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="mt-4 text-sm">Loading...</div>;
  if (error) return <div className="mt-4 text-sm text-red-600">{error}</div>;

  const headings = [
    "Invoice Number",
    "Invoice Date",
    "Posting Date",
    "Transaction Type",
    " Invoice Status",

    "Purchases order No",

    "Vendor Code",
    "Vendor NAme",
    "Vendor GSTIN",
    "Vendor Address",
    "Vendor Type",
    "Line Number",
    "Item Code",
    "Item Name",
    "Quantity",
    "Unit Of Measure",
    "Price Per Unit",
    "Discount Amount",
    "Tax %",
    "Amount",
    "Total Amount",
    "Currency",
    "Posting Account Code",
    "Buyer Name",
    "Expense Recognition Date",
    "Payment Status",
    "Payable Balance",
    "Site",
    "Warehouse",
    "Tax Amount",
    "Created By",
    "Created DateTime",
    "Modified By",
    "Modified DateTime",
    "Invoice Amount (Net / Total)",
    "Transporter Details",
    "Delivery Date",
  ];

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">
        Purchases Register by Line Report
      </h2>
      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-xs">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {headings.map((h, i) => (
                <th key={i} className="border px-2 py-1 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border px-2 py-1">{row.InvoiceNumber}</td>
                <td className="border px-2 py-1">{row.InvoiceDate}</td>
                <td className="border px-2 py-1">{row.PostingDate}</td>
                <td className="border px-2 py-1">{row.TransactionType}</td>
                <td className="border px-2 py-1">{row.PurchasesType}</td>
                <td className="border px-2 py-1">{row.PurchasesReferenceNo}</td>
                <td className="border px-2 py-1">{row.Status}</td>
                <td className="border px-2 py-1">{row.VendorAddress}</td>
                <td className="border px-2 py-1">{row.VendorType}</td>
                <td className="border px-2 py-1">{row.LineNumber}</td>
                <td className="border px-2 py-1">{row.ItemCode}</td>
                <td className="border px-2 py-1">{row.ItemName}</td>
                <td className="border px-2 py-1">{row.Quantity}</td>
                <td className="border px-2 py-1">{row.PaymentTerms}</td>
                <td className="border px-2 py-1">{row.PricePerUnit}</td>
                <td className="border px-2 py-1">{row.DiscountAmount}</td>
                <td className="border px-2 py-1">{row.Tax}</td>
                <td className="border px-2 py-1">{row.Amount}</td>
                <td className="border px-2 py-1">{row.TotalAmount}</td>
                <td className="border px-2 py-1">{row.Currency}</td>
                <td className="border px-2 py-1">{row.PostingAccountCode}</td>
                <td className="border px-2 py-1">{row.BuyerName}</td>
                <td className="border px-2 py-1">
                  {row.ExpenseRecognitionDate}
                </td>
                <td className="border px-2 py-1">{row.PaymentStatus}</td>
                <td className="border px-2 py-1">{row.PayableBalance}</td>
                <td className="border px-2 py-1">{row.Site}</td>
                <td className="border px-2 py-1">{row.Warehouse}</td>
                <td className="border px-2 py-1">{row.TaxAmount}</td>
                <td className="border px-2 py-1">{row.CreatedBy}</td>
                <td className="border px-2 py-1">{row.CreatedDateTime}</td>
                <td className="border px-2 py-1">{row.ModifiedBy}</td>
                <td className="border px-2 py-1">{row.ModifiedDateTime}</td>
                <td className="border px-2 py-1">
                  {row.InvoiceAmountNetTotal}
                </td>
                <td className="border px-2 py-1">{row.TransporterDetails}</td>
                <td className="border px-2 py-1">{row.DeliveryDate}</td>
                <td className="border px-2 py-1">{row.Remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseRegisterByLineReport;
