import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { FaSortAmountDown, FaFilter, FaSearch } from "react-icons/fa";

// Dummy helpers
const getId = (c) => c.id;
const getCode = (c) => c.code;
const getName = (c) => c.customerName;
const getAddress = (c) => c.customerAccount;
const isActive = (c) => c.status === "Active";

// ✅ Helper for date
const addDays = (dateStr, days) => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
};

const dummyFreeTaxings = [
  {
    id: "FTI001",
    code: "CRN-201",
    customerAccount: "AC-1001",
    customerName: "John Doe",
    status: "Active",
    transactionType: "Sale",
    itemCode: "ITM-001",
    itemName: "Laptop",
    postingAccount: "POST-001",
    quantity: 5,
    uom: "pcs",
    unitPrice: 1000,
    subtotal: 5000,
    currency: "USD",
    orderId: "ORD-201",
    site: "NYC",
    warehouse: "WH-01",
  },
  {
    id: "FTI002",
    code: "CRN-202",
    customerAccount: "AC-1002",
    customerName: "Jane Smith",
    status: "Inactive",
    transactionType: "Return",
    itemCode: "ITM-002",
    itemName: "Monitor",
    postingAccount: "POST-002",
    quantity: 3,
    uom: "pcs",
    unitPrice: 300,
    subtotal: 900,
    currency: "USD",
    orderId: "ORD-202",
    site: "LA",
    warehouse: "WH-02",
  },
  {
    id: "FTI003",
    code: "CRN-203",
    customerAccount: "AC-1003",
    customerName: "Mike Johnson",
    status: "Active",
    transactionType: "Sale",
    itemCode: "ITM-003",
    itemName: "Keyboard",
    postingAccount: "POST-003",
    quantity: 10,
    uom: "pcs",
    unitPrice: 50,
    subtotal: 500,
    currency: "USD",
    orderId: "ORD-203",
    site: "Chicago",
    warehouse: "WH-03",
  },
  {
    id: "FTI004",
    code: "CRN-204",
    customerAccount: "AC-1004",
    customerName: "Emily Davis",
    status: "Active",
    transactionType: "Sale",
  },
];

export default function FreeTaxingList() {
  // Dummy summary data
  const [summary, setSummary] = useState({
    count: 12,
    creditLimit: "$50,000",
    paidFreeTaxings: 8,
    activeFreeTaxings: 7,
    onHoldFreeTaxings: 2,
  });

  // ✅ State
  const [freeTaxings, setFreeTaxings] = useState(dummyFreeTaxings);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [activeTab, setActiveTab] = useState("All");

  const tabNames = ["All", "Active", "Inactive"];
  const anyFiltersOn =
    searchTerm || statusFilter !== "All" || sortOption || startDate || endDate;

  // ✅ Filtering logic
  const filteredFreeTaxings = freeTaxings.filter((c) => {
    const matchesSearch =
      getName(c).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCode(c).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && isActive(c)) ||
      (statusFilter === "Inactive" && !isActive(c));
    const matchesTab =
      activeTab === "All" ||
      (activeTab === "Active" && isActive(c)) ||
      (activeTab === "Inactive" && !isActive(c));
    return matchesSearch && matchesStatus && matchesTab;
  });

  // Dummy actions
  const handleAddFreeTaxing = () => toast.success("Add Debit Note clicked!");
  const handleDeleteSelected = () => toast.info("Deleted selected notes");
  const generatePDF = () => toast.info("PDF generated");
  const exportToExcel = () => toast.info("Exported to Excel");
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSortChange = (e) => setSortOption(e.target.value);
  const handleStatusChange = (e) => setStatusFilter(e.target.value);
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredFreeTaxings.map((c) => getId(c)));
    } else {
      setSelectedIds([]);
    }
  };
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const handleFreeTaxingClick = (id) => toast.info(`Clicked on ${id}`);
  const onTabClick = (tab) => setActiveTab(tab);

  const fetchFreeTaxings = async () => {
    toast.info("Fetching FreeTaxings (dummy)");
  };
  const fetchMetrics = async () => {
    toast.info("Fetching Metrics (dummy)");
  };

  const isRangeValid =
    startDate && endDate && new Date(endDate) > new Date(startDate);

  return (
    <div>
      <ToastContainer />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2 ">
          <h3 className="text-xl font-semibold mb-6">Free Taxing List</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            // onClick={handleAddDebitNote}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
          >
            + Add
          </button>
          <button
            onClick={handleDeleteSelected}
            disabled={!selectedIds.length}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
          >
            Delete
          </button>
          <button
            onClick={generatePDF}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
          >
            PDF
          </button>
          <button
            onClick={exportToExcel}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
          >
            Export
          </button>
        </div>
      </div>

      {/* Date + Metrics */}
      <div className="bg-white rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {[
            ["Total DebitNotes", summary.count],
            ["Credit Limit", summary.creditLimit],
            ["Paid DebitNotes", summary.paidDebitNotes],
            ["Active DebitNotes", summary.activeDebitNotes],
            ["On-Hold DebitNotes", summary.onHoldDebitNotes],
          ].map(([label, value]) => (
            <div key={label} className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className=" mt-10 flex flex-wrap Sales-center text-sm justify-between p-2 bg-white rounded-md mb-2 space-y-3 md:space-y-0 md:space-x-4">
        <div className=" mt-10 flex items-center space-x-4">
          {/* Sort By */}
          <div className="relative">
            <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={
                sortOption === "name-asc"
                  ? "DebitNote Name"
                  : sortOption === "code-asc"
                  ? "DebitNote Account in Ascending"
                  : sortOption === "code-desc"
                  ? "DebitNote Account in descending"
                  : ""
              }
              onChange={handleSortChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="">Sort By</option>
              <option value="DebitNote Name">DebitNote Name</option>
              <option value="DebitNote Account in Ascending">
                DebitNote Account in Ascending
              </option>
              <option value="DebitNote Account in descending">
                DebitNote Account in descending
              </option>
            </select>
          </div>

          {/* Filter By Status */}
          <div className="relative">
            <FaFilter className="text-sm absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={
                statusFilter === "Active"
                  ? "yes"
                  : statusFilter === "Inactive"
                  ? "no"
                  : "All"
              }
              onChange={handleStatusChange}
              className="pl-10 pr-4 py-2 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="All">Filter By Status</option>
              <option value="yes">Active</option>
              <option value="no">Inactive</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-60 pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FaSearch className="w-5 h-5" />
            </div>
          </div>
          <div className="flex gap-2">
            <label className="block text-sm font-medium text-gray-600 mb-1 mt-2">
              To
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-2 py-1"
            />
            <label className="block text-sm font-medium text-gray-600 mb-1 mt-2">
              From
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate ? addDays(startDate, 1) : undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-2 py-1"
            />
            <button
              onClick={() => {
                if (!isRangeValid) {
                  toast.info("Pick a valid Start and End date (End > Start).");
                  return;
                }
                fetchMetrics({ fromDate: startDate, toDate: endDate });
                fetchDebitNotes({ fromDate: startDate, toDate: endDate });
              }}
              disabled={!isRangeValid || loadingMetrics}
              className="px-3 py-1 border rounded"
            >
              {loadingMetrics ? "Applying…" : "Apply"}
            </button>
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={async () => {
            setSearchTerm("");
            setStatusFilter("All");
            setSelectedIds([]);
            setSortOption("");
            setStartDate("");
            setEndDate("");
            await fetchDebitNotes(); // all
            await fetchMetrics(); // all
          }}
          disabled={!anyFiltersOn}
          className={`font-medium w-full sm:w-auto transition
            ${
              anyFiltersOn
                ? "text-red-500 hover:text-red-600 cursor-pointer"
                : "text-gray-400 cursor-not-allowed"
            }`}
        >
          Reset Filter
        </button>
      </div>

      {/* Tabs */}
      <div className="flex">
        <ul className="flex space-x-6 list-none p-0 m-0">
          {tabNames.map((tab) => (
            <li
              key={tab}
              onClick={() => onTabClick(tab)}
              className={`cursor-pointer pb-2 transition-colors ${
                activeTab === tab
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab}
            </li>
          ))}
        </ul>
      </div>
      {/* Table */}
      <div className="mx-auto w-[82vw] max-w-[1500px] rounded-lg border bg-white ">
        <div className="h-[400px] overflow-x-auto overflow-y-auto">
          <table className="w-full min-w-[1200px] table-auto divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="bg-gray-50">
                <th className="sticky top-0 z-20 px-4 py-2 bg-gray-50">
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={
                      selectedIds.length === filteredFreeTaxings.length &&
                      filteredFreeTaxings.length > 0
                    }
                    className="form-checkbox"
                  />
                </th>
                {[
                  "Free Tax Invoice ID",
                  "Cust Account",
                  "Customer Name",
                  "Status",
                  "Transaction type",
                  "Item Code",
                  "Item Name",
                  "Posting Account",
                  "Quantity",
                  "Unit of Measure (UOM)",
                  "Unit Price",
                  "Subtotal /  line amount",
                  "Currency",
                  "Order Id",
                  "Site",
                  "Warehouse",
                ].map((h) => (
                  <th
                    key={h}
                    className="sticky top-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFreeTaxings.length ? (
                filteredFreeTaxings.map((c) => (
                  <tr
                    key={getId(c)}
                    className="hover:bg-gray-100 transition-colors"
                  >
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(getId(c))}
                        onChange={() => handleCheckboxChange(getId(c))}
                        className="form-checkbox"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        className="text-blue-600 hover:underline focus:outline-none"
                        onClick={() => handleFreeTaxingClick(getId(c))}
                      >
                        {c.code}
                      </button>
                    </td>
                    <td className="px-6 py-4">{c.customerAccount}</td>
                    <td className="px-6 py-4">{c.customerName}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          isActive(c)
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {isActive(c) ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">{c.transactionType}</td>
                    <td className="px-6 py-4">{c.itemCode}</td>
                    <td className="px-6 py-4">{c.itemName}</td>
                    <td className="px-6 py-4">{c.postingAccount}</td>
                    <td className="px-6 py-4">{c.quantity}</td>
                    <td className="px-6 py-4">{c.uom}</td>
                    <td className="px-6 py-4">{c.unitPrice}</td>
                    <td className="px-6 py-4">{c.subtotal}</td>
                    <td className="px-6 py-4">{c.currency}</td>
                    <td className="px-6 py-4">{c.orderId}</td>
                    <td className="px-6 py-4">{c.site}</td>
                    <td className="px-6 py-4">{c.warehouse}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={17}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
