// src/constants.js
import {
  FaThLarge,
  FaListUl,
  FaTh,
  FaArrowLeft,

  FaWarehouse,
  FaFilter,
  FaSortAmountDown,FaBoxOpen,
  FaColumns,
  FaMap,
  FaMapMarkerAlt,
  FaPalette,
  FaArchive,
} from "react-icons/fa";

export const PAGE = {
  TOGGLE: "TOGGLE",
  ITEM_MASTER: "ITEM_MASTER",
  SITE: "SITE",
  WAREHOUSE: "WAREHOUSE",
  ZONE: "ZONE",
  SHELVES: "SHELVES",
  AISLES: "AISLES",
  BATCHES: "BATCHES",
  BIN: "BIN",
  LOCATION: "LOCATION",
  RACK: "RACK",
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
};

export const VIEW_MODES = { GRID: "GRID", ICON: "ICON", LIST: "LIST" };

// Group pages into logical categories for navigation

export const groups = [
  {
    id: "master",
    title: "Master List",
    items: [
      {
        id: "itemMaster",
        title: "Item Master",
        
        page: PAGE.ITEM_MASTER,
      },
    ],
  },
  {
    id: "setups",
    title: "Setups & Configurations",
  },
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
// Return the pages within the same group as the current page
export const setupSections = [
  {
    id: "storage",
    title: "1. Storage Dimensions",
    cols: 3,
    items: [
      { id: "site", title: "Site", icon: <FaMap />, page: PAGE.SITE },
      {
        id: "warehouse",
        title: "Warehouse",
        icon: <FaWarehouse />,
        page: PAGE.WAREHOUSE,
      },
      { id: "zone", title: "Zone", icon: <FaMapMarkerAlt />, page: PAGE.ZONE },
      { id: "aisles", title: "Aisles", icon: <FaListUl />, page: PAGE.AISLES },
      {
        id: "shelves",
        title: "Shelves",
        icon: <FaListUl />,
        page: PAGE.SHELVES,
      },
      { id: "bin", title: "Bin", icon: <FaListUl />, page: PAGE.BIN },
      {
        id: "location",
        title: "Location",
        icon: <FaListUl />,
        page: PAGE.LOCATION,
      },
      { id: "rack", title: "Rack", icon: <FaListUl />, page: PAGE.RACK },
    ],
  },
  {
    id: "product",
    title: "2. Product Dimensions",
    cols: 2,
    items: [
      {
        id: "color",
        title: "Product Color",
        icon: <FaPalette />,
        page: PAGE.COLOR,
      },
      {
        id: "config",
        title: "Product Config",
        icon: <FaFilter />,
        page: PAGE.CONFIG,
      },
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
    ],
  },
];
