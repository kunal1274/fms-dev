import React, { useState } from "react";

import CreditNoteViewPage from "./CreditNoteViewPage";
import { Button } from "@/components/ui/Button";
import CreditNoteForm from "./CreditNoteForm";
import CreditNoteList from "./CreditNotelistDummy";

const CreditNotePage = () => {
  const [view, setView] = useState("list");
  const [debits, setCreditNotes] = useState([]);
  const [selectedCreditNote, setSelectedCreditNote] = useState(null);

  /** Save or update a debit */
  const handleSaveCreditNote = (debit) => {
    setCreditNotes((prev) => {
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

  /** Open the "Add CreditNote" form */
  const handleAddCreditNote = () => {
    setSelectedCreditNote(null);
    setView("form");
  };

  /** Show debit details */
  const handleViewCreditNote = (debitAccountNo) => {
    const cust = debits.find((c) => c.debitAccountNo === debitAccountNo);
    setSelectedCreditNote(cust);
    setView("details");
  };

  /** Delete selected debits */
  const handleDeleteCreditNote = (toDeleteAccounts) => {
    setCreditNotes((prev) =>
      prev.filter((c) => !toDeleteAccounts.includes(c.debitAccountNo))
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
            debits={debits}
            handleAddCreditNote={handleAddCreditNote}
            onView={handleViewCreditNote}
            onDelete={handleDeleteCreditNote}
          />
        )}

        {view === "form" && (
          <CreditNoteForm
            debit={selectedCreditNote}
            handleAddCreditNote={handleAddCreditNote}
            handleCancel={handleCancel}
          />
        )}
        {view === "details" && selectedCreditNote && (
          <CreditNoteViewPage
            debit={selectedCreditNote}
            onEdit={() => setView("form")}
            onBack={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default CreditNotePage;
