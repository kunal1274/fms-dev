import React, { useState, useEffect } from "react";
import SerialsList from "./SerialList";
import SerialsForm from "./SerialForm";

// import { Button } from "../../../../src/Component/Button/Button";
const SerialsPage = () => {
  const [view, setView] = useState("list");
  const [Serials, setSerials] = useState([]);
  const [selectedSerials, setSelectedSerials] = useState(null);

  /** Save or update a Serials */
  const handleSaveSerials = (Serials) => {
    setSerials((prev) => {
      const idx = prev.findIndex(
        (c) => c.SerialsAccountNo === Serials.SerialsAccountNo
      );

      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = Serials;
        return updated;
      }
      return [...prev, Serials];
    });
    setView("list");
  };

  /** Open the "Add Serials" form */
  const handleAddSerials = () => {
    setSelectedSerials(null);
    setView("form");
  };

  /** Show Serials details */
  const handleViewSerials = (SerialsAccountNo) => {
    const cust = Serials.find((c) => c.SerialsAccountNo === SerialsAccountNo);
    setSelectedSerials(cust);
    setView("details");
  };

  /** Delete selected Serialss */
  const handleDeleteSerials = (toDeleteAccounts) => {
    setSerialss((prev) =>
      prev.filter((c) => !toDeleteAccounts.includes(c.SerialsAccountNo))
    );
  };

  /** Cancel form or detail view */
  const handleCancel = () => setView("list");

  /** Render header with title and actions */
  const renderHeader = () => {
    let title = "Serialss";
    let action = null;

    if (view === "list") {
      action = <Button onClick={handleAddSerials}>Add Serials</Button>;
    } else if (view === "form") {
      title = selectedSerials ? "Edit Serials" : "New Serials";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      );
    } else if (view === "details") {
      title = "Serials Details";
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
          <SerialsList
            Serialss={Serials}
            handleAddSerials={handleAddSerials}
            onView={handleViewSerials}
            onDelete={handleDeleteSerials}
          />
        )}

        {view === "form" && (
          <SerialsForm
            Serials={selectedSerials}
            handleAddSerials={handleAddSerials}
            handleCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default SerialsPage;
