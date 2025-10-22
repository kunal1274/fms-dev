// src/constants.js
import {
  FaThLarge,
  FaListUl,
  FaTh,
  FaArrowLeft,
  FaWarehouse,
  FaFilter,
  FaSortAmountDown,
  FaBoxOpen,
  FaColumns,
  FaMap,
  FaMapMarkerAlt,
  FaPalette,
  FaArchive,
} from "react-icons/fa";

// Page Constants

export const VIEW_MODES = {
  GRID: "GRID",
  ICON: "ICON",
  LIST: "LIST",
};
export const PAGE = {
  TOGGLE: "TOGGLE",
  ITEM_MASTER: "ITEM_MASTER",
  WAREHOUSE: "WAREHOUSE",
  SITE: "SITE",
  ZONE: "ZONE",
  SHELVES: "SHELVES",
  AISLES: "AISLES",
  BATCHES: "BATCHES",
  BIN: "BIN",
  LOCATION: "LOCATION",
  RACK: "RACK",
  PAlLLET: "PAlLLET", // looks like this is spelled oddly, maybe PALLET?
  SERIALS: "SERIALS",
  INVENTORY_JOURNALS: "INVENTORY_JOURNALS",
  INVENTORY_INOUT: "INVENTORY_INOUT",
  BULK_UPDATE: "BULK_UPDATE",
  UNIT_CONVERSIONS: "UNIT_CONVERSIONS",
  INVENTORY_TRANSACTIONS: "INVENTORY_TRANSACTIONS",
  ON_HAND_STOCK: "ON_HAND_STOCK",
  COLOR: "COLOR",
  CONFIG: "CONFIG",
  DIMVERSION: "DIMVERSION",
  STYLE: "STYLE",
  SIZE: "SIZE",
};
// Group Pages for Sidebar Navigation
export const groups = [
  {
    id: "master",
    title: "Item Master",
    items: [
      {
        id: "item",
        title: "Item",
        page: PAGE.ITEM_MASTER,
      },
    ],
  },
  {
    id: "setups",
    title: "Inventory Master",
    items: [],
  },
  {
    id: "transaction",
    title: "Transactions",
    subgroups: [
      {
        id: "journals-group",
        title: "Inventory Journal",
        items: [
          {
            id: "jornal",
            title: "Journal Creation Form",
            icon: <FaArchive />,
            page: PAGE.INVENTORY_JOURNALS,
          },
          {
            id: "inout",
            title: "Inuout Journal",
            icon: <FaArchive />,
            page: PAGE.INVENTORY_INOUT,
          },
          {
            id: "adjustment",
            title: "Adjustment Journal",
            icon: <FaSortAmountDown />,
            page: PAGE.BULK_UPDATE,
          },
          {
            id: "counting",
            title: "Counting Journal",
            icon: <FaThLarge />,
            page: PAGE.UNIT_CONVERSIONS,
          },
          {
            id: "transfer",
            title: "Transfer Journal",
            icon: <FaThLarge />,
            page: PAGE.UNIT_CONVERSIONS,
          },
          {
            id: "transferOrder",
            title: "Transfer Order",
            icon: <FaThLarge />,
            page: PAGE.UNIT_CONVERSIONS,
          },
        ],
      },
      {
        id: "onhand-group",
        title: "Transaction and Report",
        items: [
          {
            id: "inventory-transactions",
            title: "Inventory Transactions",
            icon: <FaTh />,
            page: PAGE.INVENTORY_TRANSACTIONS,
          },
          {
            id: "onhand-stock",
            title: "Inventory Balance / On-hand Stock",
            icon: <FaFilter />,
            page: PAGE.ON_HAND_STOCK,
          },
        ],
      },
      {
        id: "print-reports",
        title: "Invoice & Document Printing",
        items: [
          {
            id: "print-inout",
            title: "Inout Journal Report Printing",
            icon: <FaTh />,
            page: PAGE.INVENTORY_JOURNALS,
          },
          {
            id: "print-adjustment",
            title: "Adjustment Journal Report Printing",
            icon: <FaFilter />,
            page: PAGE.BULK_UPDATE,
          },
          {
            id: "print-counting",
            title: "Counting Journal Report Printing",
            icon: <FaFilter />,
            page: PAGE.UNIT_CONVERSIONS,
          },
          {
            id: "print-transfer",
            title: "Transfer Journal Report Printing",
            icon: <FaFilter />,
            page: PAGE.UNIT_CONVERSIONS,
          },
        ],
      },
    ],
  },
];

// Setup Sections for Config Pages
export const setupSections = [
  {
    id: "product",
    title: "Product Dimensions",
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
      {
        id: "dimversion",
        title: "Product Dim Version",
        icon: <FaFilter />,
        page: PAGE.DIMVERSION,
      },
      { id: "style", title: "Style", icon: <FaFilter />, page: PAGE.STYLE },
      { id: "size", title: "Size", icon: <FaFilter />, page: PAGE.SIZE },
    ],
  },
{
  id: "storage",
  title: "Storage Dimensions",
  cols: 3, // ← controls number of boxes per row
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
    id: "tracking",
    title: "Tracking Dimensions",
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
