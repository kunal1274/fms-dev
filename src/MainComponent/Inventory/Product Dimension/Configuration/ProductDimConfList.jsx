import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "react-toastify/dist/ReactToastify.css";
import ColorViewPage from "./ConfViewPage";

export default function ColorList({ handleAddColor }) {
  const baseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/Configurations";
  const metricsUrl = `${baseUrl}/metrics`;

  /** ---------- Helpers to normalize fields ---------- */
  const getId = (c) => c?._id || c?.id || c?.companyId || c?.code || "";
  const getCode = (c) => c?.companyCode || c?.code || "";
  const getName = (c) => c?.companyName || c?.name || "";
  const getBusinessType = (c) => c?.businessType || "";
  const getCurrency = (c) => c?.currency || "";
  const isActive = (c) => !!c?.active;
  const isOnHold = (c) => !!c?.onHold;
  const outstanding = (c) => Number(c?.outstandingBalance || 0);
  const getStatus = (c) => String(c?.status || "");

  /** ---------- Date helpers (createdAt boundaries) ---------- */
  const toStartOfDayISO = (dateStrLocal /* 'YYYY-MM-DD' */) =>
    new Date(`${dateStrLocal}T00:00:00`).toISOString();
  const toEndOfDayISO = (dateStrLocal /* 'YYYY-MM-DD' */) =>
    new Date(`${dateStrLocal}T23:59:59.999`).toISOString();

  // States
  const [colorList, setColorList] = useState([]);
  const [filteredConf, setFilteredConf] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedConf, setSelectedConf] = useState([]);
  const [viewingColorId, setViewingColorId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
const exactCreatedAtRange = (iso /* '2025-08-14T12:33:49.194Z' */) => {
    const at = new Date(iso).getTime();
    return {
      fromISO: new Date(at).toISOString(),
      toISO: new Date(at + 1).toISOString(), // +1ms upper bound
    };
  };
  // Fetch Conf
  
    const [activeTab, setActiveTab] = useState(tabNames[0]);
  
    const [companies, setCompanies] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [viewingCompaniesId, setViewingCompaniesId] = useState(null);
  
   
    const [statusFilter, setStatusFilter] = useState("All"); // All | Active | Inactive
    const [sortOption, setSortOption] = useState(""); // name-asc | code-asc | code-desc
  
    const [startDate, setStartDate] = useState(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    );
    const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const fetchConf = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: resp } = await axios.get(baseUrl);
      const list = resp.data || resp;
      setColorList(list);
      setFilteredConf(list);
    } catch (err) {
      console.error(err);
      setError("Unable to load Conf.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConf();
  }, [fetchConf]);

  // Filtering & Searching
  useEffect(() => {
    let list = [...colorList];

    if (selectedOption === "yes") list = list.filter((c) => c.active);
    else if (selectedOption === "no") list = list.filter((c) => !c.active);
    else if (selectedOption === "name")
      list = list.sort((a, b) => a.name.localeCompare(b.name));
    else if (selectedOption === "code-asc")
      list = list.sort((a, b) => a.code.localeCompare(b.code));
    else if (selectedOption === "code-desc")
      list = list.sort((a, b) => b.code.localeCompare(a.code));

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.code.toLowerCase().includes(term)
      );
    }

    setFilteredConf(list);
  }, [colorList, searchTerm, selectedOption]);

  // Handlers
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleFilterChange = (e) => setSelectedOption(e.target.value);
  const toggleSelectAll = (e) => {
    setSelectedConf(e.target.checked ? filteredConf.map((c) => c._id) : []);
  };
    const [summary, setSummary] = useState({
      count: 0,
      creditLimit: 0,
      paidCompaniess: 0,
      activeCompaniess: 0,
      onHoldCompaniess: 0,
    });
  
  const handleCheckboxChange = (id) => {
    setSelectedConf((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };
  const handleDeleteSelected = async () => {
    if (selectedConf.length === 0) {
      toast.info("No Conf selected to delete");
      return;
    }
    if (!window.confirm(`Delete ${selectedConf.length} color(s)?`)) return;

    try {
      await Promise.all(
        selectedConf.map((id) => axios.delete(`${baseUrl}/${id}`))
      );
      toast.success("Deleted successfully");
      fetchConf();
      setSelectedConf([]);
    } catch (err) {
      console.error(err);
      toast.error("Error deleting Conf");
    }
  };
 const fetchCompanies = useCallback(
    async (fromDate = startDate, toDate = endDate) => {
      setLoading(true);
      setError(null);
      try {
        // Convert selected dates to full-day UTC ISO bounds
        const fromISO = toStartOfDayISO(fromDate);
        const toISO = toEndOfDayISO(toDate);

        // Ask backend to filter by the range (assumes it uses createdAt internally)
        const { data: resp } = await axios.get(baseUrl, {
          params: { from: fromISO, to: toISO },
        });

        // Normalize the list
        const list = resp?.data || resp || [];
        const arrayList = Array.isArray(list) ? list : [];

        // Defensive client-side filter by createdAt (in case backend ignores params)
        const fromMs = new Date(fromISO).getTime();
        const toMs = new Date(toISO).getTime();
        const filteredByCreatedAt = arrayList.filter((c) => {
          if (!c?.createdAt) return false; // if createdAt missing, exclude from dated view
          const t = new Date(c.createdAt).getTime();
          return t >= fromMs && t <= toMs;
        });

        setCompanies(filteredByCreatedAt);

        // Baseline summary (if metrics fail)
        setSummary((prev) => ({
          ...prev,
          count: filteredByCreatedAt.length || 0,
          creditLimit: filteredByCreatedAt.reduce(
            (s, c) => s + (Number(c?.creditLimit) || 0),
            0
          ),
          paidCompaniess: filteredByCreatedAt.filter(
            (c) => getStatus(c) === "Paid"
          ).length,
          activeCompaniess: filteredByCreatedAt.filter((c) => isActive(c))
            .length,
       onHoldCompaniess: filteredByCreatedAt.filter((c) => !isActive(c)).length,

      
        }));
      } catch (err) {
        console.error(err);
        setError("Unable to load Companies data.");
      } finally {
        setLoading(false);
      }
    },
    [startDate, endDate]
  );
  // Export
  const exportToExcel = () => {
    if (!colorList.length) return toast.info("No data to export.");
    const ws = XLSX.utils.json_to_sheet(colorList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Conf");
    XLSX.writeFile(wb, "Conf_list.xlsx");
  };
  const generatePDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    autoTable(doc, {
      head: [
        [
          "#",
          "Code",
          "Name",
          "Description",
          "Type",
          "Values",
          "Status",
          "Created At",
          "Updated At",
        ],
      ],
      body: filteredConf.map((c, i) => [
        i + 1,
        c.code,
        c.name,
        c.description,
        c.type,
        (c.values || []).join(", "),
        c.active ? "Active" : "Inactive",
        new Date(c.createdAt).toLocaleDateString(),
        new Date(c.updatedAt).toLocaleDateString(),
      ]),
    });
    doc.save("Conf_list.pdf");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedOption("");
  };
  const handleColorClick = (id) => setViewingColorId(id);
  const goBack = () => setViewingColorId(null);

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  if (viewingColorId) {
    return <ColorViewPage ColorId={viewingColorId} goBack={goBack} />;
  }

  return (
    <div>
      <ToastContainer />
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-semibold">Configurations</h3>
        <div className="flex gap-3">
          <button
            onClick={handleAddColor}
            className="px-3 py-1 border rounded hover:bg-green-100"
          >
            + Add
          </button>
          <button
            onClick={handleDeleteSelected}
            disabled={!selectedConf.length}
            className="px-3 py-1 border rounded hover:bg-red-100"
          >
            Delete
          </button>
          <button
            onClick={generatePDF}
            className="px-3 py-1 border rounded hover:bg-blue-100"
          >
            PDF
          </button>
          <button
            onClick={exportToExcel}
            className="px-3 py-1 border rounded hover:bg-blue-100"
          >
            Export
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center text-sm justify-between p-2 bg-white rounded-md mb-2 space-y-3 md:space-y-0 md:space-x-4">
        <div className="flex items-center space-x-4">
          {/* Sort By */}
          <div className="relative">
            <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              // value={sortOption}
              // onChange={handleSortChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="">Sort By</option>
              <option value="Company Name">Company Name</option>
              <option value="Account Ascending">
                Company Account Ascending
              </option>
              <option value="Account Descending">
                Company Account Descending
              </option>
            </select>
          </div>

          {/* Filter By Status */}
          <div className="relative">
            <FaFilter className="text-sm absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              // value={filterStatus}
              // onChange={handleFilterChange}
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
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              aria-label="Search"
            >
              {/* <FaSearch className="w-5 h-5" /> */}
            </button>
          </div>
        </div>

        {/* Reset Filter */}
        <button
          onClick={resetFilters}
          className="text-red-500 hover:text-red-600 font-medium"
        >
          Reset Filter
        </button>
      </div>
      {/* Table */}
      <div className="table-scroll-container h-[400px] overflow-auto bg-white rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={
                    selectedConf.length === filteredConf.length &&
                    filteredConf.length > 0
                  }
                />
              </th>
              {[
                "Code",
                "Name",
                "Description",
                "Type",
                "Values",
                "Status",
                "Created At",
                "Updated At",
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredConf.length ? (
              filteredConf.map((c) => (
                <tr key={c._id} className="hover:bg-gray-100">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedConf.includes(c._id)}
                      onChange={() => handleCheckboxChange(c._id)}
                    />
                  </td>
                  <td className="px-6 py-2">{c.code}</td>
                  <td className="px-6 py-2">
                    <button
                      onClick={() => handleColorClick(c._id)}
                      className="text-blue-600 hover:underline"
                    >
                      {c.name}
                    </button>
                  </td>
                  <td className="px-6 py-2">{c.description || "-"}</td>
                  <td className="px-6 py-2">{c.type || "-"}</td>
                  <td className="px-6 py-2 truncate">
                    {(c.values || []).join(", ")}
                  </td>
                  <td className="px-6 py-2">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        c.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-2">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-2">
                    {new Date(c.updatedAt).toLocaleDateString()}
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
  );
}
