import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Tabs } from "flowbite-react";
import "./c.css";
import CustomerViewPage from "./CustomerViewPagee";

export default function CustomerList({ handleAddCustomer, onView }) {
  const baseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/customers";
  const metricsUrl = `${baseUrl}/metrics`;

  const tabNames = [
    "Customer List",
    "Paid Customer",
    "Active Customer",
    "Hold Customer",
    "Outstanding Customer",
  ];

  // States
  const [activeTab, setActiveTab] = useState(tabNames[0]);

  const [customerList, setCustomerList] = useState([]);
  const [selectedOption, setSelectedOption] = useState("All");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [viewingCustomerId, setViewingCustomerId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOption, setSortOption] = useState("");

  const [customerSummary, setCustomerSummary] = useState({
    count: 0,
    creditLimit: 0,
    paidCustomers: 0,
    activeCustomers: 0,
    onHoldCustomers: 0,
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [error, setError] = useState(null);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setSelectedOption(value);

    let filtered = [...customerList];

    if (value === "All") {
      setFilteredCustomers(filtered);
    } else if (value === "yes") {
      setFilteredCustomers(
        filtered.filter((customer) => customer.active === true)
      );
    } else if (value === "no") {
      setFilteredCustomers(
        filtered.filter((customer) => customer.active === false)
      );
    } else if (value === "Customer Name") {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
      setFilteredCustomers(filtered);
    } else if (value === "Customer Account no") {
      filtered = filtered.sort((a, b) => a.code.localeCompare(b.code));
      setFilteredCustomers(filtered);
    } else if (value === "Customer Account no descending") {
      filtered = filtered.sort((a, b) => b.code.localeCompare(a.code));
      setFilteredCustomers(filtered);
    }
  };
  // Fetch Customers
  const fetchCustomers = useCallback(
    async (fromDate = startDate, toDate = endDate) => {
      setLoading(true);
      setError(null);
      try {
        const { data: resp } = await axios.get(baseUrl, {
          params: { from: fromDate, to: toDate },
        });
        const list = resp.data || resp;
        setCustomerList(list);

        +setFilteredCustomers(list); // ← Add this line to update the visible customers immediately

        setCustomerSummary({
          count: list.length,
          creditLimit: list.reduce((s, c) => s + (c.creditLimit || 0), 0),
          paidCustomers: list.filter((c) => c.status === "Paid").length,
          activeCustomers: list.filter((c) => c.active).length,
          onHoldCustomers: list.filter((c) => c.onHold).length,
        });
      } catch (err) {
        console.error(err);
        setError("Unable to load customer data.");
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
      setCustomerSummary((prev) => ({
        ...prev,
        count: m.totalCustomers ?? prev.count,
        creditLimit: m.creditLimit ?? prev.creditLimit,
        paidCustomers: m.paidCustomers ?? prev.paidCustomers,
        activeCustomers: m.activeCustomers ?? prev.activeCustomers,
        onHoldCustomers: m.onHoldCustomers ?? prev.onHoldCustomers,
      }));
    } catch (err) {
      console.error(err);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchCustomers();
    fetchMetrics();
  }, [fetchCustomers, fetchMetrics]);

  // Filtering, Search, Sorting
  useEffect(() => {
    let list = [...customerList];

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

    setFilteredCustomers(list);
  }, [customerList, activeTab, statusFilter, searchTerm, sortOption]);

  // Handlers
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleStatusChange = (e) => setStatusFilter(e.target.value);
  const handleSortChange = (e) => setSortOption(e.target.value);
  const onTabClick = (tab) => setActiveTab(tab);

  const toggleSelectAll = (e) => {
    setSelectedCustomers(
      e.target.checked ? filteredCustomers.map((c) => c._id) : []
    );
  };

  const handleCheckboxChange = (id) => {
    setSelectedCustomers((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (!selectedCustomers.length) {
      toast.info("No customers selected to delete");
      return;
    }

    if (!window.confirm("Delete selected customers?")) return;

    try {
      const results = await Promise.allSettled(
        selectedCustomers.map((id) => axios.delete(`${baseUrl}/${id}`))
      );

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (succeeded) {
        toast.success(`${succeeded} deleted`);
        await fetchCustomers();
        setSelectedCustomers([]);
      }
      if (failed) toast.error(`${failed} failed — check console`);
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error while deleting");
    }
  };

  const exportToExcel = () => {
    if (!customerList.length) {
      toast.info("No data to export.");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(customerList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, "customer_list.xlsx");
  };

  const generatePDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    autoTable(doc, {
      head: [["#", "Code", "Name", "Contact", "Address", "Status"]],
      body: filteredCustomers.map((c, i) => [
        i + 1,
        c.code,
        c.name,
        c.contactNum,
        c.address,
        c.active ? "Active" : "Inactive",
      ]),
    });
    doc.save("customer_list.pdf");
  };

  const handleCustomerClick = (customerId) => {
    setViewingCustomerId(customerId);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setSortOption("");
  };

  const goBack = () => setViewingCustomerId(null);

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  if (viewingCustomerId) {
    return (
      <div className="p-4">
        <CustomerViewPage customerId={viewingCustomerId} goBack={goBack} />
      </div>
    );
  }
  // ─── Render ─────────────────────────────────────────────────────

  return (
    <div>
      <div>
        <div>
          {viewingCustomerId ? (
            <CustomerViewPage
              toggleView={toggleView}
              customerId={viewingCustomerId}
              goBack={goBack}
            />
          ) : (
            <div className="space-y-3">
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
                      {/* <svg
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
                      </svg>{" "} */}
                    </button>
                  </div>

                  {/* </div> */}
                  <h3 className="text-xl font-semibold">Customer List</h3>
                </div>
                <div className="flex items-center gap-3 ">
                  <button
                    onClick={handleAddCustomer}
                    className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
                  >
                    + Add
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={!selectedCustomers.length}
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
                      fetchCustomers(startDate, endDate);
                    }}
                    className="px-3 py-1 border rounded"
                  >
                    {loadingMetrics ? "Applying…" : "Apply"}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                  {[
                    ["Total Customers", customerSummary.count],
                    ["Credit Limit", customerSummary.creditLimit],
                    ["Paid Customers", customerSummary.paidCustomers],
                    ["Active Customers", customerSummary.activeCustomers],
                    ["On‑Hold Customers", customerSummary.onHoldCustomers],
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
                      <option value="Customer Name">Customer Name</option>
                      <option value="Customer Account no">
                        Customer Account in Ascending
                      </option>
                      <option value="Customer Account no descending">
                        Customer Account in descending
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
                  disabled={
                    !(
                      sortOption ||
                      statusFilter === "Active" ||
                      statusFilter === "Inactive" ||
                      searchTerm
                    )
                  }
                  className={`font-medium w-full sm:w-auto transition
    ${
      sortOption ||
      statusFilter === "Active" ||
      statusFilter === "Inactive" ||
      searchTerm
        ? "text-red-500 hover:text-red-600 cursor-pointer"
        : "text-gray-400 cursor-not-allowed"
    }`}
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
                            selectedCustomers.length ===
                              filteredCustomers.length &&
                            filteredCustomers.length > 0
                          }
                          className="form-checkbox"
                        />
                      </th>
                      {[
                        "Code",
                        "Name",
                        "Address",
                        "Created At",
                        "Contact",
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
                    {filteredCustomers.length ? (
                      filteredCustomers.map((c) => (
                        <tr
                          key={c.code}
                          className="hover:bg-gray-100 transition-colors"
                        >
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={selectedCustomers.includes(c._id)}
                              onChange={() => handleCheckboxChange(c._id)}
                              className="form-checkbox"
                            />
                          </td>
                          <td
                          // onClick={() => handleCustomerClick(customer._id)}
                          // className="px-6 py-4 cursor-pointer text-blue-600 hover:underline"
                          >
                            <button
                              className="text-blue-600 hover:underline focus:outline-none"
                              onClick={() => handleCustomerClick(c._id)}
                            >
                              {c.code}
                            </button>
                          </td>
                          <td className="px-6 py-4">{c.name}</td>
                          <td className="px-6 py-4">{c.address}</td>{" "}
                          <td className="px-6 py-3 truncate">
                            {new Date(c.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">{c.contactNum}</td>
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
