import React, { useState } from "react";
import ItemViewPage from "./ItemViewPage";
import { Button } from "../../Component/Button/Button";
import ItemList from "./ItemList";
import ItemForm from "./ItemForm";

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
    const cust = items.find((c) => c.customerAccountNo === customerAccountNo);
    setSelectedCustomer(cust);
    setView("details");
  };

  /** Delete selected items */
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
      action = <Button onClick={handleAdditem}>Add Item</Button>;
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
            items={items}
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
            item={selectedItemz}
            onEdit={() => setView("form")}
            onBack={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default ItemPage;
