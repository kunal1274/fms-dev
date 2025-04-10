import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const purchaseorderAPI =
  "https://fms-qkmw.onrender.com/fms/api/v0/purchaseorders";
const salesordersAPI = "https://fms-qkmw.onrender.com/fms/api/v0/salesorders";

const InventoryTransaction = () => {
  // State variables for orders data and UI controls.
  const [ordersData, setOrdersData] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedSortOption, setSelectedSortOption] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch purchase and sales orders from the APIs.
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both purchase and sales orders concurrently.
        const [purchaseRes, salesRes] = await Promise.all([
          axios.get(purchaseorderAPI),
          axios.get(salesordersAPI),
        ]);

        // Extract the data property if necessary.
        const purchaseOrders = purchaseRes.data.data || purchaseRes.data;
        const salesOrders = salesRes.data.data || salesRes.data;

        // Tag each order with its respective type.
        const formattedPurchaseOrders = purchaseOrders.map((order) => ({
          ...order,
          orderType: "purchase",
        }));
        const formattedSalesOrders = salesOrders.map((order) => ({
          ...order,
          orderType: "sale",
        }));

        // Merge both orders into one combined array.
        const combinedOrders = [
          ...formattedPurchaseOrders,
          ...formattedSalesOrders,
        ];

        // Initialize state with combined data.
        setOrdersData(combinedOrders);
        setFilteredOrders(combinedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Error fetching orders data!");
      }
    };

    fetchData();
  }, []);

  // Apply filtering and searching whenever orders data or filter/search criteria change.
  useEffect(() => {
    let filtered = ordersData;
    if (selectedFilter !== "All") {
      filtered = filtered.filter((order) => order.orderType === selectedFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter((order) =>
        (order.item?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }
    setFilteredOrders(filtered);
  }, [searchTerm, selectedFilter, ordersData]);

  // Handlers for sort, filter, and search controls.
  const handleSortChange = (e) => setSelectedSortOption(e.target.value);
  const handleFilterChange = (e) => setSelectedFilter(e.target.value);
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  // Handle selection of an individual order record.
  const handleOrderSelection = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Select or deselect all orders on the current filtered page.
  const toggleSelectAll = () => {
    setSelectedOrders(
      selectedOrders.length === filteredOrders.length
        ? []
        : filteredOrders.map((order) => order.id)
    );
  };

  // Generate a PDF version of the table using jsPDF and autoTable.
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Inventory Transaction Report", 20, 10);
    doc.autoTable({ html: "#ordersTable" });
    doc.save("inventory_transaction_report.pdf");
  };

  // Reset search and filter options.
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedSortOption("");
    setSelectedFilter("All");
  };

  // Export the filtered data to an Excel file using XLSX.
  const exportToExcel = useCallback(() => {
    if (!filteredOrders.length) return alert("No data to export");
    const worksheet = XLSX.utils.json_to_sheet(filteredOrders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Transactions");
    XLSX.writeFile(workbook, "inventory_transactions.xlsx");
  }, [filteredOrders]);

  // Define the order of statuses for purchase orders.
  const purchaseStatusHierarchy = [
    "Confirm",
    "Shipped",
    "Received",
    "Invoiced",
    "Cancelled",
  ];

  // Helper function to display purchase order quantity cumulatively.
  const showQty = (order, cellStatus) => {
    if (order.orderType !== "purchase") return "-";
    const orderIndex = purchaseStatusHierarchy.indexOf(order.status);
    const cellIndex = purchaseStatusHierarchy.indexOf(cellStatus);
    if (orderIndex === -1 || orderIndex < cellIndex) return "-";
  
    switch (cellStatus) {
      case "Confirm":
        // If the order's status is exactly "Confirm", show "Yes"
        return order.status === "Confirm" ? "Yes" : (order.inQtyConfirm ?? order.quantity);
      case "Shipped":
        return order.inQtyShipped ?? order.quantity;
      case "Received":
        return order.inQtyReceived ?? order.quantity;
      case "Invoiced":
        return order.inQtyInvoiced ?? order.quantity;
      case "Cancelled":
        return order.inQtyCancelled ?? order.quantity;
      default:
        return "-";
    }
  };
  
  // Define the order of statuses for sales orders.
  const saleStatusHierarchy = [
    "confirm",
    "shipped",
    "delivered",
    "invoiced",
    "cancelled",
  ];
  // const showQty = (order, cellStatus) => {
  //   if (order.orderType !== "purchase") return "-";
  //   const orderIndex = purchaseStatusHierarchy.indexOf(order.status);
  //   const cellIndex = purchaseStatusHierarchy.indexOf(cellStatus);
  //   if (orderIndex === -1 || orderIndex < cellIndex) return "-";
  
  //   switch (cellStatus) {
  //     case "Confirm":
  //       // If the order's status is exactly "Confirm", show "Yes"
  //       return order.status === "Confirm" ? "Yes" : (order.inQtyConfirm ?? order.quantity);
  //     case "Shipped":
  //       return order.inQtyShipped ?? order.quantity;
  //     case "Received":
  //       return order.inQtyReceived ?? order.quantity;
  //     case "Invoiced":
  //       return order.inQtyInvoiced ?? order.quantity;
  //     case "Cancelled":
  //       return order.inQtyCancelled ?? order.quantity;
  //     default:
  //       return "-";
  //   }
  // };
  // Helper function to display sales order quantity cumulatively.
  const showSalesQty = (order, cellStatus) => {
    if (order.orderType !== "sale") return "-";
    const orderStatus = order.status?.toLowerCase() || "";
    const orderIndex = saleStatusHierarchy.indexOf(orderStatus);
    const cellIndex = saleStatusHierarchy.indexOf(cellStatus.toLowerCase());
    if (orderIndex === -1 || orderIndex < cellIndex) return "-";

    switch (cellStatus.toLowerCase()) {
      case "confirm":
        return order.outQtyConfirmed ?? order.quantity;
      case "shipped":
        return order.outQtyShipped ?? order.quantity;
      case "delivered":
        return order.outQtyDelivered ?? order.quantity;
      case "invoiced":
        return order.outQtyInvoiced ?? order.quantity;
      case "cancelled":
        return order.outQtyCancelled ?? order.quantity;
      default:
        return "-";
    }
  };

  return (
    <div className="bg-grey-400 min-h-screen">
      <ToastContainer />
      {/* Header Section */}
      <div className="flex justify-between space-x-2">
        <h1 className="text-2xl font-bold mb-4">Inventory Transaction</h1>
        <div className="flex justify-end items-center gap-1 mb-3">
          <button
            onClick={generatePDF}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700"
          >
            PDF
          </button>
          <button
            onClick={exportToExcel}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700"
          >
            Export
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-wrap items-center justify-between p-2 bg-white rounded-md shadow mb-2 space-y-3 md:space-y-0 md:space-x-4">
        <div className="flex items-center space-x-4">
          {/* Sort Control */}
          <div className="relative">
            <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedSortOption}
              onChange={handleSortChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="" disabled>
                Sort By
              </option>
              <option value="saleNumber">Sort by Sale Number (Asc)</option>
              <option value="saleNumberDesc">Sort by Sale Number (Desc)</option>
              <option value="customerName">By Customer Name</option>
              <option value="itemName">By Item Name</option>
              <option value="unit">By Unit</option>
            </select>
          </div>

          {/* Filter by Order Type */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedFilter}
              onChange={handleFilterChange}
              className="pl-10 pr-4 py-2 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="All">All Orders</option>
              <option value="purchase">Purchase Orders</option>
              <option value="sale">Sales Orders</option>
            </select>
          </div>

          {/* Search Input */}
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
        <button
          onClick={resetFilters}
          className="text-red-500 hover:text-red-600 font-medium"
        >
          Reset Filter
        </button>
      </div>

      {/* Table Display */}
      <div className="border border-green-500 rounded-lg bg-white p-3 overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <table
            id="ordersTable"
            className="min-w-full border-collapse border border-gray-200"
          >
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border border-gray-300 text-left">
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={
                      selectedOrders.length === filteredOrders.length &&
                      filteredOrders.length > 0
                    }
                  />
                </th>
                <th className="px-6 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                  Date
                </th>
                <th className="px-6 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                  Item Name
                </th>
                <th className="px-6 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                  Ref Order
                </th>
                <th className="px-6 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                  Ref No
                </th>
                <th className="px-6 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                  Order Quantity
                </th>
                {/* Purchase Order Columns */}
                <th className="px-6 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                  In Qty Confirm
                </th>
                <th className="px-6 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                  In Qty Shipped
                </th>
                <th className="px-6 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                  In Qty Received
                </th>
                <th className="px-6 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                  In Qty Invoiced
                </th>
                <th className="px-6 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                  In Qty Cancelled
                </th>
                {/* Sales Order Columns */}
                <th className="px-6 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                  Out Qty Confirmed
                </th>
                <th className="px-6 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                  Out Qty Shipped
                </th>
                <th className="px-6 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                  Out Qty Delivered
                </th>
                <th className="px-6 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                  Out Qty Invoiced
                </th>
                <th className="px-6 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                  Out Qty Cancelled
                </th>
                {/* Additional / Calculated Columns */}
                <th className="px-6 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                  Cum Net Qty
                </th>
                <th className="px-6 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                  In Value
                </th>
                <th className="px-6 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                  Out Value
                </th>
                <th className="px-6 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                  Cum Net Value
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border border-gray-300">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleOrderSelection(order.id)}
                    />
                  </td>
                  <td className="px-6 py-3 border border-gray-300 text-center">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 border border-gray-300">
                    {order.item?.name || "-"}
                  </td>
                  <td className="px-6 py-3 border border-gray-300">
                    {order.orderType || "-"}
                  </td>
                  <td className="px-6 py-3 border border-gray-300">
                    {order.orderNum || "-"}
                  </td>
                  <td className="px-6 py-3 border border-gray-300">
                    {order.status || "-"}
                  </td>
                  <td className="px-6 py-3 border border-gray-300">
                    {order.quantity || "-"}
                  </td>
                  {/* Purchase Order Fields using cumulative logic */}
                  <td className="px-6 py-3 border border-gray-300 text-center">
                    {showQty(order, "Confirm")}
                  </td>
                  <td className="px-6 py-3 border border-gray-300 text-center">
                    {showQty(order, "Shipped")}
                  </td>
                  <td className="px-6 py-3 border border-gray-300 text-center">
                    {showQty(order, "Received")}
                  </td>
                  <td className="px-6 py-3 border border-gray-300 text-center">
                    {showQty(order, "Invoiced")}
                  </td>
                  <td className="px-6 py-3 border border-gray-300 text-center">
                    {showQty(order, "Cancelled")}
                  </td>
                  {/* Sales Order Fields using cumulative logic */}
                  <td className="px-6 py-3 border border-gray-300 text-center">
                    {showSalesQty(order, "confirm")}
                  </td>
                  <td className="px-6 py-3 border border-gray-300 text-center">
                    {showSalesQty(order, "shipped")}
                  </td>
                  <td className="px-6 py-3 border border-gray-300 text-center">
                    {showSalesQty(order, "delivered")}
                  </td>
                  <td className="px-6 py-3 border border-gray-300 text-center">
                    {showSalesQty(order, "invoiced")}
                  </td>
                  <td className="px-6 py-3 border border-gray-300 text-center">
                    {showSalesQty(order, "cancelled")}
                  </td>
                  {/* Additional / Calculated Fields */}
                  <td className="px-6 py-3 border border-gray-300 text-center">
                    {order.cumNetQty ?? "-"}
                  </td>
                  <td className="px-6 py-3 border border-gray-300 text-center">
                    {order.inValue ?? "-"}
                  </td>
                  <td className="px-6 py-3 border border-gray-300 text-center">
                    {order.outValue ?? "-"}
                  </td>
                  <td className="px-6 py-3 border border-gray-300 text-center">
                    {order.cumNetValue ?? "-"}
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

export default InventoryTransaction;
