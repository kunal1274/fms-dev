import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const baseUrl = "https://befr8n.vercel.app/fms/api/v0/salesorders";

const ConfirmOrder = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [selectedSales, setSelectedSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedSortOption, setSelectedSortOption] = useState("All");

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(baseUrl);
      const confirmedSales = response.data.data.filter((sale) => sale.status === "Confirmed");
      setSales(confirmedSales);
      setFilteredSales(confirmedSales);
    } catch (error) {
      console.error("Failed to load Sales:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFilteredSales(sales.filter((sale) => sale.name.toLowerCase().includes(value.toLowerCase())));
  };

  const handleCheckboxChange = (id) => {
    setSelectedSales((prevSelected) =>
      prevSelected.includes(id) ? prevSelected.filter((saleId) => saleId !== id) : [...prevSelected, id]
    );
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSelectedSortOption(value);
    let sorted = [...filteredSales];

    switch (value) {
      case "Sale Name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Sale Account no":
        sorted.sort((a, b) => a.code.localeCompare(b.code));
        break;
      case "Sale Account no descending":
        sorted.sort((a, b) => b.code.localeCompare(a.code));
        break;
      default:
        break;
    }
    setFilteredSales(sorted);
  };

  const generatePDF = () => {
    if (!selectedSales.length) {
      toast.error("No sales selected to generate PDF!");
      return;
    }

    const doc = new jsPDF();
    const tableColumn = ["#", "Sale No.", "Customer Name", "Item Name", "Quantity", "Price", "Total"];
    const selectedData = filteredSales.filter((sale) => selectedSales.includes(sale._id));
    const tableRows = selectedData.map((sale, index) => [
      index + 1,
      sale.orderNum || 0
,
      sale.customer?.name || 0
,
      sale.item?.name || 0
,
      sale.quantity || 0
,
      sale.price || 0
,
      sale.lineAmt || 0




      ,
    ]);

    doc.text("Selected Sales Order List", 14, 20);
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 30 });
    doc.save("selected_sales_order_list.pdf");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-blue-500 text-lg font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <ToastContainer />
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="px-3 py-2 border rounded-lg shadow-sm w-1/3"
        />
        <select onChange={handleSortChange} className="px-3 py-2 border rounded-lg shadow-sm">
          <option value="All">Sort by</option>
          <option value="Sale Name">Sale Name</option>
          <option value="Sale Account no">Sale Account no</option>
          <option value="Sale Account no descending">Sale Account no descending</option>
        </select>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full text-sm text-gray-700">
          <thead>
            <tr className="text-left text-gray-800 font-semibold uppercase bg-gray-200">
              <th className="px-4 py-3">Select</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Sale Order No</th>
              <th className="px-4 py-3">Item Name</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((sale) => (
              <tr key={sale._id} className="hover:bg-gray-100">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedSales.includes(sale._id)}
                    onChange={() => handleCheckboxChange(sale._id)}
                  />
                </td>
                <td className="px-4 py-3">{sale.customer?.name || "Unknown"}</td>
                <td className="px-4 py-3">{sale.orderNum}</td>
                <td className="px-4 py-3">{sale.item?.name}</td>
                <td className="px-4 py-3">{sale.quantity}</td>
                <td className="px-4 py-3">{sale.price}</td>
                <td className="px-4 py-3">{sale.lineAmt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={generatePDF} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md shadow-md">
        Generate PDF
      </button>
    </div>
  );
};

export default ConfirmOrder;
