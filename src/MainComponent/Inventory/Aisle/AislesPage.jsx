import React, { useState } from "react";
import { Button } from "../../../Component/Button/Button";
import AilsesForm from "./AislesForm.jsx";
import Ailses from "./AislesList.jsx";
// import AilsesViewPage from './';

const Ailses = () => {
  const [view, setView] = useState("list");
  const [Ailses, setLocataion] = useState([]);
  const [selectedAilses, setSelectedLocataion] = useState(null);

  /** Save or update a Locataion */
  const handleSaveAilses = (Locataion) => {
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
  const handleAddAilses = () => {
    setSelectedLocataion(null);
    setView("form");
  };

  /** Show Locataion details */
  const handleViewAilses = (LocataionAccountNo) => {
    const cust = Ailses.find(
      (c) => c.LocataionAccountNo === LocataionAccountNo
    );
    setSelectedLocataion(cust);
    setView("details");
  };

  /** Delete selected Locataions */
  const handleDeleteAilses = (toDeleteAccounts) => {
    setAilsess((prev) =>
      prev.filter((c) => !toDeleteAccounts.includes(c.AilsesAccountNo))
    );
  };

  /** Cancel form or detail view */
  const handleCancel = () => setView("list");

  /** Render header with title and actions */
  const renderHeader = () => {
    let title = "Ailsess";
    let action = null;

    if (view === "list") {
      action = <Button onClick={handleAddAilses}>Add Ailses</Button>;
    } else if (view === "form") {
      title = selectedAilses ? "Edit Ailses" : "New Ailses";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      );
    } else if (view === "details") {
      title = "Ailses Details";
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
          <Ailses
            Ailsess={Ailses}
            handleAddAilses={handleAddAilses}
            onView={handleViewAilses}
            onDelete={handleDeleteAilses}
          />
        )}

        {view === "form" && (
          <AilsesForm
            Ailses={selectedAilses}
            handleAddAilses={handleAddAilses}
            handleCancel={handleCancel}
          />
        )}
        {view === "details" && selectedAilses && (
          <AilsesViewPage
            Ailses={selectedAilses}
            onEdit={() => setView("form")}
            onBack={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default Ailses;
