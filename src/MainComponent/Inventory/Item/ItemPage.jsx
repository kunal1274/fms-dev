import React, { useState, useEffect, useContext } from "react";
import ItemViewPage from "./ItemViewPage";
import ItemForm from "./Form";
import ItemList from "./List";
import { Button } from "../../../Component/Button/Button";
// import CompanyContext from "../../../context/CompanyContext.jsx";
import CompanyContext from "../../../context/CompanyContext";

const ItemPage = () => {
  const { form, setForm, companies } = useContext(CompanyContext);

  useEffect(() => {
    console.log("Current company:", form.company);
  }, [form.company]);

  const [view, setView] = useState("list");
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  /** Save or update an Item */
  const handleSaveItem = (item) => {
    setItems((prev) => {
      const idx = prev.findIndex((c) => c.ItemAccountNo === item.ItemAccountNo);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = item;
        return updated;
      }
      return [...prev, item];
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
    const item = items.find((c) => c.ItemAccountNo === ItemAccountNo);
    setSelectedItem(item);
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
      // action = <Button onClick={handleAddItem}>Add Item</Button>;
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
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        {action}
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-lg p-4">
      {/* {renderHeader()} */}
      <h2 className="mt-2 text-lg">
        {/* Item Master - Selected Company: {form.company} */}
      </h2>
      <div className="mt-4">
        {view === "list" && (
          <ItemList
            items={items}
            onAddItem={handleAddItem}
            onView={handleViewItem}
            onDelete={handleDeleteItem}
          />
        )}

        {view === "form" && (
          <ItemForm
            item={selectedItem}
            onSave={handleSaveItem}
            onCancel={handleCancel}
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
