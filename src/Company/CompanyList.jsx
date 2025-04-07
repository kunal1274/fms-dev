import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import { useParams } from "react-router-dom";
import CompaniesDetail from "./CompanyViewPage";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import { Select } from "flowbite-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const baseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/companies";

const CompaniesList = ({ handleAddCompanies }) => {
  const [CompaniesList, setCompaniesList] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedOption, setSelectedOption] = useState("All");
  const [selectedCompaniess, setSelectedCompaniess] = useState([]);
  const [viewingCompaniesId, setViewingCompaniesId] = useState(null);
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("list");
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filteredCompaniess, setFilteredCompaniess] = useState([]);

  // Fetch Companiess
  const fetchCompaniess = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(baseUrl);
      setCompaniesList(response.data.data);
      setFilteredCompaniess(response.data.data);
    } catch (error) {
      console.error.error("Failed to load Companiess:", error);
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

        importedData.forEach((Companies, index) => {
          if (Companies.registrationNo) {
            if (seenRegistrations.has(Companies.registrationNo)) {
              duplicateErrors.push(
                `Finding the duplicate registration number: ${
                  Companies.registrationNo
                } at row ${index + 1}`
              );
            } else {
              seenRegistrations.add(Companies.registrationNo);
            }
          }
          if (Companies.pan) {
            if (seenPans.has(Companies.pan)) {
              duplicateErrors.push(
                `Companies PAN match: ${Companies.pan} at row ${index + 1}`
              );
            } else {
              seenPans.add(Companies.pan);
            }
          }
        });

        if (duplicateErrors.length > 0) {
          toast.error(`Errors occurred:\n${duplicateErrors.join("\n")}`, {
            autoClose: 1000,
            onClose: () => fetchCompaniess(), // Refresh even if duplicate errors exist
          });
          return; // Exit if duplicates are found
        }

        // Post each Companies and count successes and failures
        let successCount = 0;
        const errors = [];
        for (let i = 0; i < importedData.length; i++) {
          const Companies = importedData[i];
          try {
            const response = await axios.post(baseUrl, Companies, {
              headers: { "Content-Type": "application/json" },
            });
            successCount++;
            toast.success(
              `Successfully posted Companies ${i + 1}`,
              response.data
            );
          } catch (err) {
            console.error(`error ${i + 1}:`, err);
            errors.push(
              `error ${i + 1}: ${err.response?.data.err || err.message}`
            );
            toast.error(
              `error in import  ${i + 1}`,
              err.response?.data || err.message
            );
          }
        }

        // Display a summary toast and refresh the Companies list on close
        if (successCount === importedData.length) {
          toast.success(
            `All ${successCount} data imported and posted successfully!`,
            {
              autoClose: 1000,
              onClose: () => fetchCompaniess(),
            }
          );
        } else {
          toast.error(
            `Import Summary:\nSuccessfully imported: ${successCount}\nFailed: ${
              importedData.length - successCount
            }\nErrors:\n${errors.join("\n")}`,
            {
              autoClose: 1000,
              onClose: () => fetchCompaniess(),
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
    fetchCompaniess();
  }, [fetchCompaniess]);

  useEffect(() => {
    if (id) fetchCompaniesDetails(id);
  }, [id]);

  const fetchCompaniesDetails = async (CompaniesId) => {
    try {
      const response = await axios.get(`${baseUrl}/${CompaniesId}`);
      setViewingCompaniesId(response.data.data);
    } catch (error) {
      console.error("Error fetching Companies details:", error);
    }
  };

  // Search and Filter Logic

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    const filtered = CompaniesList.filter(
      (Companies) =>
        Companies.name.toLowerCase().includes(term.toLowerCase()) ||
        Companies.code.toLowerCase().includes(term.toLowerCase()) ||
        Companies.contactNum.includes(term) // Add this line to search by phone number
    );

    setFilteredCompaniess(filtered);
  };

  const handleDeleteSelected = async () => {
    if (!selectedCompaniess || selectedCompaniess.length === 0) {
      toast.info("No Companiess selected to delete.", { autoClose: 1000 });
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete the selected Companiess?"
    );
    if (!confirmed) return;

    try {
      const deleteResponses = await Promise.allSettled(
        selectedCompaniess.map((CompaniesId) =>
          axios.delete(`${baseUrl}/${CompaniesId}`)
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
          `${successfulDeletes.length} Companies(s) deleted successfully!`,
          {
            autoClose: 1000,
          }
        );

        setCompaniesList((prev) =>
          prev.filter((Companies) => !selectedCompaniess.includes(Companies._id))
        );
        setFilteredCompaniess((prev) =>
          prev.filter((Companies) => !selectedCompaniess.includes(Companies._id))
        );

        setSelectedCompaniess([]);
      }

      if (failedDeletes.length > 0) {
        toast.error(
          `${failedDeletes.length} deletion(s) failed. Check console for details.`
        );
        failedDeletes.forEach((err, index) => {
          console.error(
            `Error deleting Companies ${selectedCompaniess[index]}:`,
            err.reason?.response || err.reason
          );
        });
      }
    } catch (error) {
      console.error(
        "Unexpected error during deletion:",
        error.response || error.message
      );
      toast.error("An unexpected error occurred while deleting Companiess.");
    }
  };

  // Import Data from Excel

  // Export to Excel
  const exportToExcel = useCallback(() => {
    if (!CompaniesList.length) return alert("No data to export");
    const worksheet = XLSX.utils.json_to_sheet(CompaniesList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Companiess");
    XLSX.writeFile(workbook, "Companies_list.xlsx");
  }, [CompaniesList]);

  // Generate PDF
  const generatePDF = useCallback(() => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "A4",
    });
    autoTable(doc, {
      head: [["#", "Companies Code", "Name", "Contact", "Address", "Active"]],
      body: filteredCompaniess.map((Companies, index) => [
        index + 1,
        Companies.code,
        Companies.name,
        Companies.contactNum,
        Companies.address,
        Companies.active ? "Yes" : "No",
      ]),
    });
    doc.save("Companies_list.pdf");
  }, [filteredCompaniess]);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setSelectedOption(value);

    let filtered = [...CompaniesList];

    if (value === "All") {
      setFilteredCompaniess(filtered);
    } else if (value === "yes") {
      setFilteredCompaniess(
        filtered.filter((Companies) => Companies.active === true)
      );
    } else if (value === "no") {
      setFilteredCompaniess(
        filtered.filter((Companies) => Companies.active === false)
      );
    } else if (value === "Companies Name") {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
      setFilteredCompaniess(filtered);
    } else if (value === "Companies Account no") {
      filtered = filtered.sort((a, b) => a.code.localeCompare(b.code));
      setFilteredCompaniess(filtered);
    } else if (value === "Companies Account no descending") {
      filtered = filtered.sort((a, b) => b.code.localeCompare(a.code));
      setFilteredCompaniess(filtered);
    }
  };

  const filterCompanies = (Companiess, search) => {
    return Companiess.filter(
      (Companies) =>
        Companies.name.toLowerCase().includes(search.toLowerCase()) ||
        Companies.code.toLowerCase().includes(search.toLowerCase())
    );
  };
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedOption("Active Status ");
    setFilteredCompaniess(CompaniesList);
  };
  // Function to reset filters and search input

  const filteredCompanies = filterCompanies(CompaniesList, searchTerm);
  const fetchCompanies = async (CompaniesId) => {
    if (!CompaniesId.trim()) {
      setError("Companies ID cannot be empty.");
      return;
    }

    try {
      setError(null); // Clear any previous errors
      const response = await axios.get(`${baseUrl}/${CompaniesId}`, {
        headers: {
          // Authorization: `Bearer ${token}`, // Add token if needed
        },
        withCredentials: false,
      });
      console.log("Fetched Companies:", response.data);
      setSelectedCompanies(response.data.data);
    } catch (err) {
      if (err.response) {
        setError(err.response?.data?.message || "An error occurred.");
      } else if (err.request) {
        setError("Error: No response from the server.");
      } else {
        setError(`Error: ${err.message}`);
      }
      setSelectedCompanies(null);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCompanies(id); // Fetch using URL param id
    }
  }, [id]);

  // Fetch Companiess
  useEffect(() => {
    async function loadCompaniess() {
      try {
        setLoading(true);
        const response = await axios.get(baseUrl, {
          withCredentials: false,
        });
        setCompaniesList(response.data.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setMessage("Failed to load Companies data.");
      }
    }
    loadCompaniess();
  }, []);

  // Handle Input Change

  // Go back to Companies list view
  const goBack = () => {
    setViewingCompaniesId(null);
    window.location.reload();
  };

  console.log(CompaniesList.length);

  const handleCompaniesClick = (CompaniesId) => {
    console.log("Companies.id");
    setViewingCompaniesId(CompaniesId);
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
    fetchCompaniess();
  }, [fetchCompaniess]);

  useEffect(() => {
    if (id) fetchCompaniesDetails(id);
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-black-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-2 text-zinc-800 text-sm font-small">
          {" "}
          Companies list ...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-grey-400 p-4 min-h-screen">
      <ToastContainer />
      <div className="rounded-full mb-5">
        {viewingCompaniesId ? (
          <CompaniesDetail
            toggleView={toggleView}
            CompaniesId={viewingCompaniesId}
            goBack={goBack}
          />
        ) : (
          <>
            {/* Header */}
            <div className="flex justify-between space-x-2">
              <h1 className="text-xl font-bold mb-2  ">Companies Lists</h1>

              <div className="flex justify-between rounded-full mb-3">
                <div className="flex justify-end items-center gap-1">
                  <button
                    onClick={handleAddCompanies}
                    className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
                  >
                    + Add
                  </button>

                  <button
                    onClick={handleDeleteSelected}
                    disabled={selectedCompaniess.length === 0}
                    className={`h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition ${
                      selectedCompaniess.length > 0
                        ? " hover:text-blue-700 hover:scale-[1.02]"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    Delete
                  </button>
                  <button
                    onClick={generatePDF}
                    className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition  hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02] hover:scale-[1.02]"
                  >
                    PDF
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition  hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
                  >
                    Export
                  </button>
                  <label className="h-8 px-3 flex items-center border border-green-500 bg-white text-sm rounded-md transition  hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02] cursor-pointer">
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
            <div className="flex flex-wrap Sales-center text-sm justify-between p-2 bg-white rounded-md shadow mb-2 space-y-3 md:space-y-0 md:space-x-4">
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
                    <option value="" >
                      Sort By
                    </option>
                    <option value="Companies Name">Companies Name</option>
                    <option value="Companies Account no">
                      Companies Account no
                    </option>
                    <option value="Companies Account no descending">
                      Descending Account no
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

            {/* new */}

            {/* Companies Table */}
            <div className="border border-green-500 rounded-lg bg-white p-10 overflow-hidden">
              <div className="h-[460px] overflow-y-auto">
                <table className="min-w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2  border-gray-300 text-left">
                        <input
                          type="checkbox"
                          onChange={() =>
                            setSelectedCompaniess(
                              selectedCompaniess.length
                                ? []
                                : CompaniesList.map((c) => c._id)
                            )
                          }
                          checked={
                            selectedCompaniess.length === CompaniesList.length
                          }
                        />
                      </th>
                      <th className="px-6 py-2 text-sm font-medium whitespace-nowrap">
                        Companies Account
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
                    {filteredCompaniess.map((Companies) => (
                      <tr key={Companies._id}>
                        <td>
                          <th className=" px-4 py-2 border-white-300 text-left">
                            <input
                              type="checkbox"
                              checked={selectedCompaniess.includes(Companies._id)}
                              onChange={() =>
                                setSelectedCompaniess((prev) =>
                                  prev.includes(Companies._id)
                                    ? prev.filter((id) => id !== Companies._id)
                                    : [...prev, Companies._id]
                                )
                              }
                            />
                          </th>
                        </td>
                        <td>
                          <button
                            className="text-blue-600 hover:underline  ml-6 focus:outline-none"
                            onClick={() => handleCompaniesClick(Companies._id)}
                          >
                            {Companies.code}
                          </button>
                        </td>
                        <td className="px-6 py-3 truncate">{Companies.name}</td>
                        <td className="px-6 py-3 whitespace-normal truncate">
                          {Companies.contactNum}
                        </td>
                        <td className="px-6 py-3 break-words max-w-[500px] truncate hover:whitespace-normal hover:text-sm hover:max-w-none">
                          {Companies.address}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {Companies.panNum}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {Companies.currency}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {Companies.registrationNum}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {Companies.active ? "Yes" : "No"}
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

export default CompaniesList;
