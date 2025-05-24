import React, { useState } from "react";
import {
  FaThLarge,
  FaListUl,
  FaTh,
  FaArrowLeft,
  FaBoxOpen,
  FaPalette,
  FaFilter,
  FaSortAmountDown,
  FaWarehouse,
  FaMap,
  FaColumns,
  FaArchive,
  FaMapMarkerAlt,
  FaLayerGroup,
} from "react-icons/fa";

// import your real pages:
import ItemMasterPage from "./MainComponent/Inventory/Item/ItemPage";
// import other pages as needed
import WarehousePage from "./MainComponent/Inventory/Warehouse/WarehousePage";

// Page keys
const PAGE = {
  TOGGLE: "TOGGLE",
  ITEM_MASTER: "ITEM_MASTER",
  ITEM_LIST: "ITEM_LIST",
  INVENTORY_JOURNALS: "INVENTORY_JOURNALS",
  SITE: "SITE",
  WAREHOUSE: "WAREHOUSE",
  ZONE: "ZONE",
  CONFIG: "CONFIG",
  COLOR: "COLOR",
  BATCHES: "BATCHES",
  SERIALS: "SERIALS",
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
    id: "transaction",
    title: "Transaction List",
    items: [
      {
        id: "journals",
        title: "Inventory Journals",
        icon: <FaArchive />,
        page: PAGE.INVENTORY_JOURNALS,
      },
    ],
  },
  {
  id: "setups",
  title: "Setups and Configurations",
  items: [
    {
      id: "storage",
      title: "Storage Dimensions",
      icon: <FaMapMarkerAlt />,
      subItems: [
        { id: "site", title: "Site", page: PAGE.SITE },
        { id: "warehouse", title: "WH", page: PAGE.WAREHOUSE },
        { id: "zone", title: "Zone", page: PAGE.ZONE },
      ],
    },
    {
      id: "productDims",
      title: "Product dimensions",
      icon: <FaPalette />,
      subItems: [
        { id: "config", title: "Config", page: PAGE.CONFIG },
        { id: "color", title: "Color", page: PAGE.COLOR },
        { id: "size", title: "Size", page: PAGE.SIZE },            // third sub-item
      ],
    },
    {
      id: "tracking",
      title: "Tracking Dimensions",
      icon: <FaLayerGroup />,
      subItems: [
        { id: "batches", title: "Batches", page: PAGE.BATCHES },
        { id: "serials", title: "Serials", page: PAGE.SERIALS },
        { id: "lots", title: "Lots", page: PAGE.LOTS },             // third sub-item
      ],
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
  {
    id: "configUnits",
    title: "Units Configuration",
    items: [
      {
        id: "units",
        title: "Units",
        icon: <FaTh />,
        subItems: [
          {
            id: "unitConv",
            title: "Unit Conversions",
            page: PAGE.UNIT_CONVERSIONS,
          },
        ],
      },
    ],
  },
];

// Map pages to components
const componentMap = {
  [PAGE.ITEM_MASTER]: <ItemMasterPage />,
  [PAGE.WAREHOUSE]: <WarehousePage />,
};

export default function ViewTogglePage() {
  const [page, setPage] = useState(PAGE.TOGGLE);
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);

  const goBack = () => setPage(PAGE.TOGGLE);

  // Flatten items for a given group
  const flattenItems = (grp) =>
    grp.items.flatMap((item) =>
      item.subItems
        ? item.subItems.map((sub) => ({ ...sub, icon: item.icon }))
        : [{ ...item, icon: item.icon }]
    );

  // Detail page
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

      {viewMode === VIEW_MODES.GRID &&
        groups.map((grp) => (
          <div key={grp.id} className="mb-8">
            <h2 className="text-lg font-semibold mb-4">{grp.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {flattenItems(grp).map((item) => (
                <div
                  key={item.id}
                  onClick={() => setPage(item.page)}
                  className="cursor-pointer bg-white rounded-lg shadow hover:shadow-lg transform hover:scale-105 transition p-6 flex flex-col items-center"
                >
                  <div className="text-4xl text-gray-600 mb-4">{item.icon}</div>
                  <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                </div>
              ))}
            </div>
          </div>
        ))}

      {viewMode === VIEW_MODES.ICON &&
        groups.map((grp) => (
          <div key={grp.id} className="mb-8">
            <h2 className="text-lg font-semibold mb-4">{grp.title}</h2>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-6">
              {flattenItems(grp).map((item) => (
                <div
                  key={item.id}
                  onClick={() => setPage(item.page)}
                  className="cursor-pointer flex flex-col items-center p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition"
                >
                  <div className="text-3xl text-gray-600 mb-2">{item.icon}</div>
                  <span className="text-sm text-gray-800">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

      {viewMode === VIEW_MODES.LIST &&
        groups.map((grp) => (
          <div key={grp.id} className="mb-8">
            <h2 className="text-lg font-semibold mb-2">{grp.title}</h2>
            <div className="bg-white rounded-lg shadow divide-y">
              {flattenItems(grp).map((item) => (
                <div
                  key={item.id}
                  onClick={() => setPage(item.page)}
                  className="cursor-pointer flex items-center p-4 hover:bg-gray-50 transition"
                >
                  <div className="text-2xl text-gray-500 mr-4">{item.icon}</div>
                  <h3 className="text-md font-medium">{item.title}</h3>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
