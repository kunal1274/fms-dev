import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaSearch, FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./c.css";

export default function SiteList({ onAddSite }) {
  const baseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/sites";

  // State
  const [sites, setSites] = useState([]);
  const [filteredSites, setFilteredSites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [archivedFilter, setArchivedFilter] = useState("all");
  const [sortKey, setSortKey] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(false);

  // Column definitions matching backend model
  const columns = [
    { key: "code", label: "Code" },
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
    { key: "type", label: "Type" },
    { key: "active", label: "Active" },
    { key: "archived", label: "Archived" },
    { key: "createdAt", label: "Created At" },
  ];

  // Fetch sites from API
  const fetchSites = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(baseUrl);
      setSites(data);
      setFilteredSites(data);
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
    <div className="p-4">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Site List</h3>
        <button
          onClick={onAddSite}
          className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-green-100"
        >
          + Add Site
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center space-x-2 mb-4">
        <input
          type="text"
          placeholder="Search by code or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          value={archivedFilter}
          onChange={(e) => setArchivedFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
        >
          <option value="all">All Archives</option>
          <option value="archived">Archived</option>
          <option value="unarchived">Unarchived</option>
        </select>

        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
        >
          <option value="">Sort By</option>
          {columns
            .filter((c) => ["code", "name", "type"].includes(c.key))
            .map((col) => (
              <option key={col.key} value={col.key}>
                {col.label}
              </option>
            ))}
        </select>

        {sortKey && (
          <button
            onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
            className="px-2"
          >
            {sortOrder === "asc" ? <FaSortAlphaDown /> : <FaSortAlphaUp />}
          </button>
        )}
      </div>

      {/* Data Table */}
      {loading ? (
        <div>Loading sites...</div>
      ) : (
        <div className="overflow-auto bg-white rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSites.length > 0 ? (
                filteredSites.map((site) => (
                  <tr key={site._id} className="hover:bg-gray-100">
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-4 py-2 text-sm text-gray-800"
                      >
                        {col.key === "createdAt"
                          ? new Date(site[col.key]).toLocaleString()
                          : String(site[col.key])}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-4 text-center text-gray-500"
                  >
                    No sites found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
