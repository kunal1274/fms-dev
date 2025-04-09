import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";
import ItemviewPage from "./ItemviewPage ";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { ToastContainer } from "react-toastify";

const BASE_URL = "https://fms-qkmw.onrender.com/fms/api/v0/items";

function ItemList({ handleAddItem }) {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewingItemId, setViewingItemId] = useState(null);

  // Separate states for filtering and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [selectedSortOption, setSelectedSortOption] = useState("All");

  // Fetch items from API
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(BASE_URL);
      setItems(response.data.data);
      setFilteredItems(response.data.data);
    } catch (error) {
      console.error("Failed to load items:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Apply filters and sorting
  const applyFilters = useCallback(() => {
    let updatedItems = [...items];

    // Filter by status
    if (selectedStatusFilter === "yes") {
      updatedItems = updatedItems.filter((item) => item.active);
    } else if (selectedStatusFilter === "no") {
      updatedItems = updatedItems.filter((item) => !item.active);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      updatedItems = updatedItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting if needed
    if (selectedSortOption !== "All") {
      updatedItems.sort((a, b) => {
        switch (selectedSortOption) {
          case "Item Name":
            return a.name.localeCompare(b.name);
          case "Item Account no":
            return a.code.localeCompare(b.code);
          case "Item Account no descending":
            return b.code.localeCompare(a.code);
          case "By unit":
            return a.unit.localeCompare(b.unit);
          default:
            return 0;
        }
      });
    }

    setFilteredItems(updatedItems);
  }, [items, searchTerm, selectedStatusFilter, selectedSortOption]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Handlers for search and filter changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setSelectedStatusFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    setSelectedSortOption(e.target.value);
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((item) => item._id));
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleItemClick = (id) => {
    setViewingItemId(id);
  };

  const goBack = () => {
    setViewingItemId(null);
    // Optionally avoid reloading if not needed
    window.location.reload();
  };

  // PDF generation using jsPDF and autoTable
  const generatePDF = useCallback(() => {
    const doc = new jsPDF();
    const tableColumn = [
      "#",
      "Item No.",
      "Item Name",
      "Type",
      "Description",
      "Unit",
      "Price",
      "Active",
    ];
    const tableRows = filteredItems.map((item, index) => [
      index + 1,
      item.code,
      item.name,
      item.type,
      item.description,
      item.unit,
      item.price,
      item.active ? "Yes" : "No",
    ]);
    doc.text("Item List", 14, 20);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });
    doc.save("item_list.pdf");
  }, [filteredItems]);

  // Excel export
  const exportToExcel = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(filteredItems);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Items");
    XLSX.writeFile(workbook, "item_list.xlsx");
  }, [filteredItems]);

  // Placeholder for Excel import functionality
  const importFromExcel = () => {
    // Implementation for importing Excel files can be added here
  };

  // Delete selected items
  const handleDeleteSelectedItems = async () => {
    if (selectedItems.length === 0) {
      alert("No items selected to delete.");
      return;
    }

    if (
      !window.confirm("Are you sure you want to delete the selected items?")
    ) {
      return;
    }

    try {
      await Promise.all(
        selectedItems.map((itemId) => axios.delete(`${BASE_URL}/${itemId}`))
      );
      setItems((prev) =>
        prev.filter((item) => !selectedItems.includes(item._id))
      );
      setSelectedItems([]);
      alert("Selected items deleted successfully!");
    } catch (error) {
      console.error("Error deleting items:", error);
      alert("Failed to delete selected items.");
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatusFilter("All");
    setSelectedSortOption("All");
    setFilteredItems([...items]);
    console.log("Filters reset to default.");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-black-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-500 text-lg font-medium">
          Item List Page...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-grey-400 p-4 min-h-screen">
      {" "}
      <ToastContainer />
      <div className="rounded-full mb-5">
        {viewingItemId ? (
          <ItemviewPage
            toggleView={null}
            itemId={viewingItemId}
            goBack={goBack}
          />
        ) : (
          <>
            <div className="flex justify-between space-x-2">
              <h1 className="text-xl font-bold mb-2  ">Item Lists</h1>
              <div className="flex justify-between rounded-full mb-3">
                <div className="flex justify-end items-center gap-1">
                  <button
                    onClick={handleAddItem}
                    className="h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition hover:bg-blue-500 hover:text-blue-700 hover:scale-[1.02]"
                  >
                    + Add
                  </button>
                  <button
                    onClick={handleDeleteSelectedItems}
                    disabled={selectedItems.length === 0}
                    className={`h-8 px-3 border border-green-500 bg-white text-sm rounded-md transition ${
                      selectedItems.length > 0
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

            <div className="flex flex-wrap Sales-center text-sm justify-between p-2 bg-white rounded-md shadow mb-2 space-y-3 md:space-y-0 md:space-x-4">
              {/* Left group: Sort, Filter, Search */}
              <div className="flex items-center space-x-4">
                {/* Sort By */}
                <div className="relative">
                  <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={selectedSortOption}
                    onChange={handleSortChange}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="All">Sort By</option>
                    <option value="Item Name">Sort by Item Name</option>
                    <option value="Item Account no">
                      Sort By Item code Ascending{" "}
                    </option>
                    <option value="Item Account no descending">
                      Sort By Item code Descending
                    </option>
                    <option value="  By type  service ">
                      Sort By Item Type Service
                    </option>{" "}
                    <option value="By type Good ">
                      Sort By Item Type Good
                    </option>
                  </select>
                </div>
                {/* Filter By Status */}
                <div className="relative">
                  <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={selectedStatusFilter}
                    onChange={handleStatusFilterChange}
                    className="pl-10 pr-4 py-2 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="All">Filter By Status</option>
                    <option value="yes">Active </option>
                    <option value="no"> Unactive</option>
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
              {/* Right side: Reset Filter */}
              <button
                className="text-red-500 hover:text-red-600 font-medium"
                onClick={resetFilters}
              >
                Reset Filter
              </button>
            </div>

            <div className="border border-green-500 rounded-lg bg-white p-10 overflow-hidden">
              <div className="h-[460px] overflow-y-auto">
                <table className="min-w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 border-gray-300 text-left">
                        <input
                          type="checkbox"
                          checked={
                            selectedItems.length === filteredItems.length &&
                            filteredItems.length > 0
                          }
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Item Code.
                      </th>{" "}
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Item No.
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Item Name
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Type
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Description
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Unit
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Price
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700">
                        Active
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item._id)}
                            onChange={() => handleCheckboxChange(item._id)}
                          />
                        </td>
                        <td>
                          <button
                            className="text-blue-600 hover:underline  ml-6 focus:outline-none"
                            onClick={() => handleItemClick(item._id)}
                          >
                            {item.code}
                          </button>
                        </td>{" "}
                        <td className="px-6 py-3 truncate">{item.itemNum}</td>
                        <td className="px-6 py-3 truncate">{item.name}</td>
                        <td className="px-6 py-3 truncate">{item.type}</td>
                        <td className="px-6 py-3 break-words max-w-[500px] truncate hover:whitespace-normal hover:text-sm hover:max-w-none">
                          {item.description}
                        </td>
                        <td className="px-6 py-3 truncate">{item.unit}</td>
                        <td className="px-6 py-3 truncate">{item.price}</td>
                        <td className="px-6 py-3 truncate">
                          {item.active ? "Yes" : "No"}
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
}

export default ItemList;
