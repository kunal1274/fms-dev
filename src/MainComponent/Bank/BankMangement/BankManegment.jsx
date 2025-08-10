import React, { useMemo, useState } from "react";
import { PAGE, VIEW_MODES, groups } from "./constants";
import { FaThLarge, FaListUl, FaTh, FaArrowLeft } from "react-icons/fa";

// === Page Components (adjust paths if your folders differ) ===
import BankForm from "../BankMaster/BankForm";
import BankBalanceReport from "../Bank Balance report/Bank Balance report";
import BankTransactionReport from "../BankTransaction/Bank Transaction Report";

export default function InventoryManagement() {
  const [page, setPage] = useState(PAGE.TOGGLE);
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [hiddenGroups, setHiddenGroups] = useState({});
  const [hiddenSubgroups, setHiddenSubgroups] = useState({});

  const goBack = () => setPage(PAGE.TOGGLE);

  const toggleGroup = (id) =>
    setHiddenGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleSubgroup = (id) =>
    setHiddenSubgroups((prev) => ({ ...prev, [id]: !prev[id] }));

  // Shared styles
  const baseCard =
    "cursor-pointer select-none bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm hover:shadow-lg hover:ring-gray-200 transition-all duration-200";
  const baseRow =
    "cursor-pointer flex items-center w-full rounded-xl ring-1 ring-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-200";

  const renderItems = (items = [], cols = 4) => {
    const safeItems = Array.isArray(items) ? items : [];

    // LIST MODE
    if (viewMode === VIEW_MODES.LIST) {
      return (
        <div className="flex flex-col gap-2">
          {safeItems.map((item) => (
            <button
              key={item.id}
              onClick={() => item.page && setPage(item.page)}
              className={`${baseRow} p-3 text-left`}
              title={item.title}
            >
              <div className="text-gray-500 mr-3">{item.icon}</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {item.title}
                </div>
              </div>
            </button>
          ))}
        </div>
      );
    }

    // ICON MODE (small squares)
    if (viewMode === VIEW_MODES.ICON) {
      const iconCols = Math.max(cols * 2, 4);
      return (
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${iconCols}, minmax(0,1fr))` }}
        >
          {safeItems.map((item) => (
            <button
              key={item.id}
              onClick={() => item.page && setPage(item.page)}
              className={`${baseCard} flex flex-col items-center justify-center`}
              style={{ width: 76, height: 76, padding: 8 }}
              title={item.title}
            >
              <div className="text-gray-600 text-base mb-1">{item.icon}</div>
              <div className="text-[10px] font-medium text-gray-800 text-center leading-tight line-clamp-2">
                {item.title}
              </div>
            </button>
          ))}
        </div>
      );
    }

    // GRID MODE (compact cards)
    const gridCols = Math.max(cols, 3);
    return (
      <div
        className="grid gap-3 sm:gap-4"
        style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0,1fr))` }}
      >
        {safeItems.map((item) => (
          <button
            key={item.id}
            onClick={() => item.page && setPage(item.page)}
            className={`${baseCard} flex flex-col items-center justify-center text-sm`}
            style={{ minHeight: 104, padding: 10 }}
            title={item.title}
          >
            <div className="text-gray-600 text-lg mb-1.5">{item.icon}</div>
            <div className="text-xs font-medium text-gray-900 text-center leading-tight">
              {item.title}
            </div>
          </button>
        ))}
      </div>
    );
  };

  const componentMap = useMemo(
    () => ({
      [PAGE.BANK_FORM]: <BankForm />,
      [PAGE.BANK_BALANCE_REPORT]: <BankBalanceReport />,
      [PAGE.BANK_TRANSACTION_REPORT]: <BankTransactionReport />,
    }),
    []
  );

  // Page switch
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
    <div className="p-3 sm:p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Bank Dashboard</h2>
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
            (grp.subgroups
              ? grp.subgroups.map((sub) => (
                  <div key={sub.id} className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="text-md font-medium">{sub.title}</h5>
                      <button
                        onClick={() => toggleSubgroup(sub.id)}
                        className="text-gray-600 hover:text-gray-800"
                        aria-label={`Toggle ${sub.title}`}
                        title={hiddenSubgroups[sub.id] ? "Expand" : "Collapse"}
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
  );
}
