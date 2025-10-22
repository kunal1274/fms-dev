// InoutJournal.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const InoutJournal = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get("/api/inventory/transactions");
        console.log("API Response:", res.data);

        let data = res.data;
        if (res.data.transactions) data = res.data.transactions;
        else if (res.data.data) data = res.data.data;
        if (!Array.isArray(data)) data = [];
        setTransactions(data);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const headers = [
    "Transaction ID",
    "Transaction Type",
    "Transaction Date",
    "Reference Type",
    "Reference Number",
    "Supplier/Customer ID",
    "Supplier/Customer Name",
    "Item Code",
    "Item Description",
    "Quantity",
    "UOM",
    "Price/Unit",
    "Total Cost",
    "Received Warehouse",
    "Issued Warehouse",
    "Batch Number",
    "Serial Number",
    "Location Bin",
    "Quality Check Status",
    "Approved By",
    "Transaction Status",
    "Remarks",
  ];

  if (loading)
    return (
      <div className="p-6 text-center text-gray-600">Loading transactions…</div>
    );
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="font-sans text-gray-800">
      <h2 className="text-lg mb-4">Inventory In/Out Journal</h2>
      <section className="p-6">
        <div className="max-h-96 overflow-y-auto border border-gray-300 rounded bg-white">
          <table className="min-w-full border-collapse text-sm text-gray-700">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                {headers.map((hdr, i) => (
                  <th
                    key={i}
                    className="border border-gray-300 px-2 py-2 text-center font-normal"
                  >
                    {hdr}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.length > 0 ? (
                transactions.map((txn, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 py-1 text-center font-normal">
                      {txn.transactionId}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center font-normal">
                      {txn.transactionType}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center font-normal">
                      {txn.transactionDate}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center font-normal">
                      {txn.referenceType}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center font-normal">
                      {txn.referenceNumber}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center font-normal">
                      {txn.supplierCustomerId}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center font-normal">
                      {txn.supplierCustomerName}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center font-normal">
                      {txn.itemCode}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 font-normal">
                      {txn.itemDescription}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center font-normal">
                      {txn.quantity}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center font-normal">
                      {txn.uom}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center font-normal">
                      {txn.pricePerUnit}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center font-normal">
                      {txn.totalCost}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center font-normal">
                      {txn.receivedWarehouse}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center font-normal">
                      {txn.issuedWarehouse}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center font-normal">
                      {txn.batchNumber}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center font-normal">
                      {txn.serialNumber}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center font-normal">
                      {txn.locationBin}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center font-normal">
                      {txn.qcStatus}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center font-normal">
                      {txn.approvedBy}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center font-normal">
                      {txn.transactionStatus}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 font-normal">
                      {txn.remarks}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="text-center py-4" colSpan={headers.length}>
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default InoutJournal;
