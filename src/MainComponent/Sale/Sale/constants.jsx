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
  CUSTOMER: "CUSTOMER",
  SALE_ORDER: "SALE_ORDER",
  RETURN_ORDER: "RETURN_ORDER",
  CREDIT_NOTE: "CREDIT_NOTE",
  DEBIT_NOTE: "DEBIT_NOTE",
  JOURNAL: "JOURNAL",
  FREE_TAX_INVOICE: "FREE_TAX_INVOICE",
  CUSTOMER_TRANSACTION: "CUSTOMER_TRANSACTION",
  CUSTOMER_BALANCE: "CUSTOMER_BALANCE",
  CUSTOMER_AGING_REPORT: "CUSTOMER_AGING_REPORT",
  SALES_ACCOUNTING_TRANSACTION: "SALES_ACCOUNTING_TRANSACTION",
  SALES_ACCOUNTING_BALANCE: "SALES_ACCOUNTING_BALANCE",
  SALES_MARGIN_REPORT: "SALES_MARGIN_REPORT",
};

export const VIEW_MODES = {
  GRID: "GRID",
  ICON: "ICON",
  LIST: "LIST",
};

export const groups = [
  {
    id: "master",
    title: "Customer Master",
    items: [
      {
        id: "Customer",
        title: "Customer",
        icon: <FaThLarge />,
        page: PAGE.CUSTOMER,
      },
    ],
  },
  {
    id: "setups",
    title: "Order",
    items: [], // handled in setupSections
  },
  {
    id: "Invoice &  document",
    title: "Invoice & Document",
    subgroups: [
      {
        id: "Sales Proforma Confirmation",
        title: "Sales Proforma Confirmation",
        items: [
          {
            id: "Sales Proforma Confirmation",
            title: "Sales Proforma Confirmation",
            icon: <FaArchive />,
          },
          {
            id: "Sales Confirmation",
            title: "Sales Confirmation",
            icon: <FaSortAmountDown />,
          },
          {
            id: "sales invoice proforma",
            title: "Sales Invoice Proforma",
            icon: <FaThLarge />,
          },
          { id: "sales invoice", title: "Sales Invoice", icon: <FaThLarge /> },
        ],
      },
      {
        id: "Setup and Configuration",
        title: "Setup and Configuration",
        items: [
          { id: "Term of Payment", title: "Term of Payment", icon: <FaTh /> },
        ],
      },
    ],
  },
];

export const setupSections = [
  {
    id: "Order",
    title: "Sale Order",
    cols: 3,
    items: [
      {
        id: "Sale order",
        title: "Sale order",
        icon: <FaMap />,
        page: PAGE.SALE_ORDER,
      },
      {
        id: "Return order",
        title: "Return order",
        icon: <FaWarehouse />,
        page: PAGE.RETURN_ORDER,
      },
      {
        id: "Debit note",
        title: "Debit note",
        icon: <FaMapMarkerAlt />,
        page: PAGE.DEBIT_NOTE,
      },
      {
        id: "Credit note",
        title: "Credit note",
        icon: <FaListUl />,
        page: PAGE.CREDIT_NOTE,
      },
      {
        id: "Free Tax Invoicing",
        title: "Free Tax Invoicing",
        icon: <FaListUl />,
        page: PAGE.FREE_TAX_INVOICE,
      },
      {
        id: "Journal",
        title: "Journal",
        icon: <FaListUl />,
        page: PAGE.JOURNAL,
      },
    ],
  },
  {
    id: "TransactionReport",
    title: "Transaction and Report",
    cols: 3,
    items: [
      {
        id: "Customer transaction",
        title: "Customer transaction",
        icon: <FaMap />,
        page: PAGE.CUSTOMER_TRANSACTION,
      },
      {
        id: "Customer balance",
        title: "Customer balance",
        icon: <FaWarehouse />,
        page: PAGE.CUSTOMER_BALANCE,
      },
      {
        id: "Customer aging report",
        title: "Customer aging report",
        icon: <FaMapMarkerAlt />,
        page: PAGE.CUSTOMER_AGING_REPORT,
      },
      {
        id: "Sales accounting transaction",
        title: "Sales accounting transaction",
        icon: <FaListUl />,
        page: PAGE.SALES_ACCOUNTING_TRANSACTION,
      },
      {
        id: "Sales accounting balance",
        title: "Sales accounting balance",
        icon: <FaListUl />,
        page: PAGE.SALES_ACCOUNTING_BALANCE,
      },
      {
        id: "Sales margin report",
        title: "Sales margin report",
        icon: <FaListUl />,
        page: PAGE.SALES_MARGIN_REPORT,
      },
    ],
  },
];
