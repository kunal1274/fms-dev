import React, { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import autoTable from "jspdf-autotable";
import { useParams } from "react-router-dom";
import { RotatingLines } from "react-loader-spinner";
import { Select } from "flowbite-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import VendorViewPage from "./VendorViewPage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
const baseUrl = "https://befr8n.vercel.app/fms/api/v0/vendors";
const VendorList = ({ handleAddVendor }) => {
  const [vendorList, setVendorList] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState([]);
  const [selectedOption, setSelectedOption] = useState("All");
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [viewingVendorId, setViewingVendorId] = useState(null);
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("list");
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const showLoader = () => {
    setLoading(true);
    toast.info(
      <div className="flex items-center gap-3">
        <RotatingLines strokeColor="green" strokeWidth="5" width="40" />
        <span className="text-green-600">Loading... Please wait</span>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
        hideProgressBar: true,
        className: "custom-toast",
      }
    );

    setTimeout(() => {
      setLoading(false);
      toast.dismiss();
    }, 3000);
  };
  // Fetch Vendors
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

  useEffect(() => {
    if (id) fetchVendorDetails(id);
  }, [id]);

  const fetchVendorDetails = async (vendorId) => {
    try {
      const response = await axios.get(`${baseUrl}/${vendorId}`);
      setViewingVendorId(response.data.data);
    } catch (error) {
      console.error("Error fetching Vendor details:", error);
    }
  };

  // Search and Filter Logic

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    const filtered = vendorList.filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(term.toLowerCase()) ||
        vendor.code.toLowerCase().includes(term.toLowerCase()) ||
        vendor.contactNum.includes(term) // Add this line to search by phone number
    );

    setFilteredVendors(filtered);
  };
  const exportToExcel = useCallback(() => {
    if (!vendorList.length) return alert("No data to export");
    const worksheet = XLSX.utils.json_to_sheet(vendorList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vendors");
    XLSX.writeFile(workbook, "Vendor_list.xlsx");
  }, [vendorList]);
  const handleDeleteSelected = async () => {
    console.log("Selected Vendors:", selectedVendors);

    if (!selectedVendors.length) {
      toast.info("No Vendors selected to delete.", { autoClose: 1000 });
      return;
    }

    if (
      !window.confirm("Are you sure you want to delete the selected Vendors?")
    ) {
      return;
    }

    try {
      // Perform delete requests for selected Vendors
      const deleteResponses = await Promise.all(
        selectedVendors.map((itemId) => {
          console.log(`Deleting Vendor with ID: ${itemId}`);
          return axios.delete(`${baseUrl}/${itemId}`);
        })
      );

      // Check if all delete requests succeeded
      toast.success("Selected Vendors deleted successfully!", {
        autoClose: 1000,
      });
      console.log("Delete responses:", deleteResponses);

      // Update state to remove deleted Vendors
      setItems((prev) =>
        prev.filter((item) => !selectedVendors.includes(item._id))
      );

      setSelectedVendors([]);

      // Optional: Refresh the page, but try to avoid if state is updated correctly
      console.log("Page refresh triggered after deletion.");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error("Error deleting Vendors:", error.response || error.message);
    }
  };

  // Import Data from Excel
  const importFromExcel = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const importedData = XLSX.utils.sheet_to_json(worksheet);
      setVendorList((prev) => [...prev, ...importedData]);
    };
    reader.readAsArrayBuffer(file);
  };

  // Export to Excel

  // Generate PDF
  const generatePDF = useCallback(() => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "A4",
    });
    autoTable(doc, {
      head: [["#", "vendor Code", "Name", "Contact", "Address", "Active"]],
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
    } else if (value === "Vendor Account no") {
      filtered = filtered.sort((a, b) => a.code.localeCompare(b.code));
      setFilteredVendors(filtered);
    } else if (value === "Vendor Account no descending") {
      filtered = filtered.sort((a, b) => b.code.localeCompare(a.code));
      setFilteredVendors(filtered);
    }
  };

  const filterVendor = (vendors, search) => {
    return vendors.filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(search.toLowerCase()) ||
        vendor.code.toLowerCase().includes(search.toLowerCase())
    );
  };

  // Function to reset filters and search input

  const filteredVendor = filterVendor(vendorList, searchTerm);
  const fetchVendor = async (vendorId) => {
    if (!vendorId.trim()) {
      setError("vendor ID cannot be empty.");
      return;
    }

    try {
      setError(null); // Clear any previous errors
      const response = await axios.get(`${baseUrl}/${vendorId}`, {
        headers: {
          // Authorization: `Bearer ${token}`, // Add token if needed
        },
        withCredentials: false,
      });
      console.log("Fetched vendor:", response.data);
      setSelectedVendor(response.data.data);
    } catch (err) {
      if (err.response) {
        setError(err.response?.data?.message || "An error occurred.");
      } else if (err.request) {
        setError("Error: No response from the server.");
      } else {
        setError(`Error: ${err.message}`);
      }
      setSelectedVendor(null);
    }
  };

  useEffect(() => {
    if (id) {
      fetchVendor(id); // Fetch using URL param id
    }
  }, [id]);

  // Fetch Vendors
  useEffect(() => {
    async function loadVendors() {
      try {
        setLoading(true);
        const response = await axios.get(baseUrl, {
          withCredentials: false,
        });
        setVendorList(response.data.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setMessage("Failed to load Vendor data.");
      }
    }
    loadVendors();
  }, []);

  // Handle Input Change

  // Go back to Vendor list view
  const goBack = () => {
    setViewingVendorId(null);
    window.location.reload();
  };

  console.log(vendorList.length);

  const handleVendorClick = (vendorId) => {
    console.log("vendor.id");
    setViewingVendorId(vendorId);
  };

  const toggleView = (targetView) => {
    if (view !== targetView) {
      setView(targetView);
      console.log("Toggle function working: View changed to", targetView);
    } else {
      console.log("Error in running function: View did not change");
    }
  };

  useEffect(() => {
    if (id) fetchVendorDetails(id);
  }, [id]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedOption("Active Status ");
    setFilteredVendors(vendorList);
  };
  {
    loading && (
      <div className="loader-container">
        <RotatingLines strokeColor="green" strokeWidth="5" width="40" />
      </div>
    );
  }
  return (
    <div className="bg-grey-400  min-h-screen">
      <div className="rounded-full mb-5">
        {viewingVendorId ? (
          <VendorViewPage
            toggleView={toggleView}
            vendorId={viewingVendorId}
            goBack={goBack}
          />
        ) : (
          <>
            <ToastContainer />
            {/* Header */}
            <div className="flex justify-between space-x-3">
              <h1 className="text-2xl font-bold mb-4">vendor Lists</h1>
              <div className="flex justify-between rounded-full mb-5">
                <div className="flex justify-end gap-4">
                  <button
                    onClick={handleAddVendor}
                    className="h-10 px-4 py-2 border border-green-500 bg-white rounded-md hover:bg-gray-100"
                  >
                    + Add
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={selectedVendors.length === 0}
                    className={`h-10 px-4 py-2 border border-green-500 bg-white rounded-md ${
                      selectedVendors.length > 0
                        ? "hover:bg-gray-100"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    Delete
                  </button>
                  <button
                    onClick={generatePDF}
                    className="h-10 px-4 py-2 border border-green-500 bg-white rounded-md hover:bg-gray-100"
                  >
                    PDF
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="h-10 px-4 py-2 border border-green-500 bg-white rounded-md hover:bg-gray-100"
                  >
                    Export
                  </button>
                  <label className="border h-10 border-green-500 bg-white rounded-md py-2 px-4">
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
            </div>
            <div className="flex flex-wrap Sales-center justify-between p-4 bg-white rounded-md shadow mb-6 space-y-4 md:space-y-0 md:space-x-4">
              {/* Left group: Sort By, Filter By Status, Search */}
              <div className="flex items-center space-x-4">
                {/* Sort By */}
                <div className="relative">
                  <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    defaultValue=""
                    value={selectedOption}
                    onChange={handleFilterChange}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="" disabled>
                      Sort By
                    </option>
                    <option value="Customer Name">Customer Name</option>
                    <option value="Customer Account no">
                      Customer Account no
                    </option>
                    <option value="Customer Account no descending">
                      Descending Account no
                    </option>
                  </select>
                </div>

                {/* Filter By Status */}
                <div className="relative">
                  <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    defaultValue="All"
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    value={selectedOption}
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
                    className="w-60 pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    value={searchTerm}
                    onChange={handleSearchChange}
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    <FaSearch className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Right side: Reset Filter */}
              <button
                className="text-red-500 hover:text-red-600 font-medium"
                onClick={() => resetFilters(setSearch, setFilters)} // Pass setSearch and setFilters
              >
                Reset Filter
              </button>
            </div>
            {/* vendor Table */}
            <div className="border border-green-500 rounded-lg bg-white p-4 overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 border border-gray-300 text-left">
                        {" "}
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
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        vendor Account
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
                        <td>
                          <th className="px-4 py-2 border-white-300 text-left">
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
                          </th>
                        </td>
                        <td>
                          <button onClick={() => handleVendorClick(vendor._id)}>
                            {vendor.code}
                          </button>
                        </td>
                        <td className="px-6 py-3 truncate">{vendor.name}</td>
                        <td className="px-6 py-3 truncate">
                          {vendor.contactNum}
                        </td>
                        <td className="px-6 py-3 truncate">{vendor.address}</td>
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
