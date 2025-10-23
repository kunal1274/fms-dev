import React, { useState } from "react";

import ReturnOrderViewPage from "./ReturnOrderViewPage";
import { Button } from "@/components/ui/Button";
import ReturnOrderForm from "./ReturnOrderForm";
import ReturnOrderList from "./ReturnOrderlistDummy";

const ReturnOrderPage = () => {
  const [view, setView] = useState("list");
  const [customers, setReturnOrders] = useState([]);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState(null);

  /** Save or update a customer */
  const handleSaveReturnOrder = (customer) => {
    setReturnOrders((prev) => {
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

  /** Open the "Add ReturnOrder" form */
  const handleAddReturnOrder = () => {
    setSelectedReturnOrder(null);
    setView("form");
  };

  /** Show customer details */
  const handleViewReturnOrder = (customerAccountNo) => {
    const cust = customers.find(
      (c) => c.customerAccountNo === customerAccountNo
    );
    setSelectedReturnOrder(cust);
    setView("details");
  };

  /** Delete selected customers */
  const handleDeleteReturnOrder = (toDeleteAccounts) => {
    setReturnOrders((prev) =>
      prev.filter((c) => !toDeleteAccounts.includes(c.customerAccountNo))
    );
  };

  /** Cancel form or detail view */
  const handleCancel = () => setView("list");

  /** Render header with title and actions */
  const renderHeader = () => {
    let title = "ReturnOrders";
    let action = null;

    if (view === "list") {
      action = <Button onClick={handleAddReturnOrder}>Add ReturnOrder</Button>;
    } else if (view === "form") {
      title = selectedReturnOrder ? "Edit ReturnOrder" : "New ReturnOrder";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      );
    } else if (view === "details") {
      title = "ReturnOrder Details";
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
    <div className="">
      <div>
        {view === "list" && (
          <ReturnOrderList
            customers={customers}
            handleAddReturnOrder={handleAddReturnOrder}
            onView={handleViewReturnOrder}
            onDelete={handleDeleteReturnOrder}
          />
        )}

        {view === "form" && (
          <ReturnOrderForm
            customer={selectedReturnOrder}
            handleAddReturnOrder={handleAddReturnOrder}
            handleCancel={handleCancel}
          />
        )}
        {view === "details" && selectedReturnOrder && (
          <ReturnOrderViewPage
            customer={selectedReturnOrder}
            onEdit={() => setView("form")}
            onBack={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default ReturnOrderPage;
