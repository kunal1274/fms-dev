import React, { useState } from "react";
import { FaThLarge, FaListUl, FaTh, FaArrowLeft } from "react-icons/fa";

import { PAGE, VIEW_MODES, groups, setupSections } from "./constants";

// Component Imports
import Vendor from "../../Vendor/VendorPage";
import PurchaseOrderPage from "../../Purchase/PurchaseMaster/PurchasePage";
import ReturnOrder from "../../Purchase/ReturnOrder/ReturnOrder";
import CreditNote from "../../Purchase/CreditNoteDebitNote/CreditNote";
import DebitNote from "../../Purchase/CreditNoteDebitNote/DebitNote";
import JournalPage from "../../Purchase/JournalRevenue/JournaRevenueOrderform";
import FreeTaxInvoice from "../../Purchase/FreeTaxingInvoice/FreeTaxingInvoice";
import PurchaseTransaction from "../../Purchase/Purchase/Transaction/Purchasetransaction";
import PurchaseBalance from "../../Purchase/Purchase/Transaction/Vendorbalance";
import PurchaseAgingReport from "../../Purchase/Purchase/Transaction/VendorAgingReport";
import PurchasesAccountingTransaction from "../../Purchase/Purchase/Transaction/VendorAccountingTransaction";
import PurchasesAccountingBalance from "../../Purchase/Purchase/Transaction/VendorAccountingTransaction";

import PurchaseConfirmationInvoice from "../Purchase/Transaction/p/PurchaseConfirmationInvoice";
import PurchaseInvoice from "../Purchase/Transaction/p/PurchaseInvoice";
import PurchaseProformaConfirmationInvoice from "../Purchase/Transaction/p/PurchaseProformaConfirmationInvoice";
import PurchaseProformaInvoice from "../Purchase/Transaction/p/PurchaseProformaInvoice ";

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

const componentMap = {
  [PAGE.VENDOR]: <Vendor />,
  [PAGE.PURCHASE_ORDER]: <PurchaseOrderPage />,
  [PAGE.RETURN_ORDER]: <ReturnOrder />,
  [PAGE.CREDIT_NOTE]: <CreditNote />,
  [PAGE.DEBIT_NOTE]: <DebitNote />,
  [PAGE.JOURNAL]: <JournalPage />,
  [PAGE.FREE_TAX_INVOICE]: <FreeTaxInvoice />,
  [PAGE.VENDOR_TRANSACTION]: <PurchaseTransaction />,
  [PAGE.VENDOR_BALANCE]: <PurchaseBalance />,
  [PAGE.VENDOR_AGING_REPORT]: <PurchaseAgingReport />,
  [PAGE.PURCHASE_ACCOUNTING_TRANSACTION]: <PurchasesAccountingTransaction />,
  [PAGE.PURCHASE_ACCOUNTING_BALANCE]: <PurchasesAccountingBalance />,
  [PAGE.PURCHASE_PROFORMA_CONFIRMATION_INVOICE]: <PurchaseProformaConfirmationInvoice />,
  [PAGE.PURCHASE_PROFORMA_INVOICE]: <PurchaseProformaInvoice />,
  [PAGE.PURCHASE_INVOICE]: <PurchaseInvoice />,
 [PAGE.PURCHASE_CONFIRMATION_INVOICE]: <PurchaseConfirmationInvoice/>,
};


  const renderItems = (items = [], cols = 3) => {
    const colClass =
      viewMode === VIEW_MODES.GRID
        ? `grid-cols-${cols}`
        : viewMode === VIEW_MODES.ICON
        ? `grid-cols-${cols * 2}`
        : "";

    const containerClass =
      viewMode === VIEW_MODES.LIST
        ? "flex flex-col gap-4"
        : `grid ${colClass} gap-6`;

    return (
      <div className={containerClass}>
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() =>
              setPage(item.page || PAGE[item.id.toUpperCase()] || item.id)
            }
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

  if (page !== PAGE.TOGGLE) {
    return (
      <div className="p-6">
        <button
          onClick={goBack}
          className="flex items-center mb-4 text-gray-700 hover:text-gray-900"
        >
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </button>
        {componentMap[page] || (
          <div className="text-red-500">Page not found.</div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">Purchase Dashboard</h1>
        <div className="flex space-x-4">
          {[VIEW_MODES.GRID, VIEW_MODES.ICON, VIEW_MODES.LIST].map(
            (mode, i) => {
              const icons = [<FaThLarge />, <FaTh />, <FaListUl />];
              return (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-3 rounded ${
                    viewMode === mode ? "bg-white shadow" : "hover:bg-gray-200"
                  } transition`}
                >
                  {icons[i]}
                </button>
              );
            }
          )}
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
              {hiddenGroups[grp.id] ? ">" : "˅"}
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
                        {hiddenSections[section.id] ? ">" : "˅"}
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
                        {hiddenSubgroups[sub.id] ? ">" : "˅"}
                      </button>
                    </div>
                    {!hiddenSubgroups[sub.id] && renderItems(sub.items, 3)}
                  </div>
                ))
              : renderItems(grp.items, 4))}
        </div>
      ))}
    </div>
  );
}
