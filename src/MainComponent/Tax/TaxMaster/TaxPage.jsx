import React, { useState } from "react";
import { Button } from "../../Component/Button/Button.jsx";
import TaxForm from "./TaxForm.jsx";
import TaxList from "./TaxList.jsx";
import TaxViewPage from "./TaxViewPage.jsx";

const TaxPage = () => {
  const [view, setView] = useState("list");
  const [Tax, setLocataion] = useState([]);
  const [selectedTax, setSelectedLocataion] = useState(null);

  /** Save or update a Locataion */
  const handleSaveTax = (Locataion) => {
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
  const handleAddTax = () => {
    setSelectedLocataion(null);
    setView("form");
  };

  /** Show Locataion details */
  const handleViewTax = (LocataionAccountNo) => {
    const cust = Tax.find(
      (c) => c.LocataionAccountNo === LocataionAccountNo
    );
    setSelectedLocataion(cust);
    setView("details");
  };

  /** Delete selected Locataions */
  const handleDeleteTax = (toDeleteAccounts) => {
    setTaxs((prev) =>
      prev.filter((c) => !toDeleteAccounts.includes(c.TaxAccountNo))
    );
  };

  /** Cancel form or detail view */
  const handleCancel = () => setView("list");

  /** Render header with title and actions */
  const renderHeader = () => {
    let title = "Taxs";
    let action = null;

    if (view === "list") {
      action = <Button onClick={handleAddTax}>Add Tax</Button>;
    } else if (view === "form") {
      title = selectedTax ? "Edit Tax" : "New Tax";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      );
    } else if (view === "details") {
      title = "Tax Details";
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
          <TaxList
            Taxs={Tax}
            handleAddTax={handleAddTax}
            onView={handleViewTax}
            onDelete={handleDeleteTax}
          />
        )}

        {view === "form" && (
          <TaxForm
            Tax={selectedTax}
            handleAddTax={handleAddTax}
            handleCancel={handleCancel}
          />
        )}
        {view === "details" && selectedTax && (
          <TaxViewPage
            Tax={selectedTax}
            onEdit={() => setView("form")}
            handleCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default TaxPage;
