import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSortAmountDown, FaFilter, FaSearch } from "react-icons/fa";

const ReturnOrderList = () => {
  // Dummy summary data
  const [summary] = useState({
    count: 5,
    creditLimit: "$5000",
    paidReturnOrders: 3,
    activeReturnOrders: 2,
    onHoldReturnOrders: 1,
  });

  // Dummy return orders
  const dummyOrders = [
    {
      id: 1,
      returnOrderNo: "R001",
      salesOrderNo: "SO123",
      returnDate: new Date().toISOString(),
      custAccount: "CUST001",
      customerName: "Customer A",
      returnStatus: "Approved",
      saleInvoiceId: "INV1001",
      itemName: "Product X",
      orderQty: 10,
      uom: "pcs",
      unitPrice: 25,
      subtotal: 250,
      grandTotal: 250,
      currency: "USD",
      orderId: "O001",
      site: "Main Site",
      warehouse: "WH1",
      active: true,
    },
    {
      id: 2,
      returnOrderNo: "R002",
      salesOrderNo: "SO124",
      returnDate: new Date().toISOString(),
      custAccount: "CUST002",
      customerName: "Customer B",
      returnStatus: "Pending",
      saleInvoiceId: "INV1002",
      itemName: "Product Y",
      orderQty: 5,
      uom: "pcs",
      unitPrice: 40,
      subtotal: 200,
      grandTotal: 200,
      currency: "USD",
      orderId: "O002",
      site: "Secondary Site",
      warehouse: "WH2",
      active: false,
    },
  ];

  // State management
  const [filteredReturnOrders, setFilteredReturnOrders] = useState(dummyOrders);
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  // Dummy handlers
  const handleAddReturnOrder = () => toast.success("Add clicked");
  const handleDeleteSelected = () => toast.warn("Delete clicked");
  const generatePDF = () => toast.info("PDF generated");
  const exportToExcel = () => toast.info("Exported to Excel");
  const handleSortChange = (e) => setSortOption(e.target.value);
  const handleStatusChange = (e) => setStatusFilter(e.target.value);
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const fetchMetrics = () => toast("Fetching metrics");
  const fetchReturnOrders = () => toast("Fetching orders");
  const onTabClick = (tab) => setActiveTab(tab);

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredReturnOrders.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleReturnOrderClick = (id) => toast(`Clicked order ${id}`);

  const getId = (c) => c.id;
  const getCode = (c) => c.code;
  const getName = (c) => c.name;
  const getAddress = (c) => c.address;
  const isActive = (c) => c.active;

  const tabNames = ["All", "Active", "Inactive"];
  const anyFiltersOn =
    searchTerm || statusFilter !== "All" || sortOption || startDate || endDate;

  const isRangeValid =
    !startDate || !endDate || new Date(endDate) > new Date(startDate);

  return (
    <div className="p-4">
      <ToastContainer />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2 ">
          <h3 className="text-xl font-semibold mb-6">ReturnOrder List</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handleAddReturnOrder}
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
            ["Total ReturnOrders", summary.count],
            ["Credit Limit", summary.creditLimit],
            ["Paid ReturnOrders", summary.paidReturnOrders],
            ["Active ReturnOrders", summary.activeReturnOrders],
            ["On-Hold ReturnOrders", summary.onHoldReturnOrders],
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
              value={sortOption}
              onChange={handleSortChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="">Sort By</option>
              <option value="ReturnOrder Name">ReturnOrder Name</option>
              <option value="ReturnOrder Account in Ascending">
                ReturnOrder Account in Ascending
              </option>
              <option value="ReturnOrder Account in descending">
                ReturnOrder Account in descending
              </option>
            </select>
          </div>

          {/* Filter By Status */}
          <div className="relative">
            <FaFilter className="text-sm absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
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

          {/* Date Range */}
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
                fetchReturnOrders({ fromDate: startDate, toDate: endDate });
              }}
              disabled={!isRangeValid}
              className="px-3 py-1 border rounded"
            >
              Apply
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
            await fetchReturnOrders();
            await fetchMetrics();
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky top-0 z-10 px-4 py-2 bg-gray-50">
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={
                      selectedIds.length === filteredReturnOrders.length &&
                      filteredReturnOrders.length > 0
                    }
                    className="form-checkbox"
                  />
                </th>
                {[
                  "Return Order No",
                  "Sales Order No.",
                  "Return Date & Time",
                  "Cust Account",
                  "Customer Name",
                  "Return Status",
                  "Sale Invoice id agints return",
                  "Item Name",
                  "Order Qty",
                  "Unit of Measure (UOM)",
                  "Unit Price",
                  "Subtotal / line amount",
                  "Grand Total",
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
              {filteredReturnOrders.length ? (
                filteredReturnOrders.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-100 transition-colors"
                  >
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(c.id)}
                        onChange={() => handleCheckboxChange(c.id)}
                        className="form-checkbox"
                      />
                    </td>
                    <td className="px-6 py-4">{c.returnOrderNo}</td>
                    <td className="px-6 py-4">{c.salesOrderNo}</td>
                    <td className="px-6 py-4">
                      {c.returnDate
                        ? new Date(c.returnDate).toLocaleString()
                        : ""}
                    </td>
                    <td className="px-6 py-4">{c.custAccount}</td>
                    <td className="px-6 py-4">{c.customerName}</td>
                    <td className="px-6 py-4">{c.returnStatus}</td>
                    <td className="px-6 py-4">{c.saleInvoiceId}</td>
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
                          c.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {c.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={18}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>{" "}
      </div>
    </div>
  );
};

export default ReturnOrderList;
