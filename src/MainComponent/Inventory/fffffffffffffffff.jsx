import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaThLarge,
  FaListUl,
  FaTh,
  FaArrowLeft,
  FaBoxOpen,
  FaWarehouse,
  FaFilter,
  FaSortAmountDown,
  FaColumns,
  FaMap,
  FaMapMarkerAlt,
  FaPalette,
  FaArchive,
} from "react-icons/fa";

// import your real pages:
import WarehousePage from "./Warehouse/WarehouseForm.jsx";
import ItemMasterPage from "./Item/Form.jsx";
import SitePage from "./Site/SiteForm.jsx";
import Aisles from "./Aisles/AislesForm.jsx";
import ShelvesPage from "./Shelves/ShelvesForm.jsx";
import Serial from "./Serial/SerialForm.jsx";
import BatchValuePage from "./BatchValue/BatchValueform.jsx";
import BinPage from "./Bin/BinForm.jsx";
import RackPage from "./Rack/RackForm.jsx";
import LocationPage from "./Location/LocationForm.jsx";
import ZonePage from "./Zone/ZoneForm.jsx";
import ConfigPage from "./ProductDimConf/ProductDimConfForm.jsx";
import ColorPage from "./ProductDimColor/ProductDimColorForm.jsx";

// Define page keys
const PAGE = {
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

// Footer component


const VIEW_MODES = { GRID: "GRID", ICON: "ICON", LIST: "LIST" };
const initialForm = { company: "" };

// Company dropdown with hover


// Layout sections and groups
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

const setupSections = [
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

export default function ViewTogglePage() {
  const [form, setForm] = useState(initialForm);
  const [companies, setCompanies] = useState([]);
  const [page, setPage] = useState(PAGE.TOGGLE);
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [hiddenGroups, setHiddenGroups] = useState({});
  const [hiddenSections, setHiddenSections] = useState({});
  const [hiddenSubgroups, setHiddenSubgroups] = useState({});
  const initialForm = {
    company: localStorage.getItem("selectedCompany") || "",
  };
  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(
          "https://fms-qkmw.onrender.com/fms/api/v0/companies"
        );
        const data = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setCompanies(data);
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    };
    fetchCompanies();
  }, []);

  const goBack = () => setPage(PAGE.TOGGLE);
  const toggleGroup = (id) =>
    setHiddenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleSection = (id) =>
    setHiddenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleSubgroup = (id) =>
    setHiddenSubgroups((prev) => ({ ...prev, [id]: !prev[id] }));

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
                  : "text-xl text-gray-600 mb-4"
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

  // Mapping pages with passed props
  const componentMap = {
    [PAGE.ITEM_MASTER]: (
      <ItemMasterPage companies={companies} form={form} setForm={setForm} />
    ),
    [PAGE.WAREHOUSE]: (
      <WarehousePage companies={companies} form={form} setForm={setForm} />
    ),
    [PAGE.SITE]: (
      <SitePage companies={companies} form={form} setForm={setForm} />
    ),
    [PAGE.ZONE]: (
      <ZonePage companies={companies} form={form} setForm={setForm} />
    ),
    [PAGE.SHELVES]: (
      <ShelvesPage companies={companies} form={form} setForm={setForm} />
    ),
    [PAGE.AISLES]: (
      <Aisles companies={companies} form={form} setForm={setForm} />
    ),
    [PAGE.BATCHES]: (
      <BatchValuePage companies={companies} form={form} setForm={setForm} />
    ),
    [PAGE.BIN]: <BinPage companies={companies} form={form} setForm={setForm} />,
    [PAGE.LOCATION]: (
      <LocationPage companies={companies} form={form} setForm={setForm} />
    ),
    [PAGE.RACK]: (
      <RackPage companies={companies} form={form} setForm={setForm} />
    ),
    [PAGE.CONFIG]: (
      <ConfigPage companies={companies} form={form} setForm={setForm} />
    ),
    [PAGE.COLOR]: (
      <ColorPage companies={companies} form={form} setForm={setForm} />
    ),
    [PAGE.SERIALS]: (
      <Serial companies={companies} form={form} setForm={setForm} />
    ),
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
      <CompanyContext.Provider
        value={{ form, setForm, companies }}
      ></CompanyContext.Provider>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>

        <div className="flex justify-end items-center space-x-4">
          <CompanyDropdown
            companies={companies}
            form={form}
            setForm={setForm}
          />
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
      </div>

      {/* Render Groups */}
      {groups.map((grp) => (
        <div key={grp.id} className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{grp.title}</h2>
            <button
              onClick={() => toggleGroup(grp.id)}
              className="text-gray-600 text-2xl hover:text-gray-800"
            >
              {hiddenGroups[grp.id] ? ">" : "^"}
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
                        {hiddenSections[section.id] ? ">" : "^"}
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
                        {hiddenSubgroups[sub.id] ? ">" : "^"}
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
      <div className="flex justify-end">
        <Footer companies={companies} form={form} setForm={setForm} />
      </div></CompanyContext.Provider>
    </div>
  );
}
