import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Tabs } from "flowbite-react"; // kept to match your imports
import "./c.css";

import LocationViewPage from "./LocationViewpage";

export default function LocationList({ handleAddLocation, onView }) {
  /** ---------- API ---------- */
  const baseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/Locations";
  const metricsUrl = `${baseUrl}/metrics`;

  /** ---------- Helpers to normalize fields (match Postman) ---------- */
  const getId = (c) => c?._id || c?.id || c?.code || "";
  const getCode = (c) => c?.code || "";
  const getName = (c) => c?.name || "";
  const getType = (c) => c?.type || "";
  const getDescription = (c) => c?.description || "";
  const isActive = (c) => c?.active === true;
  const isArchived = (c) => c?.archived === true;
  // Leave onHold/status hooks intact if backend adds them later
  const isOnHold = (c) => !!c?.onHold;
  const outstanding = (c) => Number(c?.outstandingBalance || 0);
  const getStatus = (c) => String(c?.status || "");

  /** ---------- Date helpers (createdAt boundaries) ---------- */
  const toStartOfDayISO = (dateStrLocal /* 'YYYY-MM-DD' */) =>
    new Date(`${dateStrLocal}T00:00:00`).toISOString();
  const toEndOfDayISO = (dateStrLocal /* 'YYYY-MM-DD' */) =>
    new Date(`${dateStrLocal}T23:59:59.999`).toISOString();

  /** ---------- State ---------- */
  const tabNames = [
    "Location List",
    "Paid Location",
    "Active Location",
    "Hold Location",
    "Outstanding Location",
  ];

  const [activeTab, setActiveTab] = useState(tabNames[0]);

  const [Location, setLocation] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewingLocationId, setViewingLocationId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // All | Active | Inactive
  const [sortOption, setSortOption] = useState(""); // name-asc | code-asc | code-desc

  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const [summary, setSummary] = useState({
    count: 0,
    activeLocations: 0,
    archivedLocations: 0,
  });

  const [loading, setLoading] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [error, setError] = useState(null);

  const fetchLocation = useCallback(
    async (fromDate = startDate, toDate = endDate) => {
      setLoading(true);
      setError(null);
      try {
        const fromISO = toStartOfDayISO(fromDate);
        const toISO = toEndOfDayISO(toDate);

        const { data: resp } = await axios.get(baseUrl, {
          params: { from: fromISO, to: toISO },
        });

        // Normalize the list (support {data: []} or [] shapes)
        const list = resp?.data || resp || [];
        const arrayList = Array.isArray(list) ? list : [];

        // Defensive client-side filter by createdAt (include if missing)
        const fromMs = new Date(fromISO).getTime();
        const toMs = new Date(toISO).getTime();
        const filteredByCreatedAt = arrayList.filter((c) => {
          if (!c?.createdAt) return true;
          const t = new Date(c.createdAt).getTime();
          return t >= fromMs && t <= toMs;
        });

        setLocation(filteredByCreatedAt);

        // Baseline summary (if metrics fail)
        const activeCount = filteredByCreatedAt.filter((c) =>
          isActive(c)
        ).length;
        const archivedCount = filteredByCreatedAt.filter((c) =>
          isArchived(c)
        ).length;

        setSummary({
          count: filteredByCreatedAt.length || 0,
          activeLocations: activeCount,
          archivedLocations: archivedCount,
        });
      } catch (err) {
        console.error(err);
        setError("Unable to load Location data.");
      } finally {
        setLoading(false);
      }
    },
    [startDate, endDate]
  );

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
          count: m?.totalLocations ?? prev.count,
          activeLocations: m?.activeLocations ?? prev.activeLocations,
          archivedLocations: m?.archivedLocations ?? prev.archivedLocations,
        }));
      } catch (err) {
        console.error(err);
        // metrics optional
      } finally {
        setLoadingMetrics(false);
      }
    },
    [startDate, endDate]
  );

  useEffect(() => {
    fetchLocation();
    fetchMetrics();
  }, [fetchLocation, fetchMetrics]);

  /** ---------- Derived: filtered + sorted list ---------- */
  const filteredLocation = useMemo(() => {
    let list = [...Location];

    // Tabs
    switch (activeTab) {
      case "Location List":
        // no extra filter
        break;
      case "Paid Location":
        list = list.filter((c) => getStatus(c) === "Paid");
        break;
      case "Active Location":
        list = list.filter((c) => isActive(c));
        break;
      case "Hold Location":
        list = list.filter((c) => isOnHold(c));
        break;
      case "Outstanding Location":
        list = list.filter((c) => outstanding(c) > 0);
        break;
      default:
        break;
    }

    // Status filter (dropdown)
    if (statusFilter === "Active") list = list.filter((c) => isActive(c));
    else if (statusFilter === "Inactive")
      list = list.filter((c) => !isActive(c));

    // Search (use Postman fields)
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter((c) => {
        const hay = [getName(c), getCode(c), getType(c), getDescription(c)]
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
  }, [Location, activeTab, statusFilter, searchTerm, sortOption]);

  /** ---------- Handlers ---------- */
  const onTabClick = (tab) => {
    setActiveTab(tab);
    if (sortOption || statusFilter !== "All" || searchTerm) {
      resetFilters();
      setSelectedIds([]);
    }
  };

  const handleLocationClick = (siteId) => {
    if (onView) onView(siteId);
    setViewingLocationId(siteId);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setSelectedIds([]);
    setSortOption("");
  };

  const handleSortChange = (e) => {
    const v = e.target.value;
    if (v === "name-asc" || v === "code-asc" || v === "code-desc") {
      setSortOption(v);
    } else {
      setSortOption("");
    }
  };

  const handleStatusChange = (e) => {
    const v = e.target.value;
    if (v === "yes") return setStatusFilter("Active");
    if (v === "no") return setStatusFilter("Inactive");
    setStatusFilter("All");
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const toggleSelectAll = (e) => {
    setSelectedIds(e.target.checked ? filteredLocation.map((c) => getId(c)) : []);
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) {
      toast.info("No site selected to delete");
      return;
    }
    if (
      !window.confirm(
        `Delete ${selectedIds.length} selected site${
          selectedIds.length > 1 ? "s" : ""
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
        await fetchLocation(startDate, endDate);
        await fetchMetrics(startDate, endDate);
      }
      if (failed) toast.error(`${failed} failed — check console`);
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error while deleting");
    }
  };

  /** ---------- Export (match Postman fields) ---------- */
  const exportToExcel = () => {
    const rows = filteredLocation.length ? filteredLocation : Location;
    if (!rows.length) {
      toast.info("No data to export.");
      return;
    }
    const data = rows.map((c, i) => ({
      "#": i + 1,
      Code: getCode(c),
      Name: getName(c),
      Type: getType(c),
      Description: getDescription(c),
      Active: isActive(c) ? "Yes" : "No",
      Archived: isArchived(c) ? "Yes" : "No",
      CreatedAt: c?.createdAt ? new Date(c.createdAt).toLocaleString() : "",
      UpdatedAt: c?.updatedAt ? new Date(c.updatedAt).toLocaleString() : "",
      _id: getId(c),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Locations");
    XLSX.writeFile(wb, "Location_list.xlsx");
  };

  const generatePDF = () => {
    const rows = filteredLocation.length ? filteredLocation : Location;
    if (!rows.length) {
      toast.info("No data to export.");
      return;
    }
    const doc = new jsPDF({ orientation: "landscape" });
    autoTable(doc, {
      head: [
        [
          "#",
          "Code",
          "Name",
          "Type",
          "Description",
          "Created At",
          "Updated At",
          "Status",
          "Archived",
        ],
      ],
      body: rows.map((c, i) => [
        i + 1,
        getCode(c),
        getName(c),
        getType(c),
        getDescription(c),
        c?.createdAt ? new Date(c.createdAt).toLocaleString() : "",
        c?.updatedAt ? new Date(c.updatedAt).toLocaleString() : "",
        isActive(c) ? "Active" : "Inactive",
        isArchived(c) ? "Yes" : "No",
      ]),
    });
    doc.save("Location_list.pdf");
  };

  /** ---------- View toggle ---------- */
  const goBack = () => setViewingLocationId(null);

  /** ---------- Render ---------- */
  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  if (viewingLocationId) {
    return (
      <div className="p-4">
        <LocationViewPage LocationId={viewingLocationId} goBack={goBack} />
      </div>
    );
  }

  return (
    <div>
      <div>
        <div>
          {viewingLocationId ? (
            <LocationViewPage LocationId={viewingLocationId} goBack={goBack} />
          ) : (
            <div className="space-y-6">
              <ToastContainer />

              {/* Header Buttons (stack on small) */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-2 ">
                  <h3 className="text-xl font-semibold">Location List</h3>
                </div>

                {/* Buttons wrap on small */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <button
                    onClick={handleAddLocation}
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
                {/* Date filters */}
                <div className="flex flex-wrap gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border rounded px-2 py-1 w-full sm:w-auto"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border rounded px-2 py-1 w-full sm:w-auto"
                  />
                  <button
                    onClick={async () => {
                      await fetchMetrics(startDate, endDate);
                      await fetchLocation(startDate, endDate);
                    }}
                    className="px-3 py-1 border rounded w-full sm:w-auto"
                  >
                    {loadingMetrics ? "Applying…" : "Apply"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                  {[
                    ["Total Locations", summary.count],
                    ["Active Locations", summary.activeLocations],
                    ["Archived Locations", summary.archivedLocations],
                    [
                      "Inactive (calc)",
                      Math.max(summary.count - summary.activeLocations, 0),
                    ],
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
                      <option value="name-asc">Location Name</option>
                      <option value="code-asc">
                        Location Account in Ascending
                      </option>
                      <option value="code-desc">
                        Location Account in Descending
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
                            selectedIds.length === filteredLocation.length &&
                            filteredLocation.length > 0
                          }
                          className="form-checkbox"
                        />
                      </th>
                      {[
                        "Code",
                        "Type",
                        "Name",
                        "Description",
                        "Created At",
                        "Updated At",
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
                    {filteredLocation.length ? (
                      filteredLocation.map((c) => (
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

                          {/* Code (clickable) */}
                          <td className="px-6 py-4">
                            <button
                              className="text-blue-600 hover:underline focus:outline-none"
                              onClick={() => handleLocationil.LocationViewPageClick(getId(c))}
                            >
                              {getCode(c)}
                            </button>
                          </td>

                          {/* Type */}
                          <td className="px-6 py-4">{getType(c)}</td>

                          {/* Name */}
                          <td className="px-6 py-4">{getName(c)}</td>

                          {/* */}
                          <td className="px-6 py-3 truncate">
                            {getDescription(c)}
                          </td>

                          {/* Created At */}
                          <td className="px-6 py-4">
                            {c?.createdAt
                              ? new Date(c.createdAt).toLocaleString()
                              : ""}
                          </td>

                          {/* Updated At */}
                          <td className="px-6 py-4">
                            {c?.updatedAt
                              ? new Date(c.updatedAt).toLocaleString()
                              : ""}
                          </td>

                          {/* Status */}
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
