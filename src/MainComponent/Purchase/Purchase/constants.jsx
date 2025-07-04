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

  // Purchase
  PURCHASE_ORDER: "PURCHASE_ORDER",
  PURCHASE_RETURNS: "PURCHASE_RETURNS",
  PURCHASE_DEBIT_NOTE: "PURCHASE_DEBIT_NOTE",
  PURCHASE_CREDIT_NOTE: "PURCHASE_CREDIT_NOTE",

  // Free Tax
  FREE_TAX_VENDOR: "FREE_TAX_VENDOR",
  FREE_TAX_CREDIT: "FREE_TAX_CREDIT",
  FREE_TAX_DEBIT: "FREE_TAX_DEBIT",

  // Journals
  EXPENSE_JOURNAL: "EXPENSE_JOURNAL",
  REVERSE_EXPENSE: "REVERSE_EXPENSE",
  COGS_JOURNAL: "COGS_JOURNAL",
  ADJUSTMENTS: "ADJUSTMENTS",

  // Payment
  VENDOR_PAYMENT: "VENDOR_PAYMENT",
  VENDOR_REFUND: "VENDOR_REFUND",
  ADVANCE_ADJUSTMENT: "ADVANCE_ADJUSTMENT",
  REFUND_SETTLEMENT: "REFUND_SETTLEMENT",

  // Others
  REVERSALS: "REVERSALS",
  CORRECT_CANCEL: "CORRECT_CANCEL",
};

export const VIEW_MODES = {
  GRID: "GRID",
  ICON: "ICON",
  LIST: "LIST",
};

export const groups = [
  {
    id: "purchase",
    name: "Purchase",
    icon: FaBoxOpen,
    pages: [
      {
        id: "PurchaseOrder",
        title: "Purchase Order",
        page: PAGE.PURCHASE_ORDER,
        icon: FaFileInvoiceDollar,
      },

      {
        id: "PurchaseDebitNote",
        title: "Purchase Debit Note",
        page: PAGE.PURCHASE_DEBIT_NOTE,
        icon: FaMoneyCheckAlt,
      },
      {
        id: "PurchaseCreditNote",
        title: "Purchase Credit Note",
        page: PAGE.PURCHASE_CREDIT_NOTE,
        icon: FaArrowCircleUp,
      },
      {
        id: "PurchaseReturns",
        title: "Purchase Returns",
        page: PAGE.PURCHASE_RETURNS,
        icon: FaArrowCircleDown,
      },
    ],
  },
  {
    id: "freetax",
    name: "Free Tax",
    icon: FaFileAlt,
    pages: [
      {
        id: "FreeTaxVendor",
        title: "Free Tax Vendor Invoice",
        page: PAGE.FREE_TAX_VENDOR,
        icon: FaFileAlt,
      },
      {
        id: "FreeTaxCredit",
        title: "Free Tax Credit Note",
        page: PAGE.FREE_TAX_CREDIT,
        icon: FaArrowCircleUp,
      },
      {
        id: "FreeTaxDebit",
        title: "Free Tax Debit Note",
        page: PAGE.FREE_TAX_DEBIT,
        icon: FaArrowCircleDown,
      },
    ],
  },
  {
    id: "journal",
    name: "Journals",
    icon: FaFileSignature,
    pages: [
      {
        id: "ExpenseJournal",
        title: "Expense Journal",
        page: PAGE.EXPENSE_JOURNAL,
        icon: FaReceipt,
      },
      {
        id: "ReverseExpense",
        title: "Reverse Expense",
        page: PAGE.REVERSE_EXPENSE,
        icon: FaUndo,
      },
      {
        id: "COGSJournal",
        title: "COGS Journal",
        page: PAGE.COGS_JOURNAL,
        icon: FaFileSignature,
      },
      {
        id: "Adjustments",
        title: "Adjustments",
        page: PAGE.ADJUSTMENTS,
        icon: FaFileAlt,
      },
    ],
  },
  {
    id: "payment",
    name: "Vendor Payments",
    icon: FaCashRegister,
    pages: [
      {
        id: "VendorPayment",
        title: "Vendor Payment",
        page: PAGE.VENDOR_PAYMENT,
        icon: FaCashRegister,
      },
      {
        id: "VendorRefund",
        title: "Vendor Refund",
        page: PAGE.VENDOR_REFUND,
        icon: FaCreditCard,
      },
      {
        id: "AdvanceAdjustment",
        title: "Advance Adjustment",
        page: PAGE.ADVANCE_ADJUSTMENT,
        icon: FaMoneyCheckAlt,
      },
      {
        id: "RefundSettlement",
        title: "Refund Settlement",
        page: PAGE.REFUND_SETTLEMENT,
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
        id: "Reversals",
        title: "Reversals",
        page: PAGE.REVERSALS,
        icon: FaUndo,
      },
      {
        id: "CorrectCancel",
        title: "Correct / Cancel",
        page: PAGE.CORRECT_CANCEL,
        icon: FaFileAlt,
      },
    ],
  },
];

export const setupSections = {
  [PAGE.PURCHASE_ORDER]: {
    title: "Purchase Order",
    group: "Purchase",
  },
  [PAGE.PURCHASE_RETURNS]: {
    title: "Purchase Returns",
    group: "Purchase",
  },
  [PAGE.PURCHASE_DEBIT_NOTE]: {
    title: "Purchase Debit Note",
    group: "Purchase",
  },
  [PAGE.PURCHASE_CREDIT_NOTE]: {
    title: "Purchase Credit Note",
    group: "Purchase",
  },

  [PAGE.FREE_TAX_VENDOR]: {
    title: "Free Tax Vendor Invoice",
    group: "Free Tax",
  },
  [PAGE.FREE_TAX_CREDIT]: {
    title: "Free Tax Credit Note",
    group: "Free Tax",
  },
  [PAGE.FREE_TAX_DEBIT]: {
    title: "Free Tax Debit Note",
    group: "Free Tax",
  },

  [PAGE.EXPENSE_JOURNAL]: {
    title: "Expense Journal",
    group: "Journals",
  },
  [PAGE.REVERSE_EXPENSE]: {
    title: "Reverse Expense",
    group: "Journals",
  },
  [PAGE.COGS_JOURNAL]: {
    title: "COGS Journal",
    group: "Journals",
  },
  [PAGE.ADJUSTMENTS]: {
    title: "Adjustments",
    group: "Journals",
  },

  [PAGE.VENDOR_PAYMENT]: {
    title: "Vendor Payment",
    group: "Vendor Payments",
  },
  [PAGE.VENDOR_REFUND]: {
    title: "Vendor Refund",
    group: "Vendor Payments",
  },
  [PAGE.ADVANCE_ADJUSTMENT]: {
    title: "Advance Adjustment",
    group: "Vendor Payments",
  },
  [PAGE.REFUND_SETTLEMENT]: {
    title: "Refund Settlement",
    group: "Vendor Payments",
  },

  [PAGE.REVERSALS]: {
    title: "Reversals",
    group: "Other",
  },
  [PAGE.CORRECT_CANCEL]: {
    title: "Correct / Cancel",
    group: "Other",
  },
};
