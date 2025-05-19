import React, { useState } from "react";
import {
  FaThLarge,
  FaListUl,
  FaTh,
  FaArrowLeft,
  FaBoxOpen,
  FaWarehouse,
  FaMap,
  FaColumns,
  FaArchive,
  FaMapMarkerAlt,
  FaLayerGroup,
} from "react-icons/fa";

// import your real pages:
import ItemPage from "./MainComponent/Inventory/Item/ItemPage";
import SitePage from "./MainComponent/Inventory/Site/SitePage";

const items = [
  {
    id: 1,
    title: "Items",
    icon: <FaBoxOpen />,
    description: "Manage all inventory items",
  },
  {
    id: 2,
    title: "Sites",
    icon: <FaWarehouse />,
    description: "View and edit site locations",
  },
  {
    id: 3,
    title: "Zones",
    icon: <FaMap />,
    description: "Define storage zones",
  },
  {
    id: 4,
    title: "Racks",
    icon: <FaColumns />,
    description: "Configure warehouse racks",
  },
  {
    id: 5,
    title: "Bins",
    icon: <FaArchive />,
    description: "Organize bins within racks",
  },
  {
    id: 6,
    title: "Location",
    icon: <FaMapMarkerAlt />,
    description: "Pinpoint exact locations",
  },
  {
    id: 7,
    title: "Shelves",
    icon: <FaLayerGroup />,
    description: "Set up shelf levels",
  },
  {
    id: 8,
    title: "Aisles",
    icon: <FaMap />,
    description: "Manage aisle definitions",
  },
];

const VIEW_MODES = { GRID: "GRID", ICON: "ICON", LIST: "LIST" };
const PAGE = {
  TOGGLE: "TOGGLE", // your dashboard of tiles
  DETAILS: "DETAILS", // static placeholder detail
  ITEMPAGE: "ITEMPAGE", // real ItemPage
  SITESPAGE: "SITESPAGE", // real SitePage
};

export default function ViewTogglePage() {
  const [page, setPage] = useState(PAGE.TOGGLE);
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [selectedItem, setSelectedItem] = useState(null);

  const goBack = () => {
    setPage(PAGE.TOGGLE);
    setSelectedItem(null);
  };

  if (page === PAGE.ITEMPAGE) {
    return (
      <div className="p-6">
        <button
          onClick={goBack}
          className="flex items-center mb-4 text-gray-700 hover:text-gray-900"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>
        <ItemPage />
      </div>
    );
  }

  if (page === PAGE.SITESPAGE) {
    return (
      <div className="p-6">
        <button
          onClick={goBack}
          className="flex items-center mb-4 text-gray-700 hover:text-gray-900"
        >
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </button>
        <SitePage />
      </div>
    );
  }

  if (page === PAGE.DETAILS && selectedItem) {
    return (
      <div className="p-6">
        <button
          onClick={goBack}
          className="flex items-center mb-6 text-gray-700 hover:text-gray-900"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>
        <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
          <div className="text-6xl text-gray-400 mb-4 flex justify-center">
            {selectedItem.icon}
          </div>
          <h1 className="text-2xl font-semibold mb-2 text-center">
            {selectedItem.title}
          </h1>
          <p className="text-gray-600 text-center">
            {selectedItem.description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
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

      {viewMode === VIEW_MODES.GRID && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.title === "Items") setPage(PAGE.ITEMPAGE);
                else if (item.title === "Sites") setPage(PAGE.SITESPAGE);
                else {
                  setSelectedItem(item);
                  setPage(PAGE.DETAILS);
                }
              }}
              className="cursor-pointer bg-white rounded-lg shadow hover:shadow-lg transform hover:scale-105 transition p-6 flex flex-col items-center"
            >
              <div className="text-4xl text-gray-600 mb-4">{item.icon}</div>
              <h3 className="text-lg font-medium mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm text-center">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {viewMode === VIEW_MODES.ICON && (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.title === "Items") setPage(PAGE.ITEMPAGE);
                else if (item.title === "Sites") setPage(PAGE.SITESPAGE);
                else {
                  setSelectedItem(item);
                  setPage(PAGE.DETAILS);
                }
              }}
              className="cursor-pointer flex flex-col items-center p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition"
            >
              <div className="text-3xl text-gray-600 mb-2">{item.icon}</div>
              <span className="text-sm text-gray-800">{item.title}</span>
            </div>
          ))}
        </div>
      )}

      {viewMode === VIEW_MODES.LIST && (
        <div className="bg-white rounded-lg shadow divide-y">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.title === "Items") setPage(PAGE.ITEMPAGE);
                else if (item.title === "Sites") setPage(PAGE.SITESPAGE);
                else {
                  setSelectedItem(item);
                  setPage(PAGE.DETAILS);
                }
              }}
              className="cursor-pointer flex items-center p-4 hover:bg-gray-50 transition"
            >
              <div className="text-2xl text-gray-500 mr-4">{item.icon}</div>
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
