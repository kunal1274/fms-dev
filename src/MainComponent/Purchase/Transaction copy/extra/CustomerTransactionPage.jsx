// pages/CustomerTransactionPage.jsx
import React from "react";
import CustomerTransaction from "./CustomerTransaction";
import CustomerBalance from "./CustomerBalance";
import CustomerAgingReport from "./CustomerAgingReport";
import SalesAccountingTransaction from "./SalesAccountingTransaction";

const CustomerTransactionPage = () => {
  return (
    <div className="p-4 space-y-6">
      <CustomerTransaction />
      <CustomerBalance />
      <CustomerAgingReport />
      <SalesAccountingTransaction />
    </div>
  );
};

export default CustomerTransactionPage;
