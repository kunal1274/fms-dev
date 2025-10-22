import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { FaSortAmountDown, FaFilter, FaSearch } from "react-icons/fa";

// Dummy helpers
const getId = (c) => c.id;
const getCode = (c) => c.code;
const getName = (c) => c.customerName;
const getAddress = (c) => c.customerAccount;
const isActive = (c) => c.status === "Active";

export default function DebitNoteList({ handleAddDebitNote }) {
  // Dummy summary data
  const [summary, setSummary] = useState({
    count: 12,
    debitLimit: "$50,000",
    paidDebitNotes: 8,
    activeDebitNotes: 7,
    onHoldDebitNotes: 2,
  });

  // Dummy debit notes
  const [filteredDebitNotes, setFilteredDebitNotes] = useState([
    {
      id: "DN001",
      code: "DRN-101",
      referenceTransactionID: "TXN-5001",
      customerAccount: "AC-9001",
      customerName: "John Doe",
      createdAt: new Date().toISOString(),
      debitNoteStatus: "Approved",
      invoiceId: "INV-555",
      itemName: "Laptop",
      orderQty: 10,
      uom: "pcs",
      unitPrice: 1000,
      subtotal: 10000,
      grandTotal: 10500,
      currency: "USD",
      orderId: "ORD-101",
      site: "NYC",
      warehouse: "WH-01",
      contactNum: "123-456-7890",
      status: "Active",
    },
    {
      id: "DN002",
      code: "DRN-102",
      referenceTransactionID: "TXN-5002",
      customerAccount: "AC-9002",
      customerName: "Jane Smith",
      createdAt: new Date().toISOString(),
      debitNoteStatus: "Pending",
      invoiceId: "INV-556",
      itemName: "Smartphone",
      orderQty: 5,
      uom: "pcs",
      unitPrice: 700,
      subtotal: 3500,
      grandTotal: 3675,
      currency: "USD",
      orderId: "ORD-102",
      site: "LA",
      warehouse: "WH-02",
      contactNum: "555-321-9876",
      status: "Active",
    },
    {
      id: "DN003",
      code: "DRN-103",
      referenceTransactionID: "TXN-5003",
      customerAccount: "AC-9003",
      customerName: "Michael Johnson",
      createdAt: new Date().toISOString(),
      debitNoteStatus: "Approved",
      invoiceId: "INV-557",
      itemName: "Tablet",
      orderQty: 15,
      uom: "pcs",
      unitPrice: 300,
      subtotal: 4500,
      grandTotal: 4725,
      currency: "USD",
      orderId: "ORD-103",
      site: "Chicago",
      warehouse: "WH-03",
      contactNum: "111-222-3333",
      status: "Active",
    },
    {
      id: "DN004",
      code: "DRN-104",
      referenceTransactionID: "TXN-5004",
      customerAccount: "AC-9004",
      customerName: "Emily Davis",
      createdAt: new Date().toISOString(),
      debitNoteStatus: "Rejected",
      invoiceId: "INV-558",
      itemName: "Monitor",
      orderQty: 8,
      uom: "pcs",
      unitPrice: 200,
      subtotal: 1600,
      grandTotal: 1680,
      currency: "USD",
      orderId: "ORD-104",
      site: "Houston",
      warehouse: "WH-04",
      contactNum: "222-444-8888",
      status: "Inactive",
    },
    {
      id: "DN005",
      code: "DRN-105",
      referenceTransactionID: "TXN-5005",
      customerAccount: "AC-9005",
      customerName: "Robert Brown",
      createdAt: new Date().toISOString(),
      debitNoteStatus: "Approved",
      invoiceId: "INV-559",
      itemName: "Keyboard",
      orderQty: 20,
      uom: "pcs",
      unitPrice: 50,
      subtotal: 1000,
      grandTotal: 1050,
      currency: "USD",
      orderId: "ORD-105",
      site: "Seattle",
      warehouse: "WH-05",
      contactNum: "333-777-9999",
      status: "Active",
    },
    {
      id: "DN006",
      code: "DRN-106",
      referenceTransactionID: "TXN-5006",
      customerAccount: "AC-9006",
      customerName: "Sophia Wilson",
      createdAt: new Date().toISOString(),
      debitNoteStatus: "Pending",
      invoiceId: "INV-560",
      itemName: "Mouse",
      orderQty: 50,
      uom: "pcs",
      unitPrice: 25,
      subtotal: 1250,
      grandTotal: 1313,
      currency: "USD",
      orderId: "ORD-106",
      site: "Boston",
      warehouse: "WH-06",
      contactNum: "444-555-6666",
      status: "Active",
    },
    {
      id: "DN007",
      code: "DRN-107",
      referenceTransactionID: "TXN-5007",
      customerAccount: "AC-9007",
      customerName: "William Martinez",
      createdAt: new Date().toISOString(),
      debitNoteStatus: "Approved",
      invoiceId: "INV-561",
      itemName: "Printer",
      orderQty: 3,
      uom: "pcs",
      unitPrice: 400,
      subtotal: 1200,
      grandTotal: 1260,
      currency: "USD",
      orderId: "ORD-107",
      site: "Miami",
      warehouse: "WH-07",
      contactNum: "777-888-9999",
      status: "Active",
    },
    {
      id: "DN008",
      code: "DRN-108",
      referenceTransactionID: "TXN-5008",
      customerAccount: "AC-9008",
      customerName: "Olivia Garcia",
      createdAt: new Date().toISOString(),
      debitNoteStatus: "Approved",
      invoiceId: "INV-562",
      itemName: "Camera",
      orderQty: 6,
      uom: "pcs",
      unitPrice: 800,
      subtotal: 4800,
      grandTotal: 5040,
      currency: "USD",
      orderId: "ORD-108",
      site: "San Francisco",
      warehouse: "WH-08",
      contactNum: "123-888-4567",
      status: "Active",
    },
    {
      id: "DN009",
      code: "DRN-109",
      referenceTransactionID: "TXN-5009",
      customerAccount: "AC-9009",
      customerName: "James Lee",
      createdAt: new Date().toISOString(),
      debitNoteStatus: "Pending",
      invoiceId: "INV-563",
      itemName: "Headphones",
      orderQty: 30,
      uom: "pcs",
      unitPrice: 100,
      subtotal: 3000,
      grandTotal: 3150,
      currency: "USD",
      orderId: "ORD-109",
      site: "Denver",
      warehouse: "WH-09",
      contactNum: "888-999-0000",
      status: "Active",
    },
    {
      id: "DN010",
      code: "DRN-110",
      referenceTransactionID: "TXN-5010",
      customerAccount: "AC-9010",
      customerName: "Isabella Thompson",
      createdAt: new Date().toISOString(),
      debitNoteStatus: "Approved",
      invoiceId: "INV-564",
      itemName: "Projector",
      orderQty: 2,
      uom: "pcs",
      unitPrice: 1200,
      subtotal: 2400,
      grandTotal: 2520,
      currency: "USD",
      orderId: "ORD-110",
      site: "Dallas",
      warehouse: "WH-10",
      contactNum: "999-111-2222",
      status: "Active",
    },
  ]);
  // Dummy state handlers
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

  // Dummy actions
  // const handleAddDebitNote = () => toast.success("Add Debit Note clicked!");
  const handleDeleteSelected = () => toast.info("Deleted selected notes");
  const generatePDF = () => toast.info("PDF generated");
  const exportToExcel = () => toast.info("Exported to Excel");
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSortChange = (e) => setSortOption(e.target.value);
  const handleStatusChange = (e) => setStatusFilter(e.target.value);
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredDebitNotes.map((c) => getId(c)));
    } else {
      setSelectedIds([]);
    }
  };
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const handleDebitNoteClick = (id) => toast.info(`Clicked on ${id}`);
  const onTabClick = (tab) => setActiveTab(tab);

  const fetchDebitNotes = async () => {
    toast.info("Fetching DebitNotes (dummy)");
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
          <h3 className="text-xl font-semibold mb-6">Debit Note List</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handleAddDebitNote}
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
            ["Debit Limit", summary.debitLimit],
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
                      selectedIds.length === filteredDebitNotes.length &&
                      filteredDebitNotes.length > 0
                    }
                    className="form-checkbox"
                  />
                </th>
                {[
                  "DebitNoteID",
                  "ReferenceTransactionID",
                  "Cust Account",
                  "Customer Name",
                  "Date & Time",
                  "Debit Note Status",
                  " Invoice id agints Debit Note",
                  "Item Name",
                  "Order Qty",
                  "Unit of Measure (UOM)",
                  "Unit Price",
                  " Subtotal /  line amount",
                  "Grand Total",
                  " Currency ",
                  "Order Id",
                  "Site ",
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
              {filteredDebitNotes.length ? (
                filteredDebitNotes.map((c) => (
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
                        onClick={() => handleDebitNoteClick(getId(c))}
                      >
                        {c.code}
                      </button>
                    </td>
                    <td className="px-6 py-4">{c.referenceTransactionID}</td>
                    <td className="px-6 py-4">{c.customerAccount}</td>
                    <td className="px-6 py-4">{c.customerName}</td>
                    <td className="px-6 py-3 truncate">
                      {c?.createdAt
                        ? new Date(c.createdAt).toLocaleString()
                        : ""}
                    </td>
                    <td className="px-6 py-4">{c.debitNoteStatus}</td>
                    <td className="px-6 py-4">{c.invoiceId}</td>
                    <td className="px-6 py-4">{c.itemName}</td>
                    <td className="px-6 py-4">{c.orderQty}</td>
                    <td className="px-6 py-4">{c.uom}</td>
                    <td className="px-6 py-4">{c.unitPrice}</td>
                    <td className="px-6 py-4">{c.subtotal}</td>
                    <td className="px-6 py-4">{c.grandTotal}</td>
                    <td className="px-6 py-4">{c.currency}</td>
                    <td className="px-6 py-4">{c.orderId}</td>
                    <td className="px-6 py-4">{c.site}</td>
                    <td className="px-6 py-4">{c.warehouse}</td>
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
                    colSpan={7}
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
    </div>
  );
}
