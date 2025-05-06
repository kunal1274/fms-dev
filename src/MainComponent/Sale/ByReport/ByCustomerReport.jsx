import { Select } from "flowbite-react";
import { ToastContainer } from "react-toastify";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ByCustomerReport = ({ handleAddSaleOrder }) => {
  const baseUrl = "https://befr8n.vercel.app/fms/api/v0/salesorders";
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState("All");

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

  // Group sales by customer
  const groupSalesByCustomer = () => {
    return sales.reduce((acc, sale) => {
      const customerName = sale.customer?.name || "Unknown Customer";
      if (!acc[customerName]) {
        acc[customerName] = [];
      }
      acc[customerName].push(sale);
      return acc;
    }, {});
  };

  // Generate PDF Report by Customer
  const generateCustomerReport = () => {
    const groupedSales = groupSalesByCustomer();
    const doc = new jsPDF();
    doc.text("Sales Report by Customer", 14, 20);

    Object.keys(groupedSales).forEach((customer, index) => {
      if (index > 0) doc.addPage(); // Add a new page per customer
      doc.text(`Customer: ${customer}`, 14, 30);
      const tableColumn = [
        "Sale No.",
        "Item Name",
        "Quantity",
        "Price",
        "Total",
      ];
      const tableRows = groupedSales[customer].map((sale) => [
        sale.orderNum || 0,
        sale.item?.name || 0,
        sale.quantity || 0,
        sale.price || 0,
        sale.lineAmt || 0,
      ]);
      doc.autoTable({
        startY: 40,
        head: [tableColumn],
        body: tableRows,
      });
    });

    doc.save("sales_report_by_customer.pdf");
  };

  // Filter Sales by Customer Selection
  const handleCustomerFilterChange = (e) => {
    const value = e.target.value;
    setSelectedCustomer(value);
    if (value === "All") {
      setFilteredSales([...sales]);
    } else {
      setFilteredSales(sales.filter((sale) => sale.customer?.name === value));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-black-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-zice-500 text-lg font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-grey-400 min-h-screen">
      <ToastContainer />
      <div className="flex justify-between space-x-3">
        <h1 className="text-2xl font-bold mb-4">Sales Orders by Customer</h1>
        <div className="flex space-x-4">
          <button
            onClick={generateCustomerReport}
            className="h-10 px-4 py-2 border border-green-500 bg-white rounded-md hover:bg-gray-100"
          >
            Generate Customer Report
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
        <Select onChange={handleCustomerFilterChange}>
          <option value="All">All Customers</option>
          {Object.keys(groupSalesByCustomer()).map((customer) => (
            <option key={customer} value={customer}>
              {customer}
            </option>
          ))}
        </Select>
      </div>

      <div className="border border-green-500 rounded-lg bg-white p-8 overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border border-gray-300 text-left">
                  {" "}
                  <input
                    type="checkbox"
                    // onChange={() =>
                    //   setSelectedCustomers(
                    //     selectedCustomers.length
                    //       ? []
                    //       : customerList.map((c) => c._id)
                    //   )
                    // }
                    // checked={selectedCustomers.length === customerList.length}
                  />{" "}
                </th>
                <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                  Customer
                </th>
                <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                  Sale Order No
                </th>
                <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                  Item Name
                </th>
                <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                  Quantity
                </th>
                <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                  Price
                </th>
                <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale._id} className="hover:bg-gray-50">
                      <td>
                          <th className="px-4 py-2 border-white-300 text-left">
                            <input
                              type="checkbox"
                             
                             
                            />
                          </th>
                        </td>
                        <td className="px-6 py-3 truncate">
                    {sale.customer?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-3 truncate">
                    {sale.orderNum}
                  </td>
                  <td className="px-6 py-3 truncate">
                    {sale.item?.name}
                  </td>
                  <td className="px-6 py-3 truncate">
                    {sale.quantity}
                  </td>
                  <td className="px-6 py-3 truncate">
                    {sale.price}
                  </td>
                  <td className="px-6 py-3 truncate">
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

export default ByCustomerReport;
