import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./c.css";
import SiteViewPagee from "./SiteViewPagee";
export default function SiteList({ handleAddSite }) {
  const baseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/sites";

  // State

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const [selectedOption, setSelectedOption] = useState("All");
  const toggleSelectAll = (e) => {
    setSelectedSites(e.target.checked ? filteredSites.map((c) => c._id) : []);
  };

  const [sites, setSites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [archivedFilter, setArchivedFilter] = useState("all");
  const [sortKey, setSortKey] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  // …any other state…
  const goBack = () => setViewingSiteId(null);
  // ––– now it’s safe to reference them in your useEffect:
  useEffect(() => {
    let data = [...sites];
    // apply searchTerm, statusFilter, archivedFilter, sortKey, sortOrder…
    setFilteredSites(data);
  }, [sites, searchTerm, statusFilter, archivedFilter, sortKey, sortOrder]);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [viewingSiteId, setViewingSiteId] = useState(null);
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const tabNames = [
    "Site List",
    "Paid Site",
    "Active Site",
    "Hold Site",
    "Outstanding Site",
  ];
  const [selectedSites, setSelectedSites] = useState([]);
  const [filteredSites, setFilteredSites] = useState([]);
  const [activeTab, setActiveTab] = useState(tabNames[0]);
  const [siteSummary, setSiteSummary] = useState({
    count: 0,
    creditLimit: 0,
    paidSites: 0,
    activeSites: 0,
    onHoldSites: 0,
  });
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setSelectedOption(value);

    let filtered = [...sites];

    if (value === "All") {
      setFilteredSites(filtered);
    } else if (value === "yes") {
      setFilteredSites(filtered.filter((site) => site.active === true));
    } else if (value === "no") {
      setFilteredSites(filtered.filter((site) => site.active === false));
    } else if (value === "Site Name") {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
      setFilteredSites(filtered);
    } else if (value === "Site Account no") {
      filtered = filtered.sort((a, b) => a.code.localeCompare(b.code));
      setFilteredSites(filtered);
    } else if (value === "Site Account no descending") {
      filtered = filtered.sort((a, b) => b.code.localeCompare(a.code));
      setFilteredSites(filtered);
    }
  };
  const fetchSites = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await axios.get(baseUrl);
      // pull out the actual array
      const arr = Array.isArray(resp.data) ? resp.data : resp.data.sites ?? [];
      setSites(arr);
      setFilteredSites(arr);
    } catch (err) {
      console.error(err);
      toast.error("Error loading sites");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  useEffect(() => {
    // guard against non-array
    const base = Array.isArray(sites) ? sites : [];
    let data = [...base];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(
        (s) =>
          s.code.toLowerCase().includes(term) ||
          s.name.toLowerCase().includes(term)
      );
    }

    // … your other filters …

    setFilteredSites(data);
  }, [sites, searchTerm, statusFilter, archivedFilter, sortKey, sortOrder]);

  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(false);
  const handleDeleteSelected = async () => {
    if (!selectedSites.length) {
      toast.info("No Sites selected to delete");
      return;
    }

    if (!window.confirm("Delete selected Sites?")) return;

    try {
      const results = await Promise.allSettled(
        selectedSites.map((id) => axios.delete(`${baseUrl}/${id}`))
      );

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (succeeded) {
        toast.success(`${succeeded} deleted`);
        await fetchSites();
        setSelectedSites([]);
      }
      if (failed) toast.error(`${failed} failed — check console`);
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error while deleting");
    }
  };
  // Column definitions matching backend model
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setSortOption("");
  };
  const columns = [
    { key: "code", label: "Code" },
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
    { key: "type", label: "Type" },
    { key: "active", label: "Active" },
    { key: "archived", label: "Archived" },
    { key: "createdAt", label: "Created At" },
  ];
  const exportToExcel = () => {
    if (!siteList.length) {
      toast.info("No data to export.");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(siteList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "sites");
    XLSX.writeFile(wb, "site_list.xlsx");
  };
  const fetchMetrics = useCallback(async () => {
    try {
      const { data: resp } = await axios.get(metricsUrl, {
        params: { from: startDate, to: endDate },
      });

      const m = (resp.metrics && resp.metrics[0]) || {};
      setSiteSummary((prev) => ({
        ...prev,
        count: m.totalSites ?? prev.count,
        creditLimit: m.creditLimit ?? prev.creditLimit,
        paidSites: m.paidSites ?? prev.paidSites,
        activeSites: m.activeSites ?? prev.activeSites,
        onHoldSites: m.onHoldSites ?? prev.onHoldSites,
      }));
    } catch (err) {
      console.error(err);
    }
  }, [startDate, endDate]);
  const generatePDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    autoTable(doc, {
      head: [["#", "Code", "Name", "Contact", "Address", "Status"]],
      body: filteredSites.map((c, i) => [
        i + 1,
        c.code,
        c.name,
        c.contactNum,
        c.address,
        c.active ? "Active" : "Inactive",
      ]),
    });
    doc.save("Site_list.pdf");
  };
  // Fetch sites from API

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);
  const handleCheckboxChange = (id) => {
    setSelectedSites((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  };

  const onTabClick = (tab) => {
    setActiveTab(tab);
    // if you need to filter metrics by tab, do that here
  };

  const handlesiteClick = (id) => {
    setViewingSiteId(id);
  };
  // Filter, search, sort whenever dependencies change
  useEffect(() => {
    let data = [...sites];

    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(
        (s) =>
          s.code.toLowerCase().includes(term) ||
          s.name.toLowerCase().includes(term)
      );
    }

    // Active/Inactive filter
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      data = data.filter((s) => s.active === isActive);
    }

    // Archived filter
    if (archivedFilter !== "all") {
      const isArchived = archivedFilter === "archived";
      data = data.filter((s) => s.archived === isArchived);
    }

    // Sorting
    if (sortKey) {
      data.sort((a, b) => {
        const aVal = a[sortKey] ?? "";
        const bVal = b[sortKey] ?? "";
        let cmp = 0;
        if (typeof aVal === "string" && typeof bVal === "string") {
          cmp = aVal.localeCompare(bVal);
        } else if (aVal > bVal) cmp = 1;
        else if (aVal < bVal) cmp = -1;
        return sortOrder === "asc" ? cmp : -cmp;
      });
    }

    setFilteredSites(data);
  }, [sites, searchTerm, statusFilter, archivedFilter, sortKey, sortOrder]);

  return (
    <div>
      <div>
        <div>
          {viewingSiteId ? (
            <SiteViewPagee
              // toggleView={toggleView}
              siteId={viewingSiteId}
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

                  {/* </div> */}
                  <h3 className="text-xl font-semibold">Site List</h3>
                </div>
                <div className="flex items-center gap-3 ">
                  <button
                    onClick={handleAddSite}
                    className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
                  >
                    + Add
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={!selectedSites.length}
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
                    c
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
                      fetchSites(startDate, endDate);
                    }}
                    className="px-3 py-1 border rounded"
                  >
                    {loadingMetrics ? "Applying…" : "Apply"}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                  {[
                    ["Total Sites", siteSummary.count],
                    ["Credit Limit", siteSummary.creditLimit],
                    ["Paid sites", siteSummary.paidsites],
                    ["Active sites", siteSummary.activesites],
                    ["On‑Hold sites", siteSummary.onHoldsites],
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
                {/* Left group: Sort By, Filter By Status, Search */}
                <div className="flex items-center space-x-4">
                  {/* Sort By */}
                  <div className="relative">
                    <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      defaultValue=""
                      value={selectedOption}
                      onChange={handleFilterChange}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      <option value="">Sort By</option>
                      <option value="site Name">site Name</option>
                      <option value="site Account no">
                        site Account in Ascending
                      </option>
                      <option value="site Account no descending">
                        site Account in descending
                      </option>
                    </select>
                  </div>

                  {/* Filter By Status */}
                  <div className="relative">
                    <FaFilter className=" text-sm absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      defaultValue="All"
                      className="pl-10 pr-4 py-2 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                      value={selectedOption}
                      onChange={handleFilterChange}
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
                    <button
                      value={searchTerm}
                      onChange={handleSearchChange}
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      <FaSearch className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Right side: Reset Filter */}
                <button
                  onClick={resetFilters}
                  className="text-red-500 hover:text-red-600 font-medium"
                >
                  Reset Filter
                </button>
              </div>
              <div className="flex">
                {" "}
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
              {/* Data Table */}
              <div className="table-scroll-container h-[400px] overflow-auto bg-white rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="sticky top-0 z-10 px-4 py-2 bg-gray-50">
                        <input
                          type="checkbox"
                          onChange={toggleSelectAll}
                          checked={
                            selectedSites.length === filteredSites.length &&
                            filteredSites.length > 0
                          }
                          className="form-checkbox"
                        />
                      </th>
                      {[
                    
                    
                    
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
                    {filteredSites.length ? (
                      filteredSites.map((c) => (
                        <tr
                          key={c.code}
                          className="hover:bg-gray-100 transition-colors"
                        >
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={selectedSites.includes(c._id)}
                              onChange={() => handleCheckboxChange(c._id)}
                              className="form-checkbox"
                            />
                          </td>
                          <td
                          // onClick={() => handlesiteClick(site._id)}
                          // className="px-6 py-4 cursor-pointer text-blue-600 hover:underline"
                          >
                            <button
                              className="text-blue-600 hover:underline focus:outline-none"
                              onClick={() => handlesiteClick(c._id)}
                            >
                              {c.code}
                            </button>
                          </td>
                          <td className="px-6 py-4">{c.name}</td>
                          <td className="px-6 py-4">{c.description}</td>{" "}
                          <td className="px-6 py-4">{c.type}</td>
                          <td className="px-6 py-3 truncate">
                            {new Date(c.createdAt).toLocaleString()}
                          </td>
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
