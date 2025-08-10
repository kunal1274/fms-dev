import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Tabs } from "flowbite-react";
import "./c.css";

import CompanyViewPage from "./CompanyViewPage";

export default function CompaniesList({ handleAddCompany, onView }) {
  const baseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/companies";
  const metricsUrl = `${baseUrl}/metrics`;

  const tabNames = [
    "Companies List",
    "Paid Companies",
    "Active Companies",
    "Hold Companies",
    "Outstanding Companies",
  ];

  // States
  const [activeTab, setActiveTab] = useState(tabNames[0]);
  const [CompaniesList, setCompaniesList] = useState([]);
  const [selectedOption, setSelectedOption] = useState("All");
  const [filteredCompaniess, setFilteredCompaniess] = useState([]);
  const [selectedCompaniess, setSelectedCompaniess] = useState([]);
  const [viewingCompaniesId, setViewingCompaniesId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOption, setSortOption] = useState("");

  const [CompaniesSummary, setCompaniesSummary] = useState({
    count: 0,
    creditLimit: 0,
    paidCompaniess: 0,
    activeCompaniess: 0,
    onHoldCompaniess: 0,
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [error, setError] = useState(null);

  // Upload Logo
  const fileInputRef = useRef(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [currentUploadFile, setCurrentUploadFile] = useState("");

  const handleFileUpload = async (file) => {
    if (!file) {
      toast.error("No file selected!");
      return;
    }
    setCurrentUploadFile(file.name);
    setLogoUploading(true);

    try {
      const formData = new FormData();
      formData.append("logoImage", file);

      await axios.post(`${baseUrl}/upload-logo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          const percent = Math.round((evt.loaded * 100) / evt.total);
          setUploadProgress({ [file.name]: percent });
        },
      });

      toast.success("Logo uploaded successfully ✅");
      // Refresh list
      fetchCompaniess();
    } catch (error) {
      console.error(error);
      toast.error("Error uploading logo!");
    } finally {
      setTimeout(() => {
        setLogoUploading(false);
        setUploadProgress({});
        setCurrentUploadFile("");
      }, 1500);
    }
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setSelectedOption(value);

    let filtered = [...CompaniesList];

    if (value === "All") {
      setFilteredCompaniess(filtered);
    } else if (value === "yes") {
      setFilteredCompaniess(
        filtered.filter((Companies) => Companies.active === true)
      );
    } else if (value === "no") {
      setFilteredCompaniess(
        filtered.filter((Companies) => Companies.active === false)
      );
    } else if (value === "Companies Name") {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
      setFilteredCompaniess(filtered);
    } else if (value === "Companies Account no") {
      filtered = filtered.sort((a, b) => a.code.localeCompare(b.code));
      setFilteredCompaniess(filtered);
    } else if (value === "Companies Account no descending") {
      filtered = filtered.sort((a, b) => b.code.localeCompare(a.code));
      setFilteredCompaniess(filtered);
    }
  };

  // Fetch Companiess
  const fetchCompaniess = useCallback(
    async (fromDate = startDate, toDate = endDate) => {
      setLoading(true);
      setError(null);
      try {
        const { data: resp } = await axios.get(baseUrl, {
          params: { from: fromDate, to: toDate },
        });
        const list = resp.data || resp;
        setCompaniesList(list);
        +setFilteredCompaniess(list);

        setCompaniesSummary({
          count: list.length,
          creditLimit: list.reduce((s, c) => s + (c.creditLimit || 0), 0),
          paidCompaniess: list.filter((c) => c.status === "Paid").length,
          activeCompaniess: list.filter((c) => c.active).length,
          onHoldCompaniess: list.filter((c) => c.onHold).length,
        });
      } catch (err) {
        console.error(err);
        setError("Unable to load Companies data.");
      } finally {
        setLoading(false);
      }
    },
    [startDate, endDate]
  );

  // Fetch Metrics
  const fetchMetrics = useCallback(async () => {
    try {
      const { data: resp } = await axios.get(metricsUrl, {
        params: { from: startDate, to: endDate },
      });

      const m = (resp.metrics && resp.metrics[0]) || {};
      setCompaniesSummary((prev) => ({
        ...prev,
        count: m.totalCompaniess ?? prev.count,
        creditLimit: m.creditLimit ?? prev.creditLimit,
        paidCompaniess: m.paidCompaniess ?? prev.paidCompaniess,
        activeCompaniess: m.activeCompaniess ?? prev.activeCompaniess,
        onHoldCompaniess: m.onHoldCompaniess ?? prev.onHoldCompaniess,
      }));
    } catch (err) {
      console.error(err);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchCompaniess();
    fetchMetrics();
  }, [fetchCompaniess, fetchMetrics]);

  // Filtering, Search, Sorting
  useEffect(() => {
    let list = [...CompaniesList];

    switch (activeTab) {
      case tabNames[1]:
        list = list.filter((c) => c.status === "Paid");
        break;
      case tabNames[2]:
        list = list.filter((c) => c.active);
        break;
      case tabNames[3]:
        list = list.filter((c) => c.onHold);
        break;
      case tabNames[4]:
        list = list.filter((c) => c.outstandingBalance > 0);
        break;
      default:
        break;
    }

    if (statusFilter === "Active") list = list.filter((c) => c.active);
    else if (statusFilter === "Inactive") list = list.filter((c) => !c.active);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.code.toLowerCase().includes(term)
      );
    }

    if (sortOption === "name-asc")
      list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortOption === "code-asc")
      list.sort((a, b) => a.code.localeCompare(b.code));
    else if (sortOption === "code-desc")
      list.sort((a, b) => b.code.localeCompare(a.code));

    setFilteredCompaniess(list);
  }, [CompaniesList, activeTab, statusFilter, searchTerm, sortOption]);

  // Handlers
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleStatusChange = (e) => setStatusFilter(e.target.value);
  const handleSortChange = (e) => setSortOption(e.target.value);
  const onTabClick = (tab) => setActiveTab(tab);

  const toggleSelectAll = (e) => {
    setSelectedCompaniess(
      e.target.checked ? filteredCompaniess.map((c) => c._id) : []
    );
  };

  const handleCheckboxChange = (id) => {
    setSelectedCompaniess((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (!selectedCompaniess.length) {
      toast.info("No Companiess selected to delete");
      return;
    }

    if (!window.confirm("Delete selected Companiess?")) return;

    try {
      const results = await Promise.allSettled(
        selectedCompaniess.map((id) => axios.delete(`${baseUrl}/${id}`))
      );

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (succeeded) {
        toast.success(`${succeeded} deleted`);
        await fetchCompaniess();
        setSelectedCompaniess([]);
      }
      if (failed) toast.error(`${failed} failed — check console`);
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error while deleting");
    }
  };

  const exportToExcel = () => {
    if (!CompaniesList.length) {
      toast.info("No data to export.");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(CompaniesList);
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
      body: filteredCompaniess.map((c, i) => [
        i + 1,
        c.companyCode || "",
        c.companyName || "",
        c.contactNum || "",
        c.email || "",
        c.taxInfo?.gstNumber || "",
        c.businessType || "",
        c.currency || "",
        c.primaryGSTAddress || "",
        c.active ? "Active" : "Inactive",
      ]),
    });

    doc.save("Companies_list.pdf");
  };

  const handleCompaniesClick = (CompaniesId) => {
    setViewingCompaniesId(CompaniesId);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setSortOption("");
  };

  const goBack = () => setViewingCompaniesId(null);

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  if (viewingCompaniesId) {
    return (
      <div className="p-4">
        <CompanyViewPage CompaniesId={viewingCompaniesId} goBack={goBack} />
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div>
      <div>
        <div>
          {viewingCompaniesId ? (
            <CompanyViewPage ComapniesId={viewingCompaniesId} goBack={goBack} />
          ) : (
            <div className="space-y-6">
              <ToastContainer />

              {/* Header Buttons (stack on small) */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
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
                      </svg>
                    </button>
                  </div>
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
                    disabled={!selectedCompaniess.length}
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

              {/* Metrics (unchanged grid but already responsive) */}
              <div className=" bg-white rounded-lg ">
                {/* Date filters wrap on small */}
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
                    onClick={() => {
                      fetchMetrics();
                      fetchCompaniess(startDate, endDate);
                    }}
                    className="px-3 py-1 border rounded w-full sm:w-auto"
                  >
                    {loadingMetrics ? "Applying…" : "Apply"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                  {[
                    ["Total Companiess", CompaniesSummary.count],
                    ["Credit Limit", CompaniesSummary.creditLimit],
                    ["Paid Companiess", CompaniesSummary.paidCompaniess],
                    ["Active Companiess", CompaniesSummary.activeCompaniess],
                    ["On-Hold Companiess", CompaniesSummary.onHoldCompaniess],
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

              {/* Filters & Search (already flex-wrap; make inputs responsive widths) */}
              <div className="flex flex-wrap Sales-center text-sm justify-between p-2 bg-white rounded-md  mb-2 space-y-3 md:space-y-0 md:space-x-4">
                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                  {/* Sort By */}
                  <div className="relative">
                    <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      defaultValue=""
                      value={selectedOption}
                      onChange={handleFilterChange}
                      className="w-full sm:w-56 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      <option value="">Sort By</option>
                      <option value="Companies Name">Companies Name</option>
                      <option value="Companies Account no">
                        Companies Account in Ascending
                      </option>
                      <option value="Companies Account no descending">
                        Companies Account in descending
                      </option>
                    </select>
                  </div>

                  {/* Filter By Status */}
                  <div className="relative">
                    <FaFilter className=" text-sm absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      defaultValue="All"
                      className="w-full sm:w-56 pl-10 pr-4 py-2 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                      value={selectedOption}
                      onChange={handleFilterChange}
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
                      value={searchTerm}
                      onChange={handleSearchChange}
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      <FaSearch className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={resetFilters}
                  className="text-red-500 hover:text-red-600 font-medium w-full sm:w-auto"
                >
                  Reset Filter
                </button>
              </div>

              {/* Tabs (make horizontally scrollable on mobile) */}
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

              {/* Data Table (taller on mobile; horizontal scroll with min width) */}
              <div className="table-scroll-container h-[60vh] md:h-[400px] overflow-auto bg-white rounded-lg">
                <table className="min-w-[900px] md:min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="sticky top-0 z-10 px-4 py-2 bg-gray-50">
                        <input
                          type="checkbox"
                          onChange={toggleSelectAll}
                          checked={
                            selectedCompaniess.length ===
                              filteredCompaniess.length &&
                            filteredCompaniess.length > 0
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
                    {filteredCompaniess.length ? (
                      filteredCompaniess.map((c) => (
                        <tr
                          key={c.code}
                          className="hover:bg-gray-100 transition-colors"
                        >
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={selectedCompaniess.includes(c._id)}
                              onChange={() => handleCheckboxChange(c._id)}
                              className="form-checkbox"
                            />
                          </td>
                          <td>
                            <button
                              className="text-blue-600 hover:underline focus:outline-none"
                              onClick={() => handleCompaniesClick(c._id)}
                            >
                              {c.companyCode}
                            </button>
                          </td>
                          <td className="px-6 py-4"> {c.businessType} </td>
                          <td className="px-6 py-4">{c.companyName}</td>
                          <td className="px-6 py-3 truncate">{c.currency}</td>
                          <td className="px-6 py-4">{c.primaryGSTAddress}</td>
                          <td className="px-6 py-4">{c.email}</td>
                          <td className="px-6 py-4">{c.taxInfo?.gstNumber}</td>
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
