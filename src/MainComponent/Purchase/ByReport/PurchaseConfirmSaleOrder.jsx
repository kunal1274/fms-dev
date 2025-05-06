import { Select } from "flowbite-react";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
const ConfirmPurchaseOrder = ({ handleAddPurchaseOrder, invoice }) => {
  const baseUrl = "https://befr8n.vercel.app/fms/api/v0/purchasesorders";
  const [purchaseList, setpurchaseList] = useState([]);
  const [purchases, setpurchases] = useState([]);
  const [view, setView] = useState([]);
  const [selectedpurchaseForInvoice, setSelectedpurchaseForInvoice] = useState(null);
  const [selectedpurchases, setSelectedpurchases] = useState([]);
  const [selectedOption, setSelectedOption] = useState("All");
  const [viewingpurchaseId, setViewingpurchaseId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("All");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [sortOption, setSortOption] = useState("");
  const [filteredpurchases, setFilteredpurchases] = useState(purchases);

  const handleInvoice = () => {
    if (selectedpurchases.length === 1) {
      setSelectedpurchaseForInvoice(selectedpurchases[0]); // Set the selected purchase for invoice
    } else {
      toast.warn(
        "⚠️ Please select exactly one purchase order to generate an invoice.",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        }
      );
    }
  };
  const { id } = useParams();
  const [selectedSortOption, setSelectedSortOption] = useState("All");
  // Fetch all purchases from the API
  const fetchpurchases = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(baseUrl);
      // Filter only those purchases with status "Confirmed"
      const confirmedpurchases = response.data.data.filter(
        (purchase) => purchase.status === "Confirmed"
      );
      setpurchases(confirmedpurchases);
      setFilteredpurchases(confirmedpurchases);
      console.log(confirmedpurchases);
    } catch (error) {
      console.error("Failed to load purchases:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...purchases];

    // Existing active/inactive filtering
    if (selectedFilter === "yes") {
      filtered = filtered.filter((purchase) => purchase.active);
    } else if (selectedFilter === "no") {
      filtered = filtered.filter((purchase) => !purchase.active);
    }

    // Apply search term filtering
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (purchase) =>
          purchase.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          purchase.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Additional filter: Only show confirmed purchases
    filtered = filtered.filter((purchase) => purchase.status === "Confirmed");

    setFilteredpurchases(filtered);
  }, [purchases, searchTerm, selectedFilter]);

  useEffect(() => {
    fetchpurchases();
  }, [fetchpurchases]);

  const handleCheckboxChange = (id) => {
    setSelectedpurchases((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((purchaseId) => purchaseId !== id)
        : [...prevSelected, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedpurchases.length === filteredpurchases.length) {
      setSelectedpurchases([]);
    } else {
      setSelectedpurchases(filteredpurchases.map((purchase) => purchase._id));
    }
  };

  const handlepurchaseClick = (id) => {
    
    setViewingpurchaseId(id);
  };
  // // Handle filtering logic
  // const applyFilters = useCallback(() => {
  //   let filtered = [...purchases];

  //   if (selectedFilter === "yes") {
  //     filtered = filtered.filter((purchase) => purchase.active);
  //   } else if (selectedFilter === "no") {
  //     filtered = filtered.filter((purchase) => !purchase.active);
  //   }

  //   if (searchTerm.trim()) {
  //     filtered = filtered.filter(
  //       (purchase) =>
  //         purchase.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //         purchase.code.toLowerCase().includes(searchTerm.toLowerCase())
  //     );
  //   }

  //   setFilteredpurchases(filtered);
  // }, [purchases, searchTerm, selectedFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Handle individual purchase selection

  const generatePDF = useCallback(() => {
    if (!selectedpurchases || selectedpurchases.length === 0) {
    
      toast.warn("No purchases selected to generate PDF!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      return;
    }

    const doc = new jsPDF();
    const tableColumn = [
      "#",
      "purchase No.",
      "Customer Name",
      "Item Name",
      "Quantity",
      "Price",
      "Discount",
      "Line Amount",
      "Created At",
      "Status",
    ];

    // Filter the data for selected purchases
    const selectedData = filteredpurchases.filter((purchase) =>
      selectedpurchases.includes(purchase._id)
    );

    const tableRows = selectedData.map((purchase, index) => [
      index + 1,
      purchase.orderNum || 0,
      purchase.customer?.name || 0,
      purchase.item?.name || 0,
      purchase.quantity || 0,
      purchase.price || 0,
      purchase.discount || 0,
      purchase.lineAmt || 0,
      new Date(purchase.createdAt).toLocaleDateString() || 0,
      purchase.status || 0,
    ]);

    doc.text("Selected purchases Order List", 14, 20);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save("selected_purchases_order_list.pdf");
  }, [filteredpurchases, selectedpurchases]);

  const exportToExcel = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(filteredpurchases);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "purchases");
    XLSX.writeFile(workbook, "purchase_list.xlsx");
  }, [filteredpurchases]);

  const importFromExcel = () => {};

  // Handle "select all" functionality

  // Handle deleting selected purchases

  // Reset filters

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-black-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-800 text-lg font-medium">Loading...</p>
      </div>
    );
  }
  const handleFilterChange = (e) => {
    const value = e.target.value; // Get the selected filter value
    setSelectedFilter(value); // Update the selected filter state

    let filtered = [...purchases]; // Clone the original purchases array

    switch (value) {
      case "yes": // Show only active purchases
        filtered = filtered.filter((purchase) => purchase.active === true);
        break;

      case "no": // Show only inactive purchases
        filtered = filtered.filter((purchase) => purchase.active === false);
        break;

      case "All": // Show all purchases
      default:
        filtered = [...purchases];
        break;
    }

    setFilteredpurchases(filtered); // Update the filteredpurchases state
  };

  const resetFilters = () => {
    // Reset all relevant states
    setSearchTerm(""); // Clear search term if any
    setSelectedFilter("All"); // Reset to default option
    setSortOption(""); // Reset sorting to default
    setFilteredpurchases([...purchases]); // Restore the original purchases array

    console.log("Filters reset to default.");
  };
  const handleDeleteSelected = async () => {
    if (selectedpurchases.length === 0) {
      toast.warn("⚠️ No purchase order selected to delete.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      return;
    }

    try {
      // Perform deletion API calls
      await Promise.all(
        selectedpurchases.map((itemId) => axios.delete(`${baseUrl}/${itemId}`))
      );

      // Update the state to remove deleted purchases
      setFilteredpurchases((prev) =>
        prev.filter((purchase) => !selectedpurchases.includes(purchase._id))
      );
      setpurchases((prev) =>
        prev.filter((purchase) => !selectedpurchases.includes(purchase._id))
      );

      setSelectedpurchases([]); // Clear selected items after deletion
      toast.success("✅ Selected items deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } catch (error) {
      console.error("Error deleting items:", error);
      toast.error("❌ Failed to delete selected items!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }
  };

  const goBack = () => {
    setViewingpurchaseId(null);
    window.location.reload();
  };
  const handleTypeFilterChange = (e) => {
    const value = e.target.value;
    let filtered;

    switch (value) {
      case "Confirm":
        filtered = purchases.filter((purchase) => purchase.status === "Confirm");
        break;
      case "Draft":
        filtered = purchases.filter((purchase) => purchase.status === "Draft");
        break;
      case "All":
      default:
        filtered = purchases; // No filter applied, show all purchases
        break;
    }

    setFilteredpurchases(filtered);
  };
  const handleSortChange = (e) => {
    const value = e.target.value;
    setSelectedSortOption(value);

    let sorted = [...filteredpurchases];

    switch (value) {
      case "customerName":
        // Assuming "name" is the customer's name
        sorted = sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "purchaseNumber":
        // Sort by purchase account number (ascending)
        sorted = sorted.sort((a, b) => a.code.localeCompare(b.code));
        break;
      case "purchaseNumberDesc":
        // Sort by purchase account number (descending)
        sorted = sorted.sort((a, b) => b.code.localeCompare(a.code));
        break;
      case "itemName":
        // Assuming each purchase has an "itemName" property
        sorted = sorted.sort((a, b) => a.itemName.localeCompare(b.itemName));
        break;
      case "unit":
        // Sort by unit if applicable
        sorted = sorted.sort((a, b) => a.unit.localeCompare(b.unit));
        break;
      default:
        break;
    }

    setFilteredpurchases(sorted);
  };

  // Function to handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // If search term is empty, reset to filtered purchases
    if (!value) {
      setFilteredpurchases(purchases);
    }
  };

  // Function to handle search submission (filter purchases based on search term)
  const handleSearchSubmit = () => {
    if (!searchTerm.trim()) {
      setFilteredpurchases(purchases); // Reset if search is empty
      return;
    }

    // Assuming you want to search by customer name and item name
    const filtered = purchases.filter(
      (purchase) =>
        purchase.name.toLowerCase().includes(searchTerm.toLowerCase()) || // Search by customer name
        purchase.itemName.toLowerCase().includes(searchTerm.toLowerCase()) // Search by item name
    );

    setFilteredpurchases(filtered);
  };

  return (
    <div className="bg-grey-400  min-h-screen">
      <div className="rounded-full mb-5">
        {" "}
        {viewingpurchaseId ? (
          <purchaseViewPage purchaseId={viewingpurchaseId} goBack={goBack} />
        ) : selectedpurchaseForInvoice ? (
          <Invoice purchaseId={selectedpurchaseForInvoice} goBack={goBack} />
        ) : (
          <>
            <ToastContainer />
            {/* Header */}
            <div className="flex justify-between space-x-3">
              <h1 className="text-2xl font-bold mb-4">purchase Order List Page</h1>
              <div className="flex justify-between rounded-full mb-5">
                <div className="flex justify-end gap-4">
                  <button
                    onClick={handleInvoice}
                    className={`h-10 px-4 py-2 border border-green-500 bg-white rounded-md ${
                      selectedpurchases.length > 0
                        ? "hover:bg-gray-100"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    Invoice
                  </button>{" "}
                  <button
                    onClick={handleAddpurchaseOrder}
                    className="h-10 px-4 py-2 border border-green-500 bg-white rounded-md hover:bg-gray-100"
                  >
                    + Add
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={selectedpurchases.length === 0}
                    className={`h-10 px-4 py-2 border border-green-500 bg-white rounded-md ${
                      selectedpurchases.length > 0
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
                  <button className="h-10 px-4 py-2 border border-green-500 bg-white rounded-md hover:bg-gray-100">
                    Export
                  </button>
                  <label className="border h-10 border-green-500 bg-white rounded-md py-2 px-4">
                    <input type="file" accept=".xls,.xlsx" className="hidden" />
                    Import
                  </label>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap purchases-center justify-between p-4 bg-white rounded-md shadow mb-6 space-y-4 md:space-y-0 md:space-x-4">
              {/* Left group: Sort By, Filter By Status, Search */}
              <div className="flex items-center space-x-4">
                {/* Sort By */}
                <div className="relative">
                  <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={selectedSortOption}
                    onChange={handleSortChange}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="" disabled className="text-gray-500">
                      Sort By
                    </option>
                    <option value="purchaseNumber">
                      Sort by purchase Number (Asc)
                    </option>
                    <option value="purchaseNumberDesc">
                      Sort by purchase Number (Desc)
                    </option>
                    <option value="customerName">By Customer Name</option>
                    <option value="itemName">By Item Name</option>
                    <option value="unit">By Unit</option>
                  </select>
                </div>

                {/* Filter By Status */}
                <div className="relative">
                  <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={selectedType}
                    onChange={handleTypeFilterChange}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="All">Filter by Status</option>
                    <option value="Confirm">Confirm</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>

                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    aria-label="Search"
                    onChange={handleSearchChange}
                    className="w-60 pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleSearchSubmit} // Use onClick for button actions
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
                onClick={() => resetFilters(setSearch, setFilters)}
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
                        <input type="checkbox" />
                      </th>
                      <th className="px-6 py-3 w-24 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        purchase Order no
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Customer Name
                      </th>{" "}
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Item Name
                      </th>{" "}
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Qty
                      </th>{" "}
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Price
                      </th>{" "}
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Discount
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Line Amount
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        createdAt
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredpurchases.map((purchase) => (
                      <tr key={purchase._id} className="hover:bg-gray-50">
                        <td className="border px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={selectedpurchases.includes(purchase._id)}
                            onChange={() => handleCheckboxChange(purchase._id)}
                          />
                        </td>
                        <td>
                          <button onClick={() => handlepurchaseClick(purchase._id)}>
                            {purchase.orderNum}
                          </button>
                        </td>{" "}
                        <td className="px-6 py-3 truncate">
                          {purchase.customer?.name}
                        </td>{" "}
                        <td className="px-6 py-3 truncate">
                          {purchase.item?.name}
                        </td>{" "}
                        <td className="px-6 py-3 whitespace-normal truncate">
                          {purchase.quantity}
                        </td>{" "}
                        <td className="px-6 py-3 whitespace-normal truncate">
                          {purchase.price}
                        </td>
                        <td className="px-6 py-3 truncate">{purchase.discount}</td>
                        <td className="px-6 py-3 truncate">{purchase.lineAmt}</td>
                        <td className="px-6 py-3 whitespace-normal truncate">
                          {purchase.createdAt}
                        </td>
                        <td className="px-6 py-3 truncate">{purchase.status}</td>
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

export default ConfirmPurchaseOrder;
