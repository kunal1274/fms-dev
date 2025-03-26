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
  const [salesData, setSalesData] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [selectedSales, setSelectedSales] = useState([]);
  const [selectedSortOption, setSelectedSortOption] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchSales = async () => {
      // Replace with actual API call
      const data = []; // Example placeholder
      setSalesData(data);
      setFilteredSales(data);
    };
    fetchSales();
  }, []);

  useEffect(() => {
    let filtered = salesData;
    if (selectedType !== "All") {
      filtered = filtered.filter((sale) => sale.status === selectedType);
    }
    if (searchTerm) {
      filtered = filtered.filter((sale) =>
        sale.item?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredSales(filtered);
  }, [searchTerm, selectedType, salesData]);

  const handleSortChange = (e) => setSelectedSortOption(e.target.value);
  const handleTypeFilterChange = (e) => setSelectedType(e.target.value);
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleSaleSelection = (saleId) => {
    setSelectedSales((prev) =>
      prev.includes(saleId)
        ? prev.filter((id) => id !== saleId)
        : [...prev, saleId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedSales(
      selectedSales.length === filteredSales.length
        ? []
        : filteredSales.map((sale) => sale.id)
    );
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Sales Report", 20, 10);
    doc.autoTable({ html: "#salesTable" });
    doc.save("sales_report.pdf");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedSortOption("");
    setSelectedType("All");
  };

  return (
    <div className="bg-grey-400  min-h-screen">
      <ToastContainer />
      {/* Header */}
      <div className="flex justify-between space-x-3">
        <h1 className="text-2xl font-bold mb-4">Hand On Inventry</h1>
        <div className="flex justify-between rounded-full mb-5">
          <div className="flex justify-end gap-4">
            {/* <button
              // onClick={handleInvoice}
              className={`h-10 px-4 py-2 border border-green-500 bg-white rounded-md ${
                selectedSales.length > 0
                  ? "hover:bg-gray-100"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              Invoice
            </button>{" "} */}
            {/* <button
              // onClick={handleAddSaleOrder}
              className="h-10 px-4 py-2 border border-green-500 bg-white rounded-md hover:bg-gray-100"
            >
              + Add
            </button> */}
            {/* <button
              // onClick={handleDeleteSelected}
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
              <option value="saleNumber">Sort by Sale Number (Asc)</option>
              <option value="saleNumberDesc">Sort by Sale Number (Desc)</option>
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
              // onChange={handleSearchChange}
              className="w-60 pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              // onClick={handleSearchSubmit} // Use onClick for button actions
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
      <div className="border border-green-500 rounded-lg bg-white p-3 overflow-hidden">
        {" "}
        <div className="  max-h-96 overflow-y-auto">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border border-gray-300 text-left">
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={selectedSales.length === filteredSales.length}
                  />
                </th>{" "}
                <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                  Date
                </th>
                <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                  Item No
                </th>
                <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                  Ref
                </th>
                <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                  Ref No
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  In Qty Confirm
                </th>
                <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                  In Qty Shipped
                </th>
                <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                  In Qty Received
                </th>
                <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                  In Qty Invoiced
                </th>
                <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                  In Qty Cancelled
                </th>{" "}
                <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                  In Qty Confirmed
                </th>{" "}
                <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                  Out Qty Shipped
                </th>{" "}
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Out Qty Delivered
                </th>{" "}
                <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                  Out Qty Cancelled
                </th>
                <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                  Cum Net Qty
                </th>
                <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                  In value
                </th>
                <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                  Out value
                </th>
                <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                  Cum net value
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-4 py-2 border border-gray-300">
                    <input
                      type="checkbox"
                      checked={selectedSales.includes(sale.id)}
                      onChange={() => handleSaleSelection(sale.id)}
                    />
                  </td>{" "}
                  <td className="border px-4 py-2 text-center">{sale.date}</td>
                  <td className="px-6 py-3 truncate">{sale.id}</td>
                  <td className="px-6 py-3 truncate">{sale.item?.name}</td>
                  <td className="px-6 py-3 truncate">
                    {sale.InventoryOnHand?.name}
                  </td>
                  <td className="px-6 py-3 border border-gray-300">
                    {sale.inQtyConfirm}
                  </td>
                  <td className="px-6 py-3 truncate">{sale.inQtyShipped}</td>
                  <td className="px-6 py-3 truncate">{sale.inQtyReceived}</td>
                  <td className="px-6 py-3 truncate">{sale.inQtyInvoiced}</td>
                  <td className="px-6 py-3 truncate">
                    {sale.inQtyCancelled || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>{" "}
    </div>
  );
};

export default HandOnInventry;
