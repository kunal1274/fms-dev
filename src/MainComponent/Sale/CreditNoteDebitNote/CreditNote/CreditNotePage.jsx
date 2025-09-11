import React, { useState } from "react";

import CreditNoteViewPage from "./CreditNoteViewPage";
import { Button } from "../../../../Component/Button/Button";
import CreditNoteForm from "./CreditNoteForm";
import CreditNoteList from "./CreditNotelist";

const CreditNotePage = () => {
  const [view, setView] = useState("list");
  const [credits, setCreditNotes] = useState([]);
  const [selectedCreditNote, setSelectedCreditNote] = useState(null);

  /** Save or update a credit */
  const handleSaveCreditNote = (credit) => {
    setCreditNotes((prev) => {
      const idx = prev.findIndex(
        (c) => c.creditAccountNo === credit.creditAccountNo
      );

      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = credit;
        return updated;
      }
      return [...prev, credit];
    });
    setView("list");
  };

  /** Open the "Add CreditNote" form */
  const handleAddCreditNote = () => {
    setSelectedCreditNote(null);
    setView("form");
  };

  /** Show credit details */
  const handleViewCreditNote = (creditAccountNo) => {
    const cust = credits.find(
      (c) => c.creditAccountNo === creditAccountNo
    );
    setSelectedCreditNote(cust);
    setView("details");
  };

  /** Delete selected credits */
  const handleDeleteCreditNote = (toDeleteAccounts) => {
    setCreditNotes((prev) =>
      prev.filter((c) => !toDeleteAccounts.includes(c.creditAccountNo))
    );
  };

  /** Cancel form or detail view */
  const handleCancel = () => setView("list");

  /** Render header with title and actions */
  const renderHeader = () => {
    let title = "CreditNotes";
    let action = null;

    if (view === "list") {
      action = <Button onClick={handleAddCreditNote}>Add CreditNote</Button>;
    } else if (view === "form") {
      title = selectedCreditNote ? "Edit CreditNote" : "New CreditNote";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      );
    } else if (view === "details") {
      title = "CreditNote Details";
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
    <div className="">
      <div>
        {view === "list" && (
          <CreditNoteList
            credits={credits}
            handleAddCreditNote={handleAddCreditNote}
            onView={handleViewCreditNote}
            onDelete={handleDeleteCreditNote}
          />
        )}

        {view === "form" && (
          <CreditNoteForm
            credit={selectedCreditNote}
            handleAddCreditNote={handleAddCreditNote}
            handleCancel={handleCancel}
          />
        )}
        {view === "details" && selectedCreditNote && (
          <CreditNoteViewPage
            credit={selectedCreditNote}
            onEdit={() => setView("form")}
            onBack={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default CreditNotePage;
