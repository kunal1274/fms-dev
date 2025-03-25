import React, { useState, useEffect, useCallback } from "react";
import { jsPDF } from "jspdf"; // Make sure to install jsPDF
import * as XLSX from "xlsx"; // Make sure to install xlsx

const BankList = ({ items, toggleView, handleDeleteItems, onAddItem, setCurrentView, onViewItem }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItemNo, setSelectedItemNo] = useState(null);

  const handleCheckboxChange = (itemNo) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(itemNo)
        ? prevSelected.filter((no) => no !== itemNo)
        : [...prevSelected, itemNo]
    );
  };

  const handleViewItem = (itemNo) => {
    setCurrentView("ItemViewPage");
    setSelectedItemNo(itemNo);
  };

  const filteredItems = items.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  // const exportToExcel = useCallback(() => {
  //   if (filteredItems.length === 0) return; // Optional: handle empty data gracefully
  
  //   const worksheet = XLSX.utils.json_to_sheet(filteredItems);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Bank List");
  //   XLSX.writeFile(workbook, "bank_list.xlsx");
  // }, [filteredItems]);
  const handleDelete = () => {
    handleDeleteItems(selectedItems);
    setSelectedItems([]);
  };

  const generatePDF = useCallback(() => {
    const doc = new jsPDF();
    const tableColumn = ["#", "Bank Account No", "Bank Name", "Bank Holder Name", "Currency", "Account Type", "IFSC", "Active"];
    const tableRows = filteredItems.map((item, index) => [
      index + 1,
      item.itemNo,
      item.itemName,
      item.accountHolderName,
      item.currency,
      item.unit,
      item.ifsc,
      item.active ? "Yes" : "No"
    ]);
  
    doc.text("Bank List", 14, 20);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });
    doc.save("Bank_list.pdf");
  }, [filteredItems]);

  const exportToExcel = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(filteredItems);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Items");
    XLSX.writeFile(workbook, "item_list.xlsx");
  }, [filteredItems]);

  useEffect(() => {
    console.log("Selected items:", selectedItems);
  }, [selectedItems]);

  return (
    <div className="bg-blue-400 p-8 min-h-screen">
    <header className="text-center bg-white py-2 border border-blue-300 rounded-full mb-5">
        <h2 className="text-lg font-bold  text-blue-500">Bank List</h2>
      </header>

      <div className="flex flex-col sm:flex-row sm:justify-between rounded-full mb-5">
        <div className="flex items-center border border-green-500 bg-white rounded-full px-2 h-10 mb-4 sm:mb-0">
          <input
            type="text"
            placeholder="Search..."
            aria-label="Search"
            className="ml-2 outline-none bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap justify-end gap-4">
          <button
            className="px-3 border border-green-500 h-10 bg-white rounded-md hover:bg-gray-100"
            onClick={onAddItem}
          >
            + Add
          </button>
          <button
            className={`px-4 py-2 border border-green-500 h-10 bg-white rounded-md ${selectedItems.length === 0
              ? "cursor-not-allowed opacity-50"
              : "hover:bg-gray-100"
              }`}
            disabled={selectedItems.length === 0}
            onClick={handleDelete}
          >
            Delete
          </button>
          <button
            className="h-10 px-4 py-2 border border-green-500 bg-white rounded-md hover:bg-gray-100"
            onClick={generatePDF}
          >
            PDF
          </button>
          <button
            className="px-4 py-2 h-10 border border-green-500 bg-white rounded-md hover:bg-gray-100"
            onClick={exportToExcel}
          >
            Export
          </button>
          <label className="border h-10 border-green-500 bg-white rounded-md py-2 px-4">
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={(event) => {
                const file = event.target.files[0];
                if (file) {
                  console.log("File selected for import:", file.name);
                }
              }}
              className="hidden"
            />
            Import
          </label>
        </div>
      </div>

      <div className="border border-green-500 rounded-lg bg-white p-4 overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-blue-100">
              <th className="border px-4 py-2">#</th>
              <th className="border px-4 py-2">bank Account No</th>
              <th className="border px-4 py-2">Bank Name</th>
                          <th className="border px-4 py-2">Bank Holder Name </th>

              <th className="border px-4 py-2">Currency</th>
              <th className="border px-4 py-2">Acoount type</th>
              <th className="border px-4 py-2">IFSC  </th>
              <th className="border px-4 py-2">Active</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <tr key={item.itemNo}>
                  <td className="border px-4 py-2 text-center">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.itemNo)}
                        onChange={() => handleCheckboxChange(item.itemNo)}
                      />
                    </label>
                  </td>
                  <td
                    className="border px-4 py-2 cursor-pointer text-black"
                    onClick={() => onViewItem(item.itemNo)}
                  >
                    {item.itemNo}
                  </td>
                  <td className="border px-4 py-2 whitespace-normal break-words" style={{ maxWidth: "15ch" }}>{item.itemName}</td>
                  <td className="border px-4 py-2 whitespace-normal break-words" style={{ maxWidth: "15ch" }}>{item.accountHolderName}</td>
                  <td className="border px-4 py-2 whitespace-normal break-words" style={{ maxWidth: "15ch" }}>{item.currency}</td>
                  <td className="border px-4 py-2 w-44 whitespace-normal break-words" style={{ maxWidth: "15ch" }}>{item.unit}</td>
                  {/* <td className="border px-4 py-2 whitespace-normal break-words" style={{ maxWidth: "15ch" }}>{item.ifscCode}</td> */}
                  <td className="border px-4 py-2 whitespace-normal break-words" style={{ maxWidth: "15ch" }}>{item.ifsc}</td>
                  <td className="border px-4 py-2 whitespace-normal break-words" style={{ maxWidth: "15ch" }}>
                    {item.active ? "Yes" : "No"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="border px-4 py-2 text-center">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BankList;
