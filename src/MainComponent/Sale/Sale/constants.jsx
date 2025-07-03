// constants.js
import {
  FaBoxOpen,
  FaFileInvoiceDollar,
  FaFileAlt,
  FaFileSignature,
  FaReceipt,
  FaUndo,
  FaMoneyCheckAlt,
  FaArrowCircleDown,
  FaArrowCircleUp,
  FaCashRegister,
  FaCreditCard,
  FaListAlt,
  FaArchive,
} from "react-icons/fa";

export const PAGE = {
  TOGGLE: "TOGGLE",
  CREDIT_NOTE: "CREDIT_NOTE",
  DEBIT_NOTE: "DEBIT_NOTE",
  FREE_TAXING: "FREE_TAXING",
  JOURNAL_REVENUE: "JOURNAL_REVENUE",
  RETURN_ORDER: "RETURN_ORDER",
  SALE_PAGE: "SALE_PAGE",
};

export const VIEW_MODES = {
  GRID: "GRID",
  ICON: "ICON",
  LIST: "LIST",
};

export const groups = [
  {
    id: "type",
    name: "Type",
    icon: FaBoxOpen,
    pages: [
      {
        id: "Sales",
        title: "Sales",
        page: PAGE.CREDIT_NOTE,
        icon: FaFileInvoiceDollar,
      },
      {
        id: "FreeTax",
        title: "FreeTax",
        page: PAGE.DEBIT_NOTE,
        icon: FaFileAlt,
      },
      {
        id: "Journal",
        title: "Journal",
        page: PAGE.FREE_TAXING,
        icon: FaFileSignature,
      },
      {
        id: "JournalRevenue",
        title: "Journal/Revenue",
        page: PAGE.JOURNAL_REVENUE,
        icon: FaReceipt,
      },
      {
        id: "Payment",
        title: "Payment",
        page: PAGE.RETURN_ORDER,
        icon: FaUndo,
      },
    ],
  },
  {
    id: "sales",
    name: "Sales",
    icon: FaListAlt,
    pages: [
      {
        id: "SalesOrder",
        title: "Sales Order",
        page: PAGE.CREDIT_NOTE,
        icon: FaFileInvoiceDollar,
      },
      {
        id: "SalesReturns",
        title: "Sales Returns",
        page: PAGE.DEBIT_NOTE,
        icon: FaArrowCircleDown,
      },
      {
        id: "SalesDebitNote",
        title: "Sales Debit Note",
        page: PAGE.FREE_TAXING,
        icon: FaMoneyCheckAlt,
      },
      {
        id: "SalesCreditNote",
        title: "Sales Credit Note",
        page: PAGE.JOURNAL_REVENUE,
        icon: FaArrowCircleUp,
      },
      {
        id: "SalesPayment",
        title: "Payment",
        page: PAGE.RETURN_ORDER,
        icon: FaCashRegister,
      },
    ],
  },
  {
    id: "journal",
    name: "Journal",
    icon: FaFileSignature,
    pages: [
      {
        id: "RevenueJournal",
        title: "Revenue Journal",
        page: PAGE.CREDIT_NOTE,
        icon: FaFileSignature,
      },
      {
        id: "ReverseRevenueJournal",
        title: "Reverse Revenue Journal",
        page: PAGE.DEBIT_NOTE,
        icon: FaUndo,
      },
    ],
  },
  {
    id: "other",
    name: "Other",
    icon: FaArchive,
    pages: [
      {
        id: "CustomerReceipt",
        title: "Customer Receipt",
        page: PAGE.CREDIT_NOTE,
        icon: FaReceipt,
      },
      {
        id: "CustomerRefund",
        title: "Customer Refund",
        page: PAGE.DEBIT_NOTE,
        icon: FaCreditCard,
      },
    ],
  },
];

export const setupSections = {
  [PAGE.CREDIT_NOTE]: {
    title: "Credit Note",
    group: "Type",
  },
  [PAGE.DEBIT_NOTE]: {
    title: "Debit Note",
    group: "Type",
  },
  [PAGE.FREE_TAXING]: {
    title: "Free Taxing",
    group: "Type",
  },
  [PAGE.JOURNAL_REVENUE]: {
    title: "Journal/Revenue",
    group: "Type",
  },
  [PAGE.RETURN_ORDER]: {
    title: "Return Order",
    group: "Type",
  },
  [PAGE.SALE_PAGE]: {
    title: "Sale Page",
    group: "Master Setup",
  },
};
