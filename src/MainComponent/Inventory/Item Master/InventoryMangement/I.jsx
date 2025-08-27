import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { PAGE, VIEW_MODES, groups, setupSections } from "./constants";
import BatchValuePage from "../../Tracking Dimension/BatchValue/BatchValuePage";
import { FaThLarge, FaListUl, FaTh, FaArrowLeft } from "react-icons/fa";
import SerialPage from "../../Tracking Dimension/Serial/SerialPage";

import AislesPage from "../../Storage Dimension/Aisles/AislesPage";
import ItemMasterPage from "../Item/ItemPage";

import LocationPage from "../../Storage Dimension/Location/LocationPage";
import BinPage from "../../../Inventory/Storage Dimension/Bin/BinPage";
import ProductDimColor from "../../Product Dimension/Color/ProductDimColorPage";
import ProductDimConfig from "../../Product Dimension/Configuration/ProductDimConfPage";
import ProductDimVersion from "../../Product Dimension/ProductDimVersion/ProductDimVersionPage";
import Style from "../../Product Dimension/Style/ProductDimStylePage";
import Size from "../../Product Dimension/ProductDimSize/ProductDimSizePage";
import RackPage from "../../Storage Dimension/Rack/RackPage";
import WarehousePage from "../../Storage Dimension/Warehouse/WarehousePage";
import ShelvesPage from "../../Storage Dimension/Shelves/ShelvesPage";


const initialForm = {
  company: localStorage.getItem("selectedCompany") || "",
};

const I = () => {
  const [companies, setCompanies] = useState([]);
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

  const componentMap = useMemo(
    () => ({
      [PAGE.ITEM_MASTER]: (
        <ItemMasterPage companies={companies} form={form} setForm={setForm} />
      ),

      [PAGE.AISLES]: (
        <AislesPage companies={companies} form={form} setForm={setForm} />
      ),
      [PAGE.SERIALS]: (
        <SerialPage companies={companies} form={form} setForm={setForm} />
      ),
      [PAGE.BATCHES]: (
        <BatchValuePage companies={companies} form={form} setForm={setForm} />
      ),
      [PAGE.COLOR]: (
        <ProductDimColor companies={companies} form={form} setForm={setForm} />
      ),
        // [PAGE.SITE]: (
        //       <SitePage companies={companies} form={form} setForm={setForm} />
        //     ),
      [PAGE.RACK]: (
        <RackPage companies={companies} form={form} setForm={setForm} />
      ),
      [PAGE.WAREHOUSE]: (
        <WarehousePage companies={companies} form={form} setForm={setForm} />
      ),
      [PAGE.SHELVES]: (
        <ShelvesPage companies={companies} form={form} setForm={setForm} />
      ),
      [PAGE.LOCATION]: (
        <LocationPage companies={companies} form={form} setForm={setForm} />
      ),
      [PAGE.BIN]: (
        <BinPage companies={companies} form={form} setForm={setForm} />
      ),
      [PAGE.CONFIG]: (
        <ProductDimConfig companies={companies} form={form} setForm={setForm} />
      ),
      [PAGE.DIMVERSION]: (
        <ProductDimVersion
          companies={companies}
          form={form}
          setForm={setForm}
        />
      ),
      [PAGE.STYLE]: (
        <Style companies={companies} form={form} setForm={setForm} />
      ),
      [PAGE.SIZE]: <Size companies={companies} form={form} setForm={setForm} />,
    }),
    [companies, form]
  );
  const Card = ({ item }) => (
    <button
      onClick={() => item.page && setPage(item.page)}
      className="group w-full h-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition text-left"
      title={item.title}
    >
      <div className="flex items-center gap-3">
        <div className="text-xl text-gray-700 group-hover:scale-110 transition">
          {item.icon || <FaTh />}
        </div>
        <div>
          <div className="font-medium text-gray-900">{item.title}</div>
          {item.subtitle ? (
            <div className="text-xs text-gray-500">{item.subtitle}</div>
          ) : null}
        </div>
      </div>
    </button>
  );

  const IconTile = ({ item }) => (
    <button
      onClick={() => item.page && setPage(item.page)}
      className="group rounded-xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow transition flex flex-col items-center justify-center"
      title={item.title}
    >
      <div className="text-2xl text-gray-700 mb-1 group-hover:scale-110 transition">
        {item.icon || <FaTh />}
      </div>
      <div className="text-xs font-medium text-gray-800 text-center line-clamp-2">
        {item.title}
      </div>
    </button>
  );

  const ListRow = ({ item, idx }) => (
    <button
      onClick={() => item.page && setPage(item.page)}
      className="w-full text-left grid grid-cols-[2rem,1fr,10rem] items-center px-3 py-2 hover:bg-gray-50 border-b last:border-b-0"
      title={item.title}
    >
      <div className="text-gray-500">{idx + 1}.</div>
      <div className="flex items-center gap-3">
        <span className="text-lg text-gray-700">{item.icon || <FaTh />}</span>
        <span className="font-medium text-gray-900">{item.title}</span>
      </div>
      <div className="justify-self-end">
        <span className="text-xs text-gray-500">Open</span>
      </div>
    </button>
  );

  const renderItems = (items = [], colsOverride) => {
    if (!items?.length) return null;

    if (viewMode === VIEW_MODES.LIST) {
      return (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          {items.map((it, i) => (
            <ListRow key={it.id || it.title || i} item={it} idx={i} />
          ))}
        </div>
      );
    }

    if (viewMode === VIEW_MODES.ICON) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
          {items.map((it, i) => (
            <IconTile key={it.id || it.title || i} item={it} />
          ))}
        </div>
      );
    }

    // GRID
    const cols = colsOverride || 4;
    const gridClass =
      cols === 1
        ? "grid-cols-1"
        : cols === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : cols === 3
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

    return (
      <div className={`grid ${gridClass} gap-4`}>
        {items.map((it, i) => (
          <Card key={it.id || it.title || i} item={it} />
        ))}
      </div>
    );
  };
  // ------------------------------------------------------------

  // === Page switch ===
  if (page !== PAGE.TOGGLE) {
    return (
      <div className="p-4 sm:p-6">
        <button
          onClick={goBack}
          className="inline-flex items-center mb-4 text-gray-700 hover:text-gray-900"
        >
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </button>
        {componentMap[page] || null}
      </div>
    );
  }

  const viewIcons = [
    <FaThLarge key="grid" />,
    <FaTh key="icon" />,
    <FaListUl key="list" />,
  ];
  const modes = [VIEW_MODES.GRID, VIEW_MODES.ICON, VIEW_MODES.LIST];
  return (
    <div>
      {" "}
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Inventory Dashboard</h2>
          <div className="flex items-center space-x-3">
            <div className="flex bg-gray-100 rounded-xl overflow-hidden ring-1 ring-gray-200">
              {modes.map((mode, index) => (
                <button
                  key={mode}
                  aria-label={`${mode} view`}
                  onClick={() => setViewMode(mode)}
                  className={`p-2 w-10 h-10 flex items-center justify-center transition ${
                    viewMode === mode
                      ? "bg-white shadow ring-1 ring-gray-200"
                      : "hover:bg-gray-200"
                  }`}
                >
                  {React.cloneElement(viewIcons[index], {
                    className: "text-base text-gray-700",
                  })}
                </button>
              ))}
            </div>
          </div>
        </div>

        {groups.map((grp) => (
          <section key={grp.id} className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">{grp.title}</h3>
              <button
                onClick={() => toggleGroup(grp.id)}
                className="text-gray-600 text-xl hover:text-gray-800"
                aria-label={`Toggle ${grp.title}`}
                title={hiddenGroups[grp.id] ? "Expand" : "Collapse"}
              >
                {hiddenGroups[grp.id] ? "▸" : "▾"}
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
                          aria-label={`Toggle ${section.title}`}
                          title={
                            hiddenSections[section.id] ? "Expand" : "Collapse"
                          }
                        >
                          {hiddenSections[section.id] ? "▸" : "▾"}
                        </button>
                      </div>
                      {!hiddenSections[section.id] &&
                        renderItems(
                          section.items,
                          section.cols ||
                            (viewMode === VIEW_MODES.GRID
                              ? 4
                              : section.items?.length || 4)
                        )}
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
                          aria-label={`Toggle ${sub.title}`}
                          title={
                            hiddenSubgroups[sub.id] ? "Expand" : "Collapse"
                          }
                        >
                          {hiddenSubgroups[sub.id] ? "▸" : "▾"}
                        </button>
                      </div>
                      {!hiddenSubgroups[sub.id] &&
                        renderItems(
                          sub.items,
                          viewMode === VIEW_MODES.GRID
                            ? 4
                            : sub.items?.length || 4
                        )}
                    </div>
                  ))
                : grp.items
                ? renderItems(
                    grp.items,
                    viewMode === VIEW_MODES.GRID ? 4 : grp.items?.length || 4
                  )
                : null)}
          </section>
        ))}
      </div>
    </div>
  );
};

export default I;
