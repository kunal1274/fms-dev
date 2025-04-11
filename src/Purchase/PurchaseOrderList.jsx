import React, { useCallback, useEffect, useState } from "react";
import { Button, Select } from "flowbite-react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import * as XLSX from "xlsx";
import PurchaseViewPage from "./PurchaseViewPage";
import Invoice from "./Invoice/Icopy1"; // Make sure this path is correct

const BASE_URL = "https://fms-qkmw.onrender.com/fms/api/v0/purchaseorders";

const PurchaseOrderList = ({ handleAddPurchaseOrder }) => {
  // Main data states for purchase orders
  const [purchases, setPurchases] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [selectedPurchases, setSelectedPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for filtering, sorting, and searching
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedSortOption, setSelectedSortOption] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // States controlling view/invoice selection
  const [selectedpurchaseForInvoice, setSelectedpurchaseForInvoice] =
    useState(null);
  const [viewingPurchaseId, setViewingPurchaseId] = useState(null);

  const handleSelectpurchaseForInvoice = (purchaseId) => {
    setSelectedpurchaseForInvoice(purchaseId);
  };

  // Reset view/invoice selection
  const goBack = () => {
    setViewingPurchaseId(null);
    setSelectedpurchaseForInvoice(null);
  };

  // Handles importing purchase orders from Excel
  const importFromExcel = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      toast.error(`Error reading file: ${error.target.error.message}`);
    };

    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const importedData = XLSX.utils.sheet_to_json(worksheet);

        // Validate for duplicate registration numbers or PAN numbers locally
        const duplicateErrors = [];
        const seenRegistrations = new Set();
        const seenPans = new Set();

        importedData.forEach((order, index) => {
          if (order.registrationNo) {
            if (seenRegistrations.has(order.registrationNo)) {
              duplicateErrors.push(
                `Duplicate registration number: ${
                  order.registrationNo
                } at row ${index + 1}`
              );
            } else {
              seenRegistrations.add(order.registrationNo);
            }
          }
          if (order.pan) {
            if (seenPans.has(order.pan)) {
              duplicateErrors.push(
                `Duplicate PAN: ${order.pan} at row ${index + 1}`
              );
            } else {
              seenPans.add(order.pan);
            }
          }
        });

        if (duplicateErrors.length > 0) {
          toast.error(`Errors occurred:\n${duplicateErrors.join("\n")}`, {
            autoClose: 1000,
            onClose: () => fetchPurchases(),
          });
          return;
        }

        // Post each order and count successes and failures
        let successCount = 0;
        const errors = [];
        for (let i = 0; i < importedData.length; i++) {
          const order = importedData[i];
          try {
            await axios.post(BASE_URL, order, {
              headers: { "Content-Type": "application/json" },
            });
            successCount++;
            toast.success(`Successfully posted order ${i + 1}`, {
              autoClose: 500,
            });
          } catch (err) {
            console.error(`Error posting order ${i + 1}:`, err);
            errors.push(
              `Error ${i + 1}: ${err.response?.data?.err || err.message}`
            );
            toast.error(`Error posting order ${i + 1}`, {
              autoClose: 500,
            });
          }
        }

        // Display summary toast and refresh the purchase list on close
        if (successCount === importedData.length) {
          toast.success(`All ${successCount} orders imported successfully!`, {
            autoClose: 1000,
            onClose: () => fetchPurchases(),
          });
        } else {
          toast.error(
            `Import Summary:\nSuccessfully imported: ${successCount}\nFailed: ${
              importedData.length - successCount
            }\nErrors:\n${errors.join("\n")}`,
            {
              autoClose: 1000,
              onClose: () => fetchPurchases(),
            }
          );
        }
      } catch (err) {
        console.error("Error processing file:", err);
        toast.error(`Error processing file: ${err.message}`);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Fetch purchases from the API
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

  // Apply filtering, searching, and sorting whenever dependencies change
  useEffect(() => {
    let filtered = [...purchases];

    // Filter by active status if the filter is not "All"
    if (selectedFilter === "yes") {
      filtered = filtered.filter((purchase) => purchase.active === true);
    } else if (selectedFilter === "no") {
      filtered = filtered.filter((purchase) => purchase.active === false);
    }

    // Search by name or code (case-insensitive)
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (purchase) =>
          (purchase.name &&
            purchase.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (purchase.code &&
            purchase.code.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sorting logic based on the selected sort option
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

  // Event handlers for inputs and selections
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleFilterChange = (e) => setSelectedFilter(e.target.value);
  const handleSortChange = (e) => setSelectedSortOption(e.target.value);

  // Toggle individual purchase selection
  const handleCheckboxChange = (id) => {
    setSelectedPurchases((prev) =>
      prev.includes(id)
        ? prev.filter((purchaseId) => purchaseId !== id)
        : [...prev, id]
    );
  };

  // When a purchase row is clicked, view details
  const handlePurchaseClick = (id) => {
    alert(`handlePurchaseClick: ${id}`);
    setViewingPurchaseId(id);
  };

  // Toggle select/deselect all purchases
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
  const handleDeleteSelected = async () => {
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

  // Reset all filters and search
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

  // Export the purchase order list to an Excel file
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
        <p className="mt-4 text-Zinc-800 text-lg font-medium">
          Purchase List Page....
        </p>
      </div>
    );
  }

  return (
    <div className="bg-grey-400 p-4 min-h-screen">
      <ToastContainer />
      <div className="rounded-full mb-5">
        {viewingPurchaseId ? (
          <PurchaseViewPage PurchaseId={viewingPurchaseId} goBack={goBack} />
        ) : selectedpurchaseForInvoice ? (
          <Invoice purchaseId={selectedpurchaseForInvoice} goBack={goBack} />
        ) : (
          <>
            {/* Header with Action Buttons */}
            <div className="flex justify-between space-x-2">
              <h1 className="text-xl font-bold mb-2">Purchase Order Lists</h1>
              <div className="flex justify-between rounded-full mb-3">
                <div className="flex justify-end items-center gap-1">
                  <button
                    onClick={handleAddPurchaseOrder}
                    className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
                  >
                    + Add
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={selectedPurchases.length === 0}
                    className={`h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition ${
                      selectedPurchases.length > 0
                        ? "hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
                        : "opacity-50 cursor-not-allowed"
                    }`}
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
                  {/* File Import using hidden input */}
                  <label className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md cursor-pointer transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]">
                    Import
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={importFromExcel}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Controls for Sorting, Filtering, and Searching */}
            <div className="flex flex-wrap items-center text-sm justify-between p-2 bg-white rounded-md shadow mb-2 space-y-3 md:space-y-0 md:space-x-4">
              <div className="flex items-center space-x-4">
                {/* Sort By */}
                <div className="relative">
                  <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={selectedSortOption}
                    onChange={handleSortChange}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="All">Sort By</option>
                    <option value="Purchase Name">Purchase Name</option>
                    <option value="Purchase Account no">
                      Purchase Account no
                    </option>
                    <option value="Purchase Account no descending">
                      Descending Account no
                    </option>
                    <option value="By unit">By unit</option>
                  </select>
                </div>

                {/* Filter By Status */}
                <div className="relative">
                  <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={selectedFilter}
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
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="px-6 py-2 text-sm font-medium whitespace-nowrap">
                        Purchase Order No.
                      </th>
                      <th className="px-6 py-2 text-sm font-medium whitespace-nowrap">
                        Date
                      </th>
                      <th className="px-6 py-2 text-sm font-medium whitespace-nowrap">
                        Vendor Name
                      </th>
                      <th className="px-6 py-2 text-sm font-medium whitespace-nowrap">
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
                        Currency
                      </th>
                      <th className="px-6 py-2 text-sm font-medium whitespace-nowrap">
                        Amount before tax
                      </th>
                      <th className="px-6 py-2 text-sm font-medium whitespace-nowrap">
                        Line Amount
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPurchases.map((purchase, index) => (
                      <tr
                        key={purchase._id}
                        className={`hover:bg-gray-100 ${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } transition-all duration-200`}
                      >
                        <th className="px-4 py-2 border-white-300 text-left">
                          <input
                            type="checkbox"
                            checked={selectedPurchases.includes(purchase._id)}
                            onChange={() => handleCheckboxChange(purchase._id)}
                          />
                        </th>
                        <td>
                          <button
                            className="text-blue-600 hover:underline ml-6 focus:outline-none"
                            onClick={() => handlePurchaseClick(purchase._id)}
                          >
                            {purchase.orderNum}
                          </button>
                        </td>
                        <td className="px-6 py-3 truncate">
                          {new Date(purchase.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {purchase.vendor?.name}
                        </td>
                        <td className="px-6 py-3 whitespace-normal truncate">
                          {purchase.item?.name}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {purchase.quantity}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {purchase.item?.price}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {purchase.discount}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {purchase.advance}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {purchase.currency}
                        </td>
                        <td className="px-6 py-3 truncate">{purchase.netAR}</td>
                        <td className="px-6 py-3 truncate">
                          {purchase.lineAmt}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {purchase.status}
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
