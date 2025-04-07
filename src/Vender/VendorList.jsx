import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import { useParams } from "react-router-dom";
import VendorDetail from "./VendorViewPage";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import { Select } from "flowbite-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const baseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/vendors";

const VendorList = ({ handleAddVendor }) => {
  const [vendorList, setVendorList] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [selectedOption, setSelectedOption] = useState("All");
  const [viewingVendorId, setViewingVendorId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  // Fetch Vendors from the API
  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(baseUrl);
      setVendorList(response.data.data);
      setFilteredVendors(response.data.data);
    } catch (error) {
      console.error("Failed to load Vendors:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // If an id exists in the URL, use it to display vendor details
  useEffect(() => {
    if (id) {
      setViewingVendorId(id);
    }
  }, [id]);

  // Import data from an Excel file
  const importFromExcel = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      toast.error(`Error reading file: ${error.target.error.message}`);
    };

    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const importedData = XLSX.utils.sheet_to_json(worksheet);

        // Validate for duplicate registration numbers or PAN numbers
        const duplicateErrors = [];
        const seenRegistrations = new Set();
        const seenPans = new Set();

        importedData.forEach((vendor, index) => {
          if (vendor.registrationNo) {
            if (seenRegistrations.has(vendor.registrationNo)) {
              duplicateErrors.push(
                `Duplicate registration number: ${
                  vendor.registrationNo
                } at row ${index + 1}`
              );
            } else {
              seenRegistrations.add(vendor.registrationNo);
            }
          }
          if (vendor.pan) {
            if (seenPans.has(vendor.pan)) {
              duplicateErrors.push(
                `Duplicate PAN: ${vendor.pan} at row ${index + 1}`
              );
            } else {
              seenPans.add(vendor.pan);
            }
          }
        });

        if (duplicateErrors.length > 0) {
          toast.error(`Errors occurred:\n${duplicateErrors.join("\n")}`, {
            autoClose: 1000,
            onClose: () => fetchVendors(),
          });
          return;
        }

        // Post each vendor and keep track of successes and errors
        let successCount = 0;
        const errors = [];
        for (let i = 0; i < importedData.length; i++) {
          const vendor = importedData[i];
          try {
            await axios.post(baseUrl, vendor, {
              headers: { "Content-Type": "application/json" },
            });
            successCount++;
            toast.success(`Successfully posted vendor ${i + 1}`, {
              autoClose: 1000,
            });
          } catch (err) {
            console.error(`Error posting vendor ${i + 1}:`, err);
            errors.push(
              `Error ${i + 1}: ${err.response?.data.err || err.message}`
            );
            toast.error(`Error importing vendor ${i + 1}`, {
              autoClose: 1000,
            });
          }
        }

        // Summary toast after import
        if (successCount === importedData.length) {
          toast.success(
            `All ${successCount} data imported and posted successfully!`,
            {
              autoClose: 1000,
              onClose: () => fetchVendors(),
            }
          );
        } else {
          toast.error(
            `Import Summary:\nSuccessfully imported: ${successCount}\nFailed: ${
              importedData.length - successCount
            }\nErrors:\n${errors.join("\n")}`,
            {
              autoClose: 1000,
              onClose: () => fetchVendors(),
            }
          );
        }
      } catch (err) {
        console.error("Error processing file:", err);
        toast.error(`Error processing file: ${err.message}`);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Search logic
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    const filtered = vendorList.filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(term.toLowerCase()) ||
        vendor.code.toLowerCase().includes(term.toLowerCase()) ||
        vendor.contactNum.includes(term)
    );

    setFilteredVendors(filtered);
  };

  // Filter and sort logic
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setSelectedOption(value);

    let filtered = [...vendorList];

    if (value === "All") {
      setFilteredVendors(filtered);
    } else if (value === "yes") {
      setFilteredVendors(filtered.filter((vendor) => vendor.active === true));
    } else if (value === "no") {
      setFilteredVendors(filtered.filter((vendor) => vendor.active === false));
    } else if (value === "vendor Name") {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
      setFilteredVendors(filtered);
    } else if (value === "vendor Account no") {
      filtered = filtered.sort((a, b) => a.code.localeCompare(b.code));
      setFilteredVendors(filtered);
    } else if (value === "vendor Account no descending") {
      filtered = filtered.sort((a, b) => b.code.localeCompare(a.code));
      setFilteredVendors(filtered);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedOption("All");
    setFilteredVendors(vendorList);
  };

  // Delete selected vendors
  const handleDeleteSelected = async () => {
    if (!selectedVendors || selectedVendors.length === 0) {
      toast.info("No vendors selected to delete.", { autoClose: 1000 });
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete the selected vendors?"
    );
    if (!confirmed) return;

    try {
      const deleteResponses = await Promise.allSettled(
        selectedVendors.map((vendorId) =>
          axios.delete(`${baseUrl}/${vendorId}`)
        )
      );

      const successfulDeletes = deleteResponses.filter(
        (res) => res.status === "fulfilled"
      );
      const failedDeletes = deleteResponses.filter(
        (res) => res.status === "rejected"
      );

      if (successfulDeletes.length > 0) {
        toast.success(
          `${successfulDeletes.length} vendor(s) deleted successfully!`,
          {
            autoClose: 1000,
          }
        );

        setVendorList((prev) =>
          prev.filter((vendor) => !selectedVendors.includes(vendor._id))
        );
        setFilteredVendors((prev) =>
          prev.filter((vendor) => !selectedVendors.includes(vendor._id))
        );
        setSelectedVendors([]);
      }

      if (failedDeletes.length > 0) {
        toast.error(
          `${failedDeletes.length} deletion(s) failed. Check console for details.`
        );
        failedDeletes.forEach((err, index) => {
          console.error(
            `Error deleting vendor ${selectedVendors[index]}:`,
            err.reason?.response || err.reason
          );
        });
      }
    } catch (error) {
      console.error(
        "Unexpected error during deletion:",
        error.response || error.message
      );
      toast.error("An unexpected error occurred while deleting vendors.");
    }
  };

  // Export data to Excel
  const exportToExcel = useCallback(() => {
    if (!vendorList.length) return alert("No data to export");
    const worksheet = XLSX.utils.json_to_sheet(vendorList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "vendors");
    XLSX.writeFile(workbook, "vendor_list.xlsx");
  }, [vendorList]);

  // Generate PDF using jsPDF and autoTable
  const generatePDF = useCallback(() => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "A4",
    });
    autoTable(doc, {
      head: [["#", "Vendor Code", "Name", "Contact", "Address", "Active"]],
      body: filteredVendors.map((vendor, index) => [
        index + 1,
        vendor.code,
        vendor.name,
        vendor.contactNum,
        vendor.address,
        vendor.active ? "Yes" : "No",
      ]),
    });
    doc.save("vendor_list.pdf");
  }, [filteredVendors]);

  // When a vendor is clicked, set the viewingVendorId
  const handleVendorClick = (vendorId) => {
    console.log("Vendor clicked:", vendorId);
    setViewingVendorId(vendorId);
  };

  const toggleView = (targetView) => {
    if (targetView !== "list") {
      console.log("Toggle function working: View changed to", targetView);
      // You can expand view logic here if needed
    } else {
      console.log("View did not change");
    }
  };

  // Go back to vendor list view from detail view
  const goBack = () => {
    setViewingVendorId(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-black-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-2 text-zinc-800 text-sm font-small">
          Loading vendor list...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-grey-400 p-4 min-h-screen">
      <ToastContainer />
      <div className="rounded-full mb-5">
        {viewingVendorId ? (
          <VendorDetail
            toggleView={toggleView}
            vendorId={viewingVendorId}
            goBack={goBack}
          />
        ) : (
          <>
            {/* Header */}
            <div className="flex justify-between space-x-2">
              <h1 className="text-xl font-bold mb-2">Vendor Lists</h1>
              <div className="flex justify-end items-center gap-1">
                <button
                  onClick={handleAddVendor}
                  className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
                >
                  + Add
                </button>
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedVendors.length === 0}
                  className={`h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition ${
                    selectedVendors.length > 0
                      ? "hover:text-blue-700 hover:scale-[1.02]"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  Delete
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
                <label className="h-8 px-3 flex items-center border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02] cursor-pointer">
                  <input
                    type="file"
                    accept=".xls,.xlsx"
                    onChange={importFromExcel}
                    className="hidden"
                  />
                  Import
                </label>
              </div>
            </div>

            {/* Search, Sort, and Filter */}
            <div className="flex flex-wrap items-center justify-between p-2 bg-white rounded-md shadow mb-2 space-y-3 md:space-y-0 md:space-x-4">
              <div className="flex items-center space-x-4">
                {/* Sort By */}
                <div className="relative">
                  <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={selectedOption}
                    onChange={handleFilterChange}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="" disabled>
                      Sort By
                    </option>
                    <option value="vendor Name">Vendor Name</option>
                    <option value="vendor Account no">Vendor Account No</option>
                    <option value="vendor Account no descending">
                      Descending Account No
                    </option>
                  </select>
                </div>

                {/* Filter By Status */}
                <div className="relative">
                  <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={selectedOption}
                    onChange={handleFilterChange}
                    className="pl-10 pr-4 py-2 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
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
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    <FaSearch className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Reset Filter */}
              <button
                onClick={resetFilters}
                className="text-red-500 hover:text-red-600 font-medium"
              >
                Reset Filter
              </button>
            </div>

            {/* Vendor Table */}
            <div className="border border-green-500 rounded-lg bg-white p-10 overflow-hidden">
              <div className="h-[460px] overflow-y-auto">
                <table className="min-w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">
                        <input
                          type="checkbox"
                          onChange={() =>
                            setSelectedVendors(
                              selectedVendors.length
                                ? []
                                : vendorList.map((c) => c._id)
                            )
                          }
                          checked={selectedVendors.length === vendorList.length}
                        />
                      </th>
                      <th className="px-6 py-2 text-sm font-medium whitespace-nowrap">
                        Vendor Account
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Name
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Contact No.
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Address
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        PAN
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Currency
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Registration No.
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Active
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVendors.map((vendor) => (
                      <tr key={vendor._id}>
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={selectedVendors.includes(vendor._id)}
                            onChange={() =>
                              setSelectedVendors((prev) =>
                                prev.includes(vendor._id)
                                  ? prev.filter((id) => id !== vendor._id)
                                  : [...prev, vendor._id]
                              )
                            }
                          />
                        </td>
                        <td>
                          <button
                            className="text-blue-600 hover:underline ml-6 focus:outline-none"
                            onClick={() => handleVendorClick(vendor._id)}
                          >
                            {vendor.code}
                          </button>
                        </td>
                        <td className="px-6 py-3 truncate">{vendor.name}</td>
                        <td className="px-6 py-3 whitespace-normal truncate">
                          {vendor.contactNum}
                        </td>
                        <td className="px-6 py-3 break-words max-w-[500px] truncate hover:whitespace-normal hover:text-sm hover:max-w-none">
                          {vendor.address}
                        </td>
                        <td className="px-6 py-3 truncate">{vendor.panNum}</td>
                        <td className="px-6 py-3 truncate">
                          {vendor.currency}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {vendor.registrationNum}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {vendor.active ? "Yes" : "No"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VendorList;
