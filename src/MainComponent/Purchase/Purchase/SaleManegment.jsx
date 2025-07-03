import React, { useState } from "react";
import { FaThLarge, FaListUl, FaTh, FaArrowLeft } from "react-icons/fa";
import { PAGE, VIEW_MODES, groups, setupSections } from "./constants";

import CreditNote from "../CreditNoteDebitNote/CreditNote";
import DebitNote from "../CreditNoteDebitNote/DebitNote";
import FreeTaxingInvoice from "../FreeTaxingInvoice/FreeTaxingInvoice";
import JournaRevenueOrderform from "../JournalRevenue/JournaRevenueOrderform";
import ReturnOrder from "../ReturnOrder/ReturnOrder";
import PurchasePage from "../Purchase/PurchasePage"; // ✅ Fix the import path
// Add more component imports here as needed

const initialForm = {
  company: localStorage.getItem("selectedCompany") || "",
};

export default function ViewTogglePage() {
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

  const rendersale = (sale = [], cols = 3) => {
    if (!Array.isArray(sale)) return null;

    const containerClass =
      viewMode === VIEW_MODES.GRID
        ? `grid grid-cols-${cols} gap-6`
        : viewMode === VIEW_MODES.ICON
        ? `grid grid-cols-${cols * 2} gap-6`
        : "flex flex-col gap-4";

    return (
      <div className={containerClass}>
        {sale.map((item) => (
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
              {item.icon && React.createElement(item.icon)}
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
    [PAGE.CREDIT_NOTE]: <CreditNote />,
    [PAGE.DEBIT_NOTE]: <DebitNote />,
    [PAGE.FREE_TAXING]: <FreeTaxingInvoice />,
    [PAGE.JOURNAL_REVENUE]: <JournaRevenueOrderform />,
    [PAGE.RETURN_ORDER]: <ReturnOrder />,
    [PAGE.SALE_PAGE]: <PurchasePage />,
    // Add more components as you define new PAGE keys
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
        {componentMap[page] || <div>Component not found</div>}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="flex bg-gray-100 rounded-lg overflow-hidden">
          {[VIEW_MODES.GRID, VIEW_MODES.ICON, VIEW_MODES.LIST].map(
            (mode, index) => {
              const icons = [<FaThLarge />, <FaTh />, <FaListUl />];
              return (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-3 ${
                    viewMode === mode ? "bg-white shadow" : "hover:bg-gray-200"
                  } transition`}
                >
                  {icons[index]}
                </button>
              );
            }
          )}
        </div>
      </div>

      {groups.map((grp) => (
        <div key={grp.id} className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              {grp.icon && React.createElement(grp.icon)}
              {grp.name}
            </h2>
            <button
              onClick={() => toggleGroup(grp.id)}
              className="text-gray-600 text-xl hover:text-gray-800"
            >
              {hiddenGroups[grp.id] ? ">" : "⌄"}
            </button>
          </div>

          {!hiddenGroups[grp.id] &&
            rendersale(
              grp.pages || [],
              viewMode === VIEW_MODES.GRID ? 4 : (grp.pages || []).length
            )}
        </div>
      ))}
    </div>
  );
}
