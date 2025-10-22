import React, { useState } from "react";
import BatchList from "./BatchValueList";
import BatchForm from "./Form";
import BatchViewPage from "./BatchValueViewPagee";
import { Button } from "@/components/ui/Button";

export default function BatchPage() {
  const [view, setView] = useState("list");
  const [Batchs, setBatchs] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Save or update a Batch in state
  const handleSaveBatch = (Batch) => {
    setBatchs((prev) => {
      const idx = prev.findIndex(
        (w) => w.BatchAccountNo === Batch.BatchAccountNo
      );

      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = Batch;
        return updated;
      }
      return [...prev, Batch];
    });
    setView("list");
  };

  // Open the "Add Batch" form
  const handleAddBatch = () => {
    setSelectedBatch(null);
    setView("form");
  };

  // Show Batch details
  const handleViewBatch = (accountNo) => {
    const found = Batchs.find((w) => w.BatchAccountNo === accountNo);
    setSelectedBatch(found);
    setView("details");
  };

  // Delete selected Batchs
  const handleDeleteBatch = (toDeleteAccounts) => {
    setBatchs((prev) =>
      prev.filter((w) => !toDeleteAccounts.includes(w.BatchAccountNo))
    );
  };

  // Cancel form or detail view
  const handleCancel = () => {
    setView("list");
    setSelectedBatch(null);
  };

  // Render header with dynamic title and actions
  const renderHeader = () => {
    let title = "Batchs";
    let action = null;

    if (view === "list") {
      action = <Button onClick={handleAddBatch}>Add Batch</Button>;
    } else if (view === "form") {
      title = selectedBatch ? "Edit Batch" : "New Batch";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      );
    } else if (view === "details") {
      title = "Batch Details";
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
    <div>
      {renderHeader()}

      {view === "list" && (
        <BatchList
          Batchs={Batchs}
          handleAddBatch={handleAddBatch}
          onView={handleViewBatch}
          onDelete={handleDeleteBatch}
        />
      )}

      {view === "form" && (
        <BatchForm
          Batch={selectedBatch}
          onSave={handleSaveBatch}
          handleCancel={handleCancel}
        />
      )}

      {view === "details" && selectedBatch && (
        <BatchViewPage
          Batch={selectedBatch}
          onEdit={() => setView("form")}
          onBack={handleCancel}
        />
      )}
    </div>
  );
}
