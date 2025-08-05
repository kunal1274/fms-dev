import React, { useState, useEffect } from "react";
import axios from "axios";
import { PAGE, VIEW_MODES, groups, setupSections } from "./constants";
import { FaThLarge, FaListUl, FaTh, FaArrowLeft } from "react-icons/fa";

import ItemMasterPage from "./Item Master/Item/ItemPage";
import WarehousePage from "./Storage Dimension/Warehouse/WarehousePage";
import SitePage from "./Storage Dimension/Site/SitePage";
import ZonePage from "./Storage Dimension/Zone/ZonePage";
import ShelvesPage from "./Storage Dimension/Shelves/ShelvesPage";
import Aisles from "./Storage Dimension/Aisles/AislesPage";
import BatchValuePage from "./Tracking Dimension/BatchValue/BatchValueViewPagee";
import BinPage from "./Storage Dimension/Bin/BinPage";
import LocationPage from "./Storage Dimension/Location/LocationPage";
import RackPage from "./Storage Dimension/Rack/RackPage";
import Serial from "./Tracking Dimension/Serial/SerialPage";
import JournalCreationForm from "./Inventory Jornal/Jornal/Jornal";
import Inout from "../Sale/JournalRevenue/InoutJornal";
import InoutJournal from "../Sale/JournalRevenue/InoutJornal";
const initialForm = {
  company: localStorage.getItem("selectedCompany") || "",
};

export default function ViewTogglePage() {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [page, setPage] = useState(PAGE.TOGGLE);
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [hiddenGroups, setHiddenGroups] = useState({});
  const [hiddenSections, setHiddenSections] = useState({});
  const [hiddenSubgroups, setHiddenSubgroups] = useState({});

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const resp = await axios.get("/fms/api/v0/companies");
        setCompanies(Array.isArray(resp.data) ? resp.data : resp.data.data);
      } catch (err) {
        console.error("Failed to load companies:", err);
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
        ? `grid grid-cols-${cols} gap-4`
        : viewMode === VIEW_MODES.ICON
        ? `grid grid-cols-${cols * 2} gap-4`
        : "flex flex-col gap-3";

    return (
      <div className={containerClass}>
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => item.page && setPage(item.page)}
            className={
              viewMode === VIEW_MODES.LIST
                ? "cursor-pointer flex items-center p-2 hover:bg-gray-50 transition rounded"
                : "cursor-pointer bg-white rounded shadow hover:shadow-md transition p-3 flex flex-col items-center"
            }
          >
            <div
              className={
                viewMode === VIEW_MODES.LIST
                  ? "text-xl text-gray-500 mr-3"
                  : "text-lg text-gray-600 mb-2"
              }
            >
              {item.icon}
            </div>
            <h5
              className={
                viewMode === VIEW_MODES.LIST
                  ? "text-sm font-medium"
                  : "text-base font-medium text-center"
              }
            >
              {item.title}
            </h5>
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
    [PAGE.SERIALS]: (
      <Serial companies={companies} form={form} setForm={setForm} />
    ),
    [PAGE.INVENTORY_INOUT]: (
      <InoutJournal companies={companies} form={form} setForm={setForm} />
    ),
    // [PAGE.INVENTORY_JOURNALS]: <JournalCreationForm />,
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
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Item Dashboard</h2>
        <div className="flex justify-end items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg overflow-hidden">
            {[VIEW_MODES.GRID, VIEW_MODES.ICON, VIEW_MODES.LIST].map(
              (mode, index) => {
                const icons = [<FaThLarge />, <FaTh />, <FaListUl />];
                return (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`p-2 w-10 h-10 flex items-center justify-center ${
                      viewMode === mode
                        ? "bg-white shadow"
                        : "hover:bg-gray-200"
                    } transition`}
                  >
                    {React.cloneElement(icons[index], {
                      className: "text-base",
                    })}
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
            <h3 className="text-lg font-semibold">{grp.title}</h3>
            <button
              onClick={() => toggleGroup(grp.id)}
              className="text-gray-600 text-xl hover:text-gray-800"
            >
              {hiddenGroups[grp.id] ? ">" : "^"}
            </button>
          </div>
          {!hiddenGroups[grp.id] &&
            (grp.id === "setups"
              ? setupSections.map((section) => (
                  <div key={section.id} className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-md font-medium">{section.title}</h4>
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
                      <h5 className="text-md font-medium">{sub.title}</h5>
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
