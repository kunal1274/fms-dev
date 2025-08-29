import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "react-toastify/dist/ReactToastify.css";

import "./c.css";



import VendorViewPage from "./VendorViewPage";

export default function VendorList({ handleAddVendor }) {
  /** ---------- API ---------- */
  const baseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/customers";
  const metricsUrl = `${baseUrl}/metrics`;

  /** ---------- Helpers to normalize fields ---------- */
  const getId = (c) => c?._id || c?.id || c?.customerId || c?.code || "";
  const getCode = (c) => c?.customerCode || c?.code || "";
  const getName = (c) => c?.customerName || c?.name || "";
  const getEmail = (c) => c?.email || "";
  const getGST = (c) => c?.taxInfo?.gstNumber || "";
  const getAddress = (c) => c?.primaryGSTAddress || c?.address || "";
  const getBusinessType = (c) => c?.businessType || "";
  const getCurrency = (c) => c?.currency || "";
  const isActive = (c) => !!c?.active;
  const isOnHold = (c) => !!c?.onHold;
  const isInactive = (c) => !isActive(c);
  const outstanding = (c) => Number(c?.outstandingBalance || 0);
  const getStatus = (c) => String(c?.status || "");

  /** ---------- Date helpers ---------- */
  const toStartOfDayISO = (dateStr /* 'YYYY-MM-DD' */) =>
    new Date(`${dateStr}T00:00:00.000Z`).toISOString();
  const toEndOfDayISO = (dateStr /* 'YYYY-MM-DD' */) =>
    new Date(`${dateStr}T23:59:59.999Z`).toISOString();

  // addDays that is timezone-safe (strictly next day for 'min' on endDate)
  const addDays = (dateStr, days) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() + days);
    const yyyy = dt.getUTCFullYear();
    const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(dt.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = () => {
    const dt = new Date();
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  /** ---------- Tabs ---------- */
  const tabNames = [
    "Vendor List",
    "Paid Vendor",
    "Active Vendor",
    "Hold Vendor",
    "Outstanding Vendor",
  ];

  /** ---------- State ---------- */
  const [activeTab, setActiveTab] = useState(tabNames[0]);

  // Dates start empty => initial fetch = ALL data
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [customers, setVendors] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewingVendorId, setViewingVendorId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // All | Active | Inactive
  const [sortOption, setSortOption] = useState(""); // name-asc | code-asc | code-desc

  const [summary, setSummary] = useState({
    count: 0,
    creditLimit: 0,
    paidVendors: 0,
    activeVendors: 0,
    onHoldVendors: 0,
  });

  const [loading, setLoading] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [error, setError] = useState(null);

  /** ---------- Keep endDate valid vs startDate ---------- */
  useEffect(() => {
    if (!startDate) return;
    setEndDate((prev) => {
      const min = addDays(startDate, 1);
      if (!prev || prev <= startDate) return min;
      return prev;
    });
  }, [startDate]);

  /** ---------- Fetchers ---------- */
  const fetchVendors = useCallback(
    async ({ fromDate, toDate } = {}) => {
      setLoading(true);
      setError(null);
      try {
        let params = {};
        let fromISO, toISO;

        if (fromDate && toDate) {
          fromISO = toStartOfDayISO(fromDate);
          toISO = toEndOfDayISO(toDate);
          params = { from: fromISO, to: toISO };
        }

        const { data: resp } = await axios.get(baseUrl, { params });
        const list = resp?.data || resp || [];
        const arrayList = Array.isArray(list) ? list : [];

        // If backend didn't filter by date, enforce it client-side when dates are provided
        let finalList = arrayList;
        if (fromISO && toISO) {
          const fromMs = new Date(fromISO).getTime();
          const toMs = new Date(toISO).getTime();
          finalList = arrayList.filter((c) => {
            if (!c?.createdAt) return false;
            const t = new Date(c.createdAt).getTime();
            return t >= fromMs && t <= toMs;
          });
        }

        setVendors(finalList);

        // Fallback local summary (metrics may override later)
        setSummary((prev) => ({
          ...prev,
          count: finalList.length || 0,
          creditLimit: finalList.reduce(
            (s, c) => s + (Number(c?.creditLimit) || 0),
            0
          ),
          paidVendors: finalList.filter((c) => getStatus(c) === "Paid")
            .length,
          activeVendors: finalList.filter(isActive).length,
          onHoldVendors: finalList.filter((c) => isInactive(c) || isOnHold(c))
            .length,
        }));
      } catch (err) {
        console.error(err);
        setError("Unable to load Vendor data.");
      } finally {
        setLoading(false);
      }
    },
    [baseUrl]
  );

  const fetchMetrics = useCallback(
    async ({ fromDate, toDate } = {}) => {
      setLoadingMetrics(true);
      try {
        let params = {};
        if (fromDate && toDate) {
          params = {
            from: toStartOfDayISO(fromDate),
            to: toEndOfDayISO(toDate),
          };
        }

        const { data: resp } = await axios.get(metricsUrl, { params });
        const m = (resp?.metrics && resp.metrics[0]) || {};

        setSummary((prev) => ({
          ...prev,
          count: m?.totalVendors ?? prev.count,
          creditLimit: m?.creditLimit ?? prev.creditLimit,
          paidVendors: m?.paidVendors ?? prev.paidVendors,
          activeVendors: m?.activeVendors ?? prev.activeVendors,
          onHoldVendors:
            typeof m?.inactiveVendors === "number"
              ? m.inactiveVendors
              : m?.onHoldVendors ?? prev.onHoldVendors,
        }));
      } catch (err) {
        // metrics optional; do not block UI
        console.error(err);
      } finally {
        setLoadingMetrics(false);
      }
    },
    [metricsUrl]
  );

  /** ---------- Initial load: fetch ALL (no dates) ---------- */
  useEffect(() => {
    fetchVendors(); // all
    fetchMetrics(); // all
  }, [fetchVendors, fetchMetrics]);

  /** ---------- Derived: filtered + sorted list ---------- */
  const filteredVendors = useMemo(() => {
    let list = [...customers];

    // Tabs
    switch (activeTab) {
      case "Paid Vendor":
        list = list.filter((c) => getStatus(c) === "Paid");
        break;
      case "Active Vendor":
        list = list.filter(isActive);
        break;
      case "Hold Vendor":
        list = list.filter((c) => isInactive(c) || isOnHold(c));
        break;
      case "Outstanding Vendor":
        list = list.filter((c) => outstanding(c) > 0);
        break;
      default:
        break;
    }

    // Status filter
    if (statusFilter === "Active") list = list.filter(isActive);
    else if (statusFilter === "Inactive") list = list.filter(isInactive);

    // Search
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter((c) => {
        const hay = [
          getName(c),
          getCode(c),
          getEmail(c),
          getGST(c),
          getAddress(c),
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

  /** ---------- Date-range validity ---------- */
  const isRangeValid = useMemo(() => {
    if (!startDate || !endDate) return false;
    const s = new Date(startDate).getTime();
    const e = new Date(endDate).getTime();
    return e > s;
  }, [startDate, endDate]);

  /** ---------- Handlers ---------- */
  const onTabClick = (tab) => {
    setActiveTab(tab);
    // clear selections and basic filters when moving tabs (keep chosen dates)
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
    if (v === "Vendor Name") return setSortOption("name-asc");
    if (v === "Vendor Account in Ascending") return setSortOption("code-asc");
    if (v === "Vendor Account in descending")
      return setSortOption("code-desc");
    setSortOption(v || "");
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const toggleSelectAll = (e) => {
    setSelectedIds(e.target.checked ? filteredVendors.map(getId) : []);
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
        if (isRangeValid) {
          await fetchVendors({ fromDate: startDate, toDate: endDate });
          await fetchMetrics({ fromDate: startDate, toDate: endDate });
        } else {
          await fetchVendors();
          await fetchMetrics();
        }
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
        Address: getAddress(c),
        Status: isActive(c) ? "Active" : "Inactive",
        CreatedAt: c?.createdAt || "",
        Contact: c?.contactNum || "",
        Outstanding: outstanding(c),
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vendors");
    XLSX.writeFile(wb, "customer_list.xlsx");
  };

  const generatePDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    autoTable(doc, {
      head: [["#", "Code", "Name", "Email", "Address", "Status"]],
      body: filteredVendors.map((c, i) => [
        i + 1,
        getCode(c) || "",
        getName(c) || "",
        getEmail(c) || "",

        getAddress(c) || "",
        isActive(c) ? "Active" : "Inactive",
      ]),
    });
    doc.save("customer_list.pdf");
  };

  const handleVendorClick = (customerId) => {
    setViewingVendorId(customerId);
  };

  const goBack = () => setViewingVendorId(null);

  /** ---------- Render ---------- */
  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  if (viewingVendorId) {
    return (
      <div className="p-4">
        <VendorViewPage vendorId={viewingVendorId} goBack={goBack} />
      </div>
    );
  }

  const anyFiltersOn = Boolean(
    sortOption ||
      searchTerm ||
      statusFilter === "Active" ||
      statusFilter === "Inactive" ||
      startDate ||
      endDate
  );

  return (
    <div>
      <ToastContainer />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2 ">
          <h3 className="text-xl font-semibold mb-6">Vendor List</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handleAddVendor}
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
              fetchVendors({ fromDate: startDate, toDate: endDate });
            }}
            disabled={!isRangeValid || loadingMetrics}
            className="px-3 py-1 border rounded"
          >
            {loadingMetrics ? "Applying…" : "Apply"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {[
            ["Total Vendors", summary.count],
            ["Credit Limit", summary.creditLimit],
            ["Paid Vendors", summary.paidVendors],
            ["Active Vendors", summary.activeVendors],
            ["On-Hold Vendors", summary.onHoldVendors],
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
                  ? "Vendor Name"
                  : sortOption === "code-asc"
                  ? "Vendor Account in Ascending"
                  : sortOption === "code-desc"
                  ? "Vendor Account in descending"
                  : ""
              }
              onChange={handleSortChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="">Sort By</option>
              <option value="Vendor Name">Vendor Name</option>
              <option value="Vendor Account in Ascending">
                Vendor Account in Ascending
              </option>
              <option value="Vendor Account in descending">
                Vendor Account in descending
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
          onClick={async () => {
            setSearchTerm("");
            setStatusFilter("All");
            setSelectedIds([]);
            setSortOption("");
            setStartDate("");
            setEndDate("");
            await fetchVendors(); // all
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
                    selectedIds.length === filteredVendors.length &&
                    filteredVendors.length > 0
                  }
                  className="form-checkbox"
                />
              </th>
              {[
                "Code",
                "Name",
                "Address",
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
            {filteredVendors.length ? (
              filteredVendors.map((c) => (
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
                      onClick={() => handleVendorClick(getId(c))}
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
