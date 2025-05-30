import React, { useState } from "react";
import ProductStyleList from "./ProductStyleList";
import ProductStyleForm from "./ProductStyleForm";
import ProductStyleViewPage from "./ProductStyleViewPagee";

export default function ProductStylePage() {
  const [view, setView] = useState("list"); // "list" | "form" | "details"
  const [selectedId, setSelectedId] = useState(null); // Mongo _id of the ProductStyle

  // Handlers to switch views
  const handleAddProductStyle = () => {
    setSelectedId(null);
    setView("form");
  };
  const handleViewProductStyle = (id) => {
    setSelectedId(id);
    setView("details");
  };
  const handleEditProductStyle = () => {
    setView("form");
  };
  const handleCancel = () => {
    setSelectedId(null);
    setView("list");
  };
  const handleSaved = () => {
    // after create or update
    setView("list");
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg">
      {view === "list" && (
        <ProductStyleList handleAddProductStyle={handleAddProductStyle} onView={handleViewProductStyle} />
      )}

      {view === "form" && (
        <ProductStyleForm
          ProductStyleId={selectedId}
          onSave={handleSaved}
           handleCancel
           
           
           ={handleCancel}
        />
      )}

      {view === "details" && (
        <ProductStyleViewPage
          ProductStyleId={selectedId}
          onEdit={handleEditProductStyle

            
          }
          onBack={handleCancel}
        />
      )}
    </div>
  );
}
