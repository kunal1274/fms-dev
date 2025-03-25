import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import { useParams } from "react-router-dom";
import CampanyDetail from "./CompanyViewPage";

import { Select } from "flowbite-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
const baseUrl = "https://befr8n.vercel.app/fms/api/v0/companies";

const CampanyList = ({ handleAddCompany }) => {
  const [CampanyList, setCampanyList] = useState([]);
  const [selectedCampany, setSelectedCampany] = useState([]);
  const [selectedOption, setSelectedOption] = useState("All");
  const [selectedCampanys, setSelectedCampanys] = useState([]);
  const [viewingCampanyId, setViewingCampanyId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("list");
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filteredCampanys, setFilteredCampanys] = useState([]);

  // Fetch Companies from API
  const fetchCampanys = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(baseUrl);
      setCampanyList(response.data.data);
      console.log(response.data.data, "34");
      setFilteredCampanys(response.data.data);
    } catch (error) {
      console.error("Failed to load Campanys:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampanys();
  }, [fetchCampanys]);

  useEffect(() => {
    if (id) {
      fetchCampanyDetails(id);
    }
  }, [id]);

  const fetchCampanyDetails = async (CampanyId) => {
    try {
      const response = await axios.get(`${baseUrl}/${CampanyId}`);
      setViewingCampanyId(response.data.data);
      console.log(response.data.data, "57");
    } catch (error) {
      console.error("Error fetching Campany details:", error);
    }
  };

  // Search and Filter Logic
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    const filtered = CampanyList.filter(
      (Campany) =>
        Campany.name.toLowerCase().includes(term.toLowerCase()) ||
        Campany.code.toLowerCase().includes(term.toLowerCase()) ||
        (Campany.contactNum && Campany.contactNum.includes(term))
    );
    setFilteredCampanys(filtered);
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setSelectedOption(value);

    let filtered = [...CampanyList];

    if (value === "All") {
      setFilteredCampanys(filtered);
    } else if (value === "yes") {
      setFilteredCampanys(
        filtered.filter((Campany) => Campany.active === true)
      );
    } else if (value === "no") {
      setFilteredCampanys(
        filtered.filter((Campany) => Campany.active === false)
      );
    } else if (value === "Campany Name") {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
      setFilteredCampanys(filtered);
    } else if (value === "Campany Account no") {
      filtered = filtered.sort((a, b) => a.code.localeCompare(b.code));
      setFilteredCampanys(filtered);
    } else if (value === "Campany Account no descending") {
      filtered = filtered.sort((a, b) => b.code.localeCompare(a.code));
      setFilteredCampanys(filtered);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedOption("All");
    setFilteredCampanys(CampanyList);
  };

  const handleDeleteSelected = async () => {
    console.log("Selected Campanys:", selectedCampanys);
    if (!selectedCampanys.length) {
      toast.info("No Campanys selected to delete.", { autoClose: 1000 });
      return;
    }

    if (
      !window.confirm("Are you sure you want to delete the selected Campanys?")
    ) {
      return;
    }

    try {
      const deleteResponses = await Promise.all(
        selectedCampanys.map((itemId) => {
          console.log(`Deleting Campany with ID: ${itemId}`);
          return axios.delete(`${baseUrl}/${itemId}`);
        })
      );

      toast.success("Selected Campanys deleted successfully!", {
        autoClose: 1000,
      });
      console.log("Delete responses:", deleteResponses);

      // Remove deleted companies from both lists
      setCampanyList((prev) =>
        prev.filter((item) => !selectedCampanys.includes(item._id))
      );
      setFilteredCampanys((prev) =>
        prev.filter((item) => !selectedCampanys.includes(item._id))
      );
      setSelectedCampanys([]);

      // Refresh the page after a short delay (consider state update instead)
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error(
        "Error deleting Campanys:",
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
      setCampanyList((prev) => [...prev, ...importedData]);
      setFilteredCampanys((prev) => [...prev, ...importedData]);
    };
    reader.readAsArrayBuffer(file);
  };

  // Export to Excel
  const exportToExcel = useCallback(() => {
    if (!CampanyList.length) {
      alert("No data to export");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(CampanyList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Campanys");
    XLSX.writeFile(workbook, "Campany_list.xlsx");
  }, [CampanyList]);

  // Generate PDF using jsPDF and autoTable
  const generatePDF = useCallback(() => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "A4",
    });
    autoTable(doc, {
      head: [["#", "Campany Code", "Name", "Contact", "Address", "Active"]],
      body: filteredCampanys.map((Campany, index) => [
        index + 1,
        Campany.code,
        Campany.name,
        Campany.contactNum,
        Campany.address,
        Campany.taxInfo.gstNumber,
      ]),
    });
    doc.save("Campany_list.pdf");
  }, [filteredCampanys]);

  const handleCampanyClick = (CampanyId) => {
    console.log("Campany.id:", CampanyId);
    setViewingCampanyId(CampanyId);
  };

  return (
    <div className="bg-grey-400 p-8 min-h-screen">
      <ToastContainer />
      <div className="rounded-full mb-5">
        {viewingCampanyId ? (
          <CampanyDetail
            toggleView={(targetView) => setView(targetView)}
            CampanyId={viewingCampanyId}
            goBack={() => {
              setViewingCampanyId(null);
              window.location.reload();
            }}
          />
        ) : (
          <>
            {/* Header */}
            <div className="flex justify-between space-x-3">
              <h1 className="text-2xl font-bold mb-4">Campany Lists</h1>
              <div className="flex justify-between rounded-full mb-5">
                <div className="flex justify-end gap-4">
                  <button
                    onClick={handleAddCompany}
                    className="h-10 px-4 py-2 border border-green-500 bg-white rounded-md hover:bg-gray-100"
                  >
                    + Add
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={selectedCampanys.length === 0}
                    className={`h-10 px-4 py-2 border border-green-500 bg-white rounded-md ${
                      selectedCampanys.length > 0
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

            {/* Campany Table */}
            <div className="border border-green-500 rounded-lg bg-white p-8 overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 border border-gray-300 text-left">
                        <input
                          type="checkbox"
                          onChange={() =>
                            setSelectedCampanys(
                              selectedCampanys.length
                                ? []
                                : CampanyList.map((c) => c._id)
                            )
                          }
                          checked={
                            selectedCampanys.length === CampanyList.length
                          }
                        />
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Company Code
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Company Name
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Email
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Primary GST Address
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        GST number
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

export default CampanyList;
