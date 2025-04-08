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

const HandOnInventry = () => {
  const [selectedSortOption, setSelectedSortOption] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSales, setFilteredSales] = useState([]);
  const [selectedSales, setSelectedSales] = useState([]);

  // Handlers for sort, filter, and search
  const handleSortChange = (e) => setSelectedSortOption(e.target.value);
  const handleTypeFilterChange = (e) => setSelectedType(e.target.value);
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSearchSubmit = () => {
    // Implement search logic here...
  };

  const handleInvoice = () => {
    if (selectedSales.length > 0) {
      // Handle invoice logic here...
    }
  };

  const handleAddSaleOrder = () => {
    // Handle add sale order logic here...
  };

  const handleDeleteSelected = () => {
    if (selectedSales.length > 0) {
      // Handle delete logic here...
    }
  };

  // Function to reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedSortOption("");
    setSelectedType("All");
  };

  // Function to calculate inventory values per sale
  const calculateInventory = (sale) => {
    return {
      physicalInventory: sale?.physical || 0,
      financialInventory: sale?.financial || 0,
      transitInventory: sale?.transit || 0,
      positionInventory: sale?.position || 0,
    };
  };

  // Import from Excel file
  const importFromExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      // Assuming data is in the first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const importedData = XLSX.utils.sheet_to_json(worksheet);
      // Here you can process the imported data as needed.
      setFilteredSales(importedData);
      toast.success("Excel data imported successfully!");
    };
    reader.readAsBinaryString(file);
  };

  // Export to Excel using filteredSales data
  const exportToExcel = useCallback(() => {
    if (!filteredSales.length) return alert("No data to export");
    const worksheet = XLSX.utils.json_to_sheet(filteredSales);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, "inventory_list.xlsx");
  }, [filteredSales]);

  // Generate PDF using filteredSales data
  const generatePDF = useCallback(() => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "A4",
    });
    // Create table headers and body using filteredSales
    doc.autoTable({
      head: [
        [
          "#",
          "Item",
          "Physical Inventory",
          "Financial Inventory",
          "Transit Inventory",
          "Position Inventory",
        ],
      ],
      body: filteredSales.map((sale, index) => {
        const inventory = calculateInventory(sale);
        return [
          index + 1,
          sale.item?.name || "",
          inventory.physicalInventory,
          inventory.financialInventory,
          inventory.transitInventory,
          inventory.positionInventory,
        ];
      }),
    });
    doc.save("inventory_list.pdf");
  }, [filteredSales]);

  return (   <div className="bg-grey-400 p-4 min-h-screen">
    <div className="bg-grey-400  min-h-screen">
      <ToastContainer />
      {/* Header */}
      <div className="flex justify-between space-x-2">
        <h1 className="text-xl font-bold mb-2"> Inventory Transaction</h1>
        <div className="flex justify-between rounded-full mb-3">
          <div className="flex justify-end items-center gap-1">
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
            <label className="h-8 px-3 flex items-center border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02] cursor-pointer">
              <input
                type="file"
                accept=".xls,.xlsx"
                onChange={importFromExcel}
                className="hidden"
              />
              Import
            </label>
          </div>
        </div>
      </div>

      {/* Sort, Filter, and Search */}
      <div className="flex flex-wrap Sales-center text-sm justify-between p-2 bg-white rounded-md shadow mb-2 space-y-3 md:space-y-0 md:space-x-4">
        {/* Left group: Sort By, Filter By Status, Search */}
        <div className="flex items-center space-x-4">
          {/* Sort By */}
          <div className="relative">
            <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              defaultValue=""
              value={selectedSortOption}
              onChange={handleSortChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="" disabled>
                Sort By
              </option>
              <option value="saleNumber">Sale Number (Asc)</option>
              <option value="saleNumberDesc">Sale Number (Desc)</option>
              <option value="customerName">By Customer Name</option>
              <option value="itemName">By Item Name</option>
              <option value="unit">By Unit</option>
            </select>
          </div>

          {/* Filter By Status */}
          <div className="relative">
            <FaFilter className="text-sm absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              defaultValue="All"
              className="pl-10 pr-4 py-2 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              value={selectedType}
              onChange={handleTypeFilterChange}
            >
              <option value="All">Filter By Status</option>
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
              onChange={handleSearchChange}
              className="w-60 pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleSearchSubmit}
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

      {/* Inventory Table */}
      <div className="border rounded-lg bg-white p-4 overflow-auto">
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 border border-gray-300">Item</th>
              <th className="px-6 py-3 border border-gray-300">
                Physical Inventory
              </th>
              <th className="px-6 py-3 border border-gray-300">
                Financial Inventory
              </th>
              <th className="px-6 py-3 border border-gray-300">
                Transit Inventory
              </th>
              <th className="px-6 py-3 border border-gray-300">
                Position Inventory
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((sale) => (
              <tr key={sale.id} className="border-t">
                <td className="px-6 py-3 border border-gray-300">
                  {sale.item?.name}
                </td>
                <td className="px-6 py-3 border border-gray-300">
                  {calculateInventory(sale).physicalInventory}
                </td>
                <td className="px-6 py-3 border border-gray-300">
                  {calculateInventory(sale).financialInventory}
                </td>
                <td className="px-6 py-3 border border-gray-300">
                  {calculateInventory(sale).transitInventory}
                </td>
                <td className="px-6 py-3 border border-gray-300">
                  {calculateInventory(sale).positionInventory}
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </div>
  );
};

export default HandOnInventry;
