import React from "react";
import { FaArchive, FaClipboardList } from "react-icons/fa";

export const VIEW_MODES = {
  GRID: "GRID",
  ICON: "ICON",
  LIST: "LIST",
};

export const PAGE = {
  TOGGLE: "TOGGLE",
  JOURNAL_LIST: "JOURNAL_LIST",
  JOURNAL_CREATE: "JOURNAL_CREATE",
  TAX_LIST: "TAX_LIST",
};

// Groups displayed on the dashboard
export const groups = [
    {
    id: "tax",
    title: "Tax",
    items: [
      {
        id: "tax-list",
        title: "Tax List",
        icon: <FaArchive />,
        page: PAGE.TAX_LIST,
      },
    ],
  },
  {
    id: "journals",
    title: "Journals",
    items: [
      {
        id: "journal-list",
        title: "Jornal List",
        icon: <FaClipboardList />,
        page: PAGE.JOURNAL_LIST,
      },
      {
        id: "journal-create",
        title: "Jornal Creation",
        icon: <FaArchive />,
        page: PAGE.JOURNAL_CREATE,
      },
    ],
  },

];
