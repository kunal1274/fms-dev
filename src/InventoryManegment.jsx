import React, { useState } from "react";
import { FaThLarge, FaListUl, FaTh, FaFile, FaArrowLeft } from "react-icons/fa";
import ItemPage from "./MainComponent/Inventory/Item/ItemPage"

const items = [
  {
    id: 1,
    title: "Items",
    description: "This is the Items entry.",
    image: "https://via.placeholder.com/300",
  },
  {
    id: 2,
    title: "Sites",
    description: "This is the Sites entry.",
    image: "https://via.placeholder.com/300",
  },
  {
    id: 3,
    title: "Zone",
    description: "This is the Zone entry.",
    image: "https://via.placeholder.com/300",
  },
  {
    id: 4,
    title: "Location",
    description: "This is the Location entry.",
    image: "https://via.placeholder.com/300",
  },
  {
    id: 5,
    title: "Aisles",
    description: "This is the Aisles entry.",
    image: "https://via.placeholder.com/300",
  },
  {
    id: 6,
    title: "Racks",
    description: "This is the Racks entry.",
    image: "https://via.placeholder.com/300",
  },
  {
    id: 7,
    title: "Shelves",
    description: "This is the Shelves entry.",
    image: "https://via.placeholder.com/300",
  },
  {
    id: 8,
    title: "Bins",
    description: "This is the Bins entry.",
    image: "https://via.placeholder.com/300",
  },
  {
    id: 9,
    title: "Batches",
    description: "This is the Batches entry.",
    image: "https://via.placeholder.com/300",
  },
  {
    id: 10,
    title: "Serials",
    description: "This is the Serials entry.",
    image: "https://via.placeholder.com/300",
  },
];

const VIEW_MODES = { GRID: "GRID", ICON: "ICON", LIST: "LIST" };

export default function ViewTogglePage() {
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [selectedItem, setSelectedItem] = useState(null);

  // If an item is clicked, show its detail view
  if (selectedItem) {
    return (
      <div className="p-6">
        <button
          onClick={() => setSelectedItem(null)}
          className="flex items-center mb-6 text-gray-700 hover:text-gray-900 transition"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>
        <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
          <img
            src={selectedItem.image}
            alt={selectedItem.title}
            className="w-full h-48 object-cover rounded-md mb-4"
          />
          <h1 className="text-2xl font-semibold mb-2">{selectedItem.title}</h1>
          <p className="text-gray-600">{selectedItem.description}</p>
          {/* Add any more fields here if needed */}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header & Toggle Buttons */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">View Toggle</h1>
        <div className="flex bg-gray-100 rounded-lg overflow-hidden">
          {[
            { mode: VIEW_MODES.GRID, icon: <FaThLarge /> },
            { mode: VIEW_MODES.ICON, icon: <FaTh /> },
            { mode: VIEW_MODES.LIST, icon: <FaListUl /> },
          ].map(({ mode, icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`p-3 ${
                viewMode === mode ? "bg-white shadow" : "hover:bg-gray-200"
              } transition`}
            >
              {React.cloneElement(icon, { className: "text-lg" })}
            </button>
          ))}
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === VIEW_MODES.GRID && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="cursor-pointer bg-white rounded-lg shadow hover:shadow-lg transform hover:scale-105 transition p-4"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-32 object-cover rounded-md mb-4"
              />
              <h2 className="text-lg font-semibold mb-2">{item.title}</h2>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* ICON VIEW */}
      {viewMode === VIEW_MODES.ICON && (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="cursor-pointer flex flex-col items-center p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition"
            >
              <FaFile className="text-3xl text-gray-600 mb-2" />
              <span className="text-sm text-gray-800">{item.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === VIEW_MODES.LIST && (
        <div className="bg-white rounded-lg shadow divide-y">
          {items.map((item) => (
            <div className="cursor-pointer flex items-center p-4 hover:bg-gray-50 transition">
              <FaFile className="text-2xl text-gray-500 mr-4" />
              <div>
                <h3 className="text-md font-medium">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
