import { Select } from "flowbite-react";
import { toast, ToastContainer } from "react-toastify";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";

import "react-toastify/dist/ReactToastify.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
// import InvoiceComp from "../Invoice/Icopy"
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Invoice from "../Invoice/Icopy";
import SaleorderViewPage from "./SaleOrderViewPage";

const SaleOrderListPage = ({ handleAddSaleOrder, invoice }) => {
  const baseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/salesorders";

  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSales, setSelectedSales] = useState([]);
  const [selectedSaleForInvoice, setSelectedSaleForInvoice] = useState(null);
  const [viewingSaleId, setViewingSaleId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedSortOption, setSelectedSortOption] = useState("");

  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [SaleSummary, setSaleSummary] = useState({
    count: 0,
    creditLimit: 0,
    paidSales: 0,
    activeSales: 0,
    onHoldSales: 0,
  });
  const toStartOfDayISO = (dateStr /* 'YYYY-MM-DD' */) =>
    new Date(`${dateStr}T00:00:00.000Z`).toISOString();
  const toEndOfDayISO = (dateStr /* 'YYYY-MM-DD' */) =>
    new Date(`${dateStr}T23:59:59.999Z`).toISOString();

  // addDays that is timezone-safe (strictly next day for 'min' on endDate)
  const addDays = (dateStr, days) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() + days);
    const yyyy = dt.getUTCFullYear();
    const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(dt.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = () => {
    const dt = new Date();
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };
  const isRangeValid = useMemo(() => {
    if (!startDate || !endDate) return false;
    const s = new Date(startDate).getTime();
    const e = new Date(endDate).getTime();
    return e > s;
  }, [startDate, endDate]);
  const { id } = useParams();

  const handleDeleteSelected = async () => {
    if (!selectedSales.length) {
      toast.info("No sales selected");
      return;
    }
    const ok = window.confirm(
      `Delete ${selectedSales.length} selected sale(s)?`
    );
    if (!ok) return;

    try {
      toast.info("Deleting selected sale(s)...");
      await Promise.all(
        selectedSales.map((sid) => axios.delete(`${baseUrl}/${sid}`))
      );

      // Remove deleted rows from state
      setSales((prev) => prev.filter((s) => !selectedSales.includes(s._id)));
      setFilteredSales((prev) =>
        prev.filter((s) => !selectedSales.includes(s._id))
      );
      setSelectedSales([]);

      toast.success("Deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete selected sale(s)");
    }
  };
  // ===== Fetch all sales =====
  const fetchSales = useCallback(async () => {
    setLoading(true);
    // toast.info("Fetching sales…", { autoClose: 1200 });
    try {
      const response = await axios.get(baseUrl);
      const data = Array.isArray(response?.data?.data)
        ? response.data.data
        : [];
      setSales(data);
      setFilteredSales(data);
      // toast.success(`Loaded ${data.length} sales`, { autoClose: 1500 });
    } catch (error) {
      console.error("Failed to load Sales:", error);
      toast.error("Failed to load sales");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // ===== Compute summary (from current filtered list & date range) =====
  const computeSummary = useCallback(
    (rows) => {
      const summary = {
        count: rows.length,
        creditLimit: rows.reduce(
          (sum, r) => sum + Number(r?.creditLimit || 0),
          0
        ),
        paidSales: rows.filter((r) =>
          String(r?.status || "")
            .toLowerCase()
            .includes("paid")
        ).length,
        activeSales: rows.filter((r) => r?.active === true).length,
        onHoldSales: rows.filter((r) =>
          String(r?.status || "")
            .toLowerCase()
            .includes("hold")
        ).length,
      };
      setSaleSummary(summary);
    },
    [setSaleSummary]
  );

  useEffect(() => {
    computeSummary(filteredSales);
  }, [filteredSales, computeSummary]);

  // ===== Selection =====
  const handleCheckboxChange = (sid) => {
    setSelectedSales((prev) =>
      prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]
    );
  };

  const toggleSelectAll = () => {
    if (selectedSales.length === filteredSales.length) {
      setSelectedSales([]);
    } else {
      setSelectedSales(filteredSales.map((s) => s._id));
    }
  };

  // ===== View / Invoice =====
  const handleSaleClick = (sid) => setViewingSaleId(sid);

  const handleInvoice = () => {
    if (selectedSales.length === 1) {
      setSelectedSaleForInvoice(selectedSales[0]);
    } else {
      alert("Please select exactly one sale order to generate an invoice.");
    }
  };

  const goBack = () => {
    setViewingSaleId(null);
    setSelectedSaleForInvoice(null);
  };

  // ===== Filters & Search =====
  const applyFilters = useCallback(() => {
    let rows = [...sales];

    // Active / inactive filter
    if (selectedFilter === "yes") rows = rows.filter((r) => r.active === true);
    if (selectedFilter === "no") rows = rows.filter((r) => r.active === false);

    // Text search across common fields
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      rows = rows.filter((r) => {
        const customerName =
          r?.customer?.name || r?.customerName || r?.name || "";
        const itemName = r?.item?.name || r?.itemName || "";
        const code = r?.code || "";
        const orderNum = String(r?.orderNum || "");
        return (
          customerName.toLowerCase().includes(q) ||
          itemName.toLowerCase().includes(q) ||
          code.toLowerCase().includes(q) ||
          orderNum.toLowerCase().includes(q)
        );
      });
    }

    setFilteredSales(rows);
  }, [sales, searchTerm, selectedFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setSelectedFilter(value);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSelectedSortOption(value);

    let sorted = [...filteredSales];
    switch (value) {
      case "customerName":
        sorted.sort((a, b) =>
          (a?.customer?.name || a?.customerName || "").localeCompare(
            b?.customer?.name || b?.customerName || ""
          )
        );
        break;
      case "saleNumber":
        sorted.sort(
          (a, b) => Number(a?.orderNum || 0) - Number(b?.orderNum || 0)
        );
        break;
      case "saleNumberDesc":
        sorted.sort(
          (a, b) => Number(b?.orderNum || 0) - Number(a?.orderNum || 0)
        );
        break;
      case "itemName":
        sorted.sort((a, b) =>
          (a?.item?.name || a?.itemName || "").localeCompare(
            b?.item?.name || b?.itemName || ""
          )
        );
        break;
      case "unit":
        sorted.sort((a, b) =>
          (a?.uom || a?.unit || "").localeCompare(b?.uom || b?.unit || "")
        );
        break;
      default:
        break;
    }
    setFilteredSales(sorted);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedFilter("All");
    setSelectedSortOption("");
    setFilteredSales([...sales]);
    toast.info("Filters reset");
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (!e.target.value) setFilteredSales(sales);
  };

  const handleSearchSubmit = () => {
    if (!searchTerm.trim()) return setFilteredSales(sales);
    applyFilters();
  };

  // ===== Date range "Apply" button actions =====
  // Simulates fetching metrics & applies date range filter locally
  const fetchMetrics = async () => {
    setLoadingMetrics(true);
    try {
      // filter by createdAt/orderDate between startDate & endDate (inclusive)
      const start = new Date(startDate);
      const end = new Date(endDate);
      const inRange = sales.filter((r) => {
        const d = r?.orderDate ? new Date(r.orderDate) : new Date(r?.createdAt);
        if (Number.isNaN(d.getTime())) return false;
        return d >= start && d <= new Date(end.getTime() + 24 * 60 * 60 * 1000);
      });
      setFilteredSales(inRange);
      toast.success(`Applied date range: ${inRange.length} records`, {
        autoClose: 1000,
      });
    } catch (e) {
      toast.error("Failed to apply date range");
    } finally {
      setLoadingMetrics(false);
    }
  };

  // Back-compat for your existing onClick which called fetchCustomers(...)
  const fetchCustomers = async () => {
    await fetchMetrics();
  };

  // ===== PDF / Excel =====
  const generatePDF = useCallback(() => {
    if (!selectedSales || selectedSales.length === 0) {
      alert("No sales selected to generate PDF!");
      return;
    }
    const doc = new jsPDF();
    const tableColumn = [];

    const selectedData = filteredSales.filter((s) =>
      selectedSales.includes(s._id)
    );

    const tableRows = selectedData.map((sale, index) => [
      index + 1,
      sale?.orderNum ?? "",
      sale?.customer?.name || sale?.customerName || "",
      sale?.item?.name || sale?.itemName || "",
      sale?.price ?? "",
      sale?.discount ?? "",
      sale?.lineAmt ?? sale?.subtotal ?? "",
      sale?.createdAt ? new Date(sale.createdAt).toLocaleDateString() : "",
      sale?.status ?? "",
    ]);

    doc.text("Selected Sales Order List", 14, 20);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save("selected_sales_order_list.pdf");
  }, [filteredSales, selectedSales]);

  const exportToExcel = useCallback(() => {
    // Export only visible columns for clarity
    const rows = filteredSales.map((r) => ({
      saleOrderNo: r?.orderNum ?? "",
      customerAccount: r?.customer?.code || r?.customer?.accountNo || "",
      customerName: r?.customer?.name || r?.customerName || "",
      orderStatus: r?.status ?? "",
      orderDate: r?.orderDate || r?.createdAt || "",
      itemCode: r?.item?.code || r?.itemCode || "",
      itemName: r?.item?.name || r?.itemName || "",
      orderQty: r?.quantity || r?.qty || "",
      uom: r?.uom || r?.unit || "",
      lineAmount: r?.lineAmt || r?.subtotal || "",
      grandTotal: r?.total || r?.grandTotal || "",
      currency: r?.currency || "",
      orderId: r?._id || "",
      site: r?.site?.name || r?.siteName || "",
      warehouse: r?.warehouse?.name || r?.warehouseName || "",
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");
    XLSX.writeFile(workbook, "Sale_list.xlsx");
  }, [filteredSales]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-black-900 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-800 text-lg font-medium">
          Sale order List Page ...
        </p>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer />
      <div>
        <div>
          {viewingSaleId ? (
            <SaleorderViewPage saleId={viewingSaleId} goBack={goBack} />
          ) : selectedSaleForInvoice && InvoiceComp ? (
            <Invoice saleId={selectedSaleForInvoice} goBack={goBack} />
          ) : (
            <div className="space-y-6">
              <ToastContainer />
              {/* Header Buttons */}
              <div className="flex justify-between ">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-semibold">
                    Sale Order List Page
                  </h3>
                </div>
                <div className="flex items-center gap-3 ">
                  <button
                    onClick={handleAddSaleOrder}
                    className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
                  >
                    + Add
                  </button>

                  <button
                    onClick={handleDeleteSelected}
                    disabled={!selectedSales.length}
                    className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
                  >
                    Delete
                  </button>

                  <button
                    onClick={handleInvoice}
                    disabled={selectedSales.length !== 1}
                    className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
                  >
                    Invoice
                  </button>
                  <button
                    onClick={generatePDF}
                    className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
                  >
                    PDF
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
                  >
                    Export
                  </button>
                </div>
              </div>

              {/* Metrics */}
              <div className=" bg-white rounded-lg ">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                  {[
                    ["Total Sales", SaleSummary.count],
                    ["Credit Limit", SaleSummary.creditLimit],
                    ["Paid Sales", SaleSummary.paidSales],
                    ["Active Sales", SaleSummary.activeSales],
                    ["On-Hold Sales", SaleSummary.onHoldSales],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="p-4 bg-gray-50 rounded-lg text-center"
                    >
                      <div className="text-2xl font-bold">{value}</div>
                      <div className="text-sm">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap Sales-center text-sm justify-between p-2 bg-white rounded-md  mb-2 space-y-3 md:space-y-0 md:space-x-4">
                {/* Left group: Sort By, Filter By Status, Search */}
                <div className="flex items-center space-x-4">
                  {/* Sort By */}
                  <div className="relative">
                    <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      defaultValue=""
                      value={selectedSortOption}
                      onChange={handleSortChange}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      <option value="">Sort By</option>
                      <option value="customerName">Customer Name</option>
                      <option value="saleNumber">
                        Customer Account in Ascending
                      </option>
                      <option value="saleNumberDesc">
                        Customer Account in descending
                      </option>
                      <option value="itemName">Item Name</option>
                      <option value="unit">Unit</option>
                    </select>
                  </div>

                  {/* Filter By Status */}
                  <div className="relative">
                    <FaFilter className=" text-sm absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      defaultValue="All"
                      className="pl-10 pr-4 py-2 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                      value={selectedFilter}
                      onChange={handleFilterChange}
                    >
                      <option value="All">Filter By Status</option>
                      <option value="yes">Active</option>
                      <option value="no">Inactive</option>
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
</div>
                    <div className="flex gap-2">
                      <label className="block text-sm font-medium text-gray-600 mb-1 mt-2">
                        To
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border rounded px-2 py-1"
                      />
                      <label className="block text-sm font-medium text-gray-600 mb-1 mt-2">
                        From
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        min={startDate ? addDays(startDate, 1) : undefined}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border rounded px-2 py-1"
                      />
                      <button
                        onClick={() => {
                          if (!isRangeValid) {
                            toast.info(
                              "Pick a valid Start and End date (End > Start)."
                            );
                            return;
                          }
                          fetchMetrics({
                            fromDate: startDate,
                            toDate: endDate,
                          });
                          fetchCustomers({
                            fromDate: startDate,
                            toDate: endDate,
                          });
                        }}
                        disabled={!isRangeValid || loadingMetrics}
                        className="px-3 py-1 border rounded"
                      >
                        {loadingMetrics ? "Applying…" : "Apply"}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      <FaSearch className="w-5 h-5" />
                    </button>
                
                </div>

                {/* Right side: Reset Filter */}
                <button
                  onClick={resetFilters}
                  className="text-red-500 hover:text-red-600 font-medium"
                >
                  Reset Filter
                </button>
              </div>

              {/* Data Table */}
              <div className="mx-auto w-[82vw] max-w-[1500px] rounded-lg border bg-white ">
                {/* Scroll area */}
                <div className="h-[400px] overflow-x-auto overflow-y-auto">
                  <table className="w-full min-w-[1200px] table-auto divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="sticky top-0 z-20 px-4 py-2 bg-gray-50">
                          <input
                            type="checkbox"
                            onChange={toggleSelectAll}
                            checked={
                              filteredSales.length > 0 &&
                              selectedSales.length === filteredSales.length
                            }
                            className="form-checkbox"
                          />
                        </th>

                        {[
                          "Sale Order No",
                          "Customer Account",
                          "Customer Name",
                          "Order Status",
                          "Order date",
                          "Item Code",
                          "Item Name",
                          "Order Qty",
                          "Unit of Measure (UOM)",
                          "Subtotal /  line amount",
                          "Grand Total",

                          "Currency",
                          "Order Id",
                          "Site",
                          "Warehouse",
                        ].map((h) => (
                          <th
                            key={h}
                            className="sticky top-0 z-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredSales.length ? (
                        filteredSales.map((sale) => (
                          <tr
                            key={sale._id}
                            className="hover:bg-gray-100 transition-colors"
                          >
                            <td className="px-4 py-2 align-middle">
                              <input
                                type="checkbox"
                                checked={selectedSales.includes(sale._id)}
                                onChange={() => handleCheckboxChange(sale._id)}
                                className="form-checkbox"
                              />
                            </td>

                            <td className="px-6 py-4 align-middle whitespace-nowrap">
                              <button
                                className="text-blue-600 hover:underline focus:outline-none"
                                onClick={() => handleSaleClick(sale._id)}
                              >
                                {sale?.orderNum ?? ""}
                              </button>
                            </td>

                            <td className="px-6 py-4 align-middle whitespace-nowrap">
                              {sale?.customer?.code ||
                                sale?.customer?.accountNo ||
                                ""}
                            </td>

                            <td className="px-6 py-4 align-middle whitespace-nowrap">
                              {sale?.customer?.name || sale?.customerName || ""}
                            </td>

                            <td className="px-6 py-4 align-middle whitespace-nowrap">
                              {sale?.status ?? ""}
                            </td>

                            <td className="px-6 py-4 align-middle whitespace-nowrap">
                              {sale?.orderDate
                                ? new Date(sale.orderDate).toLocaleDateString()
                                : sale?.createdAt
                                ? new Date(sale.createdAt).toLocaleDateString()
                                : ""}
                            </td>

                            <td className="px-6 py-4 align-middle whitespace-nowrap">
                              {sale?.item?.code || sale?.itemCode || ""}
                            </td>

                            <td className="px-6 py-4 align-middle whitespace-nowrap">
                              {sale?.item?.name || sale?.itemName || ""}
                            </td>

                            <td className="px-6 py-4 align-middle whitespace-nowrap">
                              {sale?.quantity || sale?.qty || ""}
                            </td>

                            <td className="px-6 py-4 align-middle whitespace-nowrap">
                              {sale?.uom || sale?.unit || ""}
                            </td>

                            <td className="px-6 py-4 align-middle whitespace-nowrap">
                              {sale?.lineAmt || sale?.subtotal || ""}
                            </td>

                            <td className="px-6 py-4 align-middle whitespace-nowrap">
                              {sale?.total || sale?.grandTotal || ""}
                            </td>

                            <td className="px-6 py-4 align-middle whitespace-nowrap">
                              {sale?.currency || ""}
                            </td>

                            <td className="px-6 py-4 align-middle whitespace-nowrap">
                              {sale?._id || ""}
                            </td>

                            <td className="px-6 py-4 align-middle whitespace-nowrap">
                              {sale?.site?.name || sale?.siteName || ""}
                            </td>

                            <td className="px-6 py-4 align-middle whitespace-nowrap">
                              {sale?.warehouse?.name ||
                                sale?.warehouseName ||
                                ""}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          {/* 1 (checkbox) + 16 headers = 17 */}
                          <td
                            colSpan={17}
                            className="px-6 py-4 text-center text-sm text-gray-500"
                          >
                            No data
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaleOrderListPage;
