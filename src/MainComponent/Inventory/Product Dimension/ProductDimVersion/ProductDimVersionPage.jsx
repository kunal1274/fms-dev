import React, { useState } from "react";
import ProductVersionList from "./ProductDimVersionList.jsx";
import ProductVersionForm from "./productDimVersionForm";
// import ProductVersionViewPage from "./ProductDimVersionViewPage";

export default function ProductVersionPage() {
  const [view, setView] = useState("list"); // "list" | "form" | "details"
  const [selectedId, setSelectedId] = useState(null); // Mongo _id of the ProductVersion

  // Handlers to switch views
  const handleAddProductProduct = () => {
    setSelectedId(null);
    setView("form");
  };
  const handleViewProductVersion = (id) => {
    setSelectedId(id);
    setView("details");
  };
  const handleEditProductVersion = () => {
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
    <div>
      {view === "list" && (
        <ProductVersionList
         handleAddProductProduct={handleAddProductProduct}
          onView={handleViewProductVersion}
        />
      )}

      {view === "form" && (
        <ProductVersionForm
          ProductVersionId={selectedId}
          onSave={handleSaved}
          onCancel={handleCancel}
        />
      )}

      {view === "details" && (
        <ProductVersionViewPage
          ProductVersionId={selectedId}
          onEdit={handleEditProductVersion}
          handleCancel={handleCancel}
        />
      )}
    </div>
  );
}
