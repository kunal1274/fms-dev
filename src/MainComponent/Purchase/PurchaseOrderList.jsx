import { Select } from "flowbite-react";
import { toast, ToastContainer } from "react-toastify";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
// import Invoice from "./Invoice/Icopy";
import PurchaseorderViewPage from "./PurchaseOrderViewPage";

const PurchaseOrderListPage = ({ handleAddPurchaseOrder, invoice }) => {
  const itemsBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/items";
  const customersBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/customers";
  const baseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/Purchasesorders";
  const [PurchaseList, setPurchaseList] = useState([]);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [Purchases, setPurchases] = useState([]);
  const [view, setView] = useState([]);
  const [selectedPurchaseForInvoice, setSelectedPurchaseForInvoice] =
    useState(null);
  const [selectedPurchases, setSelectedPurchases] = useState([]);
  const [selectedOption, setSelectedOption] = useState("All");
  const [viewingPurchaseId, setViewingPurchaseId] = useState(null); // States

  const tabNames = ["Purchase List"];
  const [activeTab, setActiveTab] = useState(tabNames[0]);
  const [loading, setLoading] = useState(true);
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [PurchaseSummary, setPurchaseSummary] = useState({
    count: 0,
    creditLimit: 0,
    paidCustomers: 0,
    activeCustomers: 0,
    onHoldCustomers: 0,
  });
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [selectedType, setSelectedType] = useState("All");
  // const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [sortOption, setSortOption] = useState("");
  const [filteredPurchases, setFilteredPurchases] = useState(Purchases);

  const handleInvoice = () => {
    if (selectedPurchases.length === 1) {
      setSelectedPurchaseForInvoice(selectedPurchases[0]); // Set the selected Purchase for invoice
    } else {
      alert("Please select exactly one Purchase order to generate an invoice.");
    }
  };
  const { id } = useParams();
  const [selectedSortOption, setSelectedSortOption] = useState("All");
  // Fetch all Purchases from the API
  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(baseUrl);
      setPurchases(response.data.data);
      console.log(response.data.data);
      setFilteredPurchases(response.data.data);
    } catch (error) {
      console.error("Failed to load Purchases:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const handleCheckboxChange = (id) => {
    setSelectedPurchases((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((PurchaseId) => PurchaseId !== id)
        : [...prevSelected, id]
    );
  };

  const handlePurchaseClick = (id) => {
    // alert(`Purchase clicked: ${id}`);
    setViewingPurchaseId(id);
  };
  // Handle filtering logic
  const applyFilters = useCallback(() => {
    let filtered = [...Purchases];

    if (selectedFilter === "yes") {
      filtered = filtered.filter((Purchase) => Purchase.active);
    } else if (selectedFilter === "no") {
      filtered = filtered.filter((Purchase) => !Purchase.active);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (Purchase) =>
          Purchase.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          Purchase.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPurchases(filtered);
  }, [Purchases, searchTerm, selectedFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Handle individual Purchase selection

  const generatePDF = useCallback(() => {
    if (!selectedPurchases || selectedPurchases.length === 0) {
      alert("No Purchases selected to generate PDF!");
      return;
    }

    const doc = new jsPDF();
    const tableColumn = [
      "#",
      "Purchase No.",
      "Customer Name",
      "Item Name",
      "Quantity",
      "Price",
      "Discount",
      "Line Amount",
      "Created At",
      "Status",
    ];

    // Filter the data for selected Purchases
    const selectedData = filteredPurchases.filter((Purchase) =>
      selectedPurchases.includes(Purchase.id)
    );

    const tableRows = selectedData.map((Purchase, index) => [
      index + 1,
      Purchase.orderNum || 0,
      Purchase.customer?.name || 0,
      Purchase.item?.name || 0,
      Purchase.quantity || 0,
      Purchase.price || 0,
      Purchase.discount || 0,
      Purchase.lineAmt || 0,
      new Date(Purchase.createdAt).toLocaleDateString() || 0,
      Purchase.status || 0,
    ]);

    doc.text("Selected Purchases Order List", 14, 20);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save("selected_Purchases_order_list.pdf");
  }, [filteredPurchases, selectedPurchases]);

  const exportToExcel = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(filteredPurchases);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchases");
    XLSX.writeFile(workbook, "Purchase_list.xlsx");
  }, [filteredPurchases]);

  const importFromExcel = () => {};



  const handleFilterChange = (e) => {
    const value = e.target.value; // Get the selected filter value
    setSelectedFilter(value); // Update the selected filter state

    let filtered = [...Purchases]; // Clone the original Purchases array

    switch (value) {
      case "yes": // Show only active Purchases
        filtered = filtered.filter((Purchase) => Purchase.active === true);
        break;

      case "no": // Show only inactive Purchases
        filtered = filtered.filter((Purchase) => Purchase.active === false);
        break;

      case "All": // Show all Purchases
      default:
        filtered = [...Purchases];
        break;
    }

    setFilteredPurchases(filtered); // Update the filteredPurchases state
  };

  const resetFilters = () => {
    // Reset all relevant states
    setSearchTerm(""); // Clear search term if any
    setSelectedFilter("All"); // Reset to default option
    setSortOption(""); // Reset sorting to default
    setFilteredPurchases([...Purchases]); // Restore the original Purchases array

    console.log("Filters reset to default.");
  };
  const goBack = () => {
    setViewingPurchaseId(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-black-900 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-800 text-lg font-medium">
          Purchase order List Page ...
        </p>
      </div>
    );
  }
  const handleTypeFilterChange = (e) => {
    const value = e.target.value;
    let filtered;

    switch (value) {
      case "Confirm":
        filtered = Purchases.filter(
          (Purchase) => Purchase.status === "Confirm"
        );
        break;
      case "Draft":
        filtered = Purchases.filter((Purchase) => Purchase.status === "Draft");
        break;
      case "All":
      default:
        filtered = Purchases; // No filter applied, show all Purchases
        break;
    }

    setFilteredPurchases(filtered);
  };
  const handleSortChange = (e) => {
    const value = e.target.value;
    setSelectedSortOption(value);

    let sorted = [...filteredPurchases];

    switch (value) {
      case "customerName":
        // Assuming "name" is the customer's name
        sorted = sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "PurchaseNumber":
        // Sort by Purchase account number (ascending)
        sorted = sorted.sort((a, b) => a.code.localeCompare(b.code));
        break;
      case "PurchaseNumberDesc":
        // Sort by Purchase account number (descending)
        sorted = sorted.sort((a, b) => b.code.localeCompare(a.code));
        break;
      case "itemName":
        // Assuming each Purchase has an "itemName" property
        sorted = sorted.sort((a, b) => a.itemName.localeCompare(b.itemName));
        break;
      case "unit":
        // Sort by unit if applicable
        sorted = sorted.sort((a, b) => a.unit.localeCompare(b.unit));
        break;
      default:
        break;
    }

    setFilteredPurchases(sorted);
  };

  // Function to handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // If search term is empty, reset to filtered Purchases
    if (!value) {
      setFilteredPurchases(Purchases);
    }
  };

  // Function to handle search submission (filter Purchases based on search term)
  const handleSearchSubmit = () => {
    if (!searchTerm.trim()) {
      setFilteredPurchases(Purchases); // Reset if search is empty
      return;
    }

    // Assuming you want to search by customer name and item name
    const filtered = Purchases.filter(
      (Purchase) =>
        Purchase.name.toLowerCase().includes(searchTerm.toLowerCase()) || // Search by customer name
        Purchase.itemName.toLowerCase().includes(searchTerm.toLowerCase()) // Search by item name
    );

    setFilteredPurchases(filtered);
  };
  const toggleSelectAll = () => {
    if (selectedPurchases.length === filteredPurchases.length) {
      setSelectedPurchases([]);
    } else {
      setSelectedPurchases(filteredPurchases.map((Purchase) => Purchase._id));
    }
  };
  const handleDeleteSelected = async () => {
    if (selectedPurchases.length === 0) {
      alert("No Purchase order selected to delete.");
      return;
    }

    try {
      // Perform deletion API calls
      await Promise.all(
        selectedPurchases.map((itemId) => axios.delete(`${baseUrl}/${itemId}`))
      );

      // Update the state to remove deleted Purchases
      setFilteredPurchases((prev) =>
        prev.filter((Purchase) => !selectedPurchases.includes(Purchase._id))
      );
      setPurchases((prev) =>
        prev.filter((Purchase) => !selectedPurchases.includes(Purchase._id))
      );

      setSelectedPurchases([]); // Clear selected items after deletion
      alert("Selected items deleted successfully!");
    } catch (error) {
      console.error("Error deleting items:", error);
      alert("Failed to delete selected items.");
    }
  };
  return (
    <div>
      <ToastContainer />
      <div>
        <div>
          {viewingPurchaseId ? (
            <PurchaseorderViewPage
              PurchaseId={viewingPurchaseId}
              goBack={goBack}
            />
          ) : selectedPurchaseForInvoice ? (
            <Invoice PurchaseId={selectedPurchaseForInvoice} goBack={goBack} />
          ) : (
            <div className="space-y-6">
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
                      </svg>{" "}
                    </button>
                  </div>

                  {/* </div> */}
                  <h3 className="text-xl font-semibold">
                    Purchase Order List Page
                  </h3>
                </div>
                <div className="flex items-center gap-3 ">
                  <button
                    onClick={handleAddPurchaseOrder}
                    className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
                  >
                    + Add
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={selectedPurchases.length === 0}
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
                    // value={endDate}
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
                    ["Total Purchases", PurchaseSummary.count],
                    ["Credit Limit", PurchaseSummary.creditLimit],
                    ["Paid Purchases", PurchaseSummary.paidPurchases],
                    ["Active Purchases", PurchaseSummary.activePurchases],
                    ["On‑Hold Purchases", PurchaseSummary.onHoldPurchases],
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
              <div className="flex flex-wrap Purchases-center text-sm justify-between p-2 bg-white rounded-md  mb-2 space-y-3 md:space-y-0 md:space-x-4">
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
                  className="text-red-500 hover:text-red-600 font-medium"
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
              <div className="mx-auto w-[85vw] max-w-full h-[400px]  bg-white rounded-lg">
                <table className="w-full min-w-[400px] divide-y divide-gray-200 border-green-500">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="sticky top-0 z-10 px-4 py-2 bg-gray-50">
                        <input
                          type="checkbox"
                          onChange={toggleSelectAll}
                          checked={
                            filteredPurchases.length > 0 &&
                            selectedPurchases.length ===
                              filteredPurchases.length
                          }
                          className="form-checkbox"
                        />
                      </th>
                      {[
                        " Purchase Order No",
                        "Customer Name",
                        "Item Name",
                        "Qty",
                        "Price",
                        "Discount",
                        "Advance",
                        "currency",
                        "Amount before tax",
                        "Line Amount",
                        " Status",
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
                  <tbody className="bg-white divide-y divside-gray-200">
                    {filteredPurchases.length ? (
                      filteredPurchases.map((Purchase) => (
                        <tr
                          key={Purchase.code}
                          className="hover:bg-gray-100 transition-colors"
                        >
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={selectedPurchases.includes(Purchase._id)}
                              onChange={() =>
                                handleCheckboxChange(Purchase._id)
                              }
                              className="form-checkbox"
                            />
                          </td>
                          <td>
                            <button
                              className="text-blue-600 hover:underline focus:outline-none"
                              onClick={() => handlePurchaseClick(Purchase._id)}
                            >
                              {Purchase.orderNum}
                            </button>
                          </td>
                          <td className="px-6 py-3 truncate">
                            {new Date(Purchase.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            {" "}
                            {Purchase.customer?.name}
                          </td>{" "}
                          <td className="px-6 py-4"> {Purchase.item?.name}</td>{" "}
                          <td className="px-6 py-4"> {Purchase.quantity}</td>{" "}
                          <td className="px-6 py-4">{Purchase.discount}</td>{" "}
                          <td className="px-6 py-4"> {Purchase.advance}</td>{" "}
                          <td className="px-6 py-4">{Purchase.currency}</td>{" "}
                          <td className="px-6 py-4">{Purchase.netAR}</td>{" "}
                          <td className="px-6 py-4"> {Purchase.lineAmt}</td>
                          <td className="px-6 py-4">{Purchase.status}</td>
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
};

export default PurchaseOrderListPage;
