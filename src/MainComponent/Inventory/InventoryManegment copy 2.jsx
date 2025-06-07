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
  FaMap,
  FaColumns,
  FaArchive,
  FaMapMarkerAlt,
  FaPalette,
} from "react-icons/fa";

// Pages
import WarehousePage from "./Warehouse/WarehouseForm.jsx";
import ItemMasterPage from "./Item/Form.jsx";
import SitePage from "./Site/SiteForm.jsx";
import AislesPage from "./Aisles/AislesForm.jsx";
import ShelvesPage from "./Shelves/ShelvesForm.jsx";
import SerialPage from "./Serial/SerialForm.jsx";
import BatchValuePage from "./BatchValue/BatchValueform.jsx";
import BinPage from "./Bin/BinForm.jsx";
import RackPage from "./Rack/RackForm.jsx";
import LocationPage from "./Location/LocationForm.jsx";
import ZonePage from "./Zone/ZoneForm.jsx";
import ConfigPage from "./ProductDimConf/ProductDimConfForm.jsx";
import ColorPage from "./ProductDimColor/ProductDimColorForm.jsx";

const PAGE = {
  TOGGLE: "TOGGLE",
  ITEM_MASTER: "ITEM_MASTER",
  SITE: "SITE",
  WAREHOUSE: "WAREHOUSE",
  ZONE: "ZONE",
  AISLES: "AISLES",
  SHELVES: "SHELVES",
  RACKS: "RACKS",
  BATCHES: "BATCHES",
  BIN: "BIN",
  LOCATION: "LOCATION",
  INVENTORY_JOURNALS: "INVENTORY_JOURNALS",
  BULK_UPDATE: "BULK_UPDATE",
  UNIT_CONVERSIONS: "UNIT_CONVERSIONS",
  ON_HAND_STOCK: "ON_HAND_STOCK",
  MONTHLY_REPORT: "MONTHLY_REPORT",
  INVENTORY_DASHBOARD: "INVENTORY_DASHBOARD",
  CONFIG: "CONFIG",
  COLOR: "COLOR",
  SERIALS: "SERIALS",
};

const VIEW_MODES = { GRID: "GRID", ICON: "ICON", LIST: "LIST" };
const COMPANY_API_URL = "/api/companies"; // adjust to your real endpoint

const initialForm = { company: "" };

export default function ViewTogglePage() {
  const [page, setPage] = useState(PAGE.TOGGLE);
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [hiddenGroups, setHiddenGroups] = useState({});
  const [hiddenSections, setHiddenSections] = useState({});
  const [hiddenSubgroups, setHiddenSubgroups] = useState({});

  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(initialForm);

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(COMPANY_API_URL);
        const payload = response.data;
        // Handle different API shapes
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.data)
          ? payload.data
          : [];
        setCompanies(list);
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    };
    fetchCompanies();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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

  // Layout definitions (groups and setupSections remain unchanged)
  /* ... same as before ... */

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
        <select
          name="company"
          value={form.company}
          onChange={handleChange}
          required
          className="mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-200"
        >
          <option value="">Select a company…</option>
          {companies.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        {/* view mode toggle UI */}
      </div>
      {/* rest of layout rendering */}
    </div>
  );
}
