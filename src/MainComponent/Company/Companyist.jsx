import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Tabs } from "flowbite-react"; // kept to match your imports
import "./c.css";

import CompanyViewPage from "./CompanyViewPage";

export default function CompaniesList({ handleAddCompany, onView }) {
  /** ---------- API ---------- */
  const baseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/companies";
  const metricsUrl = `${baseUrl}/metrics`;

  /** ---------- Helpers to normalize fields ---------- */
  const getId = (c) => c?._id || c?.id || c?.companyId || c?.code || "";
  const getCode = (c) => c?.companyCode || c?.code || "";
  const getName = (c) => c?.companyName || c?.name || "";
  const getBusinessType = (c) => c?.businessType || "";
  const getCurrency = (c) => c?.currency || "";
  const isActive = (c) => !!c?.active;
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

  /** ---------- State ---------- */
  const tabNames = [
    "Companies List",
    "Paid Companies",
    "Active Companies",
    "Hold Companies",
    "Outstanding Companies",
  ];

  const [activeTab, setActiveTab] = useState(tabNames[0]);

  const [companies, setCompanies] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewingCompaniesId, setViewingCompaniesId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // All | Active | Inactive
  const [sortOption, setSortOption] = useState(""); // name-asc | code-asc | code-desc

  // Start/end date are BLANK initially -> show ALL data
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [summary, setSummary] = useState({
    count: 0,
    creditLimit: 0,
    paidCompaniess: 0,
    activeCompaniess: 0,
    onHoldCompaniess: 0,
  });

  const [loading, setLoading] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [error, setError] = useState(null);

  /** ---------- Fetchers ---------- */
  const fetchCompanies = useCallback(async ({ fromDate, toDate } = {}) => {
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

      // Normalize the list shape
      const list = resp?.data || resp || [];
      const arrayList = Array.isArray(list) ? list : [];

      // If we sent params, defensively re-check createdAt range; else keep all
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

      setCompanies(finalList);

      // Baseline local summary
      setSummary((prev) => ({
        ...prev,
        count: finalList.length || 0,
        creditLimit: finalList.reduce(
          (s, c) => s + (Number(c?.creditLimit) || 0),
          0
        ),
        paidCompaniess: finalList.filter((c) => getStatus(c) === "Paid").length,
        activeCompaniess: finalList.filter((c) => isActive(c)).length,
        onHoldCompaniess: finalList.filter((c) => !isActive(c)).length,
      }));
    } catch (err) {
      console.error(err);
      setError("Unable to load Companies data.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMetrics = useCallback(async ({ fromDate, toDate } = {}) => {
    setLoadingMetrics(true);
    try {
      let params = {};
      if (fromDate && toDate) {
        const fromISO = toStartOfDayISO(fromDate);
        const toISO = toEndOfDayISO(toDate);
        params = { from: fromISO, to: toISO };
      }

      const { data: resp } = await axios.get(metricsUrl, { params });
      const m = (resp?.metrics && resp.metrics[0]) || {};

      setSummary((prev) => ({
        ...prev,
        count: m?.totalCompaniess ?? prev.count,
        creditLimit: m?.creditLimit ?? prev.creditLimit,
        paidCompaniess: m?.paidCompaniess ?? prev.paidCompaniess,
        activeCompaniess: m?.activeCompaniess ?? prev.activeCompaniess,
        onHoldCompaniess:
          typeof m?.inactiveCompaniess === "number"
            ? m.inactiveCompaniess
            : m?.onHoldCompaniess ?? prev.onHoldCompaniess,
      }));
    } catch (err) {
      console.error(err); // metrics optional
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  // Initial load — show ALL data (no date params)
  useEffect(() => {
    fetchCompanies();
    fetchMetrics();
  }, [fetchCompanies, fetchMetrics]);

  /** ---------- Derived: filtered + sorted list ---------- */
  const filteredCompanies = useMemo(() => {
    let list = [...companies];

    // Tabs
    switch (activeTab) {
      case "Paid Companies":
        list = list.filter((c) => getStatus(c) === "Paid");
        break;
      case "Active Companies":
        list = list.filter((c) => isActive(c));
        break;
      case "Hold Companies":
        list = list.filter((c) => !isActive(c));
        break;
      case "Outstanding Companies":
        list = list.filter((c) => outstanding(c) > 0);
        break;
      default:
        break;
    }

    // Status filter (dropdown)
    if (statusFilter === "Active") list = list.filter((c) => isActive(c));
    else if (statusFilter === "Inactive")
      list = list.filter((c) => !isActive(c));

    // Search
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter((c) => {
        const hay = [
          getName(c),
          getCode(c),
          String(c?.email ?? ""),
          String(c?.taxInfo?.gstNumber ?? ""),
          String(c?.primaryGSTAddress ?? ""),
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
    if (sortOption === "name-desc")
      list.sort((a, b) => cmpStr(getName(b), getName(a)));
    if (sortOption === "code-asc")
      list.sort((a, b) => cmpStr(getCode(a), getCode(b)));
    if (sortOption === "code-desc")
      list.sort((a, b) => cmpStr(getCode(b), getCode(a)));

    return list;
  }, [companies, activeTab, statusFilter, searchTerm, sortOption]);

  /** ---------- Date-range validity ---------- */
  const isRangeValid = useMemo(() => {
    if (!startDate || !endDate) return false;
    // strictly greater than
    const s = new Date(startDate).getTime();
    const e = new Date(endDate).getTime();
    return e > s;
  }, [startDate, endDate]);

  /** ---------- Handlers ---------- */
  const onTabClick = (tab) => {
    setActiveTab(tab);
    // Reset filters when switching tabs
    if (sortOption || statusFilter !== "All" || searchTerm) {
      resetFilters();
      setSelectedIds([]);
    }
  };

  const handleCompaniesClick = (CompaniesId) => {
    setViewingCompaniesId(CompaniesId);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setSelectedIds([]);
    setSortOption("");
  };

  const handleSortChange = (e) => {
    const v = e.target.value;
    if (v === "Companies Name") return setSortOption("name-asc");
    if (v === "Companies Account in Ascending")
      return setSortOption("code-asc");
    if (v === "Companies Account in Descending")
      return setSortOption("code-desc");
    setSortOption(v);
  };

  const handleStatusChange = (e) => {
    const v = e.target.value;
    if (v === "yes") return setStatusFilter("Active");
    if (v === "no") return setStatusFilter("Inactive");
    setStatusFilter("All");
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const toggleSelectAll = (e) => {
    setSelectedIds(
      e.target.checked ? filteredCompanies.map((c) => getId(c)) : []
    );
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) {
      toast.info("No companies selected to delete");
      return;
    }
    if (
      !window.confirm(
        `Delete ${selectedIds.length} selected compan${
          selectedIds.length > 1 ? "ies" : "y"
        }?`
      )
    ) {
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
        if (startDate && endDate && isRangeValid) {
          await fetchCompanies({ fromDate: startDate, toDate: endDate });
          await fetchMetrics({ fromDate: startDate, toDate: endDate });
        } else {
          await fetchCompanies();
          await fetchMetrics();
        }
        window.location.reload();
      }
      if (failed) toast.error(`${failed} failed — check console`);
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error while deleting");
    }
  };

  /** ---------- Export ---------- */
  const exportToExcel = () => {
    if (!companies.length) {
      toast.info("No data to export.");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(companies);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Companiess");
    XLSX.writeFile(wb, "Companies_list.xlsx");
  };

  const generatePDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    autoTable(doc, {
      head: [
        [
          "#",
          "Code",
          "Name",
          "Email",
          "Registration Number",
          "Business Type",
          "Currency",
          "Address",
          "Status",
        ],
      ],
      body: filteredCompanies.map((c, i) => [
        i + 1,
        getCode(c) || "",
        getName(c) || "",
        c?.email || "",
        c?.taxInfo?.gstNumber || "",
        getBusinessType(c) || "",
        getCurrency(c) || "",
        c?.primaryGSTAddress || "",
        isActive(c) ? "Active" : "Inactive",
      ]),
    });
    doc.save("Companies_list.pdf");
  };

  /** ---------- View toggle ---------- */
  const goBack = () => setViewingCompaniesId(null);

  /** ---------- Render ---------- */
  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  if (viewingCompaniesId) {
    return (
      <div className="p-4">
        <CompanyViewPage CompaniesId={viewingCompaniesId} goBack={goBack} />
      </div>
    );
  }

  // Apply is enabled only when endDate is strictly after startDate
  const canApply = isRangeValid;

  return (
    <div>
      <div>
        <div>
          {viewingCompaniesId ? (
            <CompanyViewPage CompaniesId={viewingCompaniesId} goBack={goBack} />
          ) : (
            <div className="space-y-6">
              <ToastContainer />

              {/* Header Buttons (stack on small) */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-2 ">
                  <h3 className="text-xl font-semibold">Companies List</h3>
                </div>

                {/* Buttons wrap on small */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <button
                    onClick={handleAddCompany}
                    className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02] w-full sm:w-auto"
                  >
                    + Add
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={!selectedIds.length}
                    className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02] w-full sm:w-auto"
                  >
                    Delete
                  </button>
                  <button
                    onClick={generatePDF}
                    className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02] w-full sm:w-auto"
                  >
                    PDF
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02] w-full sm:w-auto"
                  >
                    Export
                  </button>
                </div>
              </div>

              {/* Metrics */}
              <div className=" bg-white rounded-lg ">
                {/* Date filters       /creation date  */}
                <div className="flex flex-wrap gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      // Clear end date if it is now invalid
                      if (
                        endDate &&
                        e.target.value &&
                        endDate <= e.target.value
                      ) {
                        setEndDate("");
                      }
                    }}
                    className="border rounded px-2 py-1 w-full sm:w-auto"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border rounded px-2 py-1 w-full sm:w-auto"
                    disabled={!startDate}
                    min={startDate ? addDays(startDate, 1) : undefined}
                  />
                  <button
                    onClick={async () => {
                      if (!isRangeValid) {
                        toast.error(
                          "Please choose an end date after the start date."
                        );
                        return;
                      }
                      await fetchMetrics({
                        fromDate: startDate,
                        toDate: endDate,
                      });
                      await fetchCompanies({
                        fromDate: startDate,
                        toDate: endDate,
                      });
                    }}
                    className="px-3 py-1 border rounded w-full sm:w-auto"
                    disabled={!canApply || loadingMetrics}
                  >
                    {loadingMetrics ? "Applying…" : "Apply"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                  {[
                    ["Total Companiess", summary.count],
                    ["Credit Limit", summary.creditLimit],
                    ["Paid Companiess", summary.paidCompaniess],
                    ["Active Companiess", summary.activeCompaniess],
                    ["On-Hold Companiess", summary.onHoldCompaniess],
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

              {/* Filters & Search */}
              <div className="flex flex-wrap Sales-center text-sm justify-between p-2 bg-white rounded-md  mb-2 space-y-3 md:space-y-0 md:space-x-4">
                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                  {/* Sort By */}
                  <div className="relative">
                    <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      value={sortOption}
                      onChange={handleSortChange}
                      className="w-full sm:w-56 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      <option value="">Sort By</option>
                      <option value="name-asc">Companies Name</option>
                      <option value="code-asc">
                        Companies Account in Ascending
                      </option>
                      <option value="code-desc">
                        Companies Account in Descending
                      </option>
                    </select>
                  </div>

                  {/* Filter By Status */}
                  <div className="relative">
                    <FaFilter className=" text-sm absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      defaultValue="All"
                      className="w-full sm:w-56 pl-10 pr-4 py-2 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                      value={
                        statusFilter === "Active"
                          ? "yes"
                          : statusFilter === "Inactive"
                          ? "no"
                          : "All"
                      }
                      onChange={handleStatusChange}
                    >
                      <option value="All">Filter By Status</option>
                      <option value="yes">Active</option>
                      <option value="no">Inactive</option>
                    </select>
                  </div>

                  {/* Search */}
                  <div className="relative w-full sm:w-60">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      onClick={() => {}}
                    >
                      <FaSearch className="w-5 h-5" />
                    </button>
                  </div>
                </div>

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
              <div className="flex overflow-x-auto">
                <ul className="flex space-x-6 list-none p-0 m-0 whitespace-nowrap px-1">
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

              {/* Data Table */}
              <div className="table-scroll-container h-[60vh] md:h-[400px] overflow-auto bg-white rounded-lg">
                <table className="min-w-[900px] md:min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="sticky top-0 z-10 px-4 py-2 bg-gray-50">
                        <input
                          type="checkbox"
                          onChange={toggleSelectAll}
                          checked={
                            selectedIds.length === filteredCompanies.length &&
                            filteredCompanies.length > 0
                          }
                          className="form-checkbox"
                        />
                      </th>
                      {[
                        "Code",
                        "Business Type",
                        "Name",
                        "Currency",
                        "Address",
                        "Email",
                        "Registration Number",
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
                    {filteredCompanies.length ? (
                      filteredCompanies.map((c) => (
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
                          <td>
                            <button
                              className="text-blue-600 hover:underline focus:outline-none"
                              onClick={() => handleCompaniesClick(getId(c))}
                            >
                              {getCode(c)}
                            </button>
                          </td>
                          <td className="px-6 py-4">{getBusinessType(c)}</td>
                          <td className="px-6 py-4">{getName(c)}</td>
                          <td className="px-6 py-3 truncate">
                            {getCurrency(c)}
                          </td>
                          <td className="px-6 py-4">
                            {c?.primaryGSTAddress || ""}
                          </td>
                          <td className="px-6 py-4">{c?.email || ""}</td>
                          <td className="px-6 py-4">
                            {c?.taxInfo?.gstNumber || ""}
                          </td>
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
                          colSpan={9}
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
