import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaSortAmountDown, FaFilter } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "react-toastify/dist/ReactToastify.css";
import "./c.css";
import ZoneViewPage from "./ZoneViewPagee";

export default function ZoneList({ handleAddZone }) {
  const baseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/zones";
  const metricsUrl = `${baseUrl}/metrics`;

  const tabNames = ["All Zones", "Active", "Archived"];

  const [activeTab, setActiveTab] = useState(tabNames[0]);
  const [zones, setZones] = useState([]);
  const [filteredZones, setFilteredZones] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [summary, setSummary] = useState({ total: 0, active: 0, archived: 0 });
  const [loading, setLoading] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [error, setError] = useState(null);
  const [viewingId, setViewingId] = useState(null);

  // Table column headers
  const columns = [
    "Code",
    "Name",
    "Description",
    "Type",
    "Warehouse",
    "Zone Address",
    "Remarks",
    "Archived",
    "Company",
    "Groups",
    "Created By",
    "Updated By",
    "Active",
  ];

  // Fetch zones list
  const fetchZones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(baseUrl, {
        params: { search: searchTerm, sort: sortOption },
      });
      // Normalize response into array
      const list = Array.isArray(res.data)
        ? res.data
        : res.data.zones ?? res.data.data ?? [];
      setZones(list);
      // Set initial filtered list and summary
      setFilteredZones(list);
      setSummary({
        total: list.length,
        active: list.filter((z) => z.active).length,
        archived: list.filter((z) => z.archived).length,
      });
    } catch (err) {
      console.error(err);
      setError("Unable to load zones.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortOption]);

  // Fetch metrics counts
  const fetchMetrics = useCallback(async () => {
    setLoadingMetrics(true);
    try {
      const { data } = await axios.get(metricsUrl);
      setSummary({
        total: data.totalZones,
        active: data.activeZones,
        archived: data.archivedZones,
      });
    } catch {
      // ignore
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  // On mount/update: fetch data
  useEffect(() => {
    fetchZones();
    fetchMetrics();
  }, [fetchZones, fetchMetrics]);

  // Apply filters (tab, search, sort)
  useEffect(() => {
    let list = [...zones];
    if (activeTab === "Active") list = list.filter((z) => z.active);
    else if (activeTab === "Archived") list = list.filter((z) => z.archived);

    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      list = list.filter(
        (z) =>
          z.code.toLowerCase().includes(t) || z.name.toLowerCase().includes(t)
      );
    }

    if (sortOption === "code-asc")
      list.sort((a, b) => a.code.localeCompare(b.code));
    else if (sortOption === "code-desc")
      list.sort((a, b) => b.code.localeCompare(a.code));

    setFilteredZones(list);
  }, [zones, activeTab, searchTerm, sortOption]);

  // Toggle select all
  const toggleSelectAll = (e) =>
    setSelectedIds(e.target.checked ? filteredZones.map((z) => z._id) : []);

  // Delete selected zones
  const handleDeleteSelected = async () => {
    if (!selectedIds.length) {
      toast.info("No zones selected");
      return;
    }
    if (!window.confirm("Delete selected zones?")) return;
    try {
      const results = await Promise.allSettled(
        selectedIds.map((id) => axios.delete(`${baseUrl}/${id}`))
      );
      const ok = results.filter((r) => r.status === "fulfilled").length;
      toast.success(`${ok} deleted`);
      setSelectedIds([]);
      fetchZones();
    } catch {
      toast.error("Delete failed");
    }
  };

  // Loading or error states
  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (viewingId)
    return (
      <ZoneViewPage ZoneId={viewingId} goBack={() => setViewingId(null)} />
    );

  // Render main table
  return (
    <div>
      <ToastContainer />

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Zones</h3>
        <div className="space-x-2">
          <button onClick={handleAddZone} className="btn">
            + Add
          </button>
          <button
            onClick={handleDeleteSelected}
            className="btn"
            disabled={!selectedIds.length}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {["total", "active", "archived"].map((key, idx) => (
          <div key={key} className="p-4 bg-gray-50 rounded">
            <div className="text-2xl">{summary[key]}</div>
            <div>{key.charAt(0).toUpperCase() + key.slice(1)} Zones</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex space-x-4">
          <ul className="flex space-x-4">
            {tabNames.map((tab) => (
              <li
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`cursor-pointer pb-1 ${
                  activeTab === tab
                    ? "border-b-2 border-green-600 text-green-600"
                    : "text-gray-600"
                }`}
              >
                {tab}
              </li>
            ))}
          </ul>

          <div className="flex items-center space-x-2">
            <FaSortAmountDown />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border px-2 py-1 rounded"
            >
              <option value="">Sort</option>
              <option value="code-asc">Code ↑</option>
              <option value="code-desc">Code ↓</option>
            </select>
          </div>

          <div className="relative">
            <FaFilter className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-2 py-1 border rounded"
            />
          </div>
        </div>

        <button
          onClick={() => {
            setSearchTerm("");
            setSortOption("");
            setActiveTab(tabNames[0]);
          }}
          className="text-red-500"
        >
          Reset
        </button>
      </div>

      {/* Data table */}
      <div className="overflow-auto bg-white rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={
                    selectedIds.length === filteredZones.length &&
                    !!filteredZones.length
                  }
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredZones.length ? (
              filteredZones.map((z) => (
                <tr key={z._id} className="hover:bg-gray-100">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(z._id)}
                      onChange={() =>
                        setSelectedIds((ids) =>
                          ids.includes(z._id)
                            ? ids.filter((i) => i !== z._id)
                            : [...ids, z._id]
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => setViewingId(z._id)}
                    >
                      {z.code}
                    </button>
                  </td>
                  <td className="px-4 py-2">{z.name}</td>
                  <td className="px-4 py-2">{z.description || "—"}</td>
                  <td className="px-4 py-2">{z.type}</td>
                  <td className="px-4 py-2">{z.warehouse?.name || "—"}</td>
                  <td className="px-4 py-2">{z.zoneAddress || "—"}</td>
                  <td className="px-4 py-2">{z.remarks || "—"}</td>
                  <td className="px-4 py-2">{z.archived ? "Yes" : "No"}</td>
                  <td className="px-4 py-2">{z.company?.name || "—"}</td>
                  <td className="px-4 py-2">{(z.groups || []).length}</td>
                  <td className="px-4 py-2">{z.createdBy || "—"}</td>
                  <td className="px-4 py-2">{z.updatedBy || "—"}</td>
                  <td className="px-4 py-2">{z.active ? "Yes" : "No"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No zones found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
