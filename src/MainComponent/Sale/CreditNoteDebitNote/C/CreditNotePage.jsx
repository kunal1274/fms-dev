import React, { useState } from "react";

import DebitNoteViewPage from "./DebitNoteViewPage";
import { Button } from "@/components/ui/Button";
import DebitNoteForm from "./DebitNoteForm";
import DebitNoteList from "./DebitNotelist";

const DebitNotePage = () => {
  const [view, setView] = useState("list");
  const [debits, setDebitNotes] = useState([]);
  const [selectedDebitNote, setSelectedDebitNote] = useState(null);

  /** Save or update a debit */
  const handleSaveDebitNote = (debit) => {
    setDebitNotes((prev) => {
      const idx = prev.findIndex(
        (c) => c.debitAccountNo === debit.debitAccountNo
      );

      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = debit;
        return updated;
      }
      return [...prev, debit];
    });
    setView("list");
  };

  /** Open the "Add DebitNote" form */
  const handleAddDebitNote = () => {
    setSelectedDebitNote(null);
    setView("form");
  };

  /** Show debit details */
  const handleViewDebitNote = (debitAccountNo) => {
    const cust = debits.find((c) => c.debitAccountNo === debitAccountNo);
    setSelectedDebitNote(cust);
    setView("details");
  };

  /** Delete selected debits */
  const handleDeleteDebitNote = (toDeleteAccounts) => {
    setDebitNotes((prev) =>
      prev.filter((c) => !toDeleteAccounts.includes(c.debitAccountNo))
    );
  };

  /** Cancel form or detail view */
  const handleCancel = () => setView("list");

  /** Render header with title and actions */
  const renderHeader = () => {
    let title = "DebitNotes";
    let action = null;

    if (view === "list") {
      action = <Button onClick={handleAddDebitNote}>Add DebitNote</Button>;
    } else if (view === "form") {
      title = selectedDebitNote ? "Edit DebitNote" : "New DebitNote";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      );
    } else if (view === "details") {
      title = "DebitNote Details";
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
          <DebitNoteList
            debits={debits}
            handleAddDebitNote={handleAddDebitNote}
            onView={handleViewDebitNote}
            onDelete={handleDeleteDebitNote}
          />
        )}

        {view === "form" && (
          <DebitNoteForm
            debit={selectedDebitNote}
            handleAddDebitNote={handleAddDebitNote}
            handleCancel={handleCancel}
          />
        )}
        {view === "details" && selectedDebitNote && (
          <DebitNoteViewPage
            debit={selectedDebitNote}
            onEdit={() => setView("form")}
            onBack={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default DebitNotePage;
