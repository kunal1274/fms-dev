import React, { useState } from "react";

import BinViewPage from "./BinViewPage";
import { Button } from "../../../Component/Button/Button";
import BinForm from "./BinForm";

import BinList from "./BinList";

const BinPage = () => {
  const [view, setView] = useState("list");
  const [bin, setBin] = useState([]);
  const [selectedBin, setSelectedBin] = useState(null);

  /** Save or update a Bin */
  const handleSavebin = (bin) => {
    setbin((prev) => {
      const idx = prev.findIndex((c) => c.binAccountNo === bin.binAccountNo);

      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = bin;
        return updated;
      }
      return [...prev, bin];
    });
    setView("list");
  };

  /** Open the "Add bin" form */
  const handleAddBin = () => {
    setSelectedBin(null);
    setView("form");
  };

  /** Show Bin details */
  const handleViewBin = (binAccountNo) => {
    const cust = bin.find((c) => c.binAccountNo === binAccountNo);
    setSelectedBin(cust);
    setView("details");
  };

  /** Delete selected Bins */
  const handleDeleteBin = (toDeleteAccounts) => {
    setBins((prev) =>
      prev.filter((c) => !toDeleteAccounts.includes(c.binAccountNo))
    );
  };

  /** Cancel form or detail view */
  const handleCancel = () => setView("list");

  /** Render header with title and actions */
  const renderHeader = () => {
    let title = "bins";
    let action = null;

    if (view === "list") {
      action = <Button onClick={handleAddBin}>Add Bin</Button>;
    } else if (view === "form") {
      title = selectedBin ? "Edit Bin" : "New Bin";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      );
    } else if (view === "details") {
      title = "Bin Details";
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
          <BinList
            bins={bin}
            handleAddBin={handleAddBin}
            onView={handleViewBin}
            onDelete={handleDeleteBin}
          />
        )}

        {view === "form" && (
          <BinForm
            bin={selectedBin}
            handleAddBin={handleAddBin}
           handleCancel={handleCancel}
          />
        )}
        {view === "details" && selectedBin && (
          <BinViewPage
            bin={selectedBin}
            onEdit={() => setView("form")}
            onBack={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default BinPage;
