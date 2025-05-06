import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import { useParams } from "react-router-dom";
import CustomerDetail from "./CustomerViewPage";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const baseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/customers";

const CustomerList = ({ handleAddCustomer }) => {
  const [customerList, setCustomerList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState([]);
  const [selectedOption, setSelectedOption] = useState("All");
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [viewingCustomerId, setViewingCustomerId] = useState(null);
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("list");
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(baseUrl);
      setCustomerList(response.data.data);
      setFilteredCustomers(response.data.data);
    } catch (error) {
      console.error("Failed to load customers:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const importFromExcel = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    // Catch errors during file reading
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

        // Validate for duplicate registration numbers or PAN numbers locally
        const duplicateErrors = [];
        const seenRegistrations = new Set();
        const seenPans = new Set();

        importedData.forEach((customer, index) => {
          if (customer.registrationNo) {
            if (seenRegistrations.has(customer.registrationNo)) {
              duplicateErrors.push(
                `Duplicate registration number: ${
                  customer.registrationNo
                } at row ${index + 1}`
              );
            } else {
              seenRegistrations.add(customer.registrationNo);
            }
          }
          if (customer.pan) {
            if (seenPans.has(customer.pan)) {
              duplicateErrors.push(
                `Duplicate PAN: ${customer.pan} at row ${index + 1}`
              );
            } else {
              seenPans.add(customer.pan);
            }
          }
        });

        if (duplicateErrors.length > 0) {
          toast.error(`Errors occurred:\n${duplicateErrors.join("\n")}`, {
            autoClose: 1000,
            onClose: () => fetchCustomers(), // Refresh even if duplicate errors exist
          });
          return; // Exit if duplicates are found
        }

        // Post each customer and count successes and failures
        let successCount = 0;
        const errors = [];
        for (let i = 0; i < importedData.length; i++) {
          const customer = importedData[i];
          try {
            const response = await axios.post(baseUrl, customer, {
              headers: { "Content-Type": "application/json" },
            });
            successCount++;
            toast.success(
              `Successfully posted customer ${i + 1}`,
              response.data
            );
          } catch (err) {
            console.error(`Error posting customer ${i + 1}:`, err);
            errors.push(
              `Error ${i + 1}: ${err.response?.data.err || err.message}`
            );
            toast.error(
              `Error importing customer ${i + 1}: ${
                err.response?.data || err.message
              }`
            );
          }
        }

        // Display a summary toast and refresh the customer list on close
        if (successCount === importedData.length) {
          toast.success(
            `All ${successCount} data imported and posted successfully!`,
            {
              autoClose: 1000,
              onClose: () => fetchCustomers(),
            }
          );
        } else {
          toast.error(
            `Import Summary:\nSuccessfully imported: ${successCount}\nFailed: ${
              importedData.length - successCount
            }\nErrors:\n${errors.join("\n")}`,
            {
              autoClose: 1000,
              onClose: () => fetchCustomers(),
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

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    if (id) fetchCustomerDetails(id);
  }, [id]);

  const fetchCustomerDetails = async (customerId) => {
    try {
      const response = await axios.get(`${baseUrl}/${customerId}`);
      setViewingCustomerId(response.data.data);
    } catch (error) {
      console.error("Error fetching customer details:", error);
    }
  };

  // Search and Filter Logic
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    const filtered = customerList.filter(
      (customer) =>
        customer.name.toLowerCase().includes(term.toLowerCase()) ||
        customer.code.toLowerCase().includes(term.toLowerCase()) ||
        customer.contactNum.includes(term)
    );

    setFilteredCustomers(filtered);
  };

  const handleDeleteSelected = async () => {
    if (!selectedCustomers || selectedCustomers.length === 0) {
      toast.info("No customers selected to delete.", { autoClose: 1000 });
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete the selected customers?"
    );
    if (!confirmed) return;

    try {
      const deleteResponses = await Promise.allSettled(
        selectedCustomers.map((customerId) =>
          axios.delete(`${baseUrl}/${customerId}`)
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
          `${successfulDeletes.length} customer(s) deleted successfully!`,
          {
            autoClose: 1000,
          }
        );

        setCustomerList((prev) =>
          prev.filter((customer) => !selectedCustomers.includes(customer._id))
        );
        setFilteredCustomers((prev) =>
          prev.filter((customer) => !selectedCustomers.includes(customer._id))
        );
        setSelectedCustomers([]);
      }

      if (failedDeletes.length > 0) {
        toast.error(
          `${failedDeletes.length} deletion(s) failed. Check console for details.`
        );
        failedDeletes.forEach((err, index) => {
          console.error(
            `Error deleting customer ${selectedCustomers[index]}:`,
            err.reason?.response || err.reason
          );
        });
      }
    } catch (error) {
      console.error(
        "Unexpected error during deletion:",
        error.response || error.message
      );
      toast.error("An unexpected error occurred while deleting customers.");
    }
  };

  // Export Data from Excel and PDF Generation

  const exportToExcel = useCallback(() => {
    if (!customerList.length) return alert("No data to export");
    const worksheet = XLSX.utils.json_to_sheet(customerList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    XLSX.writeFile(workbook, "customer_list.xlsx");
  }, [customerList]);

  const generatePDF = useCallback(() => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "A4",
    });
    autoTable(doc, {
      head: [["#", "Customer Code", "Name", "Contact", "Address", "Active"]],
      body: filteredCustomers.map((customer, index) => [
        index + 1,
        customer.code,
        customer.name,
        customer.contactNum,
        customer.address,
        customer.active ? "Yes" : "No",
      ]),
    });
    doc.save("customer_list.pdf");
  }, [filteredCustomers]);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setSelectedOption(value);

    let filtered = [...customerList];

    if (value === "All") {
      setFilteredCustomers(filtered);
    } else if (value === "yes") {
      setFilteredCustomers(
        filtered.filter((customer) => customer.active === true)
      );
    } else if (value === "no") {
      setFilteredCustomers(
        filtered.filter((customer) => customer.active === false)
      );
    } else if (value === "Customer Name") {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
      setFilteredCustomers(filtered);
    } else if (value === "Customer Account no") {
      filtered = filtered.sort((a, b) => a.code.localeCompare(b.code));
      setFilteredCustomers(filtered);
    } else if (value === "Customer Account no descending") {
      filtered = filtered.sort((a, b) => b.code.localeCompare(a.code));
      setFilteredCustomers(filtered);
    }
  };

  const filterCustomer = (customers, search) => {
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.code.toLowerCase().includes(search.toLowerCase())
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedOption("Active Status ");
    setFilteredCustomers(customerList);
  };

  // Function to fetch an individual customer using customer id
  const fetchCustomer = async (customerId) => {
    if (!customerId.trim()) {
      setError("Customer ID cannot be empty.");
      return;
    }

    try {
      setError(null); // Clear any previous errors
      const response = await axios.get(`${baseUrl}/${customerId}`, {
        headers: {
          // Add Authorization token if needed
        },
        withCredentials: false,
      });
      console.log("Fetched Customer:", response.data);
      setSelectedCustomer(response.data.data);
    } catch (err) {
      if (err.response) {
        setError(err.response?.data?.message || "An error occurred.");
      } else if (err.request) {
        setError("Error: No response from the server.");
      } else {
        setError(`Error: ${err.message}`);
      }
      setSelectedCustomer(null);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCustomer(id); // Fetch using URL param id
    }
  }, [id]);

  // Fetch Customers on component mount
  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        const response = await axios.get(baseUrl, { withCredentials: false });
        setCustomerList(response.data.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setMessage("Failed to load customer data.");
      }
    }
    loadCustomers();
  }, []);

  // Go back to customer list view
  const goBack = () => {
    setViewingCustomerId(null);
    window.location.reload();
  };

  const handleCustomerClick = (customerId) => {
    console.log("Customer clicked:", customerId);
    setViewingCustomerId(customerId);
  };

  const toggleView = (targetView) => {
    if (view !== targetView) {
      setView(targetView);
      console.log("Toggle function working: View changed to", targetView);
    } else {
      console.log("Error: View did not change");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-black border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-2 text-gray-800 text-sm font-small">
          Customer list ...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-400 p-4 min-h-screen">
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        <div className="rounded-md mb-5">
          {viewingCustomerId ? (
            <CustomerDetail
              toggleView={toggleView}
              customerId={viewingCustomerId}
              goBack={goBack}
            />
          ) : (
            <div className="space-y-6">
              <ToastContainer />
              {/* Header Buttons */}
              <div className="flex justify-between ">
                <div className="flex items-center space-x-2">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSidyDz4vUFPC_pC4WT44M-8OE1iyO2TcSr0Q&s"
                    alt="Logo"
                    className="w-13 h-8 object-contain"
                  />
                  <h3 className="text-xl font-semibold">Customer List</h3>
                </div>
                <div className="flex items-center gap-3 ">
                  <button
                    onClick={handleAddCustomer}
                    className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
                  >
                    + Add
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={!selectedCustomers.length}
                    className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
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
                    c
                    className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
                  >
                    Export
                  </button>
                </div>
              </div>

              {/* Metrics */}
              <div className=" bg-white rounded-lg ">
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                  <button
                    onClick={fetchMetrics}
                    className="px-3 py-1 border rounded"
                  >
                    {loadingMetrics ? "Applying…" : "Apply"}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                  {[
                    ["Total Customers", customerSummary.count],
                    ["Credit Limit", customerSummary.creditLimit],
                    ["Paid Customers", customerSummary.paidCustomers],
                    ["Active Customers", customerSummary.activeCustomers],
                    ["On‑Hold Customers", customerSummary.onHoldCustomers],
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
                      value={selectedOption}
                      onChange={handleFilterChange}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      <option value="">Sort By</option>
                      <option value="Customer Name">Customer Name</option>
                      <option value="Customer Account no">
                        Customer Account in Ascending
                      </option>
                      <option value="Customer Account no descending">
                        Customer Account in descending
                      </option>
                    </select>
                  </div>

                  {/* Filter By Status */}
                  <div className="relative">
                    <FaFilter className=" text-sm absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      defaultValue="All"
                      className="pl-10 pr-4 py-2 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
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
                      className="w-60 pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  onClick={resetFilters}
                  className="text-red-500 hover:text-red-600 font-medium"
                >
                  Reset Filter
                </button>
              </div>
              <div className="flex">
                {" "}
                <ul className="flex space-x-6 list-none p-0 m-0">
                  {tabNames.map((tab) => (
                    <li
                      key={tab}
                      onClick={() => onTabClick(tab)}
                      className={`cursor-pointer pb-2 transition-colors ${
                        activeTab === tab
                          ? "text-green-600 border-b-2 border-green-600"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      {tab}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Data Table */}
              <div className="table-scroll-container h-[400px] overflow-auto bg-white rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="sticky top-0 z-10 px-4 py-2 bg-gray-50">
                        <input
                          type="checkbox"
                          onChange={toggleSelectAll}
                          checked={
                            selectedCustomers.length ===
                              filteredCustomers.length &&
                            filteredCustomers.length > 0
                          }
                          className="form-checkbox"
                        />
                      </th>
                      {["Code", "Name", "Address", "Contact", "Status"].map(
                        (h) => (
                          <th
                            key={h}
                            className="sticky top-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomers.length ? (
                      filteredCustomers.map((c) => (
                        <tr
                          key={c.code}
                          className="hover:bg-gray-100 transition-colors"
                        >
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={selectedCustomers.includes(c._id)}
                              onChange={() => handleCheckboxChange(c._id)}
                              className="form-checkbox"
                            />
                          </td>
                          <td
                            onClick={() => onView(c.code)}
                            className="px-6 py-4 cursor-pointer text-blue-600 hover:underline"
                          >
                            {c.code}
                          </td>
                          <td className="px-6 py-4">{c.name}</td>
                          <td className="px-6 py-4">{c.address}</td>
                          <td className="px-6 py-4">{c.contactNum}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                c.active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {c.active ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerList;
