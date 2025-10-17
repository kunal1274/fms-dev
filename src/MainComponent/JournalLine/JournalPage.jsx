import React, { useState } from "react";
import { Button } from "../../Component/Button/Button.jsx";
import JournalForm from "./JournalForm.jsx";
import JournalList from "./JournalList.jsx";
import JournalViewPage from "./JournalViewPage.jsx";

const JournalPage = () => {
  const [view, setView] = useState("list");
  const [Journal, setLocataion] = useState([]);
  const [selectedJournal, setSelectedLocataion] = useState(null);

  /** Save or update a Locataion */
  const handleSaveJournal
  
  = (Locataion) => {
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
  const handleAddJournal = () => {
    setSelectedLocataion(null);
    setView("form");
  };

  /** Show Locataion details */
  const handleViewJournal = (LocataionAccountNo) => {
    const cust = Journal.find(
      (c) => c.LocataionAccountNo === LocataionAccountNo
    );
    setSelectedLocataion(cust);
    setView("details");
  };

  /** Delete selected Locataions */
  const handleDeleteJournal = (toDeleteAccounts) => {
    setJournals((prev) =>
      prev.filter((c) => !toDeleteAccounts.includes(c.JournalAccountNo))
    );
  };

  /** Cancel form or detail view */
  const handleCancel = () => setView("list");

  /** Render header with title and actions */
  const renderHeader = () => {
    let title = "Journals";
    let action = null;

    if (view === "list") {
      action = <Button onClick={handleAddJournal}>Add Journal</Button>;
    } else if (view === "form") {
      title = selectedJournal ? "Edit Journal" : "New Journal";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      );
    } else if (view === "details") {
      title = "Journal Details";
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
          <JournalList
            Journals={Journal}
            handleAddJournal={handleAddJournal}
            onView={handleViewJournal}
            onDelete={handleDeleteJournal}
          />
        )}

        {view === "form" && (
          <JournalForm
            Journal={selectedJournal}
            handleAddJournal={handleAddJournal}
            handleCancel={handleCancel}
          />
        )}
        {view === "details" && selectedJournal && (
          <JournalViewPage
            Journal={selectedJournal}
            onEdit={() => setView("form")}
            handleCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default JournalPage;
