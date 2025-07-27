import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "react-toastify/dist/ReactToastify.css";
import ConfViewPage from "./ConfViewPage.jsx";

export default function ConfList({ handleAddConf }) {
  const baseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/Configurations";

  // States
  const [ConfList, setConfList] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [viewingConfId, setViewingConfId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch configurations
  const fetchCompaniess = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: resp } = await axios.get(baseUrl);
      const list = resp.data || resp;
      setConfList(list);
      setFilteredCompanies(list);
    } catch (err) {
      console.error(err);
      setError("Unable to load configurations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompaniess();
  }, [fetchCompaniess]);

  // Filtering & Searching
  useEffect(() => {
    let list = [...ConfList];

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

    setFilteredCompanies(list);
  }, [ConfList, searchTerm, selectedOption]);

  // Handlers
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleFilterChange = (e) => setSelectedOption(e.target.value);
  const toggleSelectAll = (e) => {
    setSelectedCompanies(
      e.target.checked ? filteredCompanies.map((c) => c._id) : []
    );
  };
  const handleCheckboxChange = (id) => {
    setSelectedCompanies((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };
  const handleDeleteSelected = async () => {
    if (selectedCompanies.length === 0) {
      toast.info("No configurations selected to delete");
      return;
    }
    if (!window.confirm(`Delete ${selectedCompanies.length} configuration(s)?`))
      return;

    try {
      await Promise.all(
        selectedCompanies.map((id) => axios.delete(`${baseUrl}/${id}`))
      );
      toast.success("Deleted successfully");
      fetchCompaniess();
      setSelectedCompanies([]);
    } catch (err) {
      console.error(err);
      toast.error("Error deleting configurations");
    }
  };

  // Export
  const exportToExcel = () => {
    if (!ConfList.length) return toast.info("No data to export.");
    const ws = XLSX.utils.json_to_sheet(ConfList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Configurations");
    XLSX.writeFile(wb, "Configurations_list.xlsx");
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
      body: filteredCompanies.map((c, i) => [
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
    doc.save("Configurations_list.pdf");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedOption("");
  };
  const handleComapniesClick = (id) => setViewingConfId(id);
  const goBack = () => setViewingConfId(null);

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  if (viewingConfId) {
    return <ConfViewPage ConfId={viewingConfId} goBack={goBack} />;
  }

  return (
    <div>
      <ToastContainer />
      <div className="flex justify-between mb-4">
        <h3 className="text-xl font-semibold">Configurations</h3>
        <div className="flex gap-3">
          <button
            onClick={handleAddConf}
            className="px-3 py-1 border rounded hover:bg-green-100"
          >
            + Add
          </button>
          <button
            onClick={handleDeleteSelected}
            disabled={!selectedCompanies.length}
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

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={selectedOption}
            onChange={handleFilterChange}
            className="pl-10 pr-4 py-2 border rounded"
          >
            <option value="">Sort/Filter</option>
            <option value="name">By Name</option>
            <option value="code-asc">By Code Asc</option>
            <option value="code-desc">By Code Desc</option>
            <option value="yes">Active</option>
            <option value="no">Inactive</option>
          </select>
        </div>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-3 py-2 border rounded"
          />
        </div>
        <button onClick={resetFilters} className="text-red-500">
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="table-scroll-container h-[400px] overflow-auto bg-white rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={
                    selectedCompanies.length === filteredCompanies.length &&
                    filteredCompanies.length > 0
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
            {filteredCompanies.length ? (
              filteredCompanies.map((c) => (
                <tr key={c._id} className="hover:bg-gray-100">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedCompanies.includes(c._id)}
                      onChange={() => handleCheckboxChange(c._id)}
                    />
                  </td>
                  <td className="px-6 py-2">{c.code}</td>
                  <td className="px-6 py-2">
                    <button
                      onClick={() => handleComapniesClick(c._id)}
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
