import React, { useState } from "react";

import CustomerViewPage from "./BankViewPagee";
import { Button } from "../../../Component/Button/Button";
import CustomerForm from "./BankForm";
import CustomerList from "./Banklist";

const CustomerPage = () => {
  const [view, setView] = useState("list");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  /** Save or update a customer */
  const handleSaveCustomer = (customer) => {
    setCustomers((prev) => {
      const idx = prev.findIndex(
        (c) => c.customerAccountNo === customer.customerAccountNo
      );

      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = customer;
        return updated;
      }
      return [...prev, customer];
    });
    setView("list");
  };

  /** Open the "Add Customer" form */
  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setView("form");
  };

  /** Show customer details */
  const handleViewCustomer = (customerAccountNo) => {
    const cust = customers.find(
      (c) => c.customerAccountNo === customerAccountNo
    );
    setSelectedCustomer(cust);
    setView("details");
  };

  /** Delete selected customers */
  const handleDeleteCustomer = (toDeleteAccounts) => {
    setCustomers((prev) =>
      prev.filter((c) => !toDeleteAccounts.includes(c.customerAccountNo))
    );
  };

  /** Cancel form or detail view */
  const handleCancel = () => setView("list");

  /** Render header with title and actions */
  const renderHeader = () => {
    let title = "Customers";
    let action = null;

    if (view === "list") {
      action = <Button onClick={handleAddCustomer}>Add Customer</Button>;
    } else if (view === "form") {
      title = selectedCustomer ? "Edit Customer" : "New Customer";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      );
    } else if (view === "details") {
      title = "Customer Details";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Back to List
        </Button>
      );
    }

    return (
      <div className="flex justify-between ">
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        {action}
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-lg ">
      <div>
        {view === "list" && (
          <CustomerList
            customers={customers}
            handleAddCustomer={handleAddCustomer}
            onView={handleViewCustomer}
            onDelete={handleDeleteCustomer}
          />
        )}

        {view === "form" && (
          <CustomerForm
            customer={selectedCustomer}
            handleAddCustomer={handleAddCustomer}
            handleCancel={handleCancel}
          />
        )}
        {view === "details" && selectedCustomer && (
          <CustomerViewPage
            customer={selectedCustomer}
            onEdit={() => setView("form")}
            onBack={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default CustomerPage;
