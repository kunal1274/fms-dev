import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  const [activeView, setActiveView] = useState("customer");
  const [selectedDrill, setSelectedDrill] = useState(null);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedPaymentDrill, setSelectedPaymentDrill] = useState(null);
  const [selectedInvoiceDrill, setSelectedInvoiceDrill] = useState(null);

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

  // Group sales by customer using memoization
  const groupedSalesByCustomer = useMemo(() => {
    return sales.reduce((acc, sale) => {
      const customerName = sale.customer?.name || "Unknown Customer";
      if (!acc[customerName]) {
        acc[customerName] = [];
      }
      acc[customerName].push(sale);
      return acc;
    }, {});
  }, [sales]);

  // Compute a summary for each customer using memoization
  const customerSummary = useMemo(() => {
    return Object.keys(groupedSalesByCustomer).map((customerName) => {
      const transactions = groupedSalesByCustomer[customerName];
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
    });
  }, [groupedSalesByCustomer]);

  // Group sales by item using memoization
  const groupedSalesByItem = useMemo(() => {
    return sales.reduce((acc, sale) => {
      const itemKey = sale.item?.code || sale.itemNo || "Unknown Item";
      if (!acc[itemKey]) {
        acc[itemKey] = [];
      }
      acc[itemKey].push(sale);
      return acc;
    }, {});
  }, [sales]);

  // Compute an item summary for report generation using memoization
  const itemSummary = useMemo(() => {
    return Object.keys(groupedSalesByItem).map((itemKey) => {
      const transactions = groupedSalesByItem[itemKey];
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
  }, [groupedSalesByItem]);

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

  // Handlers to toggle the view (removed page reloads)
  const showByCustomer = () => {
    setActiveView("customer");
    setSelectedDrill(null); // Reset drill down on view change
  };

  const showByItem = () => {
    setActiveView("item");
    setSelectedDrill(null); // Reset drill down on view change
  };

  // Handle drill button click to show detailed transactions
  const handleDrillClick = (data) => {
    setSelectedDrill(data);
    setSelected(!selected);
  };
  const handleDrillClickCustomer = (data) => {
    // If the clicked row is already selected, deselect it; otherwise, select it.
    setSelectedDrill((prev) =>
      prev && prev.customerCode === data.customerCode ? null : data
    );
  };
  // Handlers for Payment and Invoice drill downs
  const handlePaymentClick = (sale) => {
    setSelectedPaymentDrill(sale);
  };

  const handleInvoiceClick = (sale) => {
    setSelectedInvoiceDrill(sale);
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
        sale.invoiceNumber || sale.orderNum || 0,
        sale.salesOrder || sale.orderNum || 0,
        sale.invAmt || sale.lineAmt || 0,
        sale.advancePaidAmt || 0,
        sale.dues != null
          ? sale.dues
          : (sale.lineAmt || 0) - (sale.advancePaidAmt || 0),
        sale.invoiceDate || 0,
        sale.itemNo || (sale.item && sale.item.code) || 0,
        sale.quantity || 0,
        sale.price || 0,
        sale.lineAmt || 0,
        sale.totalAmt || 0,
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
        sale.invoiceNumber || sale.orderNum || 0,
        sale.salesOrder || sale.orderNum || 0,
        sale.invAmt || sale.lineAmt || 0,
        sale.advancePaidAmt || 0,
        sale.dues != null
          ? sale.dues
          : (sale.lineAmt || 0) - (sale.advancePaidAmt || 0),
        sale.invoiceDate || 0,
        sale.itemNo || (sale.item && sale.item.code) || 0,
        sale.quantity || 0,
        sale.price || 0,
        sale.lineAmt || 0,
        sale.totalAmt || 0,
      ]);
      doc.autoTable({
        startY: 40,
        head: [tableColumn],
        body: tableRows,
      });
    });

    doc.save("sales_report_by_item.pdf");
  };

  // Handlers for search and sort input changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-black-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-800 text-lg font-medium">Loading...</p>
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
          onClick={showByCustomer}
          className="h-10 px-4 py-2 border border-black bg-white rounded-md hover:bg-white"
        >
          Show By Customer
        </button>
        <button
          onClick={showByItem}
          className="h-10 px-4 py-2 border border-black bg-white rounded-md hover:bg-white"
        >
          Show By Item
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
        <button
          className="text-black hover:text-black font-medium"
          onClick={resetFilters}
        >
          Reset Filter
        </button>
      </div>
      <div className="flex flex-col md:flex-row">
        {/* Left Panel: Conditional rendering based on activeView */}
        <div className="w-full md:w-1/2 pr-2">
          {activeView === "customer" ? (
            <>
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
                    <th className="px-4 py-2 border border-black">
                      Total Paid
                    </th>
                    <th className="px-4 py-2 border border-black">
                      Total Dues
                    </th>
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
                          onClick={() => handleDrillClickCustomer(customer)}
                          // className={`px-2 py-1 border rounded ${
                          //   selectedDrill.customerCode === customer.customerCode
                          //     ? "bg-blue-300" // Selected row
                          //     : "bg-white hover:bg-blue-300" // Not selected: allow hover effect
                          // }`}
                        >
                          Drill
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2 text-black">
                Item Summary
              </h2>
              <table className="min-w-full border-collapse border border-black">
                <thead>
                  <tr className="bg-white">
                    <th className="px-4 py-2 border border-black">Item Code</th>
                    <th className="px-4 py-2 border border-black">
                      Total Invoiced
                    </th>
                    <th className="px-4 py-2 border border-black">
                      Total Paid
                    </th>
                    <th className="px-4 py-2 border border-black">
                      Total Dues
                    </th>
                    <th className="px-4 py-2 border   border-black">Drill</th>
                  </tr>
                </thead>
                <tbody>
                  {itemSummary.map((item) => (
                    <tr key={item.itemCode} className="hover:bg-white">
                      <td className="px-4 py-2 border border-black">
                        {item.itemCode}
                      </td>
                      <td className="px-4 py-2 border border-black">
                        {item.totalInvoice.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 border border-black">
                        {item.totalPaid.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 border border-black">
                        {item.totalDues.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 border border-black">
                        <button
                          onClick={() => handleDrillClick(item)}
                          className={`px-2 py-1 border hover:border-blue rounded ${
                            selectedDrill &&
                            selectedDrill.itemCode === item.itemCode
                              ? "bg-blue-300" // Selected item gets blue background permanently.
                              : "bg-white hover:bg-blue-300" // Non-selected item turns blue on hover.
                          }`}
                        >
                          Drill
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
        {/* Right Panel: Detailed Transactions for the selected drill */}
        <div className="w-full md:w-1/2 pl-2 mt-4 md:mt-0">
          {selectedDrill ? (
            <>
              <h2 className="text-xl font-semibold mb-2 text-black">
                {activeView === "customer"
                  ? `${selectedDrill.customerName} - Detailed Transactions`
                  : `Item: ${selectedDrill.itemCode} - Detailed Transactions`}
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
                    <th className="px-2 py-1 border border-black">
                      Drill on Payment
                    </th>
                    <th className="px-2 py-1 border border-black">
                      Drill on Invoice
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDrill.transactions.map((sale) => (
                    <tr
                      key={sale._id || sale.invoiceNumber}
                      className="hover:bg-white"
                    >
                      <td className="px-2 py-1 border border-black">
                        {sale.invoiceNumber || sale.orderNum || 0}
                      </td>
                      <td className="px-2 py-1 border border-black">
                        {sale.salesOrder || sale.orderNum || 0}
                      </td>
                      <td className="px-2 py-1 border border-black">
                        {sale.invAmt || sale.lineAmt || 0}
                      </td>
                      <td className="px-2 py-1 border border-black">
                        {sale.advancePaidAmt || 0}
                      </td>
                      <td className="px-2 py-1 border border-black">
                        {sale.dues != null
                          ? sale.dues
                          : (sale.lineAmt || 0) - (sale.advancePaidAmt || 0)}
                      </td>
                      <td className="px-2 py-1 border border-black">
                        {sale.invoiceDate || 0}
                      </td>
                      <td className="px-2 py-1 border border-black">
                        {sale.itemNo || (sale.item && sale.item.code) || 0}
                      </td>
                      <td className="px-2 py-1 border border-black">
                        {sale.quantity || 0}
                      </td>
                      <td className="px-2 py-1 border border-black">
                        {sale.price || 0}
                      </td>
                      <td className="px-2 py-1 border border-black">
                        {sale.lineAmt || 0}
                      </td>
                      <td className="px-2 py-1 border border-black">
                        {sale.totalAmt || 0}
                      </td>
                      <td className="px-4 py-2 border border-black">
                        <button
                          onClick={() => handlePaymentClick(sale)}
                          className={`px-2 py-1 border border-black rounded ${
                            selectedPaymentDrill === sale
                              ? "bg-blue-300"
                              : "bg-white"
                          } hover:bg-blue-300`}
                        >
                          Drill on Payment
                        </button>
                      </td>
                      <td className="px-4 py-2 border border-black">
                        <button
                          onClick={() => handleInvoiceClick(sale)}
                          className={`px-2 py-1 border border-black rounded ${
                            selectedInvoiceDrill === sale
                              ? "bg-blue-300"
                              : "bg-white"
                          } hover:bg-blue-300`}
                        >
                          Drill on Invoice
                        </button>
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
          {/* Payment Drill Details */}
          {selectedPaymentDrill && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-black">
                Payment Drill Details
              </h2>
              <button
                onClick={() => setSelectedPaymentDrill(null)}
                className="mb-2 px-2 py-1 border border-black bg-white rounded hover:bg-white"
              >
                Close
              </button>
              <table className="min-w-full border-collapse border border-black">
                <thead>
                  <tr className="bg-white">
                    <th className="px-4 py-2 border border-black">
                      Invoice No.
                    </th>
                    <th className="px-4 py-2 border border-black">
                      Payment Date
                    </th>
                    <th className="px-4 py-2 border border-black">
                      Transaction ID
                    </th>
                    <th className="px-4 py-2 border border-black">
                      Payment Amt
                    </th>
                    <th className="px-4 py-2 border border-black">
                      Payment Mode
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPaymentDrill.payments &&
                    selectedPaymentDrill.payments.map((payment, index) => (
                      <tr key={index} className="hover:bg-white">
                        <td className="px-4 py-2 border border-black">
                          {selectedPaymentDrill.invoiceNumber ||
                            selectedPaymentDrill.orderNum ||
                            0}
                        </td>
                        <td className="px-4 py-2 border border-black">
                          {new Date(payment.date).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 border border-black">
                          {payment.transactionId || 0}
                        </td>
                        <td className="px-4 py-2 border border-black">
                          {payment.amount || 0}
                        </td>
                        <td className="px-4 py-2 border border-black">
                          {payment.paymentMode || ""}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Invoice Drill Details */}
          {selectedInvoiceDrill && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-black">
                Invoice Drill Details
              </h2>
              <button
                onClick={() => setSelectedInvoiceDrill(null)}
                className="mb-2 px-2 py-1 border border-black bg-white rounded hover:bg-white"
              >
                Close
              </button>
              <table className="min-w-full border-collapse border border-black">
                <thead>
                  <tr className="bg-white">
                    <th className="px-4 py-2 border border-black">
                      Invoice No.
                    </th>
                    <th className="px-4 py-2 border border-black">
                      Payment Date
                    </th>
                    <th className="px-4 py-2 border border-black">
                      Transaction ID
                    </th>
                    <th className="px-4 py-2 border border-black">
                      Payment Amt
                    </th>
                    <th className="px-4 py-2 border border-black">
                      Payment Mode
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoiceDrill.paidAmt.map((payment, index) => (
                    <tr key={index} className="hover:bg-white">
                      <td className="px-4 py-2 border border-black">
                        {selectedInvoiceDrill.invoiceNum ||
                          selectedInvoiceDrill.orderNum ||
                          0}
                      </td>
                      <td className="px-4 py-2 border border-black">
                        {payment.date || 0}
                      </td>
                      <td className="px-4 py-2 border border-black">
                        {payment.transactionId || 0}
                      </td>
                      <td className="px-4 py-2 border border-black">
                        {payment.amount || 0}
                      </td>
                      <td className="px-4 py-2 border border-black">
                        {payment.paymentMode || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ByInvoiced;
