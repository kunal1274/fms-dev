

import React, { useState } from "react";
import ProductSizeList from "./ProductSizeList";
import ProductSizeForm from "./ProductSizeForm";
import ProductSizeViewPage from "./ProductSizeViewPagee";

export default function ProductSizePage() {
  const [view, setView] = useState("list"); // "list" | "form" | "details"
  const [selectedId, setSelectedId] = useState(null); // Mongo _id of the ProductSize

  // Handlers to switch views
  const handleAddProductSize = () => {
    setSelectedId(null);
    setView("form");
  };
  const handleViewProductSize = (id) => {
    setSelectedId(id);
    setView("details");
  };
  const handleEditProductSize = () => {
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
        <ProductSizeList handleAddProductSize={handleAddProductSize} onView={handleViewProductSize} />
      )}

      {view === "form" && (
        <ProductSizeForm
          ProductSizeId={selectedId}
          onSave={handleSaved}
          onCancel={handleCancel}
        />
      )}

      {view === "details" && (
        <ProductSizeViewPage
          ProductSizeId={selectedId}
          onEdit={handleEditProductSize}
          onBack={handleCancel}
        />
      )}
    </div>
  );
}
