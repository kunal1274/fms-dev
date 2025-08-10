import React, { useMemo, useState } from "react";
import { FaThLarge, FaListUl, FaTh, FaArrowLeft } from "react-icons/fa";
import { PAGE, VIEW_MODES, groups, setupSections } from "./constants";

// Page components
import CustomerPage from "../../Customer/CustomerPage";
import SaleOrderPage from "../../Sale/SaleMaster/SalePage";
import SalesProformaInvoice from "../../Sale/Transaction/SalesProformaInvoice/SalesProformaInvoice";
import ReturnOrder from "../../Sale/ReturnOrder/ReturnOrder";
import CreditNote from "../../Sale/CreditNoteDebitNote/CreditNote";
import DebitNote from "../../Sale/CreditNoteDebitNote/DebitNote";
import JournalPage from "../../Sale/JournalRevenue/JournaRevenueOrderform";
import FreeTaxInvoice from "../../Sale/FreeTaxingInvoice/FreeTaxingInvoice";
import CustomerTransaction from "../Transaction/Customer transaction/CustomerTransaction";
import CustomerBalance from "../../Sale/Transaction/Customer balance/CustomerBalance";
import CustomerAgingReport from "../Transaction/Customer Aging Report/CustomerAgingReport";
import SalesAccountingTransaction from "../../Sale/Transaction/Sales Accounting Transaction/SalesAccountingTransaction";
import SalesAccountingBalance from "../Transaction/Sales Accounting Balance/SalesAccountingBalance";
import SalesMarginReport from "../../Sale/Transaction/Sale margine  report/Salemarginereport";
import SalesInvoice from "../Transaction/SalesInvoice/SalesInvoice";
import SalesConfirmationInvoice from "../Transaction/SalesConfirmationInvoice/SalesConfirmationInvoice";
import SalesProformaConfirmationInvoice from "../Transaction/SalesProformaConfirmationInvoice/SalesProformaConfirmationInvoice.jsx";

const initialForm = {
  company: localStorage.getItem("selectedCompany") || "",
};

export default function ViewTogglePage() {
  // State (JSX-safe: no TypeScript generics)
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

  const componentMap = useMemo(
    () => ({
      [PAGE.CUSTOMER]: <CustomerPage />,
      [PAGE.SALE_ORDER]: <SaleOrderPage />,
      [PAGE.RETURN_ORDER]: <ReturnOrder />,
      [PAGE.CREDIT_NOTE]: <CreditNote />,
      [PAGE.DEBIT_NOTE]: <DebitNote />,
      [PAGE.JOURNAL]: <JournalPage />,
      [PAGE.FREE_TAX_INVOICE]: <FreeTaxInvoice />,
      [PAGE.CUSTOMER_TRANSACTION]: <CustomerTransaction />,
      [PAGE.CUSTOMER_BALANCE]: <CustomerBalance />,
      [PAGE.CUSTOMER_AGING_REPORT]: <CustomerAgingReport />,
      [PAGE.SALES_ACCOUNTING_TRANSACTION]: <SalesAccountingTransaction />,
      [PAGE.SALES_ACCOUNTING_BALANCE]: <SalesAccountingBalance />,
      [PAGE.SALES_MARGIN_REPORT]: <SalesMarginReport />,
      [PAGE.SALES_CONFIRMATION_INVOICE]: <SalesConfirmationInvoice />,
      [PAGE.SALES_PROFORMA_INVOICE_ALT]: <SalesProformaInvoice />,
      [PAGE.SALES_INVOICE]: <SalesInvoice />,
      [PAGE.SALES_PROFORMA_CONFIRMATION_INVOICE]: (
        <SalesProformaConfirmationInvoice />
      ),
    }),
    []
  );

  // Shared classes
  const baseCard =
    "cursor-pointer select-none bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm hover:shadow-lg hover:ring-gray-200 transition-all duration-200";
  const baseRow =
    "cursor-pointer flex items-center w-full rounded-xl ring-1 ring-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-200";

  const renderItems = (items = [], cols = 4) => {
    const safeItems = Array.isArray(items) ? items : [];

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
              <div className="text-gray-500 mr-3 text-lg">{item.icon}</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {item.title}
                </div>
                {item.subtitle ? (
                  <div className="text-xs text-gray-500">{item.subtitle}</div>
                ) : null}
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
              className={`${baseCard} flex flex-col items-center justify-center`}
              style={{ width: 76, height: 76, padding: 8 }}
              title={item.title}
              aria-label={item.title}
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
            aria-label={item.title}
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

  if (page !== PAGE.TOGGLE) {
    return (
      <div className="p-6">
        <button
          onClick={goBack}
          className="inline-flex items-center mb-4 text-gray-700 hover:text-gray-900"
        >
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </button>
        {componentMap[page] || (
          <div className="text-red-600">Page not found</div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Customer Dashboard</h1>
        <div className="flex space-x-2">
          {[
            { mode: VIEW_MODES.GRID, Icon: FaThLarge, label: "Grid" },
            { mode: VIEW_MODES.ICON, Icon: FaTh, label: "Icon" },
            { mode: VIEW_MODES.LIST, Icon: FaListUl, label: "List" },
          ].map(({ mode, Icon, label }) => {
            const active = viewMode === mode;
            return (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm transition ${
                  active
                    ? "bg-white shadow ring-1 ring-gray-200"
                    : "hover:bg-gray-100"
                }`}
                aria-pressed={active}
                title={label}
              >
                <Icon className="mr-2" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {groups.map((grp) => (
        <section key={grp.id} className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">{grp.title}</h2>
            <button
              onClick={() => toggleGroup(grp.id)}
              className="text-gray-600 text-sm hover:text-gray-800"
              aria-expanded={!hiddenGroups[grp.id]}
              aria-controls={`group-${grp.id}`}
            >
              {hiddenGroups[grp.id] ? "Show" : "Hide"}
            </button>
          </div>

          {!hiddenGroups[grp.id] && (
            <div id={`group-${grp.id}`} className="space-y-4">
              {grp.id === "setups"
                ? setupSections.map((section) => (
                    <div key={section.id} className="mb-2">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-md font-medium">{section.title}</h3>
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="text-gray-600 text-sm hover:text-gray-800"
                          aria-expanded={!hiddenSections[section.id]}
                          aria-controls={`section-${section.id}`}
                        >
                          {hiddenSections[section.id] ? "Show" : "Hide"}
                        </button>
                      </div>
                      {!hiddenSections[section.id] && (
                        <div id={`section-${section.id}`}>
                          {renderItems(section.items, section.cols || 4)}
                        </div>
                      )}
                    </div>
                  ))
                : grp.subgroups
                ? grp.subgroups.map((sub) => (
                    <div key={sub.id} className="mb-2">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-md font-medium">{sub.title}</h3>
                        <button
                        onClick={() => toggleSubgroup(sub.id)}
                        className="text-gray-600 hover:text-gray-800"
                        aria-label={`Toggle ${sub.title}`}
                        title={hiddenSubgroups[sub.id] ? "Expand" : "Collapse"}
                      >
                        {hiddenSubgroups[sub.id] ? "▸" : "▾"}
                      </button>
                      </div>
                      {!hiddenSubgroups[sub.id] && (
                        <div id={`sub-${sub.id}`}>
                          {renderItems(sub.items, 3)}
                        </div>
                      )}
                    </div>
                  ))
                : renderItems(grp.items, 4)}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
