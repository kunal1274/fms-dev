import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import { FaSortAmountDown, FaFilter, FaSearch } from "react-icons/fa";

const A = ({
  viewingCompaniesId,
  toggleView,
  goBack,
  handleAddCompany,
  handleDeleteSelected,
  generatePDF,
  exportToExcel,
  selectedCompanies = [],
  toggleSelectAll,
  filteredCompanies = [],
  handleCheckboxChange,
  handleCompaniesClick,
  resetFilters,
  handleSearchChange,
  searchTerm = "",
}) => {
  const [sortOption, setSortOption] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const handleSortChange = (e) => setSortOption(e.target.value);
  const handleFilterChange = (e) => setFilterStatus(e.target.value);

  return (
    <div>
      <ToastContainer />
      <div>
        {viewingCompaniesId ? (
          <CompanyViewPage
            toggleView={toggleView}
            CompaniesId={viewingCompaniesId}
            goBack={goBack}
          />
        ) : (
          <div>
            {/* Header Buttons */}
            <div className="flex justify-between">
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
                <h3 className="text-xl mb-4 font-semibold">Company List</h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddCompany}
                  className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
                >
                  + Add
                </button>
                <button
                  onClick={handleDeleteSelected}
                  disabled={!selectedCompanies.length}
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

            {/* Filters & Search */}
            <div className="flex flex-wrap items-center text-sm justify-between p-2 bg-white rounded-md mb-2 space-y-3 md:space-y-0 md:space-x-4">
              <div className="flex items-center space-x-4">
                {/* Sort By */}
                <div className="relative">
                  <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={sortOption}
                    onChange={handleSortChange}
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
                    value={filterStatus}
                    onChange={handleFilterChange}
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
                          selectedCompanies.length ===
                            filteredCompanies.length &&
                          filteredCompanies.length > 0
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
                      "Contact",
                      "Email",
                      "Registration Number",
                      "Tax ID / GST No",
                      "Status",
                    ].map((header) => (
                      <th
                        key={header}
                        className="sticky top-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCompanies.length ? (
                    filteredCompanies.map((c) => (
                      <tr
                        key={c._id}
                        className="hover:bg-gray-100 transition-colors"
                      >
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={selectedCompanies.includes(c._id)}
                            onChange={() => handleCheckboxChange(c._id)}
                            className="form-checkbox"
                          />
                        </td>
                        <td className="px-6 py-2">
                          <button
                            className="text-blue-600 hover:underline focus:outline-none"
                            onClick={() => handleCompaniesClick(c._id)}
                          >
                            {c.companyCode}
                          </button>
                        </td>
                        <td className="px-6 py-2">{c.businessType || "-"}</td>
                        <td className="px-6 py-2">{c.companyName || "-"}</td>
                        <td className="px-6 py-2">{c.currency || "-"}</td>
                        <td className="px-6 py-2 truncate">
                          {c.primaryGSTAddress || "-"}
                        </td>
                        <td className="px-6 py-2">{c.contactNumber || "-"}</td>
                        <td className="px-6 py-2">{c.email || "-"}</td>
                        <td className="px-6 py-2">{c.gstNumber || "-"}</td>
                        <td className="px-6 py-2">{c.tanNumber || "-"}</td>
                        <td className="px-6 py-2">
                          <span
                            className={`text-xs font-semibold rounded-full ${
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
                        colSpan={11}
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
  );
};

export default A;
