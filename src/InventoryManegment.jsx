import React, { useState } from "react";
import {
  FaThLarge,
  FaListUl,
  FaTh,
  FaArrowLeft,
  FaBoxOpen,
  FaWarehouse,
  FaFilter,
  FaSortAmountDown,
  FaMap,
  FaColumns,
  FaArchive,
  FaMapMarkerAlt,
  FaPalette,
} from "react-icons/fa";

// import your real pages:
import WarehousePage from "./MainComponent/Inventory/Warehouse/WarehousePage";
import ItemMasterPage from "./MainComponent/Inventory/Item/ItemPage";
import SitePage from "./MainComponent/Inventory/Site/SitePage";
import ShelvesPage from "./MainComponent/Inventory/Shelves/ShelvesPage";
// import AislesPage from "./MainComponent/Inventory/Aisle/AislePage.jsx";
import BatchValuePage from "./MainComponent/Inventory/BatchValue/BatchValuePage";
import BinPage from "./MainComponent/Inventory/Bin/BinPage";
import LocationPage from "./MainComponent/Inventory/Location/LocationPage.jsx";
import ProductDimColorPage from "./MainComponent/Inventory/ProductDimColor/ProductDimColorPage";
import RackPage from "./MainComponent/Inventory/Rack/RackPage.jsx";
// import ZonePage from "./MainComponent/Inventory/Zone/ZonePage";
// placeholder imports (uncomment when available)
// import ConfigPage from "./MainComponent/Inventory/ProductDimConf/ProductDimConfPage.jsx";
// import ColorPage from "./MainComponent/Inventory/ProductDimColor/ProductDimColorPage.jsx";
// import SerialsPage from "./MainComponent/Inventory/Serials/SerialsPage.jsx";
// import RackPage from "./MainComponent/Inventory/Rack/RackPage.jsx";
const PAGE = {
  TOGGLE: "TOGGLE",
  ITEM_MASTER: "ITEM_MASTER",
  SITE: "SITE",
  SHELVES: "SHELVES",
  WAREHOUSE: "WAREHOUSE",
  ZONE: "ZONE",
  SHELVES: "SHELVES",
  AISLES: "AISLES",
  BATCHES: "BATCHES",
  BIN: "BIN",
  LOCATION: "LOCATION",
  RACKS: "RACKS",
  INVENTORY_JOURNALS: "INVENTORY_JOURNALS",
  INVENTORY_TRANSACTIONS: "INVENTORY_TRANSACTIONS",
  ON_HAND_STOCK: "ON_HAND_STOCK",
  INVENTORY_DASHBOARD: "INVENTORY_DASHBOARD",
  MONTHLY_REPORT: "MONTHLY_REPORT",
  BULK_UPDATE: "BULK_UPDATE",
  UNIT_CONVERSIONS: "UNIT_CONVERSIONS",
  CONFIG: "CONFIG",
  COLOR: "COLOR",
  SERIALS: "SERIALS",
  productDimVersionForm: "productDimVersionForm",
  productDimSize: "productDimSize",
  ProductDimVersion: "ProductDimVersion",
  productDimStyleForm: "productDimStyleForm",
  PRODUCTPAGE: "PRODUCTPAGE",
  LOCATIONPAGE: "PRODUCTPAGE",
};

const VIEW_MODES = { GRID: "GRID", ICON: "ICON", LIST: "LIST" };

const groups = [
  {
    id: "master",
    title: "Master List",
    items: [
      {
        id: "itemMaster",
        title: "Item Master",
        icon: <FaBoxOpen />,
        page: PAGE.ITEM_MASTER,
      },
    ],
  },
  { id: "setups", title: "Setups & Configurations" },
  {
    id: "transaction",
    title: "Transactions",
    subgroups: [
      {
        id: "journals-group",
        title: "Journals",
        items: [
          {
            id: "journals",
            title: "Inventory Journals",
            icon: <FaArchive />,
            page: PAGE.INVENTORY_JOURNALS,
          },
          {
            id: "bulkUpdate",
            title: "Bulk Update",
            icon: <FaSortAmountDown />,
            page: PAGE.BULK_UPDATE,
          },
          {
            id: "unitConv",
            title: "Unit Conversions",
            icon: <FaThLarge />,
            page: PAGE.UNIT_CONVERSIONS,
          },
        ],
      },
      {
        id: "onhand-group",
        title: "On Hand",
        items: [
          {
            id: "onHand",
            title: "On Hand Stock",
            icon: <FaTh />,
            page: PAGE.ON_HAND_STOCK,
          },
          {
            id: "monthly",
            title: "Monthly Report",
            icon: <FaFilter />,
            page: PAGE.MONTHLY_REPORT,
          },
          {
            id: "dashboard",
            title: "Dashboard",
            icon: <FaColumns />,
            page: PAGE.INVENTORY_DASHBOARD,
          },
        ],
      },
    ],
  },
];

// Setup sections with dynamic cols for grid
const setupSections = [
  {
    id: "storage",
    title: "1. Storage Dimensions",
    cols: 3,
    items: [
      { id: "site", title: "Site", icon: <FaMap />, page: PAGE.SITE },
      {
        id: "warehouse",
        title: "WH",
        icon: <FaWarehouse />,
        page: PAGE.WAREHOUSE,
      },
      { id: "zone", title: "Zone", icon: <FaMapMarkerAlt />, page: PAGE.ZONE },
    ],
  },
  {
    id: "product",
    title: "2. Product Dimensions",
    cols: 2,
    items: [
      { id: "config", title: "Config", icon: <FaFilter />, page: PAGE.CONFIG },
      { id: "color", title: "Color", icon: <FaPalette />, page: PAGE.COLOR },
    ],
  },
  {
    id: "tracking",
    title: "3. Tracking Dimensions",
    cols: 2,
    items: [
      {
        id: "batches",
        title: "Batches",
        icon: <FaArchive />,
        page: PAGE.BATCHES,
      },
      {
        id: "serials",
        title: "Serials",
        icon: <FaListUl />,
        page: PAGE.SERIALS,
      },
      {
        id: "Aisles",
        title: "Aisles",
        icon: <FaListUl />,
        page: PAGE.SERIALS,
      },
      {
        id: "Bin",
        title: "Bin",
        icon: <FaListUl />,
        page: PAGE.BIN,
      },
      {
        id: "Location",
        title: "Location",
        icon: <FaListUl />,
        page: PAGE.LOCATION,
      },
      {
        id: "ProductColor ",
        title: "Product",
        icon: <FaListUl />,
        page: PAGE.PRODUCTPAGE,
      },
      {
        id: "ProductDimConf ",
        title: "Product",
        icon: <FaListUl />,
        page: PAGE.PRODUCTPAGE,
      },
      {
        id: "productDimStyle",
        title: "Product",
        icon: <FaListUl />,
        page: PAGE.PRODUCTPAGE,
      },
      {
        id: "Serials",
        title: "Product",
        icon: <FaListUl />,
        page: PAGE.PRODUCTPAGE,
      },
      {
        id: "Location",
        title: "Location",
        icon: <FaListUl />,
        page: PAGE.LOCATION,
      },
      {
        id: "Shelves",
        title: "Product",
        icon: <FaListUl />,
        page: PAGE.PRODUCTPAGE,
      },
      {
        id: "Site",
        title: "Product",
        icon: <FaListUl />,
        page: PAGE.PRODUCTPAGE,
      },
      {
        id: "Shelves",
        title: "Shelves",
        icon: <FaListUl />,
        page: PAGE.SHELVES,
      },
    ],
  },
];

const componentMap = {
  [PAGE.ITEM_MASTER]: <ItemMasterPage />,
  [PAGE.WAREHOUSE]: <WarehousePage />,
  [PAGE.SITE]: <SitePage />,
  // [PAGE.ZONE]: <ZonePage />,
  [PAGE.SHELVES]: <ShelvesPage />,
  // [PAGE.AISLES]: <AislesPage />,
  // [PAGE.BATCHES]: <BatchValuePage />,
  // [PAGE.BIN]: <BinPage />,
  [PAGE.LOCATION]: <LocationPage />,
  [PAGE.RACKS]: <RackPage/>,
  // [PAGE.CONFIG]: <ConfigPage />,
  // [PAGE.COLOR]: <ColorPage />,
  // [PAGE.SERIALS]: <SerialsPage />,
};

export default function ViewTogglePage() {
  const [page, setPage] = useState(PAGE.TOGGLE);
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [hiddenGroups, setHiddenGroups] = useState({});
  const [hiddenSections, setHiddenSections] = useState({});
  const [hiddenSubgroups, setHiddenSubgroups] = useState({});

  const goBack = () => setPage(PAGE.TOGGLE);
  const toggleGroup = (id) =>
    setHiddenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleSection = (id) =>
    setHiddenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleSubgroup = (id) =>
    setHiddenSubgroups((prev) => ({ ...prev, [id]: !prev[id] }));

  // generic item renderer respecting viewMode
  const renderItems = (items, cols) => {
    const containerClass =
      viewMode === VIEW_MODES.GRID
        ? `grid grid-cols-${cols} gap-6`
        : viewMode === VIEW_MODES.ICON
        ? `grid grid-cols-${cols * 2} gap-6`
        : "flex flex-col gap-4";

    return (
      <div className={containerClass}>
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => item.page && setPage(item.page)}
            className={
              viewMode === VIEW_MODES.LIST
                ? "cursor-pointer flex items-center p-4 hover:bg-gray-50 transition"
                : "cursor-pointer bg-white rounded-lg shadow hover:shadow-lg transform hover:scale-105 transition p-6 flex flex-col items-center"
            }
          >
            <div
              className={
                viewMode === VIEW_MODES.LIST
                  ? "text-2xl text-gray-500 mr-4"
                  : "text-4xl text-gray-600 mb-4"
              }
            >
              {item.icon}
            </div>
            <span
              className={
                viewMode === VIEW_MODES.LIST
                  ? "text-md font-medium"
                  : "text-lg font-medium mb-2"
              }
            >
              {item.title}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (page !== PAGE.TOGGLE) {
    return (
      <div className="p-6">
        <button
          onClick={goBack}
          className="flex items-center mb-4 text-gray-700 hover:text-gray-900"
        >
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </button>
        {componentMap[page]}
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

      {groups.map((grp) => (
        <div key={grp.id} className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{grp.title}</h2>
            <button
              onClick={() => toggleGroup(grp.id)}
              className="text-gray-600 text-2xl hover:text-gray-800"
            >
              {hiddenGroups[grp.id] ? ">>" : "^^"}
            </button>
          </div>

          {!hiddenGroups[grp.id] &&
            (grp.id === "setups"
              ? setupSections.map((section) => (
                  <div key={section.id} className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-md font-medium">{section.title}</h3>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        {hiddenSections[section.id] ? ">>" : "^^"}
                      </button>
                    </div>
                    {!hiddenSections[section.id] &&
                      renderItems(section.items, section.cols)}
                  </div>
                ))
              : grp.subgroups
              ? grp.subgroups.map((sub) => (
                  <div key={sub.id} className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-md font-medium">{sub.title}</h3>
                      <button
                        onClick={() => toggleSubgroup(sub.id)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        {hiddenSubgroups[sub.id] ? ">>" : "^^"}
                      </button>
                    </div>
                    {!hiddenSubgroups[sub.id] &&
                      renderItems(
                        sub.items,
                        viewMode === VIEW_MODES.ICON
                          ? sub.items.length
                          : viewMode === VIEW_MODES.GRID
                          ? 4
                          : sub.items.length
                      )}
                  </div>
                ))
              : renderItems(
                  grp.items,
                  viewMode === VIEW_MODES.ICON
                    ? grp.items.length
                    : viewMode === VIEW_MODES.GRID
                    ? 4
                    : grp.items.length
                ))}
        </div>
      ))}
    </div>
  );
}
