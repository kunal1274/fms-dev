import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaSearch, FaSortAmountDown, FaFilter } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "react-toastify/dist/ReactToastify.css";
import "./c.css";
import WarehouseViewPage from "./WarehouseViewPagee";

export default function WarehouseList({ handleAddWarehouse }) {
  const baseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/warehouses";
  const metricsUrl = `${baseUrl}/metrics`;

  // Tab names
  const tabNames = [
    "All Warehouses",
    "Paid Warehouses",
    "Active Warehouses",
    "On‑Hold Warehouses",
    "Outstanding Warehouses",
  ];

  const [activeTab, setActiveTab] = useState(tabNames[0]);
  const [warehouses, setWarehouses] = useState([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOption, setSortOption] = useState("");

  const [summary, setSummary] = useState({
    count: 0,
    creditLimit: 0,
    paid: 0,
    active: 0,
    onHold: 0,
  });

  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const [loading, setLoading] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [error, setError] = useState(null);
  const [viewingId, setViewingId] = useState(null);

  // Fetch warehouses
  const fetchWarehouses = useCallback(
    async (from = startDate, to = endDate) => {
      setLoading(true);
      setError(null);
      try {
        const { data: resp } = await axios.get(baseUrl, {
          params: { from, to },
        });
        const list = resp.data || resp;
        setWarehouses(list);
        setFilteredWarehouses(list);
        setSummary((prev) => ({
          ...prev,
          count: list.length,
          creditLimit: list.reduce((sum, w) => sum + (w.creditLimit || 0), 0),
          paid: list.filter((w) => w.status === "Paid").length,
          active: list.filter((w) => w.active).length,
          onHold: list.filter((w) => w.onHold).length,
        }));
      } catch (err) {
        console.error(err);
        setError("Unable to load warehouse data.");
      } finally {
        setLoading(false);
      }
    },
    [startDate, endDate]
  );

  // Fetch metrics
  const fetchMetrics = useCallback(async () => {
    setLoadingMetrics(true);
    try {
      const { data: resp } = await axios.get(metricsUrl, {
        params: { from: startDate, to: endDate },
      });
      const m = (resp.metrics && resp.metrics[0]) || {};
      setSummary((prev) => ({
        ...prev,
        count: m.totalWarehouses ?? prev.count,
        creditLimit: m.creditLimit ?? prev.creditLimit,
        paid: m.paidWarehouses ?? prev.paid,
        active: m.activeWarehouses ?? prev.active,
        onHold: m.onHoldWarehouses ?? prev.onHold,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMetrics(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchWarehouses();
    fetchMetrics();
  }, [fetchWarehouses, fetchMetrics]);

  // Combined filtering, search, sort, tabs
  useEffect(() => {
    let list = [...warehouses];

    // Tab filtering
    switch (activeTab) {
      case tabNames[1]:
        list = list.filter((w) => w.status === "Paid");
        break;
      case tabNames[2]:
        list = list.filter((w) => w.active);
        break;
      case tabNames[3]:
        list = list.filter((w) => w.onHold);
        break;
      case tabNames[4]:
        list = list.filter((w) => w.outstandingBalance > 0);
        break;
      default:
        break;
    }

    // Status filter
    if (statusFilter === "Active") {
      list = list.filter((w) => w.active);
    } else if (statusFilter === "Inactive") {
      list = list.filter((w) => !w.active);
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (w) =>
          w.name.toLowerCase().includes(term) ||
          w.code.toLowerCase().includes(term)
      );
    }

    // Sort
    if (sortOption === "code-asc") {
      list.sort((a, b) => a.code.localeCompare(b.code));
    } else if (sortOption === "code-desc") {
      list.sort((a, b) => b.code.localeCompare(a.code));
    } else if (sortOption === "name-asc") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredWarehouses(list);
  }, [warehouses, activeTab, statusFilter, searchTerm, sortOption]);

  // Handlers
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleStatusChange = (e) => setStatusFilter(e.target.value);
  const handleSortChange = (e) => setSortOption(e.target.value);
  const onTabClick = (tab) => setActiveTab(tab);
  const toggleSelectAll = (e) =>
    setSelectedIds(
      e.target.checked ? filteredWarehouses.map((w) => w._id) : []
    );
  const handleCheckboxChange = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return toast.info("No warehouses selected");
    if (!window.confirm("Delete selected warehouses?")) return;

    try {
      const results = await Promise.allSettled(
        selectedIds.map((id) => axios.delete(`${baseUrl}/${id}`))
      );
      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;
      if (succeeded) {
        toast.success(`${succeeded} deleted`);
        await fetchWarehouses();
        setSelectedIds([]);
      }
      if (failed) toast.error(`${failed} failed`);
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error");
    }
  };

  const exportToExcel = () => {
    if (!warehouses.length) return toast.info("No data to export");
    const ws = XLSX.utils.json_to_sheet(warehouses);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Warehouses");
    XLSX.writeFile(wb, "warehouses.xlsx");
  };

  const generatePDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    autoTable(doc, {
      head: [["#", "Code", "Name", "Contact", "Address", "Status"]],
      body: filteredWarehouses.map((w, i) => [
        i + 1,
        w.code,
        w.name,
        w.contactNum,
        w.address,
        w.active ? "Active" : "Inactive",
      ]),
    });
    doc.save("warehouses.pdf");
  };

  const handleRowClick = (id) => setViewingId(id);
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setSortOption("");
    setActiveTab(tabNames[0]);
  };
  const goBack = () => setViewingId(null);

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  if (viewingId) {
    return <WarehouseViewPage warehouseId={viewingId} goBack={goBack} />;
  }

  return (
    <div className="p-4">
      <ToastContainer />
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Warehouses</h3>
        <div className="space-x-2">
          <button onClick={handleAddWarehouse} className="btn">
            + Add
          </button>
          <button
            onClick={handleDeleteSelected}
            className="btn"
            disabled={!selectedIds.length}
          >
            Delete
          </button>
          <button onClick={generatePDF} className="btn">
            PDF
          </button>
          <button onClick={exportToExcel} className="btn">
            Export
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex space-x-2 mb-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <button
            onClick={() => {
              fetchMetrics();
              fetchWarehouses();
            }}
            className="px-3 py-1 border rounded"
          >
            {loadingMetrics ? "Applying…" : "Apply"}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {[
            ["Total", summary.count],
            ["Credit Limit", summary.creditLimit],
            ["Paid", summary.paid],
            ["Active", summary.active],
            ["On‑Hold", summary.onHold],
          ].map(([label, value]) => (
            <div key={label} className="bg-gray-50 p-4 rounded text-center">
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between bg-white rounded-md p-4 mb-4 space-y-2 md:space-y-0">
        <div className="flex items-center space-x-4">
          {/* Sort */}
          <div className="relative">
            <FaSortAmountDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={sortOption}
              onChange={handleSortChange}
              className="pl-10 pr-4 py-2 border rounded-lg"
            >
              <option value="">Sort By</option>
              <option value="code-asc">Code Asc</option>
              <option value="code-desc">Code Desc</option>
              <option value="name-asc">Name Asc</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="pl-10 pr-4 py-2 border rounded-lg"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-3 pr-10 py-2 border rounded-md"
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <button onClick={resetFilters} className="text-red-500">
          Reset
        </button>
      </div>

      {/* Tabs */}
      <ul className="flex space-x-6 mb-4">
        {tabNames.map((tab) => (
          <li
            key={tab}
            onClick={() => onTabClick(tab)}
            className={`cursor-pointer pb-2 ${
              activeTab === tab
                ? "border-b-2 border-green-600 text-green-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {tab}
          </li>
        ))}
      </ul>

      {/* Table */}
      <div
        className="overflow-auto bg-white rounded-lg"
        style={{ maxHeight: "400px" }}
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-2">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={
                    selectedIds.length === filteredWarehouses.length &&
                    filteredWarehouses.length > 0
                  }
                />
              </th>
              {["Code", "Name", "Address", "Contact", "Status"].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredWarehouses.length ? (
              filteredWarehouses.map((w, i) => (
                <tr key={w._id} className="hover:bg-gray-100">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(w._id)}
                      onChange={() => handleCheckboxChange(w._id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => handleRowClick(w._id)}
                    >
                      {w.code}
                    </button>
                  </td>
                  <td className="px-6 py-4">{w.name}</td>
                  <td className="px-6 py-4">{w.address}</td>
                  <td className="px-6 py-4">{w.contactNum}</td>
                  <td className="px-6 py-4">
                    {w.active ? "Active" : "Inactive"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
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
