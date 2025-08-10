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
  // If you don't use `form`, feel free to remove it.
  const [form] = useState(initialForm);
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

  // Shared styles
  const baseCard =
    "cursor-pointer select-none bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm hover:shadow-lg hover:ring-gray-200 transition-all duration-200";
  const baseRow =
    "cursor-pointer flex items-center w-full rounded-xl ring-1 ring-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-200";

  const cardStyles = {
    LIST: `${baseRow} p-3 text-left`,
    ICON: `${baseCard} flex flex-col items-center justify-center w-[76px] h-[76px] p-2`,
    GRID: `${baseCard} flex flex-col items-center justify-center text-sm min-h-[104px] p-2.5`,
  };

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
    [PAGE.PURCHASE_PROFORMA_CONFIRMATION_INVOICE]: (
      <PurchaseProformaConfirmationInvoice />
    ),
    [PAGE.PURCHASE_PROFORMA_INVOICE]: <PurchaseProformaInvoice />,
    [PAGE.PURCHASE_INVOICE]: <PurchaseInvoice />,
    [PAGE.PURCHASE_CONFIRMATION_INVOICE]: <PurchaseConfirmationInvoice />,
  };

  // === Simple item renderer supporting LIST / ICON / GRID ===
  const renderItems = (items = [], cols = 4) => {
    const safeItems = Array.isArray(items) ? items : [];

    if (viewMode === VIEW_MODES.LIST) {
      return (
        <div className="flex flex-col gap-2">
          {safeItems.map((item) => (
            <button
              key={item.id}
              onClick={() => item.page && setPage(item.page)}
              className={cardStyles.LIST}
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
              className={cardStyles.ICON}
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

    // GRID mode
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
            className={cardStyles.GRID}
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

  // === Page switch
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

  // === Top bar icons for view modes
  const viewIcons = [
    <FaThLarge key="grid" />,
    <FaTh key="icon" />,
    <FaListUl key="list" />,
  ];
  const modes = [VIEW_MODES.GRID, VIEW_MODES.ICON, VIEW_MODES.LIST];

  return (
    <div className="p-3 sm:p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Purchase Dashboard</h2>
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
