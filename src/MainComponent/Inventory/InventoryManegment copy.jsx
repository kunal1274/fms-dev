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

const initialForm = {
  company: localStorage.getItem("selectedCompany") || "",
};

export default function ViewTogglePage() {
  const [companies, setCompanies] = useState([]);

  // Fetch companies once
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
    [PAGE.INVENTORY_JOURNALS]: <JournalCreationForm />,
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
                ? "cursor-pointer flex justify-between items-center p-4 hover:bg-gray-50 transition"
                : "cursor-pointer bg-white rounded-lg shadow hover:shadow-lg transform hover:scale-105 transition p-6 flex justify-between items-center"
            }
          >
            <h5
              className={
                viewMode === VIEW_MODES.LIST
                  ? "text-md font-medium"
                  : "text-lg font-medium"
              }
            >
              {item.title}
            </h5>
            <div
              className={
                viewMode === VIEW_MODES.LIST
                  ? "text-2xl text-gray-500 ml-4"
                  : "text-xl text-gray-600"
              }
            >
              {item.icon}
            </div>
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
      <h2 className="text-2xl font-bold mb-4">Item Dashboard</h2>
   <div className="flex justify-end mb-4">
  <div className="flex space-x-2">
    {[VIEW_MODES.GRID, VIEW_MODES.ICON, VIEW_MODES.LIST].map(
      (mode, index) => {
        const icons = [<FaThLarge />, <FaTh />, <FaListUl />];
        return (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`p-3 w-12 h-12 flex items-center justify-center ${
              viewMode === mode ? "bg-white shadow" : "hover:bg-gray-200"
            } transition`}
          >
            {React.cloneElement(icons[index], { className: "text-lg" })}
          </button>
        );
      }
    )}
  </div>
</div>


      {groups.map((grp) => (
        <div key={grp.id} className="mb-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">{grp.title}</h3>
            <button onClick={() => toggleGroup(grp.id)} className="">
              {hiddenGroups[grp.id] ? ">" : "^"}
            </button>
          </div>
          {!hiddenGroups[grp.id] &&
            (grp.id === "setups"
              ? setupSections.map((section) => (
                  <div key={section.id} className="ml-4 mt-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-medium">{section.title}</h4>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className=""
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
                  <div key={sub.id} className="ml-4 mt-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-medium">{sub.title}</h4>
                      <button
                        onClick={() => toggleSubgroup(sub.id)}
                        className=""
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
