import React, { useEffect, useState } from "react";
import axios from "axios";

const InventoryTransaction = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // TODO: update this to your real transactions endpoint if it's not /items
  const transactionsUrl = "https://fms-qkmw.onrender.com/fms/api/v0/items";

  // keep headers and accessors in sync here
  const columns = [
    { header: "TransactionID", accessor: "transactionID" },
    { header: "TransactionDate", accessor: "transactionDate" },
    { header: "PostingDate", accessor: "postingDate" },
    { header: "TransactionType", accessor: "transactionType" },
    { header: "Reference No", accessor: "referenceNo" },
    { header: "ItemCode", accessor: "itemCode" },
    { header: "ItemName", accessor: "itemName" },
    { header: "ItemCategory", accessor: "itemCategory" },
    { header: "BatchNumber", accessor: "batchNumber" },
    { header: "SerialNumber", accessor: "serialNumber" },
    { header: "Quantity", accessor: "quantity" },
    { header: "UnitOfMeasure", accessor: "unitOfMeasure" },
    { header: "UnitCost", accessor: "unitCost" },
    { header: "TotalCost", accessor: "totalCost" },
    { header: "Inbound Warehouse", accessor: "inboundWarehouse" },
    { header: "Outbound Warehouse", accessor: "outboundWarehouse" },
    { header: "Inbound Site", accessor: "inboundSite" },
    { header: "Outbound Site", accessor: "outboundSite" },
    { header: "StockStatus", accessor: "stockStatus" },
    { header: "Transaction Reason", accessor: "transactionReason" },
    { header: "Performed By", accessor: "performedBy" },
    { header: "Approved By", accessor: "approvedBy" },
    { header: "Remarks", accessor: "remarks" },
    { header: "Created By", accessor: "createdBy" },
    { header: "Created DateTime", accessor: "createdDateTime" },
    { header: "Modified By", accessor: "modifiedBy" },
    { header: "Modified DateTime", accessor: "modifiedDateTime" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(transactionsUrl);
        setData(res.data?.data || []);
      } catch (err) {
        setError("Failed to load inventory transactions.");
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
     Inventory Transaction
      </h2>
      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-xs">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {columns.map(({ header }, i) => (
                <th key={i} className="border px-2 py-1 text-left">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map(({ accessor }, colIndex) => (
                  <td key={colIndex} className="border px-2 py-1">
                    {row[accessor] ?? "-"}
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

export default InventoryTransaction;
