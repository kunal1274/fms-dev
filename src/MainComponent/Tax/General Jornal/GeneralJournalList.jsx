import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "./c.css";

export default function JournalList({ handleAddJournal, onView }) {
  // === API base ===
  const apiBase = "https://fms-qkmw.onrender.com/fms/api/v0/journals";
  const metricsUrl = `${apiBase}/metrics`;

  // === Tabs ===
  const tabNames = [
    "All Journals",
    "Posted",
    "Active",
    "On Hold",
    "With Balance",
  ];

  // === State ===
  const [activeTab, setActiveTab] = useState(tabNames[0]);
  const [journalList, setJournalList] = useState([]);
  const [filteredJournals, setFilteredJournals] = useState([]);
  const [selectedJournals, setSelectedJournals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOption, setSortOption] = useState("");

  const [summary, setSummary] = useState({
    count: 0,
    totalDebit: 0,
    totalCredit: 0,
    postedCount: 0,
    activeCount: 0,
    onHoldCount: 0,
  });

  const [loading, setLoading] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [error, setError] = useState(null);

  // Optional: file input ref (kept if you later add attachments)
  const fileInputRef = useRef(null);

  // === Fetch Journals ===
  const fetchJournals = useCallback(
    async (fromDate = startDate, toDate = endDate) => {
      setLoading(true);
      setError(null);
      try {
        const { data: resp } = await axios.get(apiBase, {
          params: { from: fromDate, to: toDate },
        });
        const list = resp?.data || resp || [];
        setJournalList(list);
        setFilteredJournals(list);

        // Local quick summary if backend metrics aren’t available
        const localSummary = {
          count: list.length,
          totalDebit: list.reduce((s, j) => s + (Number(j.debit) || 0), 0),
          totalCredit: list.reduce((s, j) => s + (Number(j.credit) || 0), 0),
          postedCount: list.filter((j) => j.status === "Posted").length,
          activeCount: list.filter((j) => j.active).length,
          onHoldCount: list.filter((j) => j.onHold).length,
        };
        setSummary((prev) => ({ ...prev, ...localSummary }));
      } catch (err) {
        console.error(err);
        setError("Unable to load journal data.");
      } finally {
        setLoading(false);
      }
    },
    [startDate, endDate]
  );

  // === Fetch Metrics (if your API provides them) ===
  const fetchMetrics = useCallback(async () => {
    setLoadingMetrics(true);
    try {
      const { data: resp } = await axios.get(metricsUrl, {
        params: { from: startDate, to: endDate },
      });
      const m = (resp.metrics && resp.metrics[0]) || {};
      setSummary((prev) => ({
        ...prev,
        count: m.totalJournals ?? prev.count,
        totalDebit: m.totalDebit ?? prev.totalDebit,
        totalCredit: m.totalCredit ?? prev.totalCredit,
        postedCount: m.postedCount ?? prev.postedCount,
        activeCount: m.activeCount ?? prev.activeCount,
        onHoldCount: m.onHoldCount ?? prev.onHoldCount,
      }));
    } catch (err) {
      // Not fatal if metrics endpoint isn’t implemented
      console.warn("Metrics fetch failed:", err?.message);
    } finally {
      setLoadingMetrics(false);
    }
  }, [startDate, endDate, metricsUrl]);

  useEffect(() => {
    fetchJournals();
    fetchMetrics();
  }, [fetchJournals, fetchMetrics]);

  // === Filtering / Search / Sort ===
  useEffect(() => {
    let list = [...journalList];

    // Tabs
    switch (activeTab) {
      case "Posted":
        list = list.filter((j) => j.status === "Posted");
        break;
      case "Active":
        list = list.filter((j) => j.active);
        break;
      case "On Hold":
        list = list.filter((j) => j.onHold);
        break;
      case "With Balance":
        list = list.filter(
          (j) => (Number(j.debit) || 0) !== (Number(j.credit) || 0)
        );
        break;
      default:
        break;
    }

    // Status filter (broad)
    if (statusFilter === "Active") list = list.filter((j) => j.active);
    else if (statusFilter === "Inactive") list = list.filter((j) => !j.active);
    else if (statusFilter === "Posted")
      list = list.filter((j) => j.status === "Posted");
    else if (statusFilter === "Draft")
      list = list.filter((j) => j.status === "Draft");

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (j) =>
          (j.journalCode || j.code || "")
            .toString()
            .toLowerCase()
            .includes(term) ||
          (j.journalName || j.name || "")
            .toString()
            .toLowerCase()
            .includes(term)
      );
    }

    // Sort
    if (sortOption === "name-asc")
      list.sort((a, b) =>
        (a.journalName || a.name || "").localeCompare(
          b.journalName || b.name || ""
        )
      );
    else if (sortOption === "code-asc")
      list.sort((a, b) =>
        (a.journalCode || a.code || "").localeCompare(
          b.journalCode || b.code || ""
        )
      );
    else if (sortOption === "code-desc")
      list.sort((a, b) =>
        (b.journalCode || b.code || "").localeCompare(
          a.journalCode || a.code || ""
        )
      );

    setFilteredJournals(list);
  }, [journalList, activeTab, statusFilter, searchTerm, sortOption]);

  // === Handlers ===
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleStatusChange = (e) => setStatusFilter(e.target.value);
  const handleSortChange = (e) => setSortOption(e.target.value);
  const onTabClick = (tab) => setActiveTab(tab);

  const toggleSelectAll = (e) => {
    setSelectedJournals(
      e.target.checked ? filteredJournals.map((j) => j._id) : []
    );
  };

  const handleCheckboxChange = (id) => {
    setSelectedJournals((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (!selectedJournals.length) {
      toast.info("No journals selected to delete");
      return;
    }
    if (!window.confirm("Delete selected journals?")) return;

    try {
      const results = await Promise.allSettled(
        selectedJournals.map((id) => axios.delete(`${apiBase}/${id}`))
      );

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (succeeded) {
        toast.success(`${succeeded} deleted`);
        await fetchJournals();
        setSelectedJournals([]);
      }
      if (failed) toast.error(`${failed} failed — check console`);
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error while deleting");
    }
  };

  const exportToExcel = () => {
    if (!filteredJournals.length) {
      toast.info("No data to export.");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(filteredJournals);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Journals");
    XLSX.writeFile(wb, "journal_list.xlsx");
  };

  const generatePDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    autoTable(doc, {
      head: [
        [
          "#",
          "Journal Code",
          "Journal Name",
          "Posting Period",
          "Posting Date",
          "Account ID",
          "Account Name",
          "Status",
          "Debit",
          "Credit",
          "Posting Account No.",
          "Posting Account Name",
          "Total Amount",
        ],
      ],
      body: filteredJournals.map((j, i) => [
        i + 1,
        j.journalCode || j.code || "",
        j.journalName || j.name || "",
        j.postingPeriod || "",
        j.postingDate ? new Date(j.postingDate).toISOString().slice(0, 10) : "",
        j.accountId || j.accountID || "",
        j.accountName || j.account || "",
        j.status || (j.active ? "Active" : "Inactive"),
        Number(j.debit || 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        Number(j.credit || 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        j.postingAccountNo || "",
        j.postingAccountName || "",
        Number(
          j.totalAmount ?? Number(j.debit || 0) - Number(j.credit || 0)
        ).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      ]),
      styles: { fontSize: 8 },
    });
    doc.save("journal_list.pdf");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setSortOption("");
  };

  // === Render ===
  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <ToastContainer />

      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">General Journal</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddJournal}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-50 hover:scale-[1.02]"
          >
            + Add
          </button>
          <button
            onClick={handleDeleteSelected}
            disabled={!selectedJournals.length}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition disabled:opacity-50 hover:bg-blue-50 hover:scale-[1.02]"
          >
            Delete
          </button>
          <button
            onClick={generatePDF}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-50 hover:scale-[1.02]"
          >
            PDF
          </button>
          <button
            onClick={exportToExcel}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-50 hover:scale-[1.02]"
          >
            Export
          </button>
        </div>
      </div>

      {/* Metrics + date filters */}
      <div className="bg-white rounded-lg p-3 space-y-3">
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
            onClick={() => {
              fetchMetrics();
              fetchJournals(startDate, endDate);
            }}
            className="px-3 py-1 border rounded"
          >
            {loadingMetrics ? "Applying…" : "Apply"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            ["Total Journals", summary.count],
            ["Total Debit", summary.totalDebit.toLocaleString()],
            ["Total Credit", summary.totalCredit.toLocaleString()],
            ["Posted", summary.postedCount],
            ["Active", summary.activeCount],
            ["On-Hold", summary.onHoldCount],
          ].map(([label, value]) => (
            <div key={label} className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between p-2 bg-white rounded-md gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Sort */}
          <div className="relative">
            <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={sortOption}
              onChange={handleSortChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sort By</option>
              <option value="name-asc">Journal Name</option>
              <option value="code-asc">Journal Code Asc</option>
              <option value="code-desc">Journal Code Desc</option>
            </select>
          </div>

          {/* Filter By Status */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="pl-10 pr-4 py-2 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">Filter By Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Posted">Posted</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by code or name..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-60 pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FaSearch className="w-5 h-5" />
            </span>
          </div>
        </div>

        <button
          onClick={resetFilters}
          className="text-red-500 hover:text-red-600 font-medium"
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
                    selectedJournals.length === filteredJournals.length &&
                    filteredJournals.length > 0
                  }
                  className="form-checkbox"
                />
              </th>
              {[
                "Journal Code",
                "Journal Name",
                "Posting Period",
                "Posting Date",
                "Account ID",
                "Account Name",
                "Status",
                "Debit",
                "Credit",
                "Posting Account No.",
                "Posting Account Name",
                "Total Amount",
                "Created At",
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
            {filteredJournals.length ? (
              filteredJournals.map((j) => {
                const code = j.journalCode || j.code || "";
                const name = j.journalName || j.name || "";
                const debit = Number(j.debit || 0);
                const credit = Number(j.credit || 0);
                const totalAmount =
                  j.totalAmount ??
                  (Number.isFinite(debit - credit) ? debit - credit : 0);

                return (
                  <tr
                    key={j._id || code}
                    className="hover:bg-gray-100 transition-colors"
                  >
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedJournals.includes(j._id)}
                        onChange={() => handleCheckboxChange(j._id)}
                        className="form-checkbox"
                      />
                    </td>

                    {/* Code (clickable to view if onView provided) */}
                    <td className="px-6 py-4">
                      {onView ? (
                        <button
                          className="text-blue-600 hover:underline focus:outline-none"
                          onClick={() => onView(j._id)}
                        >
                          {code}
                        </button>
                      ) : (
                        code
                      )}
                    </td>

                    <td className="px-6 py-4">{name}</td>
                    <td className="px-6 py-4">{j.postingPeriod || ""}</td>
                    <td className="px-6 py-4">
                      {j.postingDate
                        ? new Date(j.postingDate).toISOString().slice(0, 10)
                        : ""}
                    </td>
                    <td className="px-6 py-4">
                      {j.accountId || j.accountID || ""}
                    </td>
                    <td className="px-6 py-4">
                      {j.accountName || j.account || ""}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          j.status === "Posted"
                            ? "bg-green-100 text-green-800"
                            : j.status === "Draft"
                            ? "bg-yellow-100 text-yellow-800"
                            : j.active
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {j.status || (j.active ? "Active" : "Inactive")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {debit.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {credit.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4">{j.postingAccountNo || ""}</td>
                    <td className="px-6 py-4">{j.postingAccountName || ""}</td>
                    <td className="px-6 py-4">
                      {Number(totalAmount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-3 truncate">
                      {j.createdAt
                        ? new Date(j.createdAt).toLocaleString()
                        : ""}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={14}
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
