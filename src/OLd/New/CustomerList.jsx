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
            <>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <h1 className="text-xl font-bold mb-2">Customer Lists</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleAddCustomer}
                    className="w-full sm:w-auto h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-105"
                  >
                    + Add
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={selectedCustomers.length === 0}
                    className={`w-full sm:w-auto h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition ${
                      selectedCustomers.length > 0
                        ? "hover:text-blue-700 hover:scale-105"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    Delete
                  </button>
                  <button
                    onClick={generatePDF}
                    className="w-full sm:w-auto h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-105"
                  >
                    PDF
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="w-full sm:w-auto h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-105"
                  >
                    Export
                  </button>
                  <label className="w-full sm:w-auto h-8 px-3 flex items-center border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-105 cursor-pointer">
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

              {/* Search, Sort, and Filter Controls */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between p-2 bg-white rounded-md shadow mb-2 space-y-3 md:space-y-0 md:space-x-4">
                {/* Left Group: Sort By, Filter By Status, Search */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
                  {/* Sort By */}
                  <div className="relative w-full sm:w-auto">
                    <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      value={selectedOption}
                      onChange={handleFilterChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      <option value="">Sort By</option>
                      <option value="Customer Name">Customer Name</option>
                      <option value="Customer Account no">
                        Customer Account in Ascending
                      </option>
                      <option value="Customer Account no descending">
                        Customer Account in Descending
                      </option>
                    </select>
                  </div>

                  {/* Filter By Status */}
                  <div className="relative w-full sm:w-auto">
                    <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      value={selectedOption}
                      onChange={handleFilterChange}
                      className="w-full pl-10 pr-4 py-2 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      <option value="All">Filter By Status</option>
                      <option value="yes">Active</option>
                      <option value="no">Inactive</option>
                    </select>
                  </div>

                  {/* Search */}
                  <div className="relative w-full sm:w-60">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
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
                  className="text-red-500 hover:text-red-600 font-medium self-start sm:self-auto"
                >
                  Reset Filter
                </button>
              </div>

              {/* Customer Table */}
              <div className="border border-green-500 rounded-lg bg-white p-4 md:p-10 overflow-x-auto">
                <div className="overflow-y-auto">
                  <table className="min-w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-2 py-1 sm:px-4 sm:py-2 text-left">
                          <input
                            type="checkbox"
                            onChange={() =>
                              setSelectedCustomers(
                                selectedCustomers.length
                                  ? []
                                  : customerList.map((c) => c._id)
                              )
                            }
                            checked={
                              selectedCustomers.length === customerList.length
                            }
                          />
                        </th>
                        <th className="px-2 py-1 sm:px-4 sm:py-2 text-left">
                          Customer Account
                        </th>
                        <th className="px-2 py-1 sm:px-4 sm:py-2 text-left">
                          Name
                        </th>
                        <th className="px-2 py-1 sm:px-4 sm:py-2 text-left">
                          Contact No.
                        </th>
                        <th className="px-2 py-1 sm:px-4 sm:py-2 text-left">
                          Address
                        </th>
                        <th className="px-2 py-1 sm:px-4 sm:py-2 text-left">
                          PAN
                        </th>
                        <th className="px-2 py-1 sm:px-4 sm:py-2 text-left">
                          Currency
                        </th>
                        <th className="px-2 py-1 sm:px-4 sm:py-2 text-left">
                          Registration No.
                        </th>
                        <th className="px-2 py-1 sm:px-4 sm:py-2 text-left">
                          Active
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((customer) => (
                        <tr
                          key={customer._id}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-2 py-1 sm:px-4 sm:py-2">
                            <input
                              type="checkbox"
                              checked={selectedCustomers.includes(customer._id)}
                              onChange={() =>
                                setSelectedCustomers((prev) =>
                                  prev.includes(customer._id)
                                    ? prev.filter((id) => id !== customer._id)
                                    : [...prev, customer._id]
                                )
                              }
                            />
                          </td>
                          <td className="px-2 py-1 sm:px-4 sm:py-2">
                            <button
                              className="text-blue-600 hover:underline focus:outline-none"
                              onClick={() => handleCustomerClick(customer._id)}
                            >
                              {customer.code}
                            </button>
                          </td>
                          <td className="px-2 py-1 sm:px-4 sm:py-2 truncate">
                            {customer.name}
                          </td>
                          <td className="px-2 py-1 sm:px-4 sm:py-2 whitespace-normal truncate">
                            {customer.contactNum}
                          </td>
                          <td className="px-2 py-1 sm:px-4 sm:py-2 break-words max-w-[200px] sm:max-w-[500px] truncate hover:whitespace-normal hover:text-sm hover:max-w-none">
                            {customer.address}
                          </td>
                          <td className="px-2 py-1 sm:px-4 sm:py-2 truncate">
                            {customer.panNum}
                          </td>
                          <td className="px-2 py-1 sm:px-4 sm:py-2 truncate">
                            {customer.currency}
                          </td>
                          <td className="px-2 py-1 sm:px-4 sm:py-2 truncate">
                            {customer.registrationNum}
                          </td>
                          <td className="px-2 py-1 sm:px-4 sm:py-2 truncate">
                            {customer.active ? "Yes" : "No"}
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
    </div>
  );
};

export default CustomerList;
