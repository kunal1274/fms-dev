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
import Invoice from "./Invoice/Icopy";
import SaleViewPage from "./SaleorderViewPage";

const SaleOrderListPage = ({ handleAddSaleOrder, invoice }) => {
  const baseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/salesorders";
  const [saleList, setSaleList] = useState([]);
  const [sales, setSales] = useState([]);
  const [view, setView] = useState([]);
  const [selectedSaleForInvoice, setSelectedSaleForInvoice] = useState(null);
  const [selectedSales, setSelectedSales] = useState([]);
  const [selectedOption, setSelectedOption] = useState("All");
  const [viewingSaleId, setViewingSaleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("All");
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [sortOption, setSortOption] = useState("");
  const [filteredSales, setFilteredSales] = useState(sales);

  const handleInvoice = () => {
    if (selectedSales.length === 1) {
      setSelectedSaleForInvoice(selectedSales[0]); // Set the selected sale for invoice
    } else {
      alert("Please select exactly one sale order to generate an invoice.");
    }
  };
  const { id } = useParams();
  const [selectedSortOption, setSelectedSortOption] = useState("All");
  // Fetch all sales from the API
  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(baseUrl);
      setSales(response.data.data);
      console.log(response.data.data);
      setFilteredSales(response.data.data);
    } catch (error) {
      console.error("Failed to load Sales:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleCheckboxChange = (id) => {
    setSelectedSales((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((saleId) => saleId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSaleClick = (id) => {
    // alert(`Sale clicked: ${id}`);
    setViewingSaleId(id);
  };
  // Handle filtering logic
  const applyFilters = useCallback(() => {
    let filtered = [...sales];

    if (selectedFilter === "yes") {
      filtered = filtered.filter((sale) => sale.active);
    } else if (selectedFilter === "no") {
      filtered = filtered.filter((sale) => !sale.active);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (sale) =>
          sale.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSales(filtered);
  }, [sales, searchTerm, selectedFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Handle individual Sale selection

  const generatePDF = useCallback(() => {
    if (!selectedSales || selectedSales.length === 0) {
      alert("No sales selected to generate PDF!");
      return;
    }

    const doc = new jsPDF();
    const tableColumn = [
      "#",
      "Sale No.",
      "Customer Name",
      "Item Name",
      "Quantity",
      "Price",
      "Discount",
      "Line Amount",
      "Created At",
      "Status",
    ];

    // Filter the data for selected sales
    const selectedData = filteredSales.filter((sale) =>
      selectedSales.includes(sale._id)
    );

    const tableRows = selectedData.map((sale, index) => [
      index + 1,
      sale.orderNum || 0,
      sale.customer?.name || 0,
      sale.item?.name || 0,
      sale.quantity || 0,
      sale.price || 0,
      sale.discount || 0,
      sale.lineAmt || 0,
      new Date(sale.createdAt).toLocaleDateString() || 0,
      sale.status || 0,
    ]);

    doc.text("Selected Sales Order List", 14, 20);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save("selected_sales_order_list.pdf");
  }, [filteredSales, selectedSales]);

  const exportToExcel = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(filteredSales);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");
    XLSX.writeFile(workbook, "Sale_list.xlsx");
  }, [filteredSales]);

  const importFromExcel = () => {};

  // Handle "select all" functionality

  // Handle deleting selected Sales

  // Reset filters

  const handleFilterChange = (e) => {
    const value = e.target.value; // Get the selected filter value
    setSelectedFilter(value); // Update the selected filter state

    let filtered = [...sales]; // Clone the original sales array

    switch (value) {
      case "yes": // Show only active sales
        filtered = filtered.filter((sale) => sale.active === true);
        break;

      case "no": // Show only inactive sales
        filtered = filtered.filter((sale) => sale.active === false);
        break;

      case "All": // Show all sales
      default:
        filtered = [...sales];
        break;
    }

    setFilteredSales(filtered); // Update the filteredSales state
  };

  const resetFilters = () => {
    // Reset all relevant states
    setSearchTerm(""); // Clear search term if any
    setSelectedFilter("All"); // Reset to default option
    setSortOption(""); // Reset sorting to default
    setFilteredSales([...sales]); // Restore the original sales array

    console.log("Filters reset to default.");
  };
  const handleDeleteSelected = async () => {
    if (selectedSales.length === 0) {
      alert("No sale order selected to delete.");
      return;
    }

    try {
      // Perform deletion API calls
      await Promise.all(
        selectedSales.map((itemId) => axios.delete(`${baseUrl}/${itemId}`))
      );

      // Update the state to remove deleted sales
      setFilteredSales((prev) =>
        prev.filter((sale) => !selectedSales.includes(sale._id))
      );
      setSales((prev) =>
        prev.filter((sale) => !selectedSales.includes(sale._id))
      );

      setSelectedSales([]); // Clear selected items after deletion
      alert("Selected items deleted successfully!");
    } catch (error) {
      console.error("Error deleting items:", error);
      alert("Failed to delete selected items.");
    }
  };

  const goBack = () => {
    setViewingSaleId(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-black-900 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-800 text-lg font-medium">
          Sale order List Page ...
        </p>
      </div>
    );
  }
  const handleTypeFilterChange = (e) => {
    const value = e.target.value;
    let filtered;

    switch (value) {
      case "Confirm":
        filtered = sales.filter((sale) => sale.status === "Confirm");
        break;
      case "Draft":
        filtered = sales.filter((sale) => sale.status === "Draft");
        break;
      case "All":
      default:
        filtered = sales; // No filter applied, show all sales
        break;
    }

    setFilteredSales(filtered);
  };
  const handleSortChange = (e) => {
    const value = e.target.value;
    setSelectedSortOption(value);

    let sorted = [...filteredSales];

    switch (value) {
      case "customerName":
        // Assuming "name" is the customer's name
        sorted = sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "saleNumber":
        // Sort by sale account number (ascending)
        sorted = sorted.sort((a, b) => a.code.localeCompare(b.code));
        break;
      case "saleNumberDesc":
        // Sort by sale account number (descending)
        sorted = sorted.sort((a, b) => b.code.localeCompare(a.code));
        break;
      case "itemName":
        // Assuming each sale has an "itemName" property
        sorted = sorted.sort((a, b) => a.itemName.localeCompare(b.itemName));
        break;
      case "unit":
        // Sort by unit if applicable
        sorted = sorted.sort((a, b) => a.unit.localeCompare(b.unit));
        break;
      default:
        break;
    }

    setFilteredSales(sorted);
  };

  // Function to handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // If search term is empty, reset to filtered sales
    if (!value) {
      setFilteredSales(sales);
    }
  };

  // Function to handle search submission (filter sales based on search term)
  const handleSearchSubmit = () => {
    if (!searchTerm.trim()) {
      setFilteredSales(sales); // Reset if search is empty
      return;
    }

    // Assuming you want to search by customer name and item name
    const filtered = sales.filter(
      (sale) =>
        sale.name.toLowerCase().includes(searchTerm.toLowerCase()) || // Search by customer name
        sale.itemName.toLowerCase().includes(searchTerm.toLowerCase()) // Search by item name
    );

    setFilteredSales(filtered);
  };
  const toggleSelectAll = () => {
    if (selectedSales.length === filteredSales.length) {
      setSelectedSales([]);
    } else {
      setSelectedSales(filteredSales.map((sale) => sale._id));
    }
  };
  return (
    <div className="bg-grey-400  min-h-screen">
      <div className="rounded-full mb-5">
        {" "}
        {viewingSaleId ? (
          <SaleViewPage saleId={viewingSaleId} goBack={goBack} />
        ) : selectedSaleForInvoice ? (
          <Invoice saleId={selectedSaleForInvoice} goBack={goBack} />
        ) : (
          <>
            <ToastContainer />
            {/* Header */}
            <div className="flex justify-between space-x-3">
              <h1 className="text-2xl font-bold mb-4">Sale Order List Page</h1>
              <div className="flex justify-between rounded-full mb-5">
                <div className="flex justify-end gap-4">
                  <button
                    onClick={handleInvoice}
                    className={`h-10 px-4 py-2 border border-green-500 bg-white rounded-md ${
                      selectedSales.length > 0
                        ? "hover:bg-gray-100"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    Invoice
                  </button>{" "}
                  <button
                    onClick={handleAddSaleOrder}
                    className="h-10 px-4 py-2 border border-green-500 bg-white rounded-md hover:bg-gray-100"
                  >
                    + Add
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={selectedSales.length === 0}
                    className={`h-10 px-4 py-2 border border-green-500 bg-white rounded-md ${
                      selectedSales.length > 0
                        ? "hover:bg-gray-100"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    Delete
                  </button>
                  <button
                    onClick={generatePDF}
                    className="h-10 px-4 py-2 border border-green-500 bg-white rounded-md hover:bg-gray-100"
                  >
                    PDF
                  </button>
                  <button className="h-10 px-4 py-2 border border-green-500 bg-white rounded-md hover:bg-gray-100">
                    Export
                  </button>
                  <label className="border h-10 border-green-500 bg-white rounded-md py-2 px-4">
                    <input type="file" accept=".xls,.xlsx" className="hidden" />
                    Import
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap Sales-center justify-between p-4 bg-white rounded-md shadow mb-6 space-y-4 md:space-y-0 md:space-x-4">
              {/* Left group: Sort By, Filter By Status, Search */}
              <div className="flex items-center space-x-4">
                {/* Sort By */}
                <div className="relative">
                  <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={selectedSortOption}
                    onChange={handleSortChange}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="" disabled className="text-gray-500">
                      Sort By
                    </option>
                    <option value="saleNumber">
                      Sort by Sale Number (Asc)
                    </option>
                    <option value="saleNumberDesc">
                      Sort by Sale Number (Desc)
                    </option>
                    <option value="customerName">By Customer Name</option>
                    <option value="itemName">By Item Name</option>
                    <option value="unit">By Unit</option>
                  </select>
                </div>

                {/* Filter By Status */}
                <div className="relative">
                  <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={selectedType}
                    onChange={handleTypeFilterChange}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="All">Filter by Status</option>
                    <option value="Confirm">Confirm</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>

                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    aria-label="Search"
                    onChange={handleSearchChange}
                    className="w-60 pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleSearchSubmit} // Use onClick for button actions
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    <FaSearch className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Right side: Reset Filter */}
              <button
                className="text-red-500 hover:text-red-600 font-medium"
                onClick={() => resetFilters(setSearch, setFilters)}
              >
                Reset Filter
              </button>
            </div>
            <div className="border border-green-500 rounded-lg bg-white p-4 overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full border-collapse border border-gray-200">
                  {/* Table Header */}
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 border border-gray-300 text-left">
                        <input
                          type="checkbox"
                          onChange={toggleSelectAll}
                          // The checkbox is checked if all filtered sales are selected
                          checked={
                            filteredSales.length > 0 &&
                            selectedSales.length === filteredSales.length
                          }
                        />
                      </th>

                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Sale Order No
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Customer Name
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Item Name
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Qty
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Price
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Discount
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Advance
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        currency
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Amount before tax
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Line Amount
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Created At
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody>
                    {filteredSales.map((sale, index) => (
                      <tr
                        key={sale._id}
                        className={`hover:bg-gray-100 ${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } transition-all duration-200`}
                      >
                        <th className="px-4 py-2 border-white-300 text-left">
                          <input
                            type="checkbox"
                            checked={selectedSales.includes(sale._id)}
                            onChange={() => handleCheckboxChange(sale._id)}
                          />
                        </th>
                        <td>
                          <button onClick={() => handleSaleClick(sale._id)}>
                            {sale.orderNum}
                          </button>
                        </td>
                        <td className="px-6 py-3 whitespace-normal truncate">
                          {sale.customer?.name}
                        </td>
                        <td className="px-6 py-3 whitespace-normal truncate">
                          {sale.item?.name}
                        </td>
                        <td className="px-6 py-3 truncate">{sale.quantity}</td>
                        <td className="px-6 py-3 truncate">
                          {sale.item?.price}
                        </td>
                        <td className="px-6 py-3 truncate">{sale.discount}</td>
                        <td className="px-6 py-3 truncate">{sale.advance}</td>
                        <td className="px-6 py-3 truncate">{sale.currency}</td>
                        <td className="px-6 py-3 truncate">{sale.netAR}</td>
                        <td className="px-6 py-3 truncate">{sale.lineAmt}</td>
                        {/* <td className="px-6 py-3 truncate">{sale.createdAt}</td> */}
                        {/* <td className="px-6 py-3 truncate">{sale.createdAt}</td> */}
                        <td className="border p-2">
                          {new Date(sale.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-3 truncate">{sale.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SaleOrderListPage;
