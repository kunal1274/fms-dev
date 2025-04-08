import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useParams } from "react-router-dom";
import CompaniesDetail from "./CompanyViewPage";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const baseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/companies";

const CompaniesList = ({ handleAddCompanies }) => {
  // Use consistent naming: companiesList and selectedCompanyIds
  const [companiesList, setCompaniesList] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState([]);
  const [viewingCompanyId, setViewingCompanyId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("list");
  const [selectedOption, setSelectedOption] = useState("All");
  const [filteredCampanys, setFilteredCampanys] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  // Separate states for sorting and filtering
  const [sortOption, setSortOption] = useState("");
  const [filterOption, setFilterOption] = useState("All");

  const { id } = useParams();

  // Fetch companies data from the API
  const fetchCompaniesList = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(baseUrl);
      // Provide a fallback to an empty array if the data shape is unexpected
      const companies = response.data.data || [];
      setCompaniesList(companies);
      setFilteredCompanies(companies);
    } catch (err) {
      console.error("Failed to load companies:", err);
      setMessage("Failed to load companies data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single company's details
  const fetchCompanyDetails = async (companyId) => {
    try {
      const response = await axios.get(`${baseUrl}/${companyId}`);
      setViewingCompanyId(response.data.data);
    } catch (err) {
      console.error("Error fetching company details:", err);
      toast.error("Error fetching company details");
    }
  };

  useEffect(() => {
    fetchCompaniesList();
  }, [fetchCompaniesList]);

  useEffect(() => {
    if (id) {
      fetchCompanyDetails(id);
    }
  }, [id]);

  // Import companies data from an Excel file
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

        // Validate for duplicate registration numbers or PAN numbers locally
        const duplicateErrors = [];
        const seenRegistrations = new Set();
        const seenPans = new Set();

        importedData.forEach((company, index) => {
          if (company.registrationNo) {
            if (seenRegistrations.has(company.registrationNo)) {
              duplicateErrors.push(
                `Duplicate registration number: ${
                  company.registrationNo
                } at row ${index + 1}`
              );
            } else {
              seenRegistrations.add(company.registrationNo);
            }
          }
          if (company.pan) {
            if (seenPans.has(company.pan)) {
              duplicateErrors.push(
                `Duplicate PAN: ${company.pan} at row ${index + 1}`
              );
            } else {
              seenPans.add(company.pan);
            }
          }
        });

        if (duplicateErrors.length > 0) {
          toast.error(`Errors occurred:\n${duplicateErrors.join("\n")}`, {
            autoClose: 1000,
            onClose: () => fetchCompaniesList(),
          });
          return;
        }

        let successCount = 0;
        const errors = [];
        // Post each company data to the API
        for (let i = 0; i < importedData.length; i++) {
          const company = importedData[i];
          try {
            await axios.post(baseUrl, company, {
              headers: { "Content-Type": "application/json" },
            });
            successCount++;
            toast.success(`Successfully posted company ${i + 1}`);
          } catch (err) {
            console.error(`Error posting company ${i + 1}:`, err);
            errors.push(
              `Error ${i + 1}: ${err.response?.data?.err || err.message}`
            );
            toast.error(
              `Error in import ${i + 1}: ${
                err.response?.data?.err || err.message
              }`
            );
          }
        }

        if (successCount === importedData.length) {
          toast.success(
            `All ${successCount} companies imported successfully!`,
            {
              autoClose: 1000,
              onClose: () => fetchCompaniesList(),
            }
          );
        } else {
          toast.error(
            `Import Summary:\nSuccessfully imported: ${successCount}\nFailed: ${
              importedData.length - successCount
            }\nErrors:\n${errors.join("\n")}`,
            {
              autoClose: 1000,
              onClose: () => fetchCompaniesList(),
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

  // Export companies data to Excel
  const exportToExcel = useCallback(() => {
    if (!companiesList.length) return alert("No data to export");
    const worksheet = XLSX.utils.json_to_sheet(companiesList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Companies");
    XLSX.writeFile(workbook, "Companies_list.xlsx");
  }, [companiesList]);

  // Generate a PDF of the companies list
  const generatePDF = useCallback(() => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "A4",
    });
    // Ensure using filteredCompanies for current displayed data
    jsPDF.autoTable(doc, {
      head: [["#", "Company Code", "Name", "Contact", "Address", "Active"]],
      body: filteredCompanies.map((company, index) => [
        index + 1,
        company.code,
        company.name,
        company.contactNum,
        company.address,
        company.active ? "Yes" : "No",
      ]),
    });
    doc.save("Companies_list.pdf");
  }, [filteredCompanies]);

  // Apply search, filter, and sort to the companies list
  const applyFiltersAndSorting = (search, sort, filterStatus) => {
    let data = [...companiesList];

    if (search) {
      data = data.filter(
        (company) =>
          company.name.toLowerCase().includes(search.toLowerCase()) ||
          company.code.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterStatus === "yes") {
      data = data.filter((company) => company.active === true);
    } else if (filterStatus === "no") {
      data = data.filter((company) => company.active === false);
    }

    if (sort === "Company Name") {
      data.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "Account No Ascending") {
      data.sort((a, b) => a.code.localeCompare(b.code));
    } else if (sort === "Account No Descending") {
      data.sort((a, b) => b.code.localeCompare(a.code));
    }
    setFilteredCompanies(data);
  };

  // Handlers for search, sort, and filter controls
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    applyFiltersAndSorting(term, sortOption, filterOption);
  };

  const handleSortChange = (e) => {
    const selected = e.target.value;
    setSortOption(selected);
    applyFiltersAndSorting(searchTerm, selected, filterOption);
  };

  const handleFilterChange = (e) => {
    const selected = e.target.value;
    setFilterOption(selected);
    applyFiltersAndSorting(searchTerm, sortOption, selected);
  };

  // Reset filters and search term
  const resetFilters = () => {
    setSearchTerm("");
    setSortOption("");
    setFilterOption("All");
    setFilteredCompanies(companiesList);
  };

  // Delete selected companies
  const handleDeleteSelected = async () => {
    if (!selectedCompanyIds.length) {
      toast.info("No companies selected to delete.", { autoClose: 1000 });
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete the selected companies?"
    );
    if (!confirmed) return;

    try {
      const deleteResponses = await Promise.allSettled(
        selectedCompanyIds.map((companyId) =>
          axios.delete(`${baseUrl}/${companyId}`)
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
          `${successfulDeletes.length} company(s) deleted successfully!`,
          {
            autoClose: 1000,
          }
        );
        const updatedList = companiesList.filter(
          (company) => !selectedCompanyIds.includes(company._id)
        );
        setCompaniesList(updatedList);
        setFilteredCompanies(updatedList);
        setSelectedCompanyIds([]);
      }

      if (failedDeletes.length > 0) {
        toast.error(
          `${failedDeletes.length} deletion(s) failed. Check console for details.`
        );
        failedDeletes.forEach((err, index) => {
          console.error(
            `Error deleting company ${selectedCompanyIds[index]}:`,
            err.reason?.response || err.reason
          );
        });
      }
    } catch (err) {
      console.error(
        "Unexpected error during deletion:",
        err.response || err.message
      );
      toast.error("An unexpected error occurred while deleting companies.");
    }
  };

  // Go back from detailed view to list view
  const goBack = () => {
    setViewingCompanyId(null);
  };

  // Handle clicking a company row
  const handleCompanyClick = (companyId) => {
    setViewingCompanyId(companyId);
  };

  // Toggle view (if needed)
  const toggleView = (targetView) => {
    if (view !== targetView) {
      setView(targetView);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-black-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-2 text-zinc-800 text-sm font-small">
          Loading companies...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-grey-400 p-4 min-h-screen">
      <ToastContainer />
      <div className="rounded-full mb-5">
        {viewingCompanyId ? (
          <CompaniesDetail
            toggleView={toggleView}
            CompaniesId={viewingCompanyId}
            goBack={goBack}
          />
        ) : (
          <>
            {/* Header */}
            <div className="flex justify-between space-x-2">
              <h1 className="text-xl font-bold mb-2">Companies List</h1>
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
                    disabled={selectedCompanyIds.length === 0}
                    className={`h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition ${
                      selectedCompanyIds.length > 0
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
            </div>

            {/* Search, Sort, and Filter Controls */}
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
                    <option value="">Sort By</option>
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

            {/* Companies Table */}
            <div className="border border-green-500 rounded-lg bg-white p-10 overflow-hidden">
              <div className="h-[460px] overflow-y-auto">
                <table className="min-w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 border-gray-300 text-left">
                        <input
                          type="checkbox"
                          onChange={() =>
                            setSelectedCompanyIds(
                              selectedCompanyIds.length
                                ? []
                                : companiesList.map((c) => c._id)
                            )
                          }
                          checked={
                            selectedCompanyIds.length === companiesList.length
                          }
                        />
                      </th>
                      <th className="px-6 py-2 text-sm font-medium whitespace-nowrap">
                        Company Code
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Email
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        GST number
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Primary GST Address
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Bank Name
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Account Number
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        IFSC Code
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCampanys.map((Campany) => (
                      <tr key={Campany._id}>
                        <td>
                          {" "}
                          <th className="px-4 py-2 border-white-300 text-left">
                            <input
                              type="checkbox"
                              checked={selectedCampanys.includes(Campany._id)}
                              onChange={() =>
                                setSelectedCampanys((prev) =>
                                  prev.includes(Campany._id)
                                    ? prev.filter((id) => id !== Campany._id)
                                    : [...prev, Campany._id]
                                )
                              }
                            />{" "}
                          </th>
                        </td>

                        <td className="px-6 py-3 border border-gray-300 truncate">
                          <button
                            onClick={() => handleCampanyClick(Campany._id)}
                          >
                            {Campany.companyCode}
                          </button>
                        </td>

                        <td className="px-6 py-3 truncate">
                          {Campany.companyName}
                        </td>
                        <td className="px-6 py-3 truncate">{Campany.email}</td>
                        <td className="px-6 py-3 truncate">
                          {Campany.primaryGSTAddress}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {Campany.taxInfo.gstNumber}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {Campany.bankDetails[0].accountNumber}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {Campany.bankDetails[0].bankName}
                        </td>
                        <td className="px-6 py-3 truncate">
                          {Campany.bankDetails[0].ifscCode}
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
