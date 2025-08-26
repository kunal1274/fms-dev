import React, { useState } from "react";
import ShelvesList from "./ShelvesList";
import ShelvesForm from "./ShelvesForm";
import ShelvesViewPage from "./ShelvesViewPage";
import { Button } from "../../../../../src/Component/Button/Button";

export default function ShelvesPage() {
  const [view, setView] = useState("list");
  const [Shelvess, setShelvess] = useState([]);
  const [selectedShelves, setSelectedShelves] = useState(null);

  // Save or update a Shelves in state
  const handleSaveShelves = (Shelves) => {
    setShelvess((prev) => {
      const idx = prev.findIndex(
        (w) => w.ShelvesAccountNo === Shelves.ShelvesAccountNo
      );

      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = Shelves;
        return updated;
      }
      return [...prev, Shelves];
    });
    setView("list");
  };

  // Open the "Add Shelves" form
  const handleAddShelves = () => {
    setSelectedShelves(null);
    setView("form");
  };

  // Show Shelves details
  const handleViewShelves = (accountNo) => {
    const found = Shelvess.find((w) => w.ShelvesAccountNo === accountNo);
    setSelectedShelves(found);
    setView("details");
  };

  // Delete selected Shelvess
  const handleDeleteShelves = (toDeleteAccounts) => {
    setShelvess((prev) =>
      prev.filter((w) => !toDeleteAccounts.includes(w.ShelvesAccountNo))
    );
  };

  // Cancel form or detail view
  const handleCancel = () => {
    setView("list");
    setSelectedShelves(null);
  };

  // Render header with dynamic title and actions
  const renderHeader = () => {
    let title = "Shelvess";
    let action = null;

    if (view === "list") {
      action = <Button onClick={handleAddShelves}>Add Shelves</Button>;
    } else if (view === "form") {
      title = selectedShelves ? "Edit Shelves" : "New Shelves";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      );
    } else if (view === "details") {
      title = "Shelves Details";
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
        <ShelvesList
          Shelvess={Shelvess}
          handleAddShelves={handleAddShelves}
          onView={handleViewShelves}
          onDelete={handleDeleteShelves}
        />
      )}

      {view === "form" && (
        <ShelvesForm
          Shelves={selectedShelves}
          onSave={handleSaveShelves}
          onCancel={handleCancel}
        />
      )}

      {view === "details" && selectedShelves && (
        <ShelvesViewPage
          Shelves={selectedShelves}
          onEdit={() => setView("form")}
          onBack={handleCancel}
        />
      )}
    </div>
  );
}
