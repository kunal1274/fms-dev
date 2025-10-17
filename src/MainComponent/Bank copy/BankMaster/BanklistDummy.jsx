import React, { useRef, useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { FaSortAmountDown, FaFilter, FaSearch } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

export default function BankList() {
  const fileInputRef = useRef(null);

  // ✅ Dummy data with required fields
  const dummyBanks = [
    {
      _id: "1",
      BankID: "B001",
      BankName: "Bank of America",
      AccountType: "Savings",
      AccountNumber: "1234567890",
      AccounHolderName: "John Doe",
      IFSCCode: "BOFA0001234",
      SWIFTCode: "BOFAUS3N",
      active: true,
    },
    {
      _id: "2",
      BankID: "B002",
      BankName: "Chase Bank",
      AccountType: "Checking",
      AccountNumber: "9876543210",
      AccounHolderName: "Jane Smith",
      IFSCCode: "CHAS0005678",
      SWIFTCode: "CHASUS33",
      active: false,
    },
    {
      _id: "3",
      BankID: "B003",
      BankName: "HSBC",
      AccountType: "Business",
      AccountNumber: "5556667777",
      AccounHolderName: "Alice Johnson",
      IFSCCode: "HSBC0004321",
      SWIFTCode: "HSBCGB2L",
      active: true,
    },
  ];

  const [banks, setBanks] = useState(dummyBanks);
  const [filteredBanks, setFilteredBanks] = useState(dummyBanks);
  const [selectedBanks, setSelectedBanks] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All Banks");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  const tabNames = ["All Banks", "Active", "Inactive"];

  // ✅ Dummy Bank Summary
  const BankSummary = {
    count: banks.length,
    creditLimit: "$500,000",
    paidBanks: 1,
    activeBanks: banks.filter((b) => b.active).length,
    onHoldBanks: 0,
  };

  // Upload handler
  const handleFileUpload = (file) => {
    if (file) toast.success(`Uploaded: ${file.name}`);
  };

  // Add dummy bank
  const handleAddBank = () => {
    const newBank = {
      _id: Date.now().toString(),
      BankID: "B00" + (banks.length + 1),
      BankName: "New Dummy Bank",
      AccountType: "Savings",
      AccountNumber: Math.floor(1000000000 + Math.random() * 9000000000),
      AccounHolderName: "Test User",
      IFSCCode: "TEST000" + banks.length,
      SWIFTCode: "TESTUS" + banks.length,
      active: Math.random() > 0.5,
    };
    setBanks([...banks, newBank]);
    toast.success("Bank Added!");
  };

  // Delete selected
  const handleDeleteSelected = () => {
    setBanks(banks.filter((b) => !selectedBanks.includes(b._id)));
    setSelectedBanks([]);
    toast.info("Selected banks deleted!");
  };

  const generatePDF = () => toast.info("PDF generated (dummy).");
  const exportToExcel = () => toast.info("Exported to Excel (dummy).");

  // Checkbox
  const handleCheckboxChange = (id) => {
    setSelectedBanks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedBanks.length === filteredBanks.length) {
      setSelectedBanks([]);
    } else {
      setSelectedBanks(filteredBanks.map((b) => b._id));
    }
  };

  // Sort
  const handleSortChange = (e) => {
    const option = e.target.value;
    setSortOption(option);

    let sorted = [...filteredBanks];
    if (option === "name-asc") {
      sorted.sort((a, b) => a.BankName.localeCompare(b.BankName));
    } else if (option === "code-asc") {
      sorted.sort((a, b) => a.BankID.localeCompare(b.BankID));
    } else if (option === "code-desc") {
      sorted.sort((a, b) => b.BankID.localeCompare(a.BankID));
    }
    setFilteredBanks(sorted);
  };

  const handleStatusChange = (e) => setStatusFilter(e.target.value);
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const resetFilters = () => {
    setSortOption("");
    setStatusFilter("All");
    setSearchTerm("");
    setFilteredBanks(banks);
  };

  const onTabClick = (tab) => setActiveTab(tab);

  const fetchMetrics = () => {
    setLoadingMetrics(true);
    setTimeout(() => setLoadingMetrics(false), 1000);
  };

  const fetchBanks = (start, end) => {
    if (!start || !end) return;
    const filtered = banks.filter(
      (b) =>
        new Date(b.createdAt) >= new Date(start) &&
        new Date(b.createdAt) <= new Date(end)
    );
    setFilteredBanks(filtered);
  };

  // Filtering logic
  useEffect(() => {
    let data = [...banks];

    if (statusFilter !== "All") {
      data = data.filter((b) =>
        statusFilter === "Active" ? b.active : !b.active
      );
    }

    if (searchTerm) {
      data = data.filter(
        (b) =>
          b.BankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.BankID.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeTab === "Active") {
      data = data.filter((b) => b.active);
    } else if (activeTab === "Inactive") {
      data = data.filter((b) => !b.active);
    }

    setFilteredBanks(data);
  }, [banks, statusFilter, searchTerm, activeTab]);

  return (
    <div className="space-y-6 p-4">
      <ToastContainer />

      {/* Header */}
      <div className="flex justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <button
              type="button"
              className="text-blue-600 mt-2 text-sm hover:underline"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files?.[0])}
            />
          </div>
          <h3 className="text-xl font-semibold">Bank List</h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddBank}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-white"
          >
            + Add
          </button>
          <button
            onClick={handleDeleteSelected}
            disabled={!selectedBanks.length}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-red-500 hover:text-white disabled:opacity-50"
          >
            Delete
          </button>
          <button
            onClick={generatePDF}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-white"
          >
            PDF
          </button>
          <button
            onClick={exportToExcel}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-white"
          >
            Export
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="bg-white rounded-lg p-4">
        <div className="flex gap-2 mb-3">
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
              fetchBanks(startDate, endDate);
            }}
            className="px-3 py-1 border rounded"
          >
            {loadingMetrics ? "Applying…" : "Apply"}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {[
            ["Total Banks", BankSummary.count],
            ["Credit Limit", BankSummary.creditLimit],
            ["Paid Banks", BankSummary.paidBanks],
            ["Active Banks", BankSummary.activeBanks],
            ["On-Hold Banks", BankSummary.onHoldBanks],
          ].map(([label, value]) => (
            <div
              key={label}
              className="p-4 bg-gray-50 rounded-lg text-center shadow"
            >
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-between p-2 bg-white rounded-md mb-2">
        <div className="flex items-center space-x-4">
          {/* Sort */}
          <div className="relative">
            <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={sortOption}
              onChange={handleSortChange}
              className="pl-10 pr-4 py-2 border rounded-lg"
            >
              <option value="">Sort By</option>
              <option value="name-asc">Bank Name</option>
              <option value="code-asc">Bank ID Asc</option>
              <option value="code-desc">Bank ID Desc</option>
            </select>
          </div>

          {/* Status */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="pl-10 pr-4 py-2 border rounded-lg"
            >
              <option value="All">Filter By Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-60 pl-3 pr-10 py-2 border rounded-md"
            />
            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <button onClick={resetFilters} className="text-red-500 font-medium">
          Reset Filter
        </button>
      </div>

      {/* Tabs */}
      <div className="flex">
        <ul className="flex space-x-6">
          {tabNames.map((tab) => (
            <li
              key={tab}
              onClick={() => onTabClick(tab)}
              className={`cursor-pointer pb-2 ${
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
      <div className="h-[400px] overflow-auto bg-white rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-2">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={
                    selectedBanks.length === filteredBanks.length &&
                    filteredBanks.length > 0
                  }
                />
              </th>
              {[
                "BankID",
                "BankName",
                "AccountType",
                "AccountNumber",
                "AccounHolderName",
                "IFSCCode",
                "SWIFTCode",
                "Status",
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBanks.length ? (
              filteredBanks.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedBanks.includes(c._id)}
                      onChange={() => handleCheckboxChange(c._id)}
                    />
                  </td>
                  <td className="px-6 py-3">{c.BankID}</td>
                  <td className="px-6 py-3">{c.BankName}</td>
                  <td className="px-6 py-3">{c.AccountType}</td>
                  <td className="px-6 py-3">{c.AccountNumber}</td>
                  <td className="px-6 py-3">{c.AccounHolderName}</td>
                  <td className="px-6 py-3">{c.IFSCCode}</td>
                  <td className="px-6 py-3">{c.SWIFTCode}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
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
