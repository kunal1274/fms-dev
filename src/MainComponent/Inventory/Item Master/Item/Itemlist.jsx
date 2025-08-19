import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "react-toastify/dist/ReactToastify.css";
import "./c.css";

// NOTE: change this import back to "./ItemViewPagee" if your file is named that.
import ItemViewPage from "./ItemViewPage";

/** ---------- Small helpers to normalize fields ---------- */
const getId = (c) => c?._id || c?.id || c?.customerId || c?.code || "";
const getCode = (c) => c?.customerCode || c?.code || "";
const getName = (c) => c?.customerName || c?.name || "";
const getEmail = (c) => c?.email || "";
const getGST = (c) => c?.taxInfo?.gstNumber || "";
const getDescription = (c) =>
  c?.description || c?.primaryGSTDescription || c?.address || "";
const getBusinessType = (c) => c?.businessType || "";
const getCurrency = (c) => c?.currency || "";
const isActive = (c) => !!c?.active;
const isOnHold = (c) => !!c?.onHold;
const outstanding = (c) => Number(c?.outstandingBalance || 0);
const getStatus = (c) => String(c?.status || "");
const isHold = (c) => !isActive(c);
const toStartOfDayISO = (localDateStr /* YYYY-MM-DD */) =>
  new Date(`${localDateStr}T00:00:00`).toISOString();
const toEndOfDayISO = (localDateStr /* YYYY-MM-DD */) =>
  new Date(`${localDateStr}T23:59:59.999`).toISOString();

export default function ItemList({ handleAddItem }) {
  /** ---------- API ---------- */
  const baseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/items";
  const metricsUrl = `${baseUrl}/metrics`;

  /** ---------- Tabs ---------- */
  const tabNames = [
    "Item List",
    "Paid Item",
    "Active Item",
    "Hold Item",
    "Outstanding Item",
  ];
  const [activeTab, setActiveTab] = useState(tabNames[0]);

  /** ---------- Dates ---------- */
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  /** ---------- Data & View ---------- */
  const [customers, setItems] = useState([]);
  const [viewingItemId, setViewingItemId] = useState(null);

  /** ---------- Filters ---------- */
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // All | Active | Inactive
  const [sortOption, setSortOption] = useState(""); // name-asc | code-asc | code-desc

  /** ---------- Selection ---------- */
  const [selectedIds, setSelectedIds] = useState([]);

  /** ---------- Summary ---------- */
  const [summary, setSummary] = useState({
    count: 0,
    creditLimit: 0,
    paidItems: 0,
    activeItems: 0,
    onHoldItems: 0,
  });

  /** ---------- UX ---------- */
  const [loading, setLoading] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [error, setError] = useState(null);

  /** ---------- Fetch: Items ---------- */
  const fetchItems = useCallback(
    async (fromDate = startDate, toDate = endDate) => {
      setLoading(true);
      setError(null);
      try {
        const fromISO = toStartOfDayISO(fromDate);
        const toISO = toEndOfDayISO(toDate);

        const { data: resp } = await axios.get(baseUrl, {
          params: { from: fromISO, to: toISO },
        });

        const raw = resp?.data || resp || [];
        const list = Array.isArray(raw) ? raw : [];

        // Defensive client filter on createdAt bounds
        const fromMs = new Date(fromISO).getTime();
        const toMs = new Date(toISO).getTime();
        const filtered = list.filter((c) => {
          if (!c?.createdAt) return false;
          const t = new Date(c.createdAt).getTime();
          return t >= fromMs && t <= toMs;
        });

        setItems(filtered);

        // Baseline summary (fallback if metrics call fails)
        setSummary({
          count: filtered.length,
          creditLimit: filtered.reduce(
            (s, c) => s + (Number(c?.creditLimit) || 0),
            0
          ),
          paidItems: filtered.filter((c) => getStatus(c) === "Paid").length,
          activeItems: filtered.filter((c) => isActive(c)).length,

          onHoldItems: filtered.filter((c) => isHold(c)).length, // Hold == Inactive
        });
      } catch (err) {
        console.error(err);
        setError("Unable to load customer data.");
      } finally {
        setLoading(false);
      }
    },
    [startDate, endDate]
  );
  const isInactive = (c) => !isActive(c);
  const isHold = (c) => isInactive(c) || isOnHold(c);
  /** ---------- Fetch: Metrics (optional backend aggregation) ---------- */
  const fetchMetrics = useCallback(
    async (fromDate = startDate, toDate = endDate) => {
      setLoadingMetrics(true);
      try {
        const fromISO = toStartOfDayISO(fromDate);
        const toISO = toEndOfDayISO(toDate);

        const { data: resp } = await axios.get(metricsUrl, {
          params: { from: fromISO, to: toISO },
        });

        const m = (resp?.metrics && resp.metrics[0]) || {};
        setSummary((prev) => ({
          ...prev,
          count: m?.totalItems ?? prev.count,
          creditLimit: m?.creditLimit ?? prev.creditLimit,
          paidItems: m?.paidItems ?? prev.paidItems,
          activeItems: m?.activeItems ?? prev.activeItems,
          onHoldItems: m?.onHoldItems ?? prev.onHoldItems,
          count: filtered.length,
          creditLimit: filtered.reduce(
            (s, c) => s + (Number(c?.creditLimit) || 0),
            0
          ),
          paidItems: filtered.filter((c) => getStatus(c) === "Paid").length,
          activeItems: filtered.filter((c) => isActive(c)).length,
          onHoldItems: filtered.filter((c) => isInactive(c)).length, // Hold == Inactive
        }));
      } catch (err) {
        // optional; ignore errors
        console.error(err);
      } finally {
        setLoadingMetrics(false);
      }
    },
    [startDate, endDate]
  );

  /** ---------- Initial + on date change ---------- */
  useEffect(() => {
    fetchItems();
    fetchMetrics();
  }, [fetchItems, fetchMetrics]);

  /** ---------- Derived: filtered + sorted customers ---------- */
  const filteredItems = useMemo(() => {
    let list = [...customers];

    // Tabs
    switch (activeTab) {
      case "Paid Item":
        list = list.filter((c) => getStatus(c) === "Paid");
        break;
      case "Active Item":
        list = list.filter((c) => isActive(c));
        break;
      case "Hold Item":
        list = list.filter((c) => isInactive(c)); // show inactive customers
        break;
      case "Outstanding Item":
        list = list.filter((c) => outstanding(c) > 0);
        break;
      default:
        break;
    }

    // Status filter
    if (statusFilter === "Active") list = list.filter((c) => isActive(c));
    else if (statusFilter === "Inactive")
      list = list.filter((c) => !isActive(c));
    if (statusFilter === "Active") list = list.filter((c) => isActive(c));
    else if (statusFilter === "Inactive")
      list = list.filter((c) => isInactive(c));
    // Search
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter((c) => {
        const hay = [
          getName(c),
          getCode(c),
          getEmail(c),
          getGST(c),
          getDescription(c),
          getBusinessType(c),
          getCurrency(c),
        ]
          .join(" | ")
          .toLowerCase();
        return hay.includes(term);
      });
    }

    // Sort
    const cmpStr = (a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" });
    if (sortOption === "name-asc")
      list.sort((a, b) => cmpStr(getName(a), getName(b)));
    else if (sortOption === "code-asc")
      list.sort((a, b) => cmpStr(getCode(a), getCode(b)));
    else if (sortOption === "code-desc")
      list.sort((a, b) => cmpStr(getCode(b), getCode(a)));

    return list;
  }, [customers, activeTab, statusFilter, searchTerm, sortOption]);

  /** ---------- Handlers ---------- */
  const onTabClick = (tab) => {
    setActiveTab(tab);
    // clear selections and filters when moving tabs
    setSelectedIds([]);
    setSearchTerm("");
    setStatusFilter("All");
    setSortOption("");
  };

  const handleStatusChange = (e) => {
    const v = e.target.value;
    if (v === "yes") return setStatusFilter("Active");
    if (v === "no") return setStatusFilter("Inactive");
    setStatusFilter("All");
  };

  const handleSortChange = (e) => {
    const v = e.target.value;
    if (v === "Item Name") return setSortOption("name-asc");
    if (v === "Item Account no") return setSortOption("code-asc");
    if (v === "Item Account no descending")
      return setSortOption("code-desc");
    setSortOption(v || "");
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const toggleSelectAll = (e) => {
    setSelectedIds(e.target.checked ? filteredItems.map(getId) : []);
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) {
      toast.info("No customers selected to delete");
      return;
    }
    if (!window.confirm(`Delete ${selectedIds.length} selected item(s)?`)) {
      return;
    }
    try {
      const results = await Promise.allSettled(
        selectedIds.map((id) => axios.delete(`${baseUrl}/${id}`))
      );
      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.length - succeeded;

      if (succeeded) {
        toast.success(`${succeeded} deleted`);
        setSelectedIds([]);
        await fetchItems(startDate, endDate);
        await fetchMetrics(startDate, endDate);
      }
      if (failed) toast.error(`${failed} failed — check console`);
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error while deleting");
    }
  };

  /** ---------- Export ---------- */
  const exportToExcel = () => {
    if (!customers.length) {
      toast.info("No data to export.");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(
      customers.map((c) => ({
        Code: getCode(c),
        Name: getName(c),
        Email: getEmail(c),
        GST: getGST(c),
        BusinessType: getBusinessType(c),
        Currency: getCurrency(c),
        Description: getDescription(c),
        Status: isActive(c) ? "Active" : "Inactive",
        CreatedAt: c?.createdAt || "",
        Contact: c?.contactNum || "",
        Outstanding: outstanding(c),
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Items");
    XLSX.writeFile(wb, "customer_list.xlsx");
  };

  const generatePDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    autoTable(doc, {
      head: [["#", "Code", "Name", "Email", "GST", "Description", "Status"]],
      body: filteredItems.map((c, i) => [
        i + 1,
        getCode(c) || "",
        getName(c) || "",
        getEmail(c) || "",
        getGST(c) || "",
        getDescription(c) || "",
        isActive(c) ? "Active" : "Inactive",
      ]),
    });
    doc.save("customer_list.pdf");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setSortOption("");
    setSelectedIds([]);
  };

  const handleItemClick = (customerId) => {
    setViewingItemId(customerId);
  };

  const goBack = () => setViewingItemId(null);

  /** ---------- Render ---------- */
  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  if (viewingItemId) {
    return (
      <div className="p-4">
        <ItemViewPage customerId={viewingItemId} goBack={goBack} />
      </div>
    );
  }

  return (
    <div>
      <ToastContainer />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2 ">
          <h3 className="text-xl font-semibold mb-6">Item List</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handleAddItem}
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
              fetchMetrics(startDate, endDate);
              fetchItems(startDate, endDate);
            }}
            className="px-3 py-1 border rounded"
          >
            {loadingMetrics ? "Applying…" : "Apply"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {[
            ["Total Items", summary.count],
            ["Credit Limit", summary.creditLimit],
            ["Paid Items", summary.paidItems],
            ["Active Items", summary.activeItems],
            ["On-Hold Items", summary.onHoldItems],
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
                  ? "Item Name"
                  : sortOption === "code-asc"
                  ? "Item Account no"
                  : sortOption === "code-desc"
                  ? "Item Account no descending"
                  : ""
              }
              onChange={handleSortChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="">Sort By</option>
              <option value="Item Name">Item Name</option>
              <option value="Item Account no">
                Item Account in Ascending
              </option>
              <option value="Item Account no descending">
                Item Account in descending
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
        </div>

        {/* Reset */}
        <button
          onClick={resetFilters}
          disabled={
            !(
              sortOption ||
              statusFilter === "Active" ||
              statusFilter === "Inactive" ||
              searchTerm
            )
          }
          className={`font-medium w-full sm:w-auto transition
          ${
            sortOption ||
            statusFilter === "Active" ||
            statusFilter === "Inactive" ||
            searchTerm
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
                    selectedIds.length === filteredItems.length &&
                    filteredItems.length > 0
                  }
                  className="form-checkbox"
                />
              </th>
              {[
                "Code",
                "Name",
                "Description",
                "Created At",
                "Contact",
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
            {filteredItems.length ? (
              filteredItems.map((c) => (
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
                      onClick={() => handleItemClick(getId(c))}
                    >
                      {getCode(c)}
                    </button>
                  </td>
                  <td className="px-6 py-4">{getName(c)}</td>
                  <td className="px-6 py-4">{getDescription(c)}</td>
                  <td className="px-6 py-3 truncate">
                    {c?.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                  </td>
                  <td className="px-6 py-4">{c?.contactNum || ""}</td>
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
  );
}
