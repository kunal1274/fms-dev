import React from "react";
import { FaArchive, FaClipboardList } from "react-icons/fa";

export const VIEW_MODES = {
  GRID: "GRID",
  ICON: "ICON",
  LIST: "LIST",
};

export const PAGE = {
  TOGGLE: "TOGGLE",
  BANK_FORM: "BANK_FORM",                // ✅ added (was missing)
  BANK_BALANCE_REPORT: "BANK_BALANCE_REPORT",
  BANK_TRANSACTION_REPORT: "BANK_TRANSACTION_REPORT",
};

// Only the bank form and two bank reports are exposed on the dashboard
export const groups = [
  {
    id: "bank-form",
    title: "Bank Form",
    items: [
      {
        id: "bank-form-item",
        title: "Bank Form",
        icon: <FaArchive />,
        page: PAGE.BANK_FORM,
      },
    ],
  },
  {
    id: "bank-reports",
    title: "Bank Reports",
    items: [
      {
        id: "bank-balance-report",
        title: "Bank Balance Report",
        icon: <FaArchive />,
        page: PAGE.BANK_BALANCE_REPORT,
      },
      {
        id: "bank-transaction-report",
        title: "Bank Transaction Report",
        icon: <FaClipboardList />,
        page: PAGE.BANK_TRANSACTION_REPORT,
      },
    ],
  },
];
