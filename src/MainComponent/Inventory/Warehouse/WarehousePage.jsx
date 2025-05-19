import React, { useState } from "react";
import WarehouseList from "./WarehouseList";
import WarehouseForm from "./WarehouseForm";
import WarehouseViewPage from "./WarehouseViewPagee";
import { Button } from "../../../Component/Button/Button";

export default function WarehousePage() {
  const [view, setView] = useState("list");
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  // Save or update a warehouse in state
  const handleSaveWarehouse = (warehouse) => {
    setWarehouses((prev) => {
      const idx = prev.findIndex(
        (w) => w.WarehouseAccountNo === warehouse.WarehouseAccountNo
      );

      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = warehouse;
        return updated;
      }
      return [...prev, warehouse];
    });
    setView("list");
  };

  // Open the "Add Warehouse" form
  const handleAddWarehouse = () => {
    setSelectedWarehouse(null);
    setView("form");
  };

  // Show warehouse details
  const handleViewWarehouse = (accountNo) => {
    const found = warehouses.find((w) => w.WarehouseAccountNo === accountNo);
    setSelectedWarehouse(found);
    setView("details");
  };

  // Delete selected warehouses
  const handleDeleteWarehouse = (toDeleteAccounts) => {
    setWarehouses((prev) =>
      prev.filter((w) => !toDeleteAccounts.includes(w.WarehouseAccountNo))
    );
  };

  // Cancel form or detail view
  const handleCancel = () => {
    setView("list");
    setSelectedWarehouse(null);
  };

  // Render header with dynamic title and actions
  const renderHeader = () => {
    let title = "Warehouses";
    let action = null;

    if (view === "list") {
      action = <Button onClick={handleAddWarehouse}>Add Warehouse</Button>;
    } else if (view === "form") {
      title = selectedWarehouse ? "Edit Warehouse" : "New Warehouse";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      );
    } else if (view === "details") {
      title = "Warehouse Details";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Back to List
        </Button>
      );
    }

    return (
      <div className="flex justify-between items-center mb-4">
        {/* <h1 className="text-2xl font-semibold text-gray-800">{title}</h1> */}
        {/* {action} */}
      </div>
    );
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg ">
      {renderHeader()}

      {view === "list" && (
        <WarehouseList
          warehouses={warehouses}
        handleAddWarehouse={handleAddWarehouse}
          onView={handleViewWarehouse}
          onDelete={handleDeleteWarehouse}
        />
      )}

      {view === "form" && (
        <WarehouseForm
          warehouse={selectedWarehouse}
          onSave={handleSaveWarehouse}
          onCancel={handleCancel}
        />
      )}

      {view === "details" && selectedWarehouse && (
        <WarehouseViewPage
          warehouse={selectedWarehouse}
          onEdit={() => setView("form")}
          onBack={handleCancel}
        />
      )}
    </div>
  );
}
