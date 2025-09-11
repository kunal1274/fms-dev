import React, { useState, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import { FaSortAmountDown, FaFilter, FaSearch } from "react-icons/fa";

export default function FreeTaxingListDemo() {
  const dummyData = [
    {
      id: 1,
      invoiceId: "FTX-1001",
      refTransactionId: "REF-9001",
      custAccount: "CUST-123",
      customerName: "John Doe",
      status: "Active",
      transactionType: "Sale",
      itemCode: "ITEM-101",
      name: "Product A",
      postingAccount: "ACCT-500",
      orderQty: 10,
      uom: "pcs",
      unitPrice: 50,
      subtotal: 500,
      grandTotal: 550,
      currency: "USD",
      orderId: "ORD-111",
      site: "NYC",
      warehouse: "WH-01",
      createdAt: "2025-09-10T10:00:00Z",
      contactNum: "1234567890",
    },
    {
      id: 2,
      invoiceId: "FTX-1002",
      refTransactionId: "REF-9002",
      custAccount: "CUST-456",
      customerName: "Jane Smith",
      status: "Inactive",
      transactionType: "Purchase",
      itemCode: "ITEM-202",
      name: "Product B",
      postingAccount: "ACCT-700",
      orderQty: 5,
      uom: "pcs",
      unitPrice: 100,
      subtotal: 500,
      grandTotal: 500,
      currency: "USD",
      orderId: "ORD-222",
      site: "LA",
      warehouse: "WH-02",
      createdAt: "2025-09-09T14:00:00Z",
      contactNum: "9876543210",
    },
  ];

  // ---- State ----
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  // ---- Dummy summary ----
  const summary = {
    count: dummyData.length,
    creditLimit: "$10,000",
    paidFreeTaxings: 1,
    activeFreeTaxings: dummyData.filter((d) => d.status === "Active").length,
    onHoldFreeTaxings: 0,
  };

  const tabNames = ["All", "Active", "Inactive"];

  // ---- Actions ----
  const handleAddFreeTaxing = () => toast.success("Add FreeTaxing clicked!");
  const handleDeleteSelected = () => toast.info("Deleted selected notes");
  const generatePDF = () => toast.info("PDF generated");
  const exportToExcel = () => toast.info("Exported to Excel");

  const toggleSelectAll = () => {
    if (selectedIds.length === dummyData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(dummyData.map((d) => d.id));
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // ---- Filtering / Searching ----
  const filteredData = useMemo(() => {
    return dummyData.filter((item) => {
      const matchesSearch =
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.invoiceId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" ||
        item.status === (statusFilter === "yes" ? "Active" : "Inactive");
      const matchesTab = activeTab === "All" || item.status === activeTab;
      return matchesSearch && matchesStatus && matchesTab;
    });
  }, [dummyData, searchTerm, statusFilter, activeTab]);

  const anyFiltersOn =
    searchTerm || statusFilter !== "All" || startDate || endDate || sortOption;

  return (
    <div>
      <ToastContainer />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2 ">
          <h3 className="text-xl font-semibold mb-6">FreeTaxing List</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handleAddFreeTaxing}
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
            ["Total FreeTaxings", summary.count],
            ["Credit Limit", summary.creditLimit],
            ["Paid FreeTaxings", summary.paidFreeTaxings],
            ["Active FreeTaxings", summary.activeFreeTaxings],
            ["On-Hold FreeTaxings", summary.onHoldFreeTaxings],
          ].map(([label, value]) => (
            <div key={label} className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap text-sm justify-between p-2 bg-white rounded-md mb-2 space-y-3 md:space-y-0 md:space-x-4">
        <div className="flex items-center space-x-4">
          {/* Sort By */}
          <div className="relative">
            <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
            >
              <option value="">Sort By</option>
              <option value="name-asc">FreeTaxing Name</option>
              <option value="code-asc">FreeTaxing Account Asc</option>
              <option value="code-desc">FreeTaxing Account Desc</option>
            </select>
          </div>

          {/* Filter By Status */}
          <div className="relative">
            <FaFilter className="text-sm absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border text-sm border-gray-300 rounded-lg focus:outline-none"
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-60 pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FaSearch className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("All");
            setSelectedIds([]);
            setSortOption("");
            setStartDate("");
            setEndDate("");
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
              onClick={() => setActiveTab(tab)}
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
      <div className="table-scroll-container h-[300px] overflow-auto bg-white rounded-lg mt-2">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky top-0 z-10 px-4 py-2 bg-gray-50">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={
                    selectedIds.length === dummyData.length &&
                    dummyData.length > 0
                  }
                  className="form-checkbox"
                />
              </th>
              {[
                "Free Tax Invoice ID",
                "ReferenceTransactionID",
                "Cust Account",
                "Customer Name",
                "Status",
                "Transaction type",
                "Item Code",
                "Name",
                "Posting Account",
                "Order Qty",
                "Unit of Measure (UOM)",
                "Unit Price",
                "Subtotal / line amount",
                "Grand Total",
                "Currency",
                "Order Id",
                "Site",
                "Warehouse",
                "Created At",
                "Contact Number",
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
            {filteredData.length ? (
              filteredData.map((c) => (
                <tr key={c.id} className="hover:bg-gray-100 transition-colors">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(c.id)}
                      onChange={() => handleCheckboxChange(c.id)}
                      className="form-checkbox"
                    />
                  </td>
                  <td className="px-6 py-4">{c.invoiceId}</td>
                  <td className="px-6 py-4">{c.refTransactionId}</td>
                  <td className="px-6 py-4">{c.custAccount}</td>
                  <td className="px-6 py-4">{c.customerName}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        c.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{c.transactionType}</td>
                  <td className="px-6 py-4">{c.itemCode}</td>
                  <td className="px-6 py-4">{c.name}</td>
                  <td className="px-6 py-4">{c.postingAccount}</td>
                  <td className="px-6 py-4">{c.orderQty}</td>
                  <td className="px-6 py-4">{c.uom}</td>
                  <td className="px-6 py-4">{c.unitPrice}</td>
                  <td className="px-6 py-4">{c.subtotal}</td>
                  <td className="px-6 py-4">{c.grandTotal}</td>
                  <td className="px-6 py-4">{c.currency}</td>
                  <td className="px-6 py-4">{c.orderId}</td>
                  <td className="px-6 py-4">{c.site}</td>
                  <td className="px-6 py-4">{c.warehouse}</td>
                  <td className="px-6 py-4">{c.createdAt}</td>
                  <td className="px-6 py-4">{c.contactNum}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={20}
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
