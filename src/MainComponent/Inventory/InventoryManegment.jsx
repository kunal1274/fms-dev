import React, { useState, useEffect } from "react";
import axios from "axios";
import { PAGE, VIEW_MODES, groups, setupSections } from "./constants";
import CompanyDropdown from "./CompanyDropdown";
import Footer from "./Footer";
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

import ItemMasterPage from "./Item/ItemPage";
import WarehousePage from "./Warehouse/WarehousePage";
import SitePage from "./Site/SitePage";
import ZonePage from "./Zone/ZonePage";
import ShelvesPage from "./Shelves/ShelvesPage";
import Aisles from "./Aisles/AislesPage";
import BatchValuePage from "./BatchValue/BatchValuePage";
import BinPage from "./Bin/BinPage";
import LocationPage from "./Location/LocationPage";
import RackPage from "./Rack/RackPage";
// import ConfigPage from "./ProductDimConf/ProductDimConfPage.jsx";
// import ColorPage from "./ProductDimColor/ProductDimColorPage.jsx/index.js";
import Serial from "./Serial/SerialPage";

const initialForm = {
  company: localStorage.getItem("selectedCompany") || "",
};

export default function ViewTogglePage() {
  const [companies, setCompanies] = useState([]);

  // ──────────────────────────────────────────────────────────
  // 1. Load available companies once on mount  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const resp = await axios.get("/fms/api/v0/companies");
        // adjust to match your payload shape:
        setCompanies(Array.isArray(resp.data) ? resp.data : resp.data.data);
      } catch (err) {
        console.error("Failed to load companies:", err);
      }
    };
    fetchCompanies();
  }, []);
  const [form, setForm] = useState(initialForm);

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
  const handleSaveCompany = () => {
    console.log("Saving selected company:", form.company);
    localStorage.setItem("selectedCompany", form.company);
    // You can add a success message or API call here
  };
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
    // [PAGE.CONFIG]: (
    //   <ConfigPage companies={companies} form={form} setForm={setForm} />
    // ),
    // [PAGE.COLOR]: (
    //   <ColorPage companies={companies} form={form} setForm={setForm} />
    // ),
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="flex justify-end items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg overflow-hidden">
            {[VIEW_MODES.GRID, VIEW_MODES.ICON, VIEW_MODES.LIST].map(
              (mode, index) => {
                const icons = [<FaThLarge />, <FaTh />, <FaListUl />];
                return (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`p-3 ${
                      viewMode === mode
                        ? "bg-white shadow"
                        : "hover:bg-gray-200"
                    } transition`}
                  >
                    {React.cloneElement(icons[index], { className: "text-lg" })}
                  </button>
                );
              }
            )}
          </div>
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
                        viewMode === VIEW_MODES.GRID ? 4 : sub.items.length
                      )}
                  </div>
                ))
              : renderItems(
                  grp.items,
                  viewMode === VIEW_MODES.GRID ? 4 : grp.items.length
                ))}
        </div>
      ))}
     
    </div>
  );
}
