import React, { useCallback, useEffect, useState } from "react";
import { Select } from "flowbite-react";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import * as XLSX from "xlsx";
import PurchaseViewPage from "./PurchaseViewPage";
import Invoice from "../Sale/Invoice/Icopy"; // Make sure this path is correct

const BASE_URL = "https://befr8n.vercel.app/fms/api/v0/purchaseorders";

const PurchaseOrderList = ({ handleAddPurchaseOrder }) => {
  const [purchases, setPurchases] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [selectedPurchases, setSelectedPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSaleForInvoice, setSelectedSaleForInvoice] = useState(null);
  const [viewingPurchaseId, setViewingPurchaseId] = useState(null);

  const handleSelectSaleForInvoice = (saleId) => {
    setSelectedSaleForInvoice(saleId);
  };

  // goBack resets the view/invoice selection
  const goBack = () => {
    setViewingPurchaseId(null);
    setSelectedSaleForInvoice(null);
  };

  // Filtering & Sorting states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All"); // "yes", "no" or "All"
  const [selectedSortOption, setSelectedSortOption] = useState("All");

  // Fetch purchases from API
  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(BASE_URL);
      setPurchases(response.data.data);
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

  // Apply filtering and sorting whenever dependencies change
  useEffect(() => {
    let filtered = [...purchases];

    // Filter by active status if not "All"
    if (selectedFilter === "yes") {
      filtered = filtered.filter((purchase) => purchase.active === true);
    } else if (selectedFilter === "no") {
      filtered = filtered.filter((purchase) => purchase.active === false);
    }

    // Search by name or code
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (purchase) =>
          (purchase.name &&
            purchase.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (purchase.code &&
            purchase.code.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sorting
    let sorted = [...filtered];
    switch (selectedSortOption) {
      case "Purchase Name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Purchase Account no":
        sorted.sort((a, b) => a.code.localeCompare(b.code));
        break;
      case "Purchase Account no descending":
        sorted.sort((a, b) => b.code.localeCompare(a.code));
        break;
      case "By unit":
        sorted.sort((a, b) => a.unit.localeCompare(b.unit));
        break;
      default:
        break;
    }

    setFilteredPurchases(sorted);
  }, [purchases, searchTerm, selectedFilter, selectedSortOption]);

  // Handlers for form controls
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleFilterChange = (e) => setSelectedFilter(e.target.value);
  const handleSortChange = (e) => setSelectedSortOption(e.target.value);

  // Toggle individual purchase selection
  const handleCheckboxChange = (id) => {
    setSelectedPurchases((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((purchaseId) => purchaseId !== id)
        : [...prevSelected, id]
    );
  };

  // Update purchase view when a row is clicked
  const handlePurchaseClick = (id) => {
    alert(`handlePurchaseClick: ${id}`);
    setViewingPurchaseId(id);
  };

  // Toggle select/deselect all purchases in the current view
  const toggleSelectAll = () => {
    if (
      selectedPurchases.length === filteredPurchases.length &&
      filteredPurchases.length > 0
    ) {
      setSelectedPurchases([]);
    } else {
      setSelectedPurchases(filteredPurchases.map((purchase) => purchase._id));
    }
  };

  // Delete selected purchase orders
  const handleDeleteSelectedPurchases = async () => {
    if (selectedPurchases.length === 0) {
      alert("No purchase orders selected to delete.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete the selected purchase orders?"
      )
    ) {
      return;
    }

    try {
      await Promise.all(
        selectedPurchases.map((purchaseId) =>
          axios.delete(`${BASE_URL}/${purchaseId}`)
        )
      );
      // Remove deleted purchases from state
      setPurchases((prev) =>
        prev.filter((purchase) => !selectedPurchases.includes(purchase._id))
      );
      setSelectedPurchases([]);
      alert("Selected purchase orders deleted successfully!");
    } catch (error) {
      console.error("Error deleting purchase orders:", error);
      alert("Failed to delete selected purchase orders.");
    }
  };

  // Reset filters and search
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedFilter("All");
    setSelectedSortOption("All");
    setFilteredPurchases([...purchases]);
  };

  // Generate a PDF of the current purchase order list
  const generatePDF = useCallback(() => {
    const doc = new jsPDF();
    const tableColumn = [
      "#",
      "Purchase No.",
      "Purchase Name",
      "Type",
      "Description",
      "Unit",
      "Price",
      "Active",
    ];
    const tableRows = filteredPurchases.map((purchase, index) => [
      index + 1,
      purchase.purchaseNo || "",
      purchase.purchaseName || "",
      purchase.type || "",
      purchase.description || "",
      purchase.unit || "",
      purchase.price || "",
      purchase.active ? "Yes" : "No",
    ]);

    doc.text("Purchase Order List", 14, 20);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });
    doc.save("purchase_order_list.pdf");
  }, [filteredPurchases]);

  // Export the current purchase order list to an Excel file
  const exportToExcel = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(filteredPurchases);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchases");
    XLSX.writeFile(workbook, "Purchase_order_list.xlsx");
  }, [filteredPurchases]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-Zinc-800 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-Zinc-800 text-lg font-medium">Purchase List Page....</p>
      </div>
    );
  }

  return (
    <div className="bg-grey-400 min-h-screen">
      <div className="rounded-full mb-5">
        {viewingPurchaseId ? (
          <PurchaseViewPage PurchaseId={viewingPurchaseId} goBack={goBack} />
        ) : selectedSaleForInvoice ? (
          <Invoice saleId={selectedSaleForInvoice} goBack={goBack} />
        ) : (
          <>
            <ToastContainer />
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <h1 className="text-2xl font-bold">Purchase Order List</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    console.log("Add button clicked");
                    handleAddPurchaseOrder();
                  }}
                  className="h-10 px-4 py-2 border border-green-500 bg-white rounded-md hover:bg-gray-100"
                >
                  + Add
                </button>
                <button
                  onClick={() => {
                    console.log("Delete button clicked");
                    handleDeleteSelectedPurchases();
                  }}
                  disabled={selectedPurchases.length === 0}
                  className={`h-10 px-4 py-2 border border-green-500 bg-white rounded-md ${
                    selectedPurchases.length > 0
                      ? "hover:bg-gray-100"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    console.log("PDF button clicked");
                    generatePDF();
                  }}
                  className="h-10 px-4 py-2 border border-green-500 bg-white rounded-md hover:bg-gray-100"
                >
                  PDF
                </button>
                <button
                  onClick={() => {
                    console.log("Export button clicked");
                    exportToExcel();
                  }}
                  className="h-10 px-4 py-2 border border-green-500 bg-white rounded-md hover:bg-gray-100"
                >
                  Export
                </button>
                <label className="border h-10 border-green-500 bg-white rounded-md py-2 px-4 cursor-pointer">
                  Import
                  <input
                    type="file"
                    accept=".xls,.xlsx"
                    className="hidden"
                    onChange={(e) =>
                      console.log("File selected:", e.target.files[0])
                    }
                  />
                </label>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-wrap Sales-center justify-between p-4 bg-white rounded-md shadow mb-6 space-y-4 md:space-y-0 md:space-x-4">
              {/* Left group: Sort By, Filter By Status, Search */}
              <div className="flex items-center space-x-4">
                {/* Sort By */}
                <div className="relative">
                  <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    defaultValue=""
                    // value={selectedOption}
                    // onChange={handleFilterChange}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="" disabled>
                      Sort By
                    </option>
                    <option value="Customer Name">Customer Name</option>
                    <option value="Customer Account no">
                      Customer Account no
                    </option>
                    <option value="Customer Account no descending">
                      Descending Account no
                    </option>
                  </select>
                </div>

                {/* Filter By Status */}
                <div className="relative">
                  <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    defaultValue="All"
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    // value={selectedOption}
                    // onChange={handleFilterChange}
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
                    className="w-60 pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="text-red-500 hover:text-red-600 font-medium"
                onClick={() => resetFilters(setSearch, setFilters)} // Pass setSearch and setFilters
              >
                Reset Filter
              </button>
            </div>

            {/* Purchase Orders Table */}
            <div className="border border-green-500 rounded-lg bg-white p-4 overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 border border-gray-300 text-left">
                        <input
                          type="checkbox"
                          checked={
                            selectedPurchases.length ===
                              filteredPurchases.length &&
                            filteredPurchases.length > 0
                          }
                          onChange={() => {
                            console.log("Select all checkbox changed");
                            toggleSelectAll();
                          }}
                        />
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Purchase Order No.
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Vendor Name
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
                        Currency
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Advance
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Line Amount
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Created At
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Settlement Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPurchases.map((purchase) => (
                      <tr
                        key={purchase._id}
                        onClick={() =>
                          console.log("Row clicked for purchase:", purchase._id)
                        }
                      >
                        <td>
                          {" "}
                          <th className="px-4 py-2 border-white-300 text-left">
                            <input
                              type="checkbox"
                              checked={selectedPurchases.includes(purchase._id)}
                              onChange={() => {
                                console.log(
                                  "Checkbox toggled for purchase:",
                                  purchase._id
                                );
                                handleCheckboxChange(purchase._id);
                              }}
                            />{" "}
                          </th>
                        </td>
                        <td>
                          <button
                            onClick={() => handlePurchaseClick(purchase._id)}
                          >
                            {purchase.orderNum}
                          </button>
                        </td>
                        <td className="px-6 py-3 truncate">
                          {purchase.vendor?.name || ""}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {purchase.item?.name || ""}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {purchase.quantity}
                        </td>
                        <td className="px-6 py-3 truncate">{purchase.price}</td>
                        <td className="px-6 py-3 truncate">
                          {purchase.discount}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {purchase.currency}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {purchase.advance}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {purchase.lineAmt}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {purchase.createdAt}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {purchase.settlementStatus}
                        </td>
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

export default PurchaseOrderList;
