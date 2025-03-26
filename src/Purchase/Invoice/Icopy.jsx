import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useReactToPrint } from "react-to-print";
import "./Css.css";

const Invoice = ({ goBack }) => {
  const { saleOrderNum } = useParams(); // Get from URL params
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [saleData, setSaleData] = useState({});
  const [error, setError] = useState("");
  const componentRef = useRef();
  const [hideButtons, setHideButtons] = useState(false);

  // Ensure correct ref passing for printing
  const handlePrint = useReactToPrint({
    content: () => {
      if (componentRef.current) {
        return componentRef.current;
      } else {
        toast.error("No content to print");
        return null;
      }
    },
    documentTitle: `Invoice-${saleData.orderNum || "invoice"}`,
    onPrintError: (error) => {
      console.error("Print error:", error);
      toast.error("Error printing invoice.");
    },
  });

  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [inputSaleOrderNum, setInputSaleOrderNum] = useState(
    saleOrderNum || ""
  );

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(
          "https://befr8n.vercel.app/fms/api/v0/companies"
        );
        if (response.status === 200) {
          setCompanies(response.data?.data || []);
        } else {
          console.error(`Unexpected response status: ${response.status}`);
        }
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    };

    fetchCompanies();
  }, []);

  // When the dropdown selection changes, update the selected company
  useEffect(() => {
    if (selectedCompanyId) {
      const company = companies.find((comp) => comp._id === selectedCompanyId);
      setSelectedCompany(company);
    } else {
      setSelectedCompany(null);
    }
  }, [selectedCompanyId, companies]);

  // Create an Axios instance
  const api = axios.create({
    baseURL: "https://befr8n.vercel.app/fms/api/v0/salesorders",
  });

  const fetchSaleDetail = useCallback(async (id) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/${id}`);
      if (response.status === 200) {
        setSaleData(response.data?.data || {});
      } else {
        const msg = `Unexpected response status: ${response.status}`;
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      setError(err.response?.data?.message || "An unexpected error occurred.");
      toast.error(err.response?.data?.message || "Error fetching sale data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial delay loading effect
  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-fetch sale details when saleOrderNum changes
  useEffect(() => {
    if (!saleOrderNum) {
      setLoading(false);
      return;
    }
    setInputSaleOrderNum(saleOrderNum);
    fetchSaleDetail(saleOrderNum);
  }, [saleOrderNum, fetchSaleDetail]);

  // Search handler
  const handleSearch = () => {
    if (!inputSaleOrderNum.trim()) {
      toast.warn("Please enter a Sale ID.");
      return;
    }
    fetchSaleDetail(inputSaleOrderNum);
  };

  // Print handler (for print styles)
  const printInvoice = () => {
    const invoiceWrapper = document.querySelector(".invoice-wrapper");
    if (invoiceWrapper) {
      invoiceWrapper.classList.add("print-mode");
    }
    setTimeout(() => {
      if (invoiceWrapper) {
        invoiceWrapper.classList.remove("print-mode");
      }
    }, 1000);
  };

  // Conditional rendering for loading states
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Invoice ........</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading data...</p>
      </div>
    );
  }

  // Download PDF with custom timing:
  // 1. Immediately hide the buttons.
  // 2. After 1 second, generate the PDF.
  // 3. After 5 seconds total, re-show the buttons.
  const downloadPDF = () => {
    setHideButtons(true); // Hide buttons immediately
    // Start PDF generation after 1 second delay
    setTimeout(() => {
      const invoiceElement = document.getElementById("print-area");
      if (!invoiceElement) return;
      html2canvas(invoiceElement, { scale: 2 })
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "pt", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
          pdf.save(`invoice-${saleData.orderNum || "invoice"}.pdf`);
        })
        .catch((error) => {
          console.error("Error generating PDF", error);
          toast.error("Error generating PDF");
        });
    }, 1000);
    // Re-show buttons after 5 seconds from the initial click
    setTimeout(() => {
      setHideButtons(false);
    }, 5000);
  };

  return (
    <div ref={componentRef} className="invoice-wrapper p-4" id="print-area">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <div className="invoice-header flex justify-between items-center mb-6">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMk1Lk-qBhzpSd7U0IiQtkR_3wCVGaEbgEUA&s"
            alt="Company Logo"
            className="h-24"
          />
          <div className="text-right">
            <h1 className="text-3xl font-bold">Invoice</h1>
            <p>Invoice No: {saleData.orderNum || 0}</p>
            <p>
              Date:{" "}
              {saleData.createdAt
                ? new Date(saleData.createdAt).toLocaleDateString()
                : 0}
            </p>
          </div>
        </div>

        <hr className="mb-6" />

        {/* Customer Details */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Customer Information Section */}
          <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              Customer Information
            </h2>
            <p className="text-gray-600">
              <strong className="text-gray-800">Name:</strong>{" "}
              {saleData.customer?.name || 0}
            </p>
            <p className="text-gray-600">
              <strong className="text-gray-800">Contact:</strong>{" "}
              {saleData.customer?.contactNum || 0}
            </p>
            <p className="text-gray-600">
              <strong className="text-gray-800">ID:</strong>{" "}
              {saleData.customer?._id || 0}
            </p>
          </div>

          {/* Company Selection Section */}
          <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              Select a Company
            </h2>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full max-w-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a Company --</option>
              {companies.map((company) => (
                <option key={company._id} value={company._id}>
                  {company.companyName}
                </option>
              ))}
            </select>
            {selectedCompany && (
              <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-white shadow-md">
                <p className="text-gray-700">
                  <strong className="text-gray-800">Name:</strong>{" "}
                  {selectedCompany.companyName}
                </p>
                <p className="text-gray-700">
                  <strong className="text-gray-800">Address:</strong>{" "}
                  {selectedCompany.primaryGSTAddress}
                </p>
                <p className="text-gray-700">
                  <strong className="text-gray-800">Email:</strong>{" "}
                  {selectedCompany.email}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-100 text-center">Item</th>
                <th className="px-6 py-3 bg-gray-100 text-center">Quantity</th>
                <th className="px-6 py-3 bg-gray-100 text-center">Price</th>
                <th className="px-6 py-3 bg-gray-100 text-center">Unit</th>
                <th className="px-6 py-3 bg-gray-100 text-center">Discount</th>
                <th className="px-6 py-3 bg-gray-100 text-center">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-6 py-3 text-center">
                  {saleData.item?.name || 0}
                </td>
                <td className="px-6 py-3 text-center">
                  {saleData.quantity || 0}
                </td>
                <td className="px-6 py-3 text-center">
                  {saleData.item?.price || 0}
                </td>
                <td className="px-6 py-3 text-center">
                  {saleData.item?.unit || 0}
                </td>
                <td className="px-6 py-3 text-center">
                  {saleData.discount || 0}
                </td>
                <td className="px-6 py-3 text-center">
                  {saleData.lineAmt || 0}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Conditionally render buttons */}
      {!hideButtons && (
        <div className="flex justify-center mt-6 space-x-4 print:hidden">
          <button
            className="bg-blue-500 text-white py-2 px-6 rounded-lg"
            onClick={handlePrint}
          >
            Print Invoice
          </button>
          <button
            className="bg-green-500 text-white py-2 px-6 rounded-lg"
            onClick={downloadPDF}
          >
            Download PDF
          </button>
          <button
            className="bg-green-500 text-white py-2 px-6 rounded-lg"
            onClick={goBack}
          >
            GO Back
          </button>
        </div>
      )}
    </div>
  );
};

export default Invoice;
