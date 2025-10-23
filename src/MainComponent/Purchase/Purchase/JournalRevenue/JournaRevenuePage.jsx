import React, { useState } from "react";

import JournalRevenueViewPage from "./JournalRevenueViewPage";
import { Button } from "@/components/ui/Button";
import JournalRevenueForm from "./JournalRevenueForm";
import JournalRevenueList from "./RevenueJournalListDummy";

const JournalRevenuePage = () => {
  const [view, setView] = useState("list");
  const [journalRevenues, setJournalRevenues] = useState([]);
  const [selectedJournalRevenue, setSelectedJournalRevenue] = useState(null);

  /** Save or update a journalRevenue */
  const handleSaveJournalRevenue = (journalRevenue) => {
    setJournalRevenues((prev) => {
      const idx = prev.findIndex(
        (c) => c.journalRevenueAccountNo === journalRevenue.journalRevenueAccountNo
      );

      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = journalRevenue;
        return updated;
      }
      return [...prev, journalRevenue];
    });
    setView("list");
  };

  /** Open the "Add JournalRevenue" form */
  const handleAddJournalRevenue = () => {
    setSelectedJournalRevenue(null);
    setView("form");
  };

  /** Show journalRevenue details */
  const handleViewJournalRevenue = (journalRevenueAccountNo) => {
    const cust = journalRevenues.find(
      (c) => c.journalRevenueAccountNo === journalRevenueAccountNo
    );
    setSelectedJournalRevenue(cust);
    setView("details");
  };

  /** Delete selected journalRevenues */
  const handleDeleteJournalRevenue = (toDeleteAccounts) => {
    setJournalRevenues((prev) =>
      prev.filter((c) => !toDeleteAccounts.includes(c.journalRevenueAccountNo))
    );
  };

  /** Cancel form or detail view */
  const handleCancel = () => setView("list");

  /** Render header with title and actions */
  const renderHeader = () => {
    let title = "JournalRevenues";
    let action = null;

    if (view === "list") {
      action = <Button onClick={handleAddJournalRevenue}>Add JournalRevenue</Button>;
    } else if (view === "form") {
      title = selectedJournalRevenue ? "Edit JournalRevenue" : "New JournalRevenue";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      );
    } else if (view === "details") {
      title = "JournalRevenue Details";
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
          <JournalRevenueList
            journalRevenues={journalRevenues}
            handleAddJournalRevenue={handleAddJournalRevenue}
            onView={handleViewJournalRevenue}
            onDelete={handleDeleteJournalRevenue}
          />
        )}

        {view === "form" && (
          <JournalRevenueForm
            journalRevenue={selectedJournalRevenue}
            handleAddJournalRevenue={handleAddJournalRevenue}
            handleCancel={handleCancel}
          />
        )}
        {view === "details" && selectedJournalRevenue && (
          <JournalRevenueViewPage
            journalRevenue={selectedJournalRevenue}
            onEdit={() => setView("form")}
            onBack={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default JournalRevenuePage;
