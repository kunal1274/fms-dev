import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import SaleOrderForm from "./SaleOrderform";
import SaleOrderListPage from "./SaleOrderListPage";

const SalePage = () => {
  const [view, setView] = useState("list");
  const [saleOrders, setSaleOrders] = useState([]);
  const [selectedSaleOrder, setSelectedSaleOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  // ---- Fetch sale orders on mount ----
  useEffect(() => {
    const fetchSaleOrders = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/saleOrders");
        // Accept either an array or { data: [...] }
        const raw = Array.isArray(res.data) ? res.data : res.data?.data || [];
        // Normalize id field
        const normalized = raw.map((so) => ({ ...so, id: so.id || so._id }));
        setSaleOrders(normalized);
        toast.success("Sale orders loaded successfully.");
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaleOrders();
  }, []);

  // ---- Create / Update ----
  const handleSaveSaleOrder = async (saleOrder) => {
    setLoading(true);
    try {
      if (saleOrder.id) {
        const response = await axios.put(
          `/api/saleOrders/${saleOrder.id}`,
          saleOrder,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        const updated = {
          ...response.data,
          id: response.data.id || response.data._id,
        };
        setSaleOrders((prev) =>
          prev.map((so) => (so.id === saleOrder.id ? updated : so))
        );
        toast.success("Sale order updated successfully.");
      } else {
        const response = await axios.post("/api/saleOrders", saleOrder, {
          headers: { "Content-Type": "application/json" },
        });
        const created = {
          ...response.data,
          id: response.data.id || response.data._id,
        };
        setSaleOrders((prev) => [...prev, created]);
        toast.success("Sale order created successfully.");
      }
      setView("list");
      setSelectedSaleOrder(null);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // ---- View one ----
  const handleViewSaleOrder = (saleOrderId) => {
    const saleOrder =
      saleOrders.find((s) => s.id === saleOrderId) ||
      saleOrders.find((s) => s._id === saleOrderId); // safety
    if (saleOrder) {
      setSelectedSaleOrder(saleOrder);
      setView("view"); // if you actually have a "view" screen; otherwise switch to "form"
    } else {
      toast.error("Sale order not found.");
    }
  };

  // ---- Start new ----
  const handleAddSaleOrder = () => {
    setSelectedSaleOrder(null);
    setView("form");
  };

  // ---- Back to list ----
  const handleCancel = () => {
    setView("list");
    setSelectedSaleOrder(null);
  };

  // ---- Error helper ----
  const handleError = (error) => {
    let msg = "An unexpected error occurred.";
    if (error?.response?.data?.message) msg = error.response.data.message;
    else if (error?.request) msg = "Network error. Please try again.";
    toast.error(msg);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-blue-500 text-lg font-medium">Loading...</p>
        <ToastContainer position="top-right" autoClose={2500} hideProgressBar />
      </div>
    );
  }

  return (
    <div>
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar />
      {view === "list" && (
        <SaleOrderListPage
          saleOrders={saleOrders}
          handleAddSaleOrder={handleAddSaleOrder}
          handleViewSaleOrder={handleViewSaleOrder}
        />
      )}

      {view === "form" && (
        <SaleOrderForm
          saleOrder={selectedSaleOrder}
          onSave={handleSaveSaleOrder}
          onCancel={handleCancel}
          // some of your other files expect this prop name:
          handleCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default SalePage;
