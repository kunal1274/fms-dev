import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import { useParams } from "react-router-dom";
import CustomerDetail from "./CustomerViewPage";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import { Select } from "flowbite-react";
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
        customer.contactNum.includes(term) // Add this line to search by phone number
    );

    setFilteredCustomers(filtered);
  };

  const handleDeleteSelected = async () => {
    console.log("Selected customers:", selectedCustomers);

    if (!selectedCustomers.length) {
      toast.info("No customers selected to delete.", { autoClose: 1000 });
      return;
    }

    if (
      !window.confirm("Are you sure you want to delete the selected customers?")
    ) {
      return;
    }

    try {
      // Perform delete requests for selected customers
      const deleteResponses = await Promise.all(
        selectedCustomers.map((itemId) => {
          console.log(`Deleting customer with ID: ${itemId}`);
          return axios.delete(`${baseUrl}/${itemId}`);
        })
      );

      // Check if all delete requests succeeded
      toast.success("Selected customers deleted successfully!", {
        autoClose: 1000,
      });
      console.log("Delete responses:", deleteResponses);

      // Update state to remove deleted customers
      setItems((prev) =>
        prev.filter((item) => !selectedCustomers.includes(item._id))
      );

      setSelectedCustomers([]);

      // Optional: Refresh the page, but try to avoid if state is updated correctly
      console.log("Page refresh triggered after deletion.");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error(
        "Error deleting customers:",
        error.response || error.message
      );
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
      setCustomerList((prev) => [...prev, ...importedData]);
    };
    reader.readAsArrayBuffer(file);
  };

  // Export to Excel
  const exportToExcel = useCallback(() => {
    if (!customerList.length) return alert("No data to export");
    const worksheet = XLSX.utils.json_to_sheet(customerList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    XLSX.writeFile(workbook, "customer_list.xlsx");
  }, [customerList]);

  // Generate PDF
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

  // Function to reset filters and search input

  const filteredCustomer = filterCustomer(customerList, searchTerm);
  const fetchCustomer = async (customerId) => {
    if (!customerId.trim()) {
      setError("Customer ID cannot be empty.");
      return;
    }

    try {
      setError(null); // Clear any previous errors
      const response = await axios.get(`${baseUrl}/${customerId}`, {
        headers: {
          // Authorization: `Bearer ${token}`, // Add token if needed
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

  // Fetch Customers
  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        const response = await axios.get(baseUrl, {
          withCredentials: false,
        });
        setCustomerList(response.data.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setMessage("Failed to load customer data.");
      }
    }
    loadCustomers();
  }, []);

  // Handle Input Change

  // Go back to customer list view
  const goBack = () => {
    setViewingCustomerId(null);
    window.location.reload();
  };

  console.log(customerList.length);

  const handleCustomerClick = (customerId) => {
    console.log("customer.id");
    setViewingCustomerId(customerId);
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
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    if (id) fetchCustomerDetails(id);
  }, [id]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedOption("Active Status ");
    setFilteredCustomers(customerList);
  };
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-black-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-800 text-lg font-medium">
          {" "}
          Customer list ...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-grey-400 p-8 min-h-screen">
      <ToastContainer />
      <div className="rounded-full mb-5">
        {viewingCustomerId ? (
          <CustomerDetail
            toggleView={toggleView}
            customerId={viewingCustomerId}
            goBack={goBack}
          />
        ) : (
          <>
            {/* Header */}
            <div className="flex justify-between space-x-3">
              <h1 className="text-2xl font-bold mb-4">Customer Lists</h1>
              <div className="flex justify-between rounded-full mb-5">
                <div className="flex justify-end gap-4">
                  <button
                    onClick={handleAddCustomer}
                    className="h-10 px-4 py-2 border border-green-500 bg-white rounded-md hover:bg-gray-100"
                  >
                    + Add
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={selectedCustomers.length === 0}
                    className={`h-10 px-4 py-2 border border-green-500 bg-white rounded-md ${
                      selectedCustomers.length > 0
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

            {/* new */}
            <div className="flex flex-wrap Sales-center justify-between p-4 bg-white rounded-md shadow mb-6 space-y-4 md:space-y-0 md:space-x-4">
              {/* Left group: Sort By, Filter By Status, Search */}
              <div className="flex items-center space-x-4">
                {/* Sort By */}
                <div className="relative">
                  <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400" />
                  <select
                    defaultValue=""
                    value={selectedOption}
                    onChange={handleFilterChange}
                    className="pl-10 pr-4 py-2 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
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
                  <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400" />
                  <select
                    defaultValue="All"
                    className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
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

            {/* new */}

            {/* Customer Table */}
            <div className="border border-green-500 rounded-lg bg-white p-8 overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 border border-gray-300 text-left">
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
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Customer Account
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
                    {filteredCustomers.map((customer) => (
                      <tr key={customer._id}>
                        <td>
                          <th className="px-4 py-2 border-white-300 text-left">
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
                          </th>
                        </td>
                        <td>
                          <button
                            onClick={() => handleCustomerClick(customer._id)}
                          >
                            {customer.code}
                          </button>
                        </td>
                        <td className="px-6 py-3 truncate">{customer.name}</td>
                        <td className="px-6 py-3 whitespace-normal truncate">
                          {customer.contactNum}
                        </td>
                        <td className="px-6 py-3 break-words max-w-[500px] truncate">
                          {customer.address}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {customer.panNum}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {customer.currency}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {customer.registrationNum}
                        </td>
                        <td className="px-6 py-3 truncate">
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
  );
};

export default CustomerList;
