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
} from "react-icons/fa";

// import your real pages:
import ItemMasterPage from "./MainComponent/Inventory/Item/ItemPage";
import WarehousePage from "./MainComponent/Inventory/Warehouse/WarehousePage";
import SitePage from "./MainComponent/Inventory/Site/SitePage";
import ShelvesPage from "./MainComponent/Inventory/Shelves/ShelvesPage";
import AislesPage from "./MainComponent/Inventory/Aisles/AislesPage";
import BatchValuePage from "./MainComponent/Inventory/BatchValue/BatchValuePage";
import BinPage from "./MainComponent/Inventory/Bin/BinPage";
import LocationPage from "./MainComponent/Inventory/Location/LocationPage";
import RacksPage from "./MainComponent/Inventory/Racks/RacksPage";
import ZonePage from "./MainComponent/Inventory/Zone/ZonePage";
import RackPage from "./MainComponent/Inventory/Rack/RackPage";

// Page keys
const PAGE = {
  TOGGLE: "TOGGLE",
  ITEM_MASTER: "ITEM_MASTER",
  INVENTORY_JOURNALS: "INVENTORY_JOURNALS",
  SITE: "SITE",
  WAREHOUSE: "WAREHOUSE",
  ZONE: "ZONE",
  SHELVES: "SHELVES",
  AISLES: "AISLES",
  BATCHES: "BATCHES",
  BIN: "BIN",
  LOCATION: "LOCATION",
  RACKS: "RACKS",
  // other groups/pages (keep or remove as needed)
  INVENTORY_TRANSACTIONS: "INVENTORY_TRANSACTIONS",
  ON_HAND_STOCK: "ON_HAND_STOCK",
  INVENTORY_DASHBOARD: "INVENTORY_DASHBOARD",
  MONTHLY_REPORT: "MONTHLY_REPORT",
  BULK_UPDATE: "BULK_UPDATE",
  UNIT_CONVERSIONS: "UNIT_CONVERSIONS",
};

// View modes
const VIEW_MODES = { GRID: "GRID", ICON: "ICON", LIST: "LIST" };

// Grouped menu structure
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
  {
    id: "setups",
    title: "Setups and Configurations",
    items: [
      {
        id: "warehouse",
        title: "Warehouse",
        icon: <FaWarehouse />,
        page: PAGE.WAREHOUSE,
      },
      { id: "site", title: "Site", icon: <FaMap />, page: PAGE.SITE },
      { id: "zone", title: "Zone", icon: <FaMapMarkerAlt />, page: PAGE.ZONE },
      { id: "shelves", title: "Shelves", icon: <FaTh />, page: PAGE.SHELVES },
      { id: "aisles", title: "Aisles", icon: <FaColumns />, page: PAGE.AISLES },
      { id: "racks", title: "Racks", icon: <FaThLarge />, page: PAGE.RACKS },
      {
        id: "batchValue",
        title: "Batch Value",
        icon: <FaBoxOpen />,
        page: PAGE.BATCHES,
      },
      { id: "bin", title: "Bin", icon: <FaArchive />, page: PAGE.BIN },
      {
        id: "location",
        title: "Location",
        icon: <FaListUl />,
        page: PAGE.LOCATION,
      },
      {
        id: "zonePage",
        title: "Zone",
        icon: <FaMapMarkerAlt />,
        page: PAGE.ZONE,
      },
    ],
  },
  {
    id: "reports",
    title: "Inquiries & Reports",
    items: [
      {
        id: "invTransactions",
        title: "Inventory Transactions",
        icon: <FaThLarge />,
        page: PAGE.INVENTORY_TRANSACTIONS,
      },
      {
        id: "onHand",
        title: "On Hand Stock",
        icon: <FaTh />,
        page: PAGE.ON_HAND_STOCK,
      },
    ],
  },
  {
    id: "workspaces",
    title: "User Workspaces",
    items: [
      {
        id: "dashboard",
        title: "Inventory Dashboard",
        icon: <FaColumns />,
        page: PAGE.INVENTORY_DASHBOARD,
      },
    ],
  },
  {
    id: "periodic",
    title: "Periodic",
    items: [
      {
        id: "monthly",
        title: "Monthly On Hand In/Out",
        icon: <FaFilter />,
        page: PAGE.MONTHLY_REPORT,
      },
      {
        id: "bulkUpdate",
        title: "Bulk Item Master Update",
        icon: <FaSortAmountDown />,
        page: PAGE.BULK_UPDATE,
      },
    ],
  },
];

// Map pages to components
const componentMap = {
  [PAGE.ITEM_MASTER]: <ItemMasterPage />,
  [PAGE.WAREHOUSE]: <WarehousePage />,
  [PAGE.SITE]: <SitePage />,
  [PAGE.ZONE]: <ZonePage />,
  [PAGE.SHELVES]: <ShelvesPage />,
  [PAGE.AISLES]: <AislesPage />,
  [PAGE.BATCHES]: <BatchValuePage />,
  [PAGE.BIN]: <BinPage />,
  [PAGE.LOCATION]: <LocationPage />,
  [PAGE.RACKS]: <RackPage />,
  [PAGE.INVENTORY_TRANSACTIONS]: null, // add your component here
  [PAGE.ON_HAND_STOCK]: null, // add your component here
  [PAGE.INVENTORY_DASHBOARD]: null, // add your component here
  [PAGE.MONTHLY_REPORT]: null, // add your component here
  [PAGE.BULK_UPDATE]: null, // add your component here
  [PAGE.UNIT_CONVERSIONS]: null, // add your component here
};
const [open, setOpen] = useState(false);

  const handleSelect = (id) => {
    // update form
    setForm({ ...form, company: id });
    // persist for next load
    localStorage.setItem("selectedCompany", id);
    setOpen(false);
  };
export default function ViewTogglePage() {
  useEffect(() => {
  const stored = localStorage.getItem("selectedCompany");
  if (stored) {
    setForm(prev => ({ ...prev, company: stored }));
  }
}, []);
  const [page, setPage] = useState(PAGE.TOGGLE);
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);

  const goBack = () => setPage(PAGE.TOGGLE);

  // flatten items
  const flattenItems = (grp) => grp.items.map((item) => ({ ...item }));

  if (page !== PAGE.TOGGLE) {
    return (
      <div className="p-6">
        <button
          onClick={goBack}
          className="flex items-center mb-4 text-gray-700 hover:text-gray-900"
        >
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </button>
        {componentMap[page] || null}
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
          <h2 className="text-lg font-semibold mb-4">{grp.title}</h2>
          <div
            className={`grid gap-6 ${
              viewMode === VIEW_MODES.GRID
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : viewMode === VIEW_MODES.ICON
                ? "grid-cols-4 sm:grid-cols-6 md:grid-cols-8"
                : ""
            }`}
          >
            {flattenItems(grp).map((item) => (
              <div
                key={item.id}
                onClick={() => setPage(item.page)}
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
              <h2>hjye</h2>
          </div>
        </div>
      ))}
    
    </div>
  );
}
