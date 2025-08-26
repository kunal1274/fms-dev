import React, { useState } from "react";
import ProductColorList from "./ProductDimColorList";
import ProductColorForm from "./ColorForm";
import ProductColorViewPage from "./ColorViewPage";

export default function ProductColorPage() {
  const [view, setView] = useState("list"); // "list" | "form" | "details"
  const [selectedId, setSelectedId] = useState(null);

  const handleAddColor = () => {
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
    setView("list");
  };

  return (
    <div className="">
      {view === "list" && (
        <ProductColorList
          handleAddColor={handleAddColor}
          onView={handleViewProductColor}
        />
      )}

      {view === "form" && (
        <ProductColorForm
          ProductColorId={selectedId}
          onSave={handleSaved}
          handleCancel={handleCancel}
        />
      )}

      {view === "details" && (
        <ProductColorViewPage
          ProductColorId={selectedId}
          onEdit={handleEditProductColor}
          onBack={handleCancel}
        />
      )}
    </div>
  );
}
