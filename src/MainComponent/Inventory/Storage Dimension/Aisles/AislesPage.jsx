import React, { useState } from "react";
import { Button } from "../../../../../src/Component/Button/Button";
import AislesForm from "./AislesForm";
import Aisles from "./AislesList.jsx";
import AislesViewPage from "./AislesViewPage.jsx";

const AislesPage = () => {
  const [view, setView] = useState("list");
  const [aisles, setLocataion] = useState([]);
  const [selectedAisles, setSelectedLocataion] = useState(null);

  /** Save or update a Locataion */
  const handleSaveAisles = (Locataion) => {
    setLocataion((prev) => {
      const idx = prev.findIndex(
        (c) => c.LocataionAccountNo === Locataion.LocataionAccountNo
      );

      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = Locataion;
        return updated;
      }
      return [...prev, Locataion];
    });
    setView("list");
  };

  /** Open the "Add Locataion" form */
  const handleAddAisles = () => {
    setSelectedLocataion(null);
    setView("form");
  };

  /** Show Locataion details */
  const handleViewAisles = (LocataionAccountNo) => {
    const cust = Aisles.find(
      (c) => c.LocataionAccountNo === LocataionAccountNo
    );
    setSelectedLocataion(cust);
    setView("details");
  };

  /** Delete selected Locataions */
  const handleDeleteAisles = (toDeleteAccounts) => {
    setAisless((prev) =>
      prev.filter((c) => !toDeleteAccounts.includes(c.AislesAccountNo))
    );
  };

  /** Cancel form or detail view */
  const handleCancel = () => setView("list");

  /** Render header with title and actions */
  const renderHeader = () => {
    let title = "Aisless";
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
          <Aisles
            Aisless={Aisles}
            handleAddAisles={handleAddAisles}
            onView={handleViewAisles}
            onDelete={handleDeleteAisles}
          />
        )}

        {view === "form" && (
          <AislesForm
            Aisles={selectedAisles}
            handleAddAisles={handleAddAisles}
            handleCancel={handleCancel}
          />
        )}
        {view === "details" && selectedAisles && (
          <AislesViewPage
            Aisles={selectedAisles}
            onEdit={() => setView("form")}
            handleCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default AislesPage;
