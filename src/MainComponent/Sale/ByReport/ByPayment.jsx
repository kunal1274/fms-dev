import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import { FaSearch, FaSortAmountDown } from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ByPayment = () => {
  const baseUrl = "https://befr8n.vercel.app/fms/api/v0/salesorders";
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  // currentView: "invoiceSummary" | "invoiceDetail" | "customerDetail"
  const [currentView, setCurrentView] = useState("invoiceSummary");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [filteredInvoices, setFilteredInvoices] = useState([]);

  // Fetch sales data from API
  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(baseUrl);
      setSales(response.data.data);
    } catch (error) {
      console.error("Failed to load sales:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // Group sales by invoice number
  const groupedSalesByInvoice = useMemo(() => {
    return sales.reduce((acc, sale) => {
      const invoiceNo =
        sale.invoiceNumber || sale.orderNum || "Unknown Invoice";
      if (!acc[invoiceNo]) {
        acc[invoiceNo] = [];
      }
      acc[invoiceNo].push(sale);
      return acc;
    }, {});
  }, [sales]);

  // Create an invoice summary for each invoice number
  const invoiceSummary = useMemo(() => {
    return Object.keys(groupedSalesByInvoice).map((invoiceNo) => {
      const transactions = groupedSalesByInvoice[invoiceNo];
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
      // Assume the first transaction holds the invoice’s common details.
      const customer = transactions[0]?.customer || {
        name: "Unknown Customer",
      };
      const invoiceDate = transactions[0]?.invoiceDate || "0";
      const salesOrder =
        transactions[0]?.salesOrder || transactions[0]?.orderNum || "";
      return {
        invoiceNo,
        totalInvoice,
        totalPaid,
        totalDues,
        customer,
        invoiceDate,
        salesOrder,
        transactions,
      };
    });
  }, [groupedSalesByInvoice]);

  // Filter and sort the invoices based on searchTerm and sortOption
  useEffect(() => {
    let filtered = [...invoiceSummary];
    if (searchTerm) {
      filtered = filtered.filter(
        (inv) =>
          inv.invoiceNo
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (inv.customer.name &&
            inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (sortOption === "Invoice No") {
      filtered.sort((a, b) =>
        a.invoiceNo.toString().localeCompare(b.invoiceNo.toString())
      );
    } else if (sortOption === "Customer") {
      filtered.sort((a, b) =>
        (a.customer.name || "").localeCompare(b.customer.name || "")
      );
    }
    setFilteredInvoices(filtered);
  }, [invoiceSummary, searchTerm, sortOption]);

  // PDF report for Invoices
  const generateInvoiceReport = () => {
    const doc = new jsPDF();
    doc.text("Invoice Report", 14, 20);
    const tableColumn = [
      "Invoice No",
      "Sales Order",
      "Inv Amt",
      "Paid",
      "Dues",
      "Invoice Date",
      "Customer",
    ];

    filteredInvoices.forEach((inv, index) => {
      if (index > 0) doc.addPage();
      doc.text(`Invoice: ${inv.invoiceNo}`, 14, 30);
      const tableRows = inv.transactions.map((sale) => [
        sale.invoiceNumber || sale.orderNum || "0",
        sale.salesOrder || sale.orderNum || "0",
        sale.invAmt || sale.lineAmt || 0,
        sale.advancePaidAmt || 0,
        sale.dues != null
          ? sale.dues
          : (sale.lineAmt || 0) - (sale.advancePaidAmt || 0),
        sale.invoiceDate || "0",
        sale.customer?.name || "Unknown Customer",
      ]);
      doc.autoTable({
        startY: 40,
        head: [tableColumn],
        body: tableRows,
      });
    });
    doc.save("invoice_report.pdf");
  };

  // Navigation handlers
  const handleDrillInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setCurrentView("invoiceDetail");
  };

  const handleDrillToCustomer = () => {
    setCurrentView("customerDetail");
  };

  const handleBack = () => {
    if (currentView === "customerDetail") {
      setCurrentView("invoiceDetail");
    } else if (currentView === "invoiceDetail") {
      setSelectedInvoice(null);
      setCurrentView("invoiceSummary");
    }
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
        <h1 className="text-2xl font-bold text-black">Invoices</h1>
        {currentView === "invoiceSummary" && (
          <button
            onClick={generateInvoiceReport}
            className="h-10 px-4 py-2 border border-black bg-white rounded-md hover:bg-white"
          >
            Generate Invoice Report
          </button>
        )}
        {(currentView === "invoiceDetail" ||
          currentView === "customerDetail") && (
          <button
            onClick={handleBack}
            className="h-10 px-4 py-2 border border-black bg-white rounded-md hover:bg-white"
          >
            Back
          </button>
        )}
      </div>

      {currentView === "invoiceSummary" && (
        <>
          <div className="flex flex-wrap justify-between p-4 bg-white rounded-md shadow mb-6 space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black appearance-none"
                >
                  <option value="">Sort By</option>
                  <option value="Invoice No">Invoice No</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
              onClick={() => {
                setSearchTerm("");
                setSortOption("");
              }}
              className="text-black hover:text-black font-medium"
            >
              Reset Filter
            </button>
          </div>
          <table className="min-w-full border-collapse border border-black">
            <thead>
              <tr className="bg-white">
                <th className="px-4 py-2 border border-black">Invoice No</th>
                <th className="px-4 py-2 border border-black">Sales Order</th>
                <th className="px-4 py-2 border border-black">Inv Amt</th>
                <th className="px-4 py-2 border border-black">Paid</th>
                <th className="px-4 py-2 border border-black">Dues</th>
                <th className="px-4 py-2 border border-black">Invoice Date</th>
                <th className="px-4 py-2 border border-black">Customer</th>
                <th className="px-4 py-2 border border-black">Drill</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv.invoiceNo} className="hover:bg-gray-100">
                  <td className="px-4 py-2 border border-black">
                    {inv.invoiceNo}
                  </td>
                  <td className="px-4 py-2 border border-black">
                    {inv.salesOrder}
                  </td>
                  <td className="px-4 py-2 border border-black">
                    {inv.totalInvoice.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 border border-black">
                    {inv.totalPaid.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 border border-black">
                    {inv.totalDues.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 border border-black">
                    {inv.invoiceDate}
                  </td>
                  <td className="px-4 py-2 border border-black">
                    {inv.customer.name}
                  </td>
                  <td className="px-4 py-2 border border-black">
                    <button
                      onClick={() => handleDrillInvoice(inv)}
                      className="px-2 py-1 border rounded bg-white hover:bg-blue-300"
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

      {currentView === "invoiceDetail" && selectedInvoice && (
        <>
          <h2 className="text-xl font-semibold mb-2 text-black">
            Invoice Details: {selectedInvoice.invoiceNo}
          </h2>
          <table className="min-w-full border-collapse border border-black">
            <thead>
              <tr className="bg-white">
                <th className="px-2 py-1 border border-black">Invoice No</th>
                <th className="px-2 py-1 border border-black">Sales Order</th>
                <th className="px-2 py-1 border border-black">Inv Amt</th>
                <th className="px-2 py-1 border border-black">Paid</th>
                <th className="px-2 py-1 border border-black">Dues</th>
                <th className="px-2 py-1 border border-black">Invoice Date</th>
                <th className="px-2 py-1 border border-black">Item No</th>
                <th className="px-2 py-1 border border-black">Qty</th>
                <th className="px-2 py-1 border border-black">Price</th>
                <th className="px-2 py-1 border border-black">Line Amt</th>
              </tr>
            </thead>
            <tbody>
              {selectedInvoice.transactions.map((sale) => (
                <tr
                  key={sale._id || sale.invoiceNumber}
                  className="hover:bg-gray-100"
                >
                  <td className="px-2 py-1 border border-black">
                    {sale.invoiceNumber || sale.orderNum || "0"}
                  </td>
                  <td className="px-2 py-1 border border-black">
                    {sale.salesOrder || sale.orderNum || "0"}
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
                    {sale.invoiceDate || "0"}
                  </td>
                  <td className="px-2 py-1 border border-black">
                    {sale.itemNo || (sale.item && sale.item.code) || "0"}
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
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4">
            <button
              onClick={handleDrillToCustomer}
              className="px-4 py-2 border border-black bg-white rounded hover:bg-blue-300"
            >
              Drill to Customer
            </button>
          </div>
        </>
      )}

      {currentView === "customerDetail" && selectedInvoice && (
        <>
          <h2 className="text-xl font-semibold mb-2 text-black">
            Customer Details
          </h2>
          <div className="p-4 border border-black rounded">
            <p>
              <strong>Name:</strong> {selectedInvoice.customer.name}
            </p>
            {/* Add any further customer details as needed */}
          </div>
        </>
      )}
    </div>
  );
};

export default ByPayment;
