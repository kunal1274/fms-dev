import React, { useState } from "react";
import BankViewPage from "./BankViewPagee";
import { Button } from "@/components/ui/Button";
import BankForm from "./BankForm";
import BankList from "./BanklistDummy";

const BankPage = () => {
  const [view, setView] = useState("list");
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);

  /** Save or update a bank */
  const handleSaveBank = (bank) => {
    setBanks((prev) => {
      const idx = prev.findIndex((c) => c.bankAccountNo === bank.bankAccountNo);

      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = bank;
        return updated;
      }
      return [...prev, bank];
    });
    setView("list");
  };

  /** Open the "Add Bank" form */
  const handleAddBank = () => {
    setSelectedBank(null);
    setView("form");
  };

  /** Show bank details */
  const handleViewBank = (bankAccountNo) => {
    const cust = banks.find((c) => c.bankAccountNo === bankAccountNo);
    setSelectedBank(cust);
    setView("details");
  };

  /** Delete selected banks */
  const handleDeleteBank = (toDeleteAccounts) => {
    setBanks((prev) =>
      prev.filter((c) => !toDeleteAccounts.includes(c.bankAccountNo))
    );
  };

  /** Cancel form or detail view */
  const handleCancel = () => setView("list");

  /** Render header with title and actions */
  const renderHeader = () => {
    let title = "Banks";
    let action = null;

    if (view === "list") {
      action = <Button onClick={handleAddBank}>Add Bank</Button>;
    } else if (view === "form") {
      title = selectedBank ? "Edit Bank" : "New Bank";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      );
    } else if (view === "details") {
      title = "Bank Details";
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
          <BankList
            banks={banks}
            handleAddBank={handleAddBank}
            onView={handleViewBank}
            onDelete={handleDeleteBank}
          />
        )}

        {view === "form" && (
          <BankForm
            bank={selectedBank}
            handleAddBank={handleAddBank}
            handleCancel={handleCancel}
          />
        )}
        {view === "details" && selectedBank && (
          <BankViewPage
            bank={selectedBank}
            onEdit={() => setView("form")}
            onBack={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default BankPage;
