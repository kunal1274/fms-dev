import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Dummy Data
const dummyJournalRevenues = [
  {
    id: 1,
    code: "JR-001",
    name: "Revenue Journal A",
    createdAt: "2025-09-20T10:00:00Z",
    postingDate: "2025-09-21",
    description: "Monthly sales revenue",
    currency: "USD",
    postingPeriod: "Sep 2025",
    active: true,
  },
  {
    id: 2,
    code: "JR-002",
    name: "Revenue Journal B",
    createdAt: "2025-09-21T12:30:00Z",
    postingDate: "2025-09-22",
    description: "Quarterly marketing revenue",
    currency: "USD",
    postingPeriod: "Q3 2025",
    active: false,
  },
  {
    id: 3,
    code: "JR-003",
    name: "Revenue Journal C",
    createdAt: "2025-09-22T09:15:00Z",
    postingDate: "2025-09-23",
    description: "Annual finance revenue",
    currency: "USD",
    postingPeriod: "2025",
    active: true,
  },
];

const dummySummary = {
  count: dummyJournalRevenues.length,
  creditLimit: 50000,
  paidJournalRevenues: 2,
  activeJournalRevenues: dummyJournalRevenues.filter((j) => j.active).length,
  onHoldJournalRevenues: 0,
};

const tabNames = ["All", "Active", "Inactive"];

export default function JournalRevenueList() {
  const [filteredJournalRevenues, setFilteredJournalRevenues] =
    useState(dummyJournalRevenues);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const getId = (c) => c.id;
  const isActive = (c) => c.active;

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredJournalRevenues.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredJournalRevenues.map((c) => getId(c)));
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleJournalRevenueClick = (id) => {
    toast.info(`Clicked JournalRevenue with ID: ${id}`);
  };

  const handleAddJournalRevenue = () => {
    toast.success("Add JournalRevenue clicked");
  };

  const handleDeleteSelected = () => {
    toast.error("Delete selected clicked");
  };

  const generatePDF = () => {
    toast.info("PDF generated");
  };

  const exportToExcel = () => {
    toast.info("Exported to Excel");
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    const filtered = dummyJournalRevenues.filter((c) =>
      c.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredJournalRevenues(filtered);
  };

  const onTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "All") setFilteredJournalRevenues(dummyJournalRevenues);
    if (tab === "Active")
      setFilteredJournalRevenues(dummyJournalRevenues.filter((c) => c.active));
    if (tab === "Inactive")
      setFilteredJournalRevenues(dummyJournalRevenues.filter((c) => !c.active));
  };

  return (
    <div className="p-4">
      <ToastContainer />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-semibold mb-6">JournalRevenue List</h3>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handleAddJournalRevenue}
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

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between p-2 bg-white rounded-md mb-2">
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

      {/* Tabs */}
      <div className="flex mb-2">
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
                    selectedIds.length === filteredJournalRevenues.length &&
                    filteredJournalRevenues.length > 0
                  }
                  className="form-checkbox"
                />
              </th>
              {[
                "Journal code",
                "Creation Date",
                "Journal name",
                "Posting_Date",
                "Description",
                "Currency",
                "Posting period",
                "Status",
                "Posting_Date.",
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
            {filteredJournalRevenues.length ? (
              filteredJournalRevenues.map((c) => (
                <tr key={c.id} className="hover:bg-gray-100 transition-colors">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(c.id)}
                      onChange={() => handleCheckboxChange(c.id)}
                      className="form-checkbox"
                    />
                  </td>
                  <td className="px-6 py-4">{c.code}</td>
                  <td className="px-6 py-4">
                    {new Date(c.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">{c.name}</td>
                  <td className="px-6 py-4">{c.postingDate}</td>
                  <td className="px-6 py-4">{c.description}</td>
                  <td className="px-6 py-4">{c.currency}</td>
                  <td className="px-6 py-4">{c.postingPeriod}</td>
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
                  <td className="px-6 py-4">{c.postingDate}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={10}
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
