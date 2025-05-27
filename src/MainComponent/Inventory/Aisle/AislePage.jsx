import React, { useState } from "react";
import { Button } from "../../../Component/Button/Button";
import AisleForm from "../Aisle/AisleForm";
import AisleList1 from "../Aisle/AilseList1";

const AislePage = () => {
  const [view, setView] = useState("list");
  const [aisles, setAisles] = useState([]);
  const [selectedAisles, setSelectedAisles] = useState(null);

  /** Save or update a aisles */
  const handleSaveaisles = (aisles) => {
    setAisles((prev) => {
      const idx = prev.findIndex(
        (c) => c.aislesAccountNo === aisles.aislesAccountNo
      );

      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = aisles;
        return updated;
      }
      return [...prev, aisles];
    });
    setView("list");
  };

  /** Open the "Add aisles" form */
  const handleAddAisles = () => {
    setSelectedAisles(null);
    setView("form");
  };

  /** Show Aisles details */
  const handleViewAisles = (aislesAccountNo) => {
    const cust = aisles.find((c) => c.aislesAccountNo === aislesAccountNo);
    setSelectedAisles(cust);
    setView("details");
  };

  /** Delete selected Aisless */
  const handleDeleteAisles = (toDeleteAccounts) => {
    setAisless((prev) =>
      prev.filter((c) => !toDeleteAccounts.includes(c.aislesAccountNo))
    );
  };

  /** Cancel form or detail view */
  const handleCancel = () => setView("list");

  /** Render header with title and actions */
  const renderHeader = () => {
    let title = "aisless";
    let action = null;

    if (view === "list") {
      action = <Button onClick={handleAddAisles}>Add Aisles</Button>;
    } else if (view === "form") {
      title = selectedAisles ? "Edit Aisles" : "New Aisles";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      );
    } else if (view === "details") {
      title = "Aisles Details";
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
          <AisleList
            aisless={aisles}
            handleAddAisles={handleAddAisles}
            onView={handleViewAisles}
            onDelete={handleDeleteAisles}
          />
        )}

        {view === "form" && (
          <AisleForm
            aisles={selectedAisles}
            handleAddAisles={handleAddAisles}
            handleCancel={handleCancel}
          />
        )}
        {/* {view === "details" && selectedAisles && (
          <AislesViewPage
            aisles={selectedAisles}
            onEdit={() => setView("form")}
            onBack={handleCancel}
          />
        )} */}
      </div>
    </div>
  );
};

export default AislePage;
