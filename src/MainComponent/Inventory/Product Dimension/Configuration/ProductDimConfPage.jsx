import React, { useState } from "react";
import ProductConfList from "./ProductDimConfList";
import ProductConfForm from "./ProductDimConForm";
import ProductConfViewPage from "./ConfViewPage";

export default function ProductConfPage() {
  const [view, setView] = useState("list"); // "list" | "form" | "details"
  const [selectedId, setSelectedId] = useState(null);

  const handleAddConf = () => {
    setSelectedId(null);
    setView("form");
  };

  const handleViewProductConf = (id) => {
    setSelectedId(id);
    setView("details");
  };

  const handleEditProductConf = () => {
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
    <div>
      {view === "list" && (
        <ProductConfList
          handleAddConf={handleAddConf}
          onView={handleViewProductConf}
        />
      )}

      {view === "form" && (
        <ProductConfForm
          ProductConfId={selectedId}
          onSave={handleSaved}
          handleCancel={handleCancel}
        />
      )}

      {view === "details" && (
        <ProductConfViewPage
          ProductConfId={selectedId}
          onEdit={handleEditProductConf}
          onBack={handleCancel}
        />
      )}
    </div>
  );
}
