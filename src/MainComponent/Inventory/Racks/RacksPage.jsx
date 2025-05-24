import React, { useState } from "react";
import RackList from "./RacksList";
import RackForm from "./Racksform";
import RackViewPage from "./RacksViewPagee";
import { Button } from "../../../Component/Button/Button";

export default function RackPage() {
  const [view, setView] = useState("list");
  const [Racks, setRacks] = useState([]);
  const [selectedRack, setSelectedRack] = useState(null);

  // Save or update a Rack in state
  const handleSaveRack = (Rack) => {
    setRacks((prev) => {
      const idx = prev.findIndex((w) => w.RackAccountNo === Rack.RackAccountNo);

      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = Rack;
        return updated;
      }
      return [...prev, Rack];
    });
    setView("list");
  };

  // Open the "Add Rack" form
  const handleAddRack = () => {
    setSelectedRack(null);
    setView("form");
  };

  // Show Rack details
  const handleViewRack = (accountNo) => {
    const found = Racks.find((w) => w.RackAccountNo === accountNo);
    setSelectedRack(found);
    setView("details");
  };

  // Delete selected Racks
  const handleDeleteRack = (toDeleteAccounts) => {
    setRacks((prev) =>
      prev.filter((w) => !toDeleteAccounts.includes(w.RackAccountNo))
    );
  };

  // Cancel form or detail view
  const handleCancel = () => {
    setView("list");
    setSelectedRack(null);
  };

  // Render header with dynamic title and actions
  const renderHeader = () => {
    let title = "Racks";
    let action = null;

    if (view === "list") {
      action = <Button onClick={handleAddRack}>Add Rack</Button>;
    } else if (view === "form") {
      title = selectedRack ? "Edit Rack" : "New Rack";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      );
    } else if (view === "details") {
      title = "Rack Details";
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
        <RackList
          Racks={Racks}
          handleAddRack={handleAddRack}
          onView={handleViewRack}
          onDelete={handleDeleteRack}
        />
      )}

      {view === "form" && (
        <RackForm
          Rack={selectedRack}
          onSave={handleSaveRack}
          onCancel={handleCancel}
        />
      )}

      {view === "details" && selectedRack && (
        <RackViewPage
          Rack={selectedRack}
          onEdit={() => setView("form")}
          onBack={handleCancel}
        />
      )}
    </div>
  );
}
