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
const InventoryTransaction = () => {
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
  const exportToExcel = useCallback(() => {
    if (!filteredSales.length) return alert("No data to export");
    const worksheet = XLSX.utils.json_to_sheet(filteredSales);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, "inventory_list.xlsx");
  }, [filteredSales]);
  return (
    <div className="bg-grey-400  min-h-screen">
      <ToastContainer />
      {/* Header */}
      <div className="flex justify-between space-x-2">
        <h1 className="text-2xl font-bold mb-4">Inventory Transaction</h1>

        <div className="flex justify-between rounded-full mb-3">
          <div className="flex justify-end items-center gap-1">
            <button
              onClick={generatePDF}
              className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition  hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02] hover:scale-[1.02]"
            >
              PDF
            </button>
            <button
              onClick={exportToExcel}
              className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition  hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
            >
              Export
            </button>
          </div>
        </div>
      </div>
      {/* new */}
      <div className="flex flex-wrap Sales-center text-sm justify-between p-2 bg-white rounded-md shadow mb-2 space-y-3 md:space-y-0 md:space-x-4">
        {/* Left group: Sort By, Filter By Status, Search */}
        <div className="flex items-center space-x-4">
          {/* Sort By */}
          <div className="relative">
            <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              defaultValue=""
              value={selectedType}
              onChange={handleTypeFilterChange}
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
            <FaFilter className=" text-sm absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              defaultValue="All"
              className="pl-10 pr-4 py-2 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              value={selectedSortOption}
              onChange={handleSortChange}
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

export default InventoryTransaction;
