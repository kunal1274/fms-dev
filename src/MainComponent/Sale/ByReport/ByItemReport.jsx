import { Select } from "flowbite-react";
import { ToastContainer } from "react-toastify";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ByItemReport = ({ handleAddSaleOrder }) => {
  const baseUrl = "https://befr8n.vercel.app/fms/api/v0/salesorders";
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState("All");

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(baseUrl);
      setSales(response.data.data);
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

  // Group sales by item
  const groupSalesByItem = () => {
    return sales.reduce((acc, sale) => {
      const itemName = sale.item?.name || "Unknown Item";
      if (!acc[itemName]) {
        acc[itemName] = [];
      }
      acc[itemName].push(sale);
      return acc;
    }, {});
  };

  // Generate PDF Report by Item
  const generateItemReport = () => {
    const groupedSales = groupSalesByItem();
    const doc = new jsPDF();
    doc.text("Sales Report by Item", 14, 20);

    Object.keys(groupedSales).forEach((item, index) => {
      if (index > 0) doc.addPage(); // Add a new page per item
      doc.text(`Item: ${item}`, 14, 30);
      const tableColumn = ["Sale No.", "Customer", "Quantity", "Price", "Total"];
      const tableRows = groupedSales[item].map((sale) => [
        sale.orderNum || 0
,
        sale.customer?.name || "Unknown",
        sale.quantity || 0
,
        sale.price || 0
,
        sale.lineAmt || 0

        ,
      ]);
      doc.autoTable({
        startY: 40,
        head: [tableColumn],
        body: tableRows,
      });
    });

    doc.save("sales_report_by_item.pdf");
  };

  // Filter Sales by Item Selection
  const handleItemFilterChange = (e) => {
    const value = e.target.value;
    setSelectedItem(value);
    if (value === "All") {
      setFilteredSales([...sales]);
    } else {
      setFilteredSales(sales.filter((sale) => sale.item?.name === value));
    }
  };

  if (loading) {
    return<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <div className="w-16 h-16 border-4 border-black-500 border-t-transparent border-solid rounded-full animate-spin"></div>
    <p className="mt-4 text-zinc-500 text-lg font-medium">Loading...</p>
  </div>;
  }
  return (
    <div className="bg-grey-400 min-h-screen">
      <ToastContainer />
      <div className="flex justify-between space-x-3">
        <h1 className="text-2xl font-bold mb-4">Sales Orders by Item</h1>
        <div className="flex space-x-4">
          <button
            onClick={generateItemReport}
            className="h-10 px-4 py-2 border border-green-500 bg-white rounded-md hover:bg-gray-100"
          >
            Generate Item Report
          </button>
          <button
            onClick={handleAddSaleOrder}
            className="h-10 px-4 py-2 border border-green-500 bg-white rounded-md hover:bg-gray-100"
          >
            + Add Sale
          </button>
        </div>
      </div>

      <div className="flex space-x-4 p-4 bg-white rounded-md shadow mb-6">
        <Select onChange={handleItemFilterChange} value={selectedItem}>
          <option value="All">All Items</option>
          {Object.keys(groupSalesByItem()).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </div>

      <div className="border border-green-500 rounded-lg bg-white p-4 overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 border border-gray-300">Item Name</th>
                <th className="px-6 py-3 border border-gray-300">Sale Order No</th>
                <th className="px-6 py-3 border border-gray-300">Customer</th>
                <th className="px-6 py-3 border border-gray-300">Quantity</th>
                <th className="px-6 py-3 border border-gray-300">Price</th>
                <th className="px-6 py-3 border border-gray-300">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale._id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 border border-gray-300">
                    {sale.item?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-3 border border-gray-300">
                    {sale.orderNum}
                  </td>
                  <td className="px-6 py-3 border border-gray-300">
                    {sale.customer?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-3 border border-gray-300">
                    {sale.quantity}
                  </td>
                  <td className="px-6 py-3 border border-gray-300">
                    {sale.price}
                  </td>
                  <td className="px-6 py-3 border border-gray-300">
                    {sale.lineAmt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ByItemReport;
