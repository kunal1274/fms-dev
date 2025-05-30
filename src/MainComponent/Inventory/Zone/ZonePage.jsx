import React, { useState } from "react";
import ZoneList from "./ZoneList";
import ZoneForm from "./ZoneForm";
import ZoneViewPage from "./ZoneViewPagee";

export default function ZonePage() {
  const [view, setView] = useState("list"); // "list" | "form" | "details"
  const [selectedId, setSelectedId] = useState(null); // Mongo _id of the zone

  // Handlers to switch views
  const handleAddZone = () => {
    setSelectedId(null);
    setView("form");
  };
  const handleViewZone = (id) => {
    setSelectedId(id);
    setView("details");
  };
  const handleEditZone = () => {
    setView("form");
  };
  const handleCancel = () => {
    setSelectedId(null);
    setView("list");
  };
  const handleSaved = () => {
    // after create or update
    setView("list");
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg">
      {view === "list" && (
        <ZoneList handleAddZone={handleAddZone} onView={handleViewZone} />
      )}

      {view === "form" && (
        <ZoneForm
          zoneId={selectedId}
          onSave={handleSaved}
          handleCancel={handleCancel}
        />
      )}

      {view === "details" && (
        <ZoneViewPage
          ZoneId={selectedId}
          onEdit={handleEditZone}
          onBack={handleCancel}
        />
      )}
    </div>
  );
}
