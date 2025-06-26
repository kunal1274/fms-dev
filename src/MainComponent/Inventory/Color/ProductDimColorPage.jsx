import React, { useState } from "react";
import ProductColorList from "./ProductDimColorList";
import ProductColorForm from "./ProductDimColorForm";
// import ProductColorViewPage from "./ProductColorViewPagee";

export default function ProductColorPage() {
  const [view, setView] = useState("list"); // "list" | "form" | "details"
  const [selectedId, setSelectedId] = useState(null); // Mongo _id of the ProductColor

  // Handlers to switch views
  const handleAddProductColor = () => {
    setSelectedId(null);
    setView("form");
  };
  const handleViewProductColor = (id) => {
    setSelectedId(id);
    setView("details");
  };
  const handleEditProductColor = () => {
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
        <ProductColorList handleAddProductColor={handleAddProductColor} onView={handleViewProductColor} />
      )}

      {view === "form" && (
        <ProductColorForm
          ProductColorId={selectedId}
          onSave={handleSaved}
         handleCancel
         ={handleCancel}
        />
      )}

      {view === "details" && (
        <ProductColorViewPage
          ProductColorId={selectedId}
          onEdit={handleEditProductColor



            
          }
          onBack={handleCancel}
        />
      )}
    </div>
  );
}
