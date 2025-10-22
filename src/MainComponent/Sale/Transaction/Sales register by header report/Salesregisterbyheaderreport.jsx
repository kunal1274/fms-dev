import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const salesOrderUrl = "https://fms-qkmw.onrender.com/fms/api/v0/salesorders";

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString() : "N/A";

const formatCurrency = (val) =>
  typeof val === "number"
    ? val.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })
    : "0.00";

// Column definitions
const columns = [
  { label: "Sales ID", key: "_id" },
  { label: "Invoice Date", key: "createdAt", formatter: formatDate },
  { label: "Customer Code", key: "customer.code" },
  { label: "Customer Name", key: "customer.name" },
  { label: "Invoice Number", key: "invoiceNumber" },
  { label: "Item Name", key: "items[0].name" },
  { label: "Quantity", key: "items[0].quantity" },
  { label: "Unit Price", key: "items[0].unitPrice", formatter: formatCurrency },
  {
    label: "Subtotal",
    key: "subtotal",
    formatter: (val, txn) => {
      const item = txn.items?.[0] || {};
      return formatCurrency((item.quantity || 0) * (item.unitPrice || 0));
    },
  },
  { label: "Discount", key: "discount", formatter: formatCurrency },
  { label: "Tax (%)", key: "items[0].taxPercent" },
  { label: "Tax Amount", key: "taxAmount", formatter: formatCurrency },
  { label: "Total", key: "total", formatter: formatCurrency },
  { label: "Paid Amount", key: "combinedPaid", formatter: formatCurrency },
  {
    label: "Balance Due",
    key: "balanceDue",
    formatter: (val, txn) =>
      formatCurrency((txn.total || 0) - (txn.combinedPaid || 0)),
  },
  { label: "Payment Method", key: "paymentMethod" },
  { label: "Status", key: "status" },
];

// Utility to safely access nested fields
const getValue = (obj, path) => {
  try {
    return path
      .replace(/\[(\d+)\]/g, ".$1")
      .split(".")
      .reduce((acc, key) => acc?.[key], obj);
  } catch {
    return undefined;
  }
};

const Salesregisterbyheaderreport = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  // Fetch data
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(salesOrderUrl);
      setTransactions(res.data?.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Debounce search
  useEffect(() => {
    const delay = setTimeout(() => setSearch(query), 300);
    return () => clearTimeout(delay);
  }, [query]);

  // Sorting logic
  const sortedTransactions = useMemo(() => {
    const sorted = [...transactions];
    if (!sortConfig.key) return sorted;

    sorted.sort((a, b) => {
      let aVal = getValue(a, sortConfig.key);
      let bVal = getValue(b, sortConfig.key);

      if (aVal == null) aVal = "";
      if (bVal == null) bVal = "";

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [transactions, sortConfig]);

  // Filtering logic
  const filteredTransactions = useMemo(() => {
    if (!search) return sortedTransactions;

    return sortedTransactions.filter((txn) => {
      const customerName = txn.customer?.name?.toLowerCase() || "";
      const invoiceNumber = txn.invoiceNumber?.toLowerCase() || "";
      const id = txn._id?.toLowerCase() || "";
      const q = search.toLowerCase();

      return (
        customerName.includes(q) || invoiceNumber.includes(q) || id.includes(q)
      );
    });
  }, [sortedTransactions, search]);

  // Sorting handler
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  // Export handlers
  const handleExportExcel = () => {
    const data = filteredTransactions.map((txn) => {
      const row = {};
      columns.forEach((col) => {
        const rawVal = getValue(txn, col.key);
        row[col.label] = col.formatter
          ? col.formatter(rawVal, txn)
          : rawVal ?? "N/A";
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales");
    XLSX.writeFile(wb, "sales_register.xlsx");
  };

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h2 className="text-lg font-semibold">
          Sales register by header report
        </h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by Customer, Invoice, or ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="px-2 py-1 border rounded text-sm w-64"
          />
          <button
            onClick={handleExportExcel}
            className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200 text-sm"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 animate-pulse rounded" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-sm text-red-600 flex items-center gap-2">
          {error}
          <button
            onClick={fetchTransactions}
            className="px-2 py-0.5 border rounded text-xs bg-gray-100 hover:bg-gray-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="overflow-x-auto max-h-[600px] border rounded">
          <table className="min-w-[1500px] border-collapse text-xs">
            <thead className="sticky top-0 bg-gray-100 text-gray-700">
              <tr>
                {columns.map(({ label, key }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="border px-2 py-1 text-left whitespace-nowrap cursor-pointer hover:bg-gray-200"
                  >
                    {label}
                    {sortConfig.key === key &&
                      (sortConfig.direction === "asc" ? " ▲" : " ▼")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="border px-2 py-2 text-center text-gray-500"
                  >
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn, idx) => (
                  <tr
                    key={txn._id || idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {columns.map((col) => {
                      const rawVal = getValue(txn, col.key);
                      return (
                        <td key={col.key} className="border px-2 py-1">
                          {col.formatter
                            ? col.formatter(rawVal, txn)
                            : rawVal ?? "N/A"}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Salesregisterbyheaderreport;
