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

  // Vendor Reports
  VENDOR_TRANSACTION: "VENDOR_TRANSACTION",
  VENDOR_BALANCE: "VENDOR_BALANCE",
  VENDOR_AGING_REPORT: "VENDOR_AGING_REPORT",

  // Purchase Reports
  PURCHASE_ACCOUNTING_TRANSACTION: "PURCHASE_ACCOUNTING_TRANSACTION",
  PURCHASE_ACCOUNTING_BALANCE: "PURCHASE_ACCOUNTING_BALANCE",
  PURCHASE_MARGIN_REPORT: "PURCHASE_MARGIN_REPORT",

  // Purchases Invoices
  PURCHASE_CONFIRMATION_INVOICE: "PURCHASE_CONFIRMATION_INVOICE",
  PURCHASE_PROFORMA_INVOICE: "PURCHASE_PROFORMA_INVOICE",
  PURCHASE_INVOICE: "PURCHASE_INVOICE",
  PURCHASE_PROFORMA_CONFIRMATION_INVOICE:
    "PURCHASE_PROFORMA_CONFIRMATION_INVOICE",

  // Setup
  TERM_OF_PAYMENT: "TERM_OF_PAYMENT",
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
        page: PAGE.VENDOR,
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
    title: "Purchases Invoice & Document",
    subgroups: [
      {
        id: "purchase-invoices",
        title: "Purchases Invoices",
        items: [
          {
            id: PAGE.PURCHASE_PROFORMA_CONFIRMATION_INVOICE,
            title: "Purchase Proforma Confirmation Invoice",
            icon: <FaArchive />,
            page: PAGE.PURCHASE_PROFORMA_CONFIRMATION_INVOICE,
          },
          {
            id: PAGE.PURCHASE_CONFIRMATION_INVOICE,
            title: "Purchase Confirmation Invoice",
            icon: <FaSortAmountDown />,
            page: PAGE.PURCHASE_CONFIRMATION_INVOICE,
          },
          {
            id: PAGE.PURCHASE_PROFORMA_INVOICE,
            title: "Purchase Proforma Invoice  ",
            icon: <FaThLarge />,
            page: PAGE.PURCHASE_PROFORMA_INVOICE,
          },
          {
            id: PAGE.PURCHASE_INVOICE,
            title: "Purchase Invoice",
            icon: <FaListUl />,
            page: PAGE.PURCHASE_INVOICE,
          },
        ],
      },
      {
        id: "setup-config",
        title: "Setup and Configuration",
        items: [
          {
            id: PAGE.TERM_OF_PAYMENT,
            title: "Term of Payment",
            icon: <FaTh />,
            page: PAGE.TERM_OF_PAYMENT,
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
        page: PAGE.PURCHASE_ORDER,
      },
      {
        id: PAGE.RETURN_ORDER,
        title: "Return Order",
        icon: <FaWarehouse />,
        page: PAGE.RETURN_ORDER,
      },
      {
        id: PAGE.DEBIT_NOTE,
        title: "Debit Note",
        icon: <FaMapMarkerAlt />,
        page: PAGE.DEBIT_NOTE,
      },
      {
        id: PAGE.CREDIT_NOTE,
        title: "Credit Note",
        icon: <FaListUl />,
        page: PAGE.CREDIT_NOTE,
      },
      {
        id: PAGE.FREE_TAX_INVOICE,
        title: "Free Tax Invoicing",
        icon: <FaListUl />,
        page: PAGE.FREE_TAX_INVOICE,
      },
      {
        id: PAGE.JOURNAL,
        title: "Journal",
        icon: <FaListUl />,
        page: PAGE.JOURNAL,
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
        page: PAGE.VENDOR_TRANSACTION,
      },
      {
        id: PAGE.VENDOR_BALANCE,
        title: "Vendor Balance",
        icon: <FaWarehouse />,
        page: PAGE.VENDOR_BALANCE,
      },
      {
        id: PAGE.VENDOR_AGING_REPORT,
        title: "Vendor Aging Report",
        icon: <FaMapMarkerAlt />,
        page: PAGE.VENDOR_AGING_REPORT,
      },
      {
        id: PAGE.PURCHASE_ACCOUNTING_TRANSACTION,
        title: "Purchases Accounting Transaction",
        icon: <FaListUl />,
        page: PAGE.PURCHASE_ACCOUNTING_TRANSACTION,
      },
      {
        id: PAGE.PURCHASE_ACCOUNTING_BALANCE,
        title: "Purchases Accounting Balance",
        icon: <FaListUl />,
        page: PAGE.PURCHASE_ACCOUNTING_BALANCE,
      },
      {
        id: PAGE.PURCHASE_MARGIN_REPORT,
        title: "Purchases Margin Report",
        icon: <FaListUl />,
        page: PAGE.PURCHASE_MARGIN_REPORT,
      },
    ],
  },
];
