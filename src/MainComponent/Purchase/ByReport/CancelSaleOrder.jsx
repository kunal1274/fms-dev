import React, { useCallback, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ByInvoiced = ({ handleAddSaleOrder }) => {
  const baseUrl = "https://befr8n.vercel.app/fms/api/v0/salesorders";
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  // selectedDrill holds the customer data (and its transactions) for the drill-down view
  const [selectedDrill, setSelectedDrill] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  // Fetch sales data from API
  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(baseUrl);
      setSales(response.data.data);
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

  // Compute a summary for each customer
  const customerSummary = Object.keys(groupSalesByCustomer()).map(
    (customerName) => {
      const transactions = groupSalesByCustomer()[customerName];
      const totalInvoice = transactions.reduce(
        (acc, sale) => acc + (sale.invAmt || sale.lineAmt || 0),
        0
      );
      const totalPaid = transactions.reduce(
        (acc, sale) => acc + (sale.advancePaidAmt || 0),
        0
      );
      const totalDues = transactions.reduce(
        (acc, sale) =>
          acc +
          (sale.dues != null
            ? sale.dues
            : (sale.lineAmt || 0) - (sale.advancePaidAmt || 0)),
        0
      );
      return { customerName, totalInvoice, totalPaid, totalDues, transactions };
    }
  );

  // Group sales by item
  const groupSalesByItem = () => {
    return sales.reduce((acc, sale) => {
      const itemKey = sale.item?.code || sale.itemNo || "Unknown Item";
      if (!acc[itemKey]) {
        acc[itemKey] = [];
      }
      acc[itemKey].push(sale);
      return acc;
    }, {});
  };

  // Compute an item summary for report generation
  const itemSummary = Object.keys(groupSalesByItem()).map((itemKey) => {
    const transactions = groupSalesByItem()[itemKey];
    const totalInvoice = transactions.reduce(
      (acc, sale) => acc + (sale.invAmt || sale.lineAmt || 0),
      0
    );
    const totalPaid = transactions.reduce(
      (acc, sale) => acc + (sale.advancePaidAmt || 0),
      0
    );
    const totalDues = transactions.reduce(
      (acc, sale) =>
        acc +
        (sale.dues != null
          ? sale.dues
          : (sale.lineAmt || 0) - (sale.advancePaidAmt || 0)),
      0
    );
    return {
      itemCode: itemKey,
      totalInvoice,
      totalPaid,
      totalDues,
      transactions,
    };
  });

  // Update filtered customers based on search and sort options
  useEffect(() => {
    let filtered = [...customerSummary];
    if (searchTerm) {
      filtered = filtered.filter((customer) =>
        customer.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortOption === "Customer Name") {
      filtered.sort((a, b) => a.customerName.localeCompare(b.customerName));
    }
    setFilteredCustomers(filtered);
  }, [customerSummary, searchTerm, sortOption]);

  // Handle drill button click to show detailed transactions
  const handleDrillClick = (customerData) => {
    setSelectedDrill(customerData);
  };

  // PDF report: Generate Customer Report
  const generateCustomerReport = () => {
    const doc = new jsPDF();
    doc.text("Sales Report by Customer", 14, 20);

    customerSummary.forEach((customer, index) => {
      if (index > 0) doc.addPage();
      doc.text(`Customer: ${customer.customerName}`, 14, 30);
      const tableColumn = [
        "Invoice No.",
        "Sales Order",
        "Inv Amt",
        "Advance Paid Amt",
        "Dues",
        "Invoice Date",
        "Item No",
        "Qty",
        "Price",
        "Line Amt",
        "Total Amt",
      ];
      const tableRows = customer.transactions.map((sale) => [
        sale.invoiceNumber || sale.orderNum || 0
,
        sale.salesOrder || sale.orderNum || 0
,
        sale.invAmt || sale.lineAmt || 0
,
        sale.advancePaidAmt || 0
,
        sale.dues != null
          ? sale.dues
          : (sale.lineAmt || 0) - (sale.advancePaidAmt || 0),
        sale.invoiceDate || 0
,
        sale.itemNo || (sale.item && sale.item.code) || 0
,
        sale.quantity || 0
,
        sale.price || 0
,
        sale.lineAmt || 0
,
        sale.totalAmt || 0
,
      ]);
      doc.autoTable({
        startY: 40,
        head: [tableColumn],
        body: tableRows,
      });
    });

    doc.save("sales_report_by_customer.pdf");
  };

  // PDF report: Generate Item Report
  const generateItemReport = () => {
    const doc = new jsPDF();
    doc.text("Item Report", 14, 20);

    itemSummary.forEach((item, index) => {
      if (index > 0) doc.addPage();
      doc.text(`Item: ${item.itemCode}`, 14, 30);
      const tableColumn = [
        "Invoice No.",
        "Item Order",
        "Inv Amt",
        "Advance Paid Amt",
        "Dues",
        "Invoice Date",
        "Item No",
        "Qty",
        "Price",
        "Line Amt",
        "Total Amt",
      ];
      const tableRows = item.transactions.map((sale) => [
        sale.invoiceNumber || sale.orderNum || 0
,
        sale.salesOrder || sale.orderNum || 0
,
        sale.invAmt || sale.lineAmt || 0
,
        sale.advancePaidAmt || 0
,
        sale.dues != null
          ? sale.dues
          : (sale.lineAmt || 0) - (sale.advancePaidAmt || 0),
        sale.invoiceDate || 0
,
        sale.itemNo || (sale.item && sale.item.code) || 0
,
        sale.quantity || 0
,
        sale.price || 0
,
        sale.lineAmt || 0
,
        sale.totalAmt || 0
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

  // Define show report functions to resolve undefined errors
  const showCustomerReport = () => {
    // For now, simply call generateCustomerReport
    generateCustomerReport();
  };

  const showItemReport = () => {
    // For now, simply call generateItemReport
    generateItemReport();
  };

  // Handler for search input changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handler for sort option changes
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  // Reset search and sort filters
  const resetFilters = () => {
    setSearchTerm("");
    setSortOption("");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-16 h-16 border-4 border-black border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-black text-lg font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen p-4">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-black">
          Sales Orders by Invoice
        </h1>
        <button
          onClick={showCustomerReport}
          className="h-10 px-4 py-2 border border-black bg-white rounded-md hover:bg-white"
        >
          Show Customer Report
        </button>
        <button
          onClick={showItemReport}
          className="h-10 px-4 py-2 border border-black bg-white rounded-md hover:bg-white"
        >
          Show Item Report
        </button>
        <div className="flex space-x-4">
          <button
            onClick={generateCustomerReport}
            className="h-10 px-4 py-2 border border-black bg-white rounded-md hover:bg-white"
          >
            Generate Customer Report
          </button>
          <button
            onClick={generateItemReport}
            className="h-10 px-4 py-2 border border-black bg-white rounded-md hover:bg-white"
          >
            Generate Item Report
          </button>
        </div>
      </div>
      <div className="flex flex-wrap justify-between p-4 bg-white rounded-md shadow mb-6 space-y-4 md:space-y-0 md:space-x-4">
        {/* Left group: Sort By and Search */}
        <div className="flex items-center space-x-4">
          {/* Sort By */}
          <div className="relative">
            <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
            <select
              value={sortOption}
              onChange={handleSortChange}
              className="pl-10 pr-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black appearance-none"
            >
              <option value="">Sort By</option>
              <option value="Customer Name">Customer Name</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-60 pl-4 pr-10 py-2 border border-black rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-black transition"
            >
              <FaSearch className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reset Filter Button */}
        <button
          className="text-black hover:text-black font-medium"
          onClick={resetFilters}
        >
          Reset Filter
        </button>
      </div>
      <div className="flex flex-col md:flex-row">
        {/* Left Panel: Customer Summary Table */}
        <div className="w-full md:w-1/2 pr-2">
          <h2 className="text-xl font-semibold mb-2 text-black">
            Customer Summary
          </h2>
          <table className="min-w-full border-collapse border border-black">
            <thead>
              <tr className="bg-white">
                <th className="px-4 py-2 border border-black">Customer</th>
                <th className="px-4 py-2 border border-black">
                  Total Invoiced
                </th>
                <th className="px-4 py-2 border border-black">Total Paid</th>
                <th className="px-4 py-2 border border-black">Total Dues</th>
                <th className="px-4 py-2 border border-black">Drill</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.customerName} className="hover:bg-white">
                  <td className="px-4 py-2 border border-black">
                    {customer.customerName}
                  </td>
                  <td className="px-4 py-2 border border-black">
                    {customer.totalInvoice.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 border border-black">
                    {customer.totalPaid.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 border border-black">
                    {customer.totalDues.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 border border-black">
                    <button
                      onClick={() => handleDrillClick(customer)}
                      className="px-2 py-1 border border-black bg-white rounded hover:bg-white"
                    >
                      Drill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Panel: Detailed Transactions for Selected Customer */}
        <div className="w-full md:w-1/2 pl-2 mt-4 md:mt-0">
          {selectedDrill ? (
            <>
              <h2 className="text-xl font-semibold mb-2 text-black">
                {selectedDrill.customerName} - Detailed Transactions
              </h2>
              <table className="min-w-full border-collapse border border-black">
                <thead>
                  <tr className="bg-white">
                    <th className="px-2 py-1 border border-black">
                      Invoice No.
                    </th>
                    <th className="px-2 py-1 border border-black">
                      Sales Order
                    </th>
                    <th className="px-2 py-1 border border-black">Inv Amt</th>
                    <th className="px-2 py-1 border border-black">
                      Advance Paid Amt
                    </th>
                    <th className="px-2 py-1 border border-black">Dues</th>
                    <th className="px-2 py-1 border border-black">
                      Invoice Date
                    </th>
                    <th className="px-2 py-1 border border-black">Item No</th>
                    <th className="px-2 py-1 border border-black">Qty</th>
                    <th className="px-2 py-1 border border-black">Price</th>
                    <th className="px-2 py-1 border border-black">Line Amt</th>
                    <th className="px-2 py-1 border border-black">Total Amt</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDrill.transactions.map((sale) => (
                    <tr key={sale._id || sale.invoiceNumber} className="hover:bg-white">
                      <td className="px-2 py-1 border border-black">
                        {sale.invoiceNumber || sale.orderNum || 0
}
                      </td>
                      <td className="px-2 py-1 border border-black">
                        {sale.salesOrder || sale.orderNum || 0
}
                      </td>
                      <td className="px-2 py-1 border border-black">
                        {sale.invAmt || sale.lineAmt || 0
}
                      </td>
                      <td className="px-2 py-1 border border-black">
                        {sale.advancePaidAmt || 0
}
                      </td>
                      <td className="px-2 py-1 border border-black">
                        {sale.dues != null
                          ? sale.dues
                          : (sale.lineAmt || 0) - (sale.advancePaidAmt || 0)}
                      </td>
                      <td className="px-2 py-1 border border-black">
                        {sale.invoiceDate || 0
}
                      </td>
                      <td className="px-2 py-1 border border-black">
                        {sale.itemNo || (sale.item && sale.item.code) || 0
}
                      </td>
                      <td className="px-2 py-1 border border-black">
                        {sale.quantity || 0
}
                      </td>
                      <td className="px-2 py-1 border border-black">
                        {sale.price || 0
}
                      </td>
                      <td className="px-2 py-1 border border-black">
                        {sale.lineAmt || 0
}
                      </td>
                      <td className="px-2 py-1 border border-black">
                        {sale.totalAmt || 0
}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <div className="text-center text-black">
              Click on a drill button to view detailed transactions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ByInvoiced;
