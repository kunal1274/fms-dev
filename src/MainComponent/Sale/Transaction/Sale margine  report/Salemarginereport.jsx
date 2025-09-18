import React, { useEffect, useState } from "react";
import axios from "axios";

import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Salemarginereport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const salesOrderUrl = "https://fms-qkmw.onrender.com/fms/api/v0/salesorders";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(salesOrderUrl);
        setData(res.data?.data || []);
      } catch (err) {
        setError("Failed to load sales margin report.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Sales Margin Report", 14, 10);
    doc.autoTable({
      startY: 20,
      head: [
        [
          "Company code",
          "Sales Order Number",
          "Sales Date",
          "Customer Code",
          "Customer Name",
          "Product Code",
          "Product Name",
          "Sold Quantity",
          "Unit Price",
          "Total Sales Amount",
          "Unit Cost (COGS)",
          "Total Cost (COGS)",
          "Gross Profit",
          "Gross Margin (%)",
          "Salesperson Name",
          "Currency",
          "Invoice Number",
        ],
      ],
      body: data.map((row) => [
        row.companyCode,
        row.salesOrderNumber,
        row.salesDate,
        row.customerCode,
        row.customerName,
        row.productCode,
        row.productName,
        row.soldQuantity,
        row.unitPrice,
        row.totalSalesAmount,
        row.unitCost,
        row.totalCost,
        (row.totalSalesAmount - row.totalCost).toFixed(2),
        row.totalSalesAmount
          ? (
              ((row.totalSalesAmount - row.totalCost) / row.totalSalesAmount) *
              100
            ).toFixed(2) + "%"
          : "0%",
        row.salespersonName,
        row.currency,
        row.invoiceNumber,
      ]),
      styles: { fontSize: 7 },
    });
    doc.save("sales_margin_report.pdf");
  };

  // ✅ Export Excel
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((row) => ({
        "Company code": row.companyCode,
        "Sales Order Number": row.salesOrderNumber,
        "Sales Date": row.salesDate,
        "Customer Code": row.customerCode,
        "Customer Name": row.customerName,
        "Product Code": row.productCode,
        "Product Name": row.productName,
        "Sold Quantity": row.soldQuantity,
        "Unit Price": row.unitPrice,
        "Total Sales Amount": row.totalSalesAmount,
        "Unit Cost (COGS)": row.unitCost,
        "Total Cost (COGS)": row.totalCost,
        "Gross Profit": (row.totalSalesAmount - row.totalCost).toFixed(2),
        "Gross Margin (%)": row.totalSalesAmount
          ? (
              ((row.totalSalesAmount - row.totalCost) / row.totalSalesAmount) *
              100
            ).toFixed(2) + "%"
          : "0%",
        "Salesperson Name": row.salespersonName,
        Currency: row.currency,
        "Invoice Number": row.invoiceNumber,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Margin Report");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "sales_margin_report.xlsx");
  };

  if (loading) return <div className="mt-4 text-sm">Loading...</div>;
  if (error) return <div className="mt-4 text-sm text-red-600">{error}</div>;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        {/* Title left */}
        <h2 className="text-lg font-semibold mb-2">Sales Margin Report</h2>

        {/* Buttons right */}
        <div className="space-x-2">
          <button
            onClick={handleExportPDF}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
          >
            Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
          >
            Export Excel
          </button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-xs">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {[
                "Company code",
                "Sales Order Number",
                "Sales Date",
                "Customer Code",
                "Customer Name",
                "Product Code",
                "Product Name",
                "Sold Quantity",
                "Unit Price",
                "Total Sales Amount",
                "Unit Cost (COGS)",
                "Total Cost (COGS)",
                "Gross Profit",
                "Gross Margin (%)",
                "Salesperson Name",
                "Currency",
                "Invoice Number",
              ].map((heading, index) => (
                <th key={index} className="border px-2 py-1 text-left">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border px-2 py-1">{row.companyCode}</td>
                <td className="border px-2 py-1">{row.salesOrderNumber}</td>
                <td className="border px-2 py-1">{row.salesDate}</td>
                <td className="border px-2 py-1">{row.customerCode}</td>
                <td className="border px-2 py-1">{row.customerName}</td>
                <td className="border px-2 py-1">{row.productCode}</td>
                <td className="border px-2 py-1">{row.productName}</td>
                <td className="border px-2 py-1">{row.soldQuantity}</td>
                <td className="border px-2 py-1">{row.unitPrice}</td>
                <td className="border px-2 py-1">{row.totalSalesAmount}</td>
                <td className="border px-2 py-1">{row.unitCost}</td>
                <td className="border px-2 py-1">{row.totalCost}</td>
                <td className="border px-2 py-1">
                  {(row.totalSalesAmount - row.totalCost).toFixed(2)}
                </td>
                <td className="border px-2 py-1">
                  {row.totalSalesAmount
                    ? (
                        ((row.totalSalesAmount - row.totalCost) /
                          row.totalSalesAmount) *
                        100
                      ).toFixed(2) + "%"
                    : "0%"}
                </td>
                <td className="border px-2 py-1">{row.salespersonName}</td>
                <td className="border px-2 py-1">{row.currency}</td>
                <td className="border px-2 py-1">{row.invoiceNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Salemarginereport;
