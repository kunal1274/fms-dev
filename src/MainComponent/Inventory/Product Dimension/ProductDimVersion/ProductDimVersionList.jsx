import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaSortAmountDown, FaFilter } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "react-toastify/dist/ReactToastify.css";
import "./c.css";
import ProductDimVersionViewPage from "./ProductDimVersionViewPage";

export default function ProductDimVersionList({ handleAddProductProduct }) {
  const baseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/versions";

  const tabNames = ["All ProductVersion", "Active", "Archived"];
  const [activeTab, setActiveTab] = useState(tabNames[0]);
  const [ProductVersion, setProductVersion] = useState([]);
  const [filteredProductVersion, setFilteredProductVersion] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [summary, setSummary] = useState({ total: 0, active: 0, archived: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewingId, setViewingId] = useState(null);

  const columns = [
    "Code",
    "Name",
    "Description",
    "Type",
    "Values",

    "Created At",
    "Updated At",
  ];

  // Fetch ProductVersion
  const fetchProductVersion = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(baseUrl, {
        params: { search: searchTerm, sort: sortOption },
      });
      const list = Array.isArray(res.data)
        ? res.data
        : res.data.ProductVersion ?? res.data.data ?? [];
      setProductVersion(list);
      setFilteredProductVersion(list);
      setSummary({
        total: list.length,
        active: list.filter((z) => z.active).length,
        archived: list.filter((z) => z.archived).length,
      });
    } catch (err) {
      console.error(err);
      setError("Unable to load ProductVersion.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortOption]);

  useEffect(() => {
    fetchProductVersion();
  }, [fetchProductVersion]);

  // Apply filters
  useEffect(() => {
    let list = [...ProductVersion];
    if (activeTab === "Active") list = list.filter((z) => z.active);
    else if (activeTab === "Archived") list = list.filter((z) => z.archived);

    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      list = list.filter(
        (z) =>
          z.code.toLowerCase().includes(t) ||
          z.name.toLowerCase().includes(t) ||
          (z.description || "").toLowerCase().includes(t)
      );
    }

    if (sortOption === "code-asc")
      list.sort((a, b) => a.code.localeCompare(b.code));
    else if (sortOption === "code-desc")
      list.sort((a, b) => b.code.localeCompare(a.code));

    setFilteredProductVersion(list);
  }, [ProductVersion, activeTab, searchTerm, sortOption]);

  // Toggle select all
  const toggleSelectAll = (e) =>
    setSelectedIds(
      e.target.checked ? filteredProductVersion.map((z) => z._id) : []
    );

  // Delete selected
  const handleDeleteSelected = async () => {
    if (!selectedIds.length) {
      toast.info("No ProductVersion selected");
      return;
    }
    if (!window.confirm("Delete selected ProductVersion?")) return;
    try {
      const results = await Promise.allSettled(
        selectedIds.map((id) => axios.delete(`${baseUrl}/${id}`))
      );
      const ok = results.filter((r) => r.status === "fulfilled").length;
      toast.success(`${ok} deleted`);
      setSelectedIds([]);
      fetchProductVersion();
    } catch {
      toast.error("Delete failed");
    }
  };

  // Export Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredProductVersion);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ProductVersions");
    XLSX.writeFile(wb, "ProductVersions.xlsx");
  };

  // Export PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Product Versions", 14, 10);
    autoTable(doc, {
      head: [columns],
      body: filteredProductVersion.map((z) => [
        z.code,
        z.name,
        z.description,
        z.type,
   
        z.createdAt ? new Date(z.createdAt).toLocaleString() : "—",
        z.updatedAt ? new Date(z.updatedAt).toLocaleString() : "—",
        z.active ? "Yes" : "No",
      ]),
    });
    doc.save("ProductVersions.pdf");
  };

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (viewingId)
    return (
      <ProductDimVersionViewPage
        ProductVersionId={viewingId}
        goBack={() => setViewingId(null)}
      />
    );

  return (
    <div>
      <ToastContainer />

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Product Versions</h3>
        <div className="flex gap-3 items-center">
          <button
            onClick={handleAddProductProduct}
            className="h-8 px-3 border border-green-500 rounded hover:bg-green-100"
          >
            + Add
          </button>
          <button
            onClick={handleDeleteSelected}
            disabled={!selectedIds.length}
            className="h-8 px-3 border border-red-500 rounded hover:bg-red-100"
          >
            Delete ({selectedIds.length})
          </button>
          <button
            onClick={generatePDF}
            className="h-8 px-3 border border-blue-500 rounded hover:bg-blue-100"
          >
            PDF
          </button>
          <button
            onClick={exportToExcel}
            className="h-8 px-3 border border-yellow-500 rounded hover:bg-yellow-100"
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
                   <FaSearch className="w-5 h-5" />
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
      <div className="overflow-auto bg-white rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={
                    selectedIds.length === filteredProductVersion.length &&
                    !!filteredProductVersion.length
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
            {filteredProductVersion.length ? (
              filteredProductVersion.map((z) => (
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
                  <td className="px-4 py-2">
                    {(z.values || []).length ? z.values.join(", ") : "—"}
                  </td>

                  <td className="px-4 py-2">
                    {z.createdAt ? new Date(z.createdAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-2">
                    {z.updatedAt ? new Date(z.updatedAt).toLocaleString() : "—"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No Product Version found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
