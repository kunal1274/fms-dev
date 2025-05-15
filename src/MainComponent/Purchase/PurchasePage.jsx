import React, { useState, useEffect } from "react";
import axios from "axios";
import PurchaseOrderForm from "./PurchaseOrderForm";
import PurchaseOrderList from "./PurchaseOrderList";
import PurchaseViewPage from "./PurchaseOrderViewPage";
import { ToastContainer } from "react-toastify";
// API endpoints
const itemsBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/items";
const vendorsBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/vendors";
const purchasesOrderUrl =
  "https://fms-qkmw.onrender.com/fms/api/v0/purchaseorders";
// mergedUrl is the same as purchasesOrderUrl for update and payment requests
const PurchasePage = () => {
  const [view, setView] = useState("list");
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const defaultNewPurchaseOrder = {
    name: "",
    price: "",
    type: "",
    unit: "",
    description: "",
    active: true,
  };

  const [newPurchaseOrder, setNewPurchaseOrder] = useState(
    defaultNewPurchaseOrder
  );

  // Fetch PurchaseOrders from the API

  const handleSavePurchaseOrder = async (purchaseOrder) => {
    setLoading(true);
    try {
      if (purchaseOrder.id) {
        // Update existing purchaseOrder
        const response = await axios.put(
          `/api/purchaseOrders/${purchaseOrder.id}`,
          purchaseOrder
        );
        setPurchaseOrders((prev) =>
          prev.map((existingPurchaseOrder) =>
            existingPurchaseOrder.id === purchaseOrder.id
              ? response.data
              : existingPurchaseOrder
          )
        );
        setMessage("PurchaseOrder updated successfully!");
      } else {
        // Create new PurchaseOrder
        const response = await axios.post(
          "/api/purchaseOrders",
          purchaseOrder,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        setPurchaseOrders((prev) => [...prev, response.data]);
        setMessage("PurchaseOrder saved successfully!");
      }
      setView("list");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPurchaseOrder = (purchaseOrderId) => {
    const purchaseOrder = purchaseOrders.find(
      (purchaseOrder) => purchaseOrder.id === purchaseOrderId
    );
    if (purchaseOrder) {
      setSelectedPuarchseOrder(puarchseOrder);
      setView("view");
    } else {
      setError("PurchaseOrder not found.");
    }
  };

  const handleAddPurchaseOrder = () => {
    setSelectedPurchaseOrder(null);
    setNewPurchaseOrder(defaultNewPurchaseOrder);
    setView("form");
  };

  const handleCancel = () => {
    setView("list");
    console.log("cancel click");
  };

  const handleError = (error) => {
    if (error.response) {
      setError(error.response.data.message || "Server error occurred.");
    } else if (error.request) {
      setError("Network error. Please try again.");
    } else {
      setError("An unexpected error occurred.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-blue-500 text-lg font-medium">Loading...</p>
      </div>
    );
  }
  return (
    <div className="w-full bg-white rounded-lg ">
      <div>
        {view === "list" && (
          <PurchaseViewPage
            PurchaseOrders={PurchaseOrders}
            handleAddPurchaseOrder={handleAddPurchaseOrder}
            handleViewPurchaseOrder={handleViewPurchaseOrder}
          />
        )}

        {view === "form" && (
          <PurchaseOrderForm
            PurchaseOrder={selectedPurchaseOrder}
            onSave={handleSavePurchaseOrder}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
    // <div>uehdjhdbejhj</div>
  );
};

export default PurchasePage;
