import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaSearch, FaSortAmountDown, FaFilter } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "react-toastify/dist/ReactToastify.css";
import "./c.css";
import ShelvesViewPage from "./ShelvesViewPagee";

export default function ShelvesList({ handleAddShelves }) {
  const baseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/Shelvess";
  const metricsUrl = `${baseUrl}/metrics`;

  // Tab names

  const tabNames = [
    "All Shelvess",
    "Paid Shelvess",
    "Active Shelvess",
    "On‑Hold Shelvess",
    "Outstanding Shelvess",
  ];

  const [activeTab, setActiveTab] = useState(tabNames[0]);
  const [Shelvess, setShelvess] = useState([]);
  const [filteredShelvess, setFilteredShelvess] = useState([]);
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

  // Fetch Shelvess
  const fetchShelvess = useCallback(
    async (from = startDate, to = endDate) => {
      setLoading(true);
      setError(null);
      try {
        const { data: resp } = await axios.get(baseUrl, {
          params: { from, to },
        });
        const list = resp.data || resp;
        setShelvess(list);
        setFilteredShelvess(list);
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
        setError("Unable to load Shelves data.");
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
        count: m.totalShelvess ?? prev.count,
        creditLimit: m.creditLimit ?? prev.creditLimit,
        paid: m.paidShelvess ?? prev.paid,
        active: m.activeShelvess ?? prev.active,
        onHold: m.onHoldShelvess ?? prev.onHold,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMetrics(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchShelvess();
    fetchMetrics();
  }, [fetchShelvess, fetchMetrics]);

  // ComShelvesed filtering, search, sort, tabs
  useEffect(() => {
    let list = [...Shelvess];

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

    setFilteredShelvess(list);
  }, [Shelvess, activeTab, statusFilter, searchTerm, sortOption]);

  // Handlers
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleStatusChange = (e) => setStatusFilter(e.target.value);
  const handleSortChange = (e) => setSortOption(e.target.value);
  const onTabClick = (tab) => setActiveTab(tab);
  const toggleSelectAll = (e) =>
    setSelectedIds(e.target.checked ? filteredShelvess.map((w) => w._id) : []);
  const handleCheckboxChange = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return toast.info("No Shelvess selected");
    if (!window.confirm("Delete selected Shelvess?")) return;

    try {
      const results = await Promise.allSettled(
        selectedIds.map((id) => axios.delete(`${baseUrl}/${id}`))
      );
      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;
      if (succeeded) {
        toast.success(`${succeeded} deleted`);
        await fetchShelvess();
        setSelectedIds([]);
      }
      if (failed) toast.error(`${failed} failed`);
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error");
    }
  };

  const exportToExcel = () => {
    if (!Shelvess.length) return toast.info("No data to export");
    const ws = XLSX.utils.json_to_sheet(Shelvess);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Shelvess");
    XLSX.writeFile(wb, "Shelvess.xlsx");
  };

  const generatePDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    autoTable(doc, {
      head: [["#", "Code", "Name", "Contact", "Address", "Status"]],
      body: filteredShelvess.map((w, i) => [
        i + 1,
        w.code,
        w.name,
        w.contactNum,
        w.address,
        w.active ? "Active" : "Inactive",
      ]),
    });
    doc.save("Shelvess.pdf");
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
    return <ShelvesViewPage ShelvesId={viewingId} goBack={goBack} />;
  }

  return (
    <div>
      <ToastContainer />
      <div>
        <div>
          {viewingId ? (
            <ShelvesViewPage
              toggleView={toggleView}
              customerId={viewingCustomerId}
              goBack={goBack}
            />
          ) : (
            <div className="space-y-6">
              <ToastContainer />
              {/* Header Buttons */}
              <div className="flex justify-between ">
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    {" "}
                    <button
                      type="button"
                      className="text-blue-600 mt-2 text-sm hover:underline"
                    >
                      Upload Photo
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 11c1.656 0 3-1.344 3-3s-1.344-3-3-3-3 1.344-3 3 1.344 3 3 3zm0 2c-2.761 0-5 2.239-5 5v3h10v-3c0-2.761-2.239-5-5-5z"
                        />
                      </svg>{" "}
                    </button>
                  </div>
                  <h3 className="text-xl font-semibold">Shelves</h3>
                </div>
                <div className="flex items-center gap-3 ">
                  <button
                    onClick={handleAddShelves}
                    className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
                  >
                    + Add
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
                    disabled={!selectedIds.length}
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

              {/* Metrics */}
              <div className=" bg-white rounded-lg ">
                <div className="flex gap-2">
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
                      fetchCustomers(startDate, endDate);
                    }}
                    className="px-3 py-1 border rounded"
                  >
                    {loadingMetrics ? "Applying…" : "Apply"}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                  {[
                    ["Total Shelvess", summary.count],
                    ["Credit Limit", summary.creditLimit],
                    ["Paid Shelvess", summary.paid],
                    ["Active Shelvess", summary.active],
                    ["On-Hold Shelvess", summary.onHold],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="p-4 bg-gray-50 rounded-lg text-center"
                    >
                      <div className="text-2xl font-bold">{value}</div>
                      <div className="text-sm">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap Sales-center text-sm justify-between p-2 bg-white rounded-md  mb-2 space-y-3 md:space-y-0 md:space-x-4">
                <div className="flex items-center space-x-4">
                  {/* Sort */}
                  <div className="relative">
                    <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      value={sortOption}
                      onChange={handleSortChange}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      <option value="">Sort By</option>
                      <option value="code-asc">Code Asc</option>
                      <option value="code-desc">Code Desc</option>
                      <option value="name-asc">Name Asc</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="relative">
                    <FaFilter className=" text-sm absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={handleStatusChange}
                      className="pl-10 pr-4 py-2 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    />{" "}
                    <button
                      value={searchTerm}
                      onChange={handleSearchChange}
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      <FaSearch className="w-5 h-5" />{" "}
                    </button>
                  </div>
                </div>
                <button
                  onClick={resetFilters}
                  className="text-red-500 hover:text-red-600 font-medium"
                >
                  Reset
                </button>
              </div>
              {/* Data Table */}
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
                            selectedIds.length === filteredShelvess.length &&
                            filteredShelvess.length > 0
                          }
                        />
                      </th>
                      {["Code", "Name", "Discription", "Type", "Status"].map(

                        
                        (h) => (
                          <th
                            key={h}
                            className="sticky top-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredShelvess.length ? (
                      filteredShelvess.map((w, i) => (
                        <tr
                          key={w._id}
                          className="hover:bg-gray-100 transition-colors"
                        >
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(w._id)}
                              onChange={() => handleCheckboxChange(w._id)}
                            />
                          </td>
                          <td>
                            <button
                              className="text-blue-600 hover:underline"
                              onClick={() => handleRowClick(w._id)}
                            >
                              {w.code}
                            </button>
                          </td>
                          <td className="px-6 py-4">{w.name}</td>
                          <td className="px-6 py-4">{w.description}</td>{" "}
                          <td className="px-6 py-4">{w.site?.name || "—"}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                w.active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {w.active ? "Active" : "Inactive"}
                            </span>
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
          )}
        </div>
      </div>
    </div>
  );
}
