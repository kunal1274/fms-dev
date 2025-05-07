import React, { useState } from "react";

import itemViewPage from "./ItemViewPage";
import { Button } from "../../Component/Button/Button";
import itemForm from "./ItemForm";
import itemList from "./Itemlist";

const itemPage = () => {
  const [view, setView] = useState("list");
  const [Items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  /** Save or update a Item */
  const handleSaveItem = (item) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (c) => c.ItemAccountNo === Item.ItemAccountNo
      );

      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = Item;
        return updated;
      }
      return [...prev, Item];
    });
    setView("list");
  };

  /** Open the "Add Item" form */
  const handleAddItem = () => {
    setSelectedItem(null);
    setView("form");
  };

  /** Show Item details */
  const handleViewItem = (itemAccountNo) => {
    const cust = items.find(
      (c) => c.itemAccountNo === itemAccountNo
    );
    setSelectedItem(cust);
    setView("details");
  };

  /** Delete selected Items */
  const handleDeleteItem = (toDeleteAccounts) => {
    setItems((prev) =>
      prev.filter((c) => !toDeleteAccounts.includes(c.itemAccountNo))
    );
  };

  /** Cancel form or detail view */
  const handleCancel = () => setView("list");

  /** Render header with title and actions */
  const renderHeader = () => {
    let title = "items";
    let action = null;

    if (view === "list") {
      action = <Button onClick={handleAdditem}>Add item</Button>;
    } else if (view === "form") {
      title = selecteditem ? "Edit item" : "New item";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      );
    } else if (view === "details") {
      title = "item Details";
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
          <itemList
            items={items}
            handleAdditem={handleAdditem}
            onView={handleViewitem}
            onDelete={handleDeleteitem}
          />
        )}

        {view === "form" && (
          <itemForm
            item={selecteditem}
            handleAdditem={handleAdditem}
            handleCancel={handleCancel}
          />
        )}
        {view === "details" && selecteditem && (
          <itemViewPage
            item={selecteditem}
            onEdit={() => setView("form")}
            onBack={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default itemPage;
