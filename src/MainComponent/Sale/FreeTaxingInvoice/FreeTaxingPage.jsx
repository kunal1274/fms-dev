import React, { useState } from "react";

import FreeTaxingViewPage from "./FreeTaxingViewPage";
import { Button } from "@/components/ui/Button";
import FreeTaxingForm from "./FreeTaxingForm";
import FreeTaxingList from "./FreeTaxinglistDummy";

const FreeTaxingPage = () => {
  const [view, setView] = useState("list");
  const [freeTaxings, setFreeTaxings] = useState([]);
  const [selectedFreeTaxing, setSelectedFreeTaxing] = useState(null);

  /** Save or update a freeTaxing */
  const handleSaveFreeTaxing = (freeTaxing) => {
    setFreeTaxings((prev) => {
      const idx = prev.findIndex(
        (c) => c.freeTaxingAccountNo === freeTaxing.freeTaxingAccountNo
      );

      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = freeTaxing;
        return updated;
      }
      return [...prev, freeTaxing];
    });
    setView("list");
  };

  /** Open the "Add FreeTaxing" form */
  const handleAddFreeTaxing = () => {
    setSelectedFreeTaxing(null);
    setView("form");
  };

  /** Show freeTaxing details */
  const handleViewFreeTaxing = (freeTaxingAccountNo) => {
    const cust = freeTaxings.find(
      (c) => c.freeTaxingAccountNo === freeTaxingAccountNo
    );
    setSelectedFreeTaxing(cust);
    setView("details");
  };

  /** Delete selected freeTaxings */
  const handleDeleteFreeTaxing = (toDeleteAccounts) => {
    setFreeTaxings((prev) =>
      prev.filter((c) => !toDeleteAccounts.includes(c.freeTaxingAccountNo))
    );
  };

  /** Cancel form or detail view */
  const handleCancel = () => setView("list");

  /** Render header with title and actions */
  const renderHeader = () => {
    let title = "FreeTaxings";
    let action = null;

    if (view === "list") {
      action = <Button onClick={handleAddFreeTaxing}>Add FreeTaxing</Button>;
    } else if (view === "form") {
      title = selectedFreeTaxing ? "Edit FreeTaxing" : "New FreeTaxing";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      );
    } else if (view === "details") {
      title = "FreeTaxing Details";
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
          <FreeTaxingList
            freeTaxings={freeTaxings}
            handleAddFreeTaxing={handleAddFreeTaxing}
            onView={handleViewFreeTaxing}
            onDelete={handleDeleteFreeTaxing}
          />
        )}

        {view === "form" && (
          <FreeTaxingForm
            freeTaxing={selectedFreeTaxing}
            handleAddFreeTaxing={handleAddFreeTaxing}
            handleCancel={handleCancel}
          />
        )}
        {view === "details" && selectedFreeTaxing && (
          <FreeTaxingViewPage
            freeTaxing={selectedFreeTaxing}
            onEdit={() => setView("form")}
            onBack={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default FreeTaxingPage;
