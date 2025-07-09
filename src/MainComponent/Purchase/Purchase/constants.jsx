import {
  FaThLarge,
  FaListUl,
  FaTh,
  FaWarehouse,
  FaMap,
  FaMapMarkerAlt,
  FaSortAmountDown,
  FaArchive,
} from "react-icons/fa";

// Page Constants
export const PAGE = {
  TOGGLE: "TOGGLE",
  VENDOR: "VENDOR",
  PURCHASE_ORDER: "PURCHASE_ORDER",
  RETURN_ORDER: "RETURN_ORDER",
  CREDIT_NOTE: "CREDIT_NOTE",
  DEBIT_NOTE: "DEBIT_NOTE",
  JOURNAL: "JOURNAL",
  FREE_TAX_INVOICE: "FREE_TAX_INVOICE",
  VENDOR_TRANSACTION: "VENDOR_TRANSACTION",
  VENDOR_BALANCE: "VENDOR_BALANCE",
  VENDOR_AGING_REPORT: "VENDOR_AGING_REPORT",
  PURCHASE_ACCOUNTING_TRANSACTION: "PURCHASE_ACCOUNTING_TRANSACTION",
  PURCHASE_ACCOUNTING_BALANCE: "PURCHASE_ACCOUNTING_BALANCE",
  PURCHASE_MARGIN_REPORT: "PURCHASE_MARGIN_REPORT",
};

export const VIEW_MODES = {
  GRID: "GRID",
  ICON: "ICON",
  LIST: "LIST",
};

// Sidebar Navigation Groups
export const groups = [
  {
    id: "master",
    title: "Vendor Master",
    items: [
      {
        id: PAGE.VENDOR,
        title: "Vendor",
        icon: <FaThLarge />,
      },
    ],
  },
  {
    id: "setups",
    title: "Order",
    items: [], // Loaded dynamically from setupSections
  },
  {
    id: "invoice-doc",
    title: "Invoice & Document",
    subgroups: [
      {
        id: "proforma-confirmation",
        title: "Purchases Proforma Confirmation",
        items: [
          {
            id: "PURCHASE_PROFORMA_CONFIRMATION",
            title: "Purchases Proforma Confirmation",
            icon: <FaArchive />,
          },
          {
            id: "PURCHASE_CONFIRMATION",
            title: "Purchases Confirmation",
            icon: <FaSortAmountDown />,
          },
          {
            id: "PURCHASE_INVOICE_PROFORMA",
            title: "Purchases Invoice Proforma",
            icon: <FaThLarge />,
          },
          {
            id: "PURCHASE_INVOICE",
            title: "Purchases Invoice",
            icon: <FaThLarge />,
          },
        ],
      },
      {
        id: "setup-config",
        title: "Setup and Configuration",
        items: [
          {
            id: "TERM_OF_PAYMENT",
            title: "Term of Payment",
            icon: <FaTh />,
          },
        ],
      },
    ],
  },
];

// Setup Sections
export const setupSections = [
  {
    id: "order",
    title: "Purchase Order",
    cols: 3,
    items: [
      {
        id: PAGE.PURCHASE_ORDER,
        title: "Purchase Order",
        icon: <FaMap />,
      },
      {
        id: PAGE.RETURN_ORDER,
        title: "Return Order",
        icon: <FaWarehouse />,
      },
      {
        id: PAGE.DEBIT_NOTE,
        title: "Debit Note",
        icon: <FaMapMarkerAlt />,
      },
      {
        id: PAGE.CREDIT_NOTE,
        title: "Credit Note",
        icon: <FaListUl />,
      },
      {
        id: PAGE.FREE_TAX_INVOICE,
        title: "Free Tax Invoicing",
        icon: <FaListUl />,
      },
      {
        id: PAGE.JOURNAL,
        title: "Journal",
        icon: <FaListUl />,
      },
    ],
  },
  {
    id: "transaction-report",
    title: "Transaction and Report",
    cols: 3,
    items: [
      {
        id: PAGE.VENDOR_TRANSACTION,
        title: "Vendor Transaction",
        icon: <FaMap />,
      },
      {
        id: PAGE.VENDOR_BALANCE,
        title: "Vendor Balance",
        icon: <FaWarehouse />,
      },
      {
        id: PAGE.VENDOR_AGING_REPORT,
        title: "Vendor Aging Report",
        icon: <FaMapMarkerAlt />,
      },
      {
        id: PAGE.PURCHASE_ACCOUNTING_TRANSACTION,
        title: "Purchases Accounting Transaction",
        icon: <FaListUl />,
      },
      {
        id: PAGE.PURCHASE_ACCOUNTING_BALANCE,
        title: "Purchases Accounting Balance",
        icon: <FaListUl />,
      },
      {
        id: PAGE.PURCHASE_MARGIN_REPORT,
        title: "Purchases Margin Report",
        icon: <FaListUl />,
      },
    ],
  },
];
