import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Dummy Data
const dummyJournalRevenues = [
  {
    id: 1,
    code: "JRN-001",
    name: "Sales Journal",
    address: "2025-Q1",
    createdAt: new Date().toISOString(),
    contactNum: "ACC-1001",
    active: true,
    debit: 1200,
    credit: 800,
    postingAccNo: "PA-100",
    postingAcc: "Main Ledger",
    totalAmount: 2000,
    invoiceNumber: "INV-001",
  },
  {
    id: 2,
    code: "JRN-002",
    name: "Purchase Journal",
    address: "2025-Q2",
    createdAt: new Date().toISOString(),
    contactNum: "ACC-1002",
    active: false,
    debit: 600,
    credit: 600,
    postingAccNo: "PA-101",
    postingAcc: "Expense Ledger",
    totalAmount: 1200,
    invoiceNumber: "INV-002",
  },
];

const dummySummary = {
  count: 2,
  creditLimit: 50000,
  paidJournalRevenues: 1,
  activeJournalRevenues: 1,
  onHoldJournalRevenues: 0,
};

const tabNames = ["All", "Active", "Inactive"];

export default function JournalRevenueList() {
  const [filteredJournalRevenues, setFilteredJournalRevenues] =
    useState(dummyJournalRevenues);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Helpers
  const getId = (c) => c.id;
  const getCode = (c) => c.code;
  const getName = (c) => c.name;
  const getAddress = (c) => c.address;
  const isActive = (c) => c.active;

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredJournalRevenues.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredJournalRevenues.map((c) => getId(c)));
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleJournalRevenueClick = (id) => {
    toast.info(`Clicked JournalRevenue with ID: ${id}`);
  };

  const handleAddJournalRevenue = () => {
    toast.success("Add JournalRevenue clicked");
  };

  const handleDeleteSelected = () => {
    toast.error("Delete selected clicked");
  };

  const generatePDF = () => {
    toast.info("PDF generated");
  };

  const exportToExcel = () => {
    toast.info("Exported to Excel");
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    const filtered = dummyJournalRevenues.filter((c) =>
      c.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredJournalRevenues(filtered);
  };

  const onTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "All") setFilteredJournalRevenues(dummyJournalRevenues);
    if (tab === "Active")
      setFilteredJournalRevenues(dummyJournalRevenues.filter((c) => c.active));
    if (tab === "Inactive")
      setFilteredJournalRevenues(dummyJournalRevenues.filter((c) => !c.active));
  };

  return (
    <div className="p-4">
      <ToastContainer />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2 ">
          <h3 className="text-xl font-semibold mb-6">JournalRevenue List</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handleAddJournalRevenue}
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
      <div className="bg-white rounded-lg my-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {[
            ["Total JournalRevenues", dummySummary.count],
            ["Credit Limit", dummySummary.creditLimit],
            ["Paid JournalRevenues", dummySummary.paidJournalRevenues],
            ["Active JournalRevenues", dummySummary.activeJournalRevenues],
            ["On-Hold JournalRevenues", dummySummary.onHoldJournalRevenues],
          ].map(([label, value]) => (
            <div key={label} className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap Sales-center text-sm justify-between p-2 bg-white rounded-md mb-2 space-y-3 md:space-y-0 md:space-x-4">
        <div className="flex items-center space-x-4">
          {/* Sort By */}
          <div className="relative">
            <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={
                sortOption === "name-asc"
                  ? "Customer Name"
                  : sortOption === "code-asc"
                  ? "Customer Account in Ascending"
                  : sortOption === "code-desc"
                  ? "Customer Account in descending"
                  : ""
              }
              onChange={handleSortChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="">Sort By</option>
              <option value="Customer Name">Customer Name</option>
              <option value="Customer Account in Ascending">
                Customer Account in Ascending
              </option>
              <option value="Customer Account in descending">
                Customer Account in descending
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
                fetchCustomers({ fromDate: startDate, toDate: endDate });
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
            await fetchCustomers(); // all
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
      <div className="table-scroll-container h-[400px] overflow-auto bg-white rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky top-0 z-10 px-4 py-2 bg-gray-50">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={
                    selectedIds.length === filteredJournalRevenues.length &&
                    filteredJournalRevenues.length > 0
                  }
                  className="form-checkbox"
                />
              </th>
              {[
                "Journal code ",
                "Journal name",
                "Posting period",
                "Posting_Date",
                "Account",
                "Account ID",
                "Name",
                "Debit",
                "Credit",
                     "Posting account Id ",
                "Posting Account ",
           
                "Total Amount",
                "Invoice Number",
                "Status",
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
            {filteredJournalRevenues.length ? (
              filteredJournalRevenues.map((c) => (
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
                      onClick={() => handleJournalRevenueClick(getId(c))}
                    >
                      {getCode(c)}
                    </button>
                  </td>
                  <td className="px-6 py-4">{getName(c)}</td>
                  <td className="px-6 py-4">{getAddress(c)}</td>
                  <td className="px-6 py-3 truncate">
                    {c?.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                  </td>
                  <td className="px-6 py-4">{c?.contactNum || ""}</td>
                  <td className="px-6 py-4">{c?.debit}</td>
                  <td className="px-6 py-4">{c?.credit}</td>
                  <td className="px-6 py-4">{c?.postingAccN}</td>
                  <td className="px-6 py-4">{c?.postingAcc}</td>
                  <td className="px-6 py-4">{c?.totalAmount}</td>{" "}
                  <td className="px-6 py-4">{c?.totalAmount}</td>
                  <td className="px-6 py-4">{c?.invoiceNumber}</td>
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
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={13}
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
  );
}
