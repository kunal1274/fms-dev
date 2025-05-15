import React, { useState } from "react";

import ItemViewPage from "./ItemViewPage";
import { Button } from "../../Component/Button/Button";
import ItemForm from "./ItemFor";
import ItemList from "./List";

const ItemPage = () => {
  const [view, setView] = useState("list");
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  /** Save or update a Item */
  const handleSaveItem = (item) => {
    setItems((prev) => {
      const idx = prev.findIndex((c) => c.itemAccountNo === item.itemAccountNo);

      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = item;
        return updated;
      }
      return [...prev, item];
    });
    setView("list");
  };

  /** Open the "Add item" form */
  const handleAddItem = () => {
    setSelectedItem(null);
    setView("form");
  };

  /** Show Item details */
  const handleViewItem = (itemAccountNo) => {
    const cust = items.find((c) => c.itemAccountNo === itemAccountNo);
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

  
  
  
  };

  return (
    <div className="w-full bg-white rounded-lg ">
      <div>
        {view === "list" && (
          <ItemList
            Items={items}
            handleAddItem={handleAddItem}
            onView={handleViewItem}
            onDelete={handleDeleteItem}
          />
        )}

        {view === "form" && (
          <ItemForm
            item={selectedItem}
            handleAddItem={handleAddItem}
            handleCancel={handleCancel}
          />
        )}
        {view === "details" && selectedItem && (
          <ItemViewPage
            item={selectedItem}
            onEdit={() => setView("form")}
            onBack={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default ItemPage;
