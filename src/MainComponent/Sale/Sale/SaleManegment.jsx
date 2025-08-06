import React, { useState } from "react";
import { FaThLarge, FaListUl, FaTh, FaArrowLeft } from "react-icons/fa";
import { PAGE, VIEW_MODES, groups, setupSections } from "./constants";

// Actual imports for each page component
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
  };

  const renderItems = (items = [], cols) => {
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
          <div className="text-red-600">Page not found</div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">Customer Dashboard</h1>
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
              className="text-gray-600 text-xl hover:text-gray-800"
            >
              {hiddenGroups[grp.id] ? "►" : "▼"}
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
                        {hiddenSections[section.id] ? "►" : "▼"}
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
                        {hiddenSubgroups[sub.id] ? "►" : "▼"}
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
