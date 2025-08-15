import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "./c.css";
import CompanyViewPage from "./CompanyViewPage";

/**
 * CompaniesList
 * - Perfected filtering, search, sorting, and selection
 */
export default function CompaniesList({ handleAddCompany, onView }) {
  /** ---------- API ---------- */
  const BASE_URL = "https://fms-qkmw.onrender.com/fms/api/v0/companies";
  const METRICS_URL = `${BASE_URL}/metrics`;

  /** ---------- Tabs ---------- */
  const tabNames = [
    "Companies List", // all
    "Paid Companies", // status === "Paid"
    "Active Companies", // active === true
    "Hold Companies", // onHold === true
    "Outstanding Companies", // outstandingBalance > 0
  ];

  /** ---------- State ---------- */
  const [activeTab, setActiveTab] = useState(tabNames[0]);

  // date range (defaults to last 7 days -> today)
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const [companies, setCompanies] = useState([]);
  const [viewingCompanyId, setViewingCompanyId] = useState(null);

  // UI filters
  const [statusFilter, setStatusFilter] = useState("All"); // All | Active | Inactive
  const [sortOption, setSortOption] = useState(""); // name-asc | name-desc | code-asc | code-desc
  const [searchTerm, setSearchTerm] = useState("");

  // selection
  const [selectedIds, setSelectedIds] = useState([]);

  // summary cards
  const [summary, setSummary] = useState({
    count: 0,
    creditLimit: 0,
    paid: 0,
    active: 0,
    onHold: 0,
  });

  // loading flags
  const [loading, setLoading] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [error, setError] = useState(null);

  /** ---------- Helpers: safe accessors ---------- */
  const getId = (c) => c?._id ?? c?.id ?? `${getCode(c)}_${getName(c)}`;
  const getCode = (c) => String(c?.companyCode ?? c?.code ?? "").trim();
  const getName = (c) => String(c?.companyName ?? c?.name ?? "").trim();
  const getCurrency = (c) => String(c?.currency ?? "").trim();
  const getBusinessType = (c) => String(c?.businessType ?? "").trim();
  const getStatus = (c) => String(c?.status ?? "").trim();
  const isActive = (c) => Boolean(c?.active);
  const isOnHold = (c) => Boolean(c?.onHold);
  const outstanding = (c) => Number(c?.outstandingBalance ?? 0);

  /** ---------- Fetch companies ---------- */
  const fetchCompanies = useCallback(
    async (fromDate = startDate, toDate = endDate) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(BASE_URL, {
          params: { from: fromDate, to: toDate },
        });
        const list = data?.data ?? data ?? [];
        setCompanies(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error(err);
        setError("Unable to load companies.");
      } finally {
        setLoading(false);
      }
    },
    [startDate, endDate]
  );

  /** ---------- Fetch metrics (optional) ---------- */
  const fetchMetrics = useCallback(async () => {
    setLoadingMetrics(true);
    try {
      const { data } = await axios.get(METRICS_URL, {
        params: { from: startDate, to: endDate },
      });
      const m = (data?.metrics && data.metrics[0]) ?? {};
      setSummary((prev) => ({
        count: m.totalCompaniess ?? prev.count,
        creditLimit: m.creditLimit ?? prev.creditLimit,
        paid: m.paidCompaniess ?? prev.paid,
        active: m.activeCompaniess ?? prev.active,
        onHold: m.onHoldCompaniess ?? prev.onHold,
      }));
    } catch (err) {
      // Non-fatal if metrics endpoint is not implemented
      console.warn("Metrics endpoint not available:", err?.message || err);
    } finally {
      setLoadingMetrics(false);
    }
  }, [startDate, endDate]);

  /** ---------- Initial fetch ---------- */
  useEffect(() => {
    fetchCompanies();
    fetchMetrics();
  }, [fetchCompanies, fetchMetrics]);

  /** ---------- Derived summary from live list ---------- */
  useEffect(() => {
    if (!companies?.length) {
      setSummary((prev) => ({
        ...prev,
        count: 0,
        creditLimit: 0,
        paid: 0,
        active: 0,
        onHold: 0,
      }));
      return;
    }
    const count = companies.length;
    const creditLimit = companies.reduce(
      (s, c) => s + Number(c?.creditLimit ?? 0),
      0
    );
    const paid = companies.filter((c) => getStatus(c) === "Paid").length;
    const active = companies.filter((c) => isActive(c)).length;
    const onHold = companies.filter((c) => isOnHold(c)).length;

    setSummary((prev) => ({
      ...prev,
      count,
      creditLimit,
      paid,
      active,
      onHold,
    }));
  }, [companies]);

  /** ---------- Filtering + Search + Sort (perfect composition) ---------- */
  const displayedCompanies = useMemo(() => {
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
        list = list.filter((c) => isOnHold(c));
        break;
      case "Outstanding Companies":
        list = list.filter((c) => outstanding(c) > 0);
        break;
      default:
        // "Companies List" -> no extra tab filter
        break;
    }

    // Status filter
    if (statusFilter === "Active") list = list.filter((c) => isActive(c));
    if (statusFilter === "Inactive") list = list.filter((c) => !isActive(c));

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

  /** ---------- Selection ---------- */
  const toggleSelectAll = (e) => {
    setSelectedIds(
      e.target.checked ? displayedCompanies.map((c) => getId(c)) : []
    );
  };

  const toggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /** ---------- Delete ---------- */
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
        selectedIds.map((id) => axios.delete(`${BASE_URL}/${id}`))
      );
      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.length - succeeded;

      if (succeeded) {
        toast.success(`${succeeded} deleted`);
        setSelectedIds([]);
        await fetchCompanies(startDate, endDate);
      }
      if (failed) toast.error(`${failed} failed — check console`);
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error while deleting");
    }
  };

  /** ---------- Export ---------- */
  const exportToExcel = () => {
    if (!displayedCompanies.length) {
      toast.info("No data to export.");
      return;
    }
    const rows = displayedCompanies.map((c, i) => ({
      "#": i + 1,
      Code: getCode(c),
      Name: getName(c),
      "Business Type": getBusinessType(c),
      Currency: getCurrency(c),
      Active: isActive(c) ? "Yes" : "No",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Companies");
    XLSX.writeFile(wb, "companies_list.xlsx");
  };

  const exportToPDF = () => {
    if (!displayedCompanies.length) {
      toast.info("No data to export.");
      return;
    }
    const doc = new jsPDF({ orientation: "landscape" });
    autoTable(doc, {
      head: [["#", "Code", "Name", "Business Type", "Currency", "Active"]],
      body: displayedCompanies.map((c, i) => [
        i + 1,
        getCode(c),
        getName(c),
        getBusinessType(c),
        getCurrency(c),
        isActive(c) ? "Yes" : "No",
      ]),
      styles: { fontSize: 8 },
    });
    doc.save("companies_list.pdf");
  };

  /** ---------- View ---------- */
  const handleRowClick = (companyId) => {
    setViewingCompanyId(companyId);
    if (onView) onView(companyId);
  };
  const goBack = () => setViewingCompanyId(null);

  /** ---------- Loading / Error ---------- */
  if (loading) return <div className="p-4">Loading…</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  /** ---------- Detail view ---------- */
  if (viewingCompanyId) {
    return (
      <div className="p-4">
        {/* Provide both prop spellings to be safe */}
        <CompanyViewPage
          companyId={viewingCompanyId}
          CompaniesId={viewingCompanyId}
          goBack={goBack}
        />
      </div>
    );
  }

  /** ---------- Render ---------- */
  return (
    <div className="p-4 space-y-6">
      <ToastContainer />

      {/* Header Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-semibold">Companies List</h3>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handleAddCompany}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
          >
            + Add
          </button>
          <button
            onClick={handleDeleteSelected}
            disabled={!selectedIds.length}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02] disabled:opacity-50"
          >
            Delete
          </button>
          <button
            onClick={exportToPDF}
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

      {/* Metrics + Date range */}
      <div className="bg-white rounded-lg p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
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
            onClick={async () => {
              await fetchCompanies(startDate, endDate);
              await fetchMetrics();
            }}
            className="px-3 py-1 border rounded"
          >
            {loadingMetrics ? "Applying…" : "Apply"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {[
            ["Total Companies", summary.count],
            ["Credit Limit", summary.creditLimit],
            ["Paid Companies", summary.paid],
            ["Active Companies", summary.active],
            ["On-Hold Companies", summary.onHold],
          ].map(([label, value]) => (
            <div key={label} className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters / Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-white rounded-md">
        {/* Sort */}

        <div className="relative">
          <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            defaultValue=""
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full sm:w-56 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
          >
            <option value="name-asc">Company Name (A→Z)</option>
            <option value="name-desc">Company Name (Z→A)</option>
            <option value="code-asc">Company Code (A→Z)</option>
            <option value="code-desc">Company Code (Z→A)</option>
          </select>
        </div>

        {/* Status */}
        <div className="relative">
          <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-56 pl-10 pr-4 py-2 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">Filter By Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60">
          <input
            type="text"
            placeholder="Search code/name/email/gst…"
        
            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <FaSearch className="w-5 h-5" />
          </div>
        </div>

        <button
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("All");
            setSortOption("");
          }}
          className="text-red-500 hover:text-red-600 font-medium"
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
      <div className="table-scroll-container h-[60vh] md:h-[400px] overflow-auto bg-white rounded-lg">
        <table className="min-w-[900px] md:min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky top-0 z-10 px-4 py-2 bg-gray-50">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={
                    displayedCompanies.length > 0 &&
                    selectedIds.length === displayedCompanies.map(getId).length
                  }
                  className="form-checkbox"
                />
              </th>
              {["Code", "Business Type", "Name", "Currency", "Active"].map(
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
            {displayedCompanies.length ? (
              displayedCompanies.map((c) => {
                const id = getId(c);
                return (
                  <tr key={id} className="hover:bg-gray-100 transition-colors">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(id)}
                        onChange={() => toggleRow(id)}
                        className="form-checkbox"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        className="text-blue-600 hover:underline focus:outline-none"
                        onClick={() => handleRowClick(id)}
                      >
                        {getCode(c) || "—"}
                      </button>
                    </td>
                    <td className="px-6 py-4">{getBusinessType(c) || "—"}</td>
                    <td className="px-6 py-4">{getName(c) || "—"}</td>
                    <td className="px-6 py-4">{getCurrency(c) || "—"}</td>
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
                );
              })
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
