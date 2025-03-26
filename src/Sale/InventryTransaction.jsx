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
const InventryTransaction = () => {
  const [selectedSortOption, setSelectedSortOption] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSales, setFilteredSales] = useState([]);
  const [selectedSales, setSelectedSales] = useState([]);

  const handleSortChange = (e) => setSelectedSortOption(e.target.value);
  const handleTypeFilterChange = (e) => setSelectedType(e.target.value);
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSearchSubmit = () => {
    // Implement search logic
  };
  const handleInvoice = () => {
    if (selectedSales.length > 0) {
      // Handle invoice logic
    }
  };
  const handleAddSaleOrder = () => {
    // Handle add sale order logic
  };
  const handleDeleteSelected = () => {
    if (selectedSales.length > 0) {
      // Handle delete logic
    }
  };
  const generatePDF = () => {
    // Generate PDF logic
  };
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedSortOption("");
    setSelectedType("All");
  };
  const calculateInventory = (sale) => {
    return {
      physicalInventory: sale?.physical || 0,
      financialInventory: sale?.financial || 0,
      transitInventory: sale?.transit || 0,
      positionInventory: sale?.position || 0,
    };
  };

  return (
    <div className="bg-grey-400  min-h-screen">
      <ToastContainer />
      {/* Header */}
      <div className="flex justify-between space-x-3">
        <h1 className="text-2xl font-bold mb-4">Inventry Transaction</h1>
        <div className="flex justify-between rounded-full mb-5">
          <div className="flex justify-end gap-4">
            {/* <button
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
            </button> */}
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

      <div className="flex flex-wrap items-center justify-between p-4 bg-white rounded-md shadow mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedSortOption}
              onChange={handleSortChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
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
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedType}
              onChange={handleTypeFilterChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="All">Filter by Status</option>
              <option value="Confirm">Confirm</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-60 pl-4 pr-10 py-2 border border-gray-300 rounded-full"
            />
            <button
              onClick={handleSearchSubmit}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FaSearch className="w-5 h-5" />
            </button>
          </div>
        </div>
        <button
          className="text-red-500 hover:text-red-600 font-medium"
          onClick={resetFilters}
        >
          Reset Filter
        </button>
      </div>

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
        </table>
      </div>
    </div>
  );
};

export default InventryTransaction;
