// pages/CustomerTransactionPage.jsx
import React from "react";
import CustomerTransaction from "../components/CustomerTransaction";
import CustomerBalance from "../components/CustomerBalance";
import CustomerAgingReport from "../components/CustomerAgingReport";
import SalesAccountingTransaction from "../components/SalesAccountingTransaction";

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
