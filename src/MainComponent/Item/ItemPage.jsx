import React, { useState } from "react";

import ItemViewPage from "./ItemViewPage";
import { Button } from "../../Component/Button/Button";
import ItemForm from "./Form";
import ItemList from "./";

const ItemPage = () => {
  const [view, setView] = useState("list");
  const [Items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  /** Save or update a Item */
  const handleSaveItem = (Item) => {
    setItems((prev) => {
      const idx = prev.findIndex((c) => c.ItemAccountNo === Item.ItemAccountNo);

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
  const handleViewItem = (ItemAccountNo) => {
    const cust = Items.find((c) => c.ItemAccountNo === ItemAccountNo);
    setSelectedItem(cust);
    setView("details");
  };

  /** Delete selected Items */
  const handleDeleteItem = (toDeleteAccounts) => {
    setItems((prev) =>
      prev.filter((c) => !toDeleteAccounts.includes(c.ItemAccountNo))
    );
  };

  /** Cancel form or detail view */
  const handleCancel = () => setView("list");

  /** Render header with title and actions */
  const renderHeader = () => {
    let title = "Items";
    let action = null;

    if (view === "list") {
      action = <Button onClick={handleAddItem}>Add Item</Button>;
    } else if (view === "form") {
      title = selectedItem ? "Edit Item" : "New Item";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      );
    } else if (view === "details") {
      title = "Item Details";
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
          <ItemList
            Items={Items}
            handleAddItem={handleAddItem}
            onView={handleViewItem}
            onDelete={handleDeleteItem}
          />
        )}

        {view === "form" && (
          <ItemForm
            Item={selectedItem}
            handleAddItem={handleAddItem}
            handleCancel={handleCancel}
          />
        )}
        {view === "details" && selectedItem && (
          <ItemViewPage
            Item={selectedItem}
            onEdit={() => setView("form")}
            onBack={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default ItemPage;
