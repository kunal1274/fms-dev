import React, { useState } from "react";
import ProductList from "./ProductDimConfList";
import ProductForm from "./ProductDimConfForm";
// import ProductViewPage from "./ProductViewPagee";

export default function ProductPage() {
  const [view, setView] = useState("list"); // "list" | "form" | "details"
  const [selectedId, setSelectedId] = useState(null); // Mongo _id of the Product

  // Handlers to switch views
  const handleAddProduct = () => {
    setSelectedId(null);
    setView("form");
  };
  const handleViewProduct = (id) => {
    setSelectedId(id);
    setView("details");
  };
  const handleEditProduct = () => {
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
        <ProductList handleAddProduct={handleAddProduct} onView={handleViewProduct} />
      )}

      {view === "form" && (
        <ProductForm
          ProductId={selectedId}
          onSave={handleSaved}
           handleCancel
           
           
           ={handleCancel}
        />
      )}

      {view === "details" && (
        <ProductViewPage
          ProductId={selectedId}
          onEdit={handleEditProduct
            
          }
          onBack={handleCancel}
        />
      )}
    </div>
  );
}
