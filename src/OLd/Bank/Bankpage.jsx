import React, { useState } from "react";
import BankForm from "./BankForm";
import BankList from "./BankList";
import BankViewPage from "./BankViewPage"; // Import the detail page

const Bankpage = () => {
  const [view, setView] = useState("list"); // Default to show ItemList
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); // Store the selected item
  
  const handleSaveItem = (item) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (existingItem) => existingItem.itemNo === item.itemNo
      );


      if (existingItemIndex !== -1) {
        // Update existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = item;
        return updatedItems;
      } else {
        // Add new item
        setView("list");
        return [...prevItems, item];
      }
    }); 
    
     // Switch to item list view
  };

  const toggleView = (newView) => {
    setView(newView);
  };

  const handleAddItem = () => {
    setSelectedItem(null); // Reset selected item for new entry
    setView("form");
  };

  const handleDeleteItems = (itemNos) => {
    if (window.confirm("Are you sure you want to delete these items?")) {
      setItems((prevItems) => 
        prevItems.filter((item) => !itemNos.includes(item.itemNo))
      );
    }
  };

  const handleViewItem = (itemNo) => {
    const item = items.find((item) => item.itemNo === itemNo);
    setSelectedItem(item);
    setView("details"); // Switch to details view
  };

  const handleDeleteItem = (itemNo) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setItems((prevItems) => prevItems.filter((item) => item.itemNo !== itemNo));
    }
  };

  const handleCancel = () => {
    setView("list");
  };

  return (
    <div className="bg-blue-400 p-8 min-h-screen">
      <div className="bg-slate-50 rounded-lg p-6">
        {view === "form" && (
          <BankForm
            handleSaveItem={handleSaveItem}
            handleCancel={handleCancel}
            toggleView={toggleView}
          />
        )}

        {view === "list" && (
          <BankList
            items={items}
            toggleView={toggleView}
            onAddItem={handleAddItem}
            // onViewItem={handleViewItem}
            handleDeleteItems={handleDeleteItems}
            onViewItem={handleViewItem}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {view === "details" && selectedItem && (
          <BankViewPage
            item={selectedItem}
            toggleView={toggleView}
            handleSaveItem={handleSaveItem} 
            onClose={() => setView("list")} // Close details view
          />
        )}
      </div>
    </div>
  );
};

export default Bankpage;
