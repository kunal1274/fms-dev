import React, { useState, useEffect } from "react";
import RacksList from "./Rack";
import RacksForm from "./RackForm";

// import { Button } from "../../../../src/Component/Button/Button";
const RacksPage = () => {
  const [view, setView] = useState("list");
  const [Racks, setRacks] = useState([]);
  const [selectedRacks, setSelectedRacks] = useState(null);

  /** Save or update a Racks */
  const handleSaveRacks = (Racks) => {
    setRacks((prev) => {
      const idx = prev.findIndex(
        (c) => c.RacksAccountNo === Racks.RacksAccountNo
      );

      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = Racks;
        return updated;
      }
      return [...prev, Racks];
    });
    setView("list");
  };

  /** Open the "Add Racks" form */
  const handleAddRacks = () => {
    setSelectedRacks(null);
    setView("form");
  };

  /** Show Racks details */
  const handleViewRacks = (RacksAccountNo) => {
    const cust = Racks.find((c) => c.RacksAccountNo === RacksAccountNo);
    setSelectedRacks(cust);
    setView("details");
  };

  /** Delete selected Rackss */
  const handleDeleteRacks = (toDeleteAccounts) => {
    setRackss((prev) =>
      prev.filter((c) => !toDeleteAccounts.includes(c.RacksAccountNo))
    );
  };

  /** Cancel form or detail view */
  const handleCancel = () => setView("list");

  /** Render header with title and actions */
  const renderHeader = () => {
    let title = "Rackss";
    let action = null;

    if (view === "list") {
      action = <Button onClick={handleAddRacks}>Add Racks</Button>;
    } else if (view === "form") {
      title = selectedRacks ? "Edit Racks" : "New Racks";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      );
    } else if (view === "details") {
      title = "Racks Details";
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
          <RacksList
            Rackss={Racks}
            handleAddRacks={handleAddRacks}
            onView={handleViewRacks}
            onDelete={handleDeleteRacks}
          />
        )}

        {view === "form" && (
          <RacksForm
            Racks={selectedRacks}
            handleAddRacks={handleAddRacks}
            handleCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default RacksPage;
