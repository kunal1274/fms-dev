import React, { useState, useEffect } from "react";
import axios from "axios";
import SaleOrderForm from "./SaleOrderForm";
import SaleOrderList from "./SaleOrderListPage";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SaleOrderPage = () => {
  const [view, setView] = useState("list");
  const [saleOrders, setSaleOrders] = useState([]);
  const [selectedSaleOrder, setSelectedSaleOrder] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const defaultNewSaleOrder = {
    name: "",
    price: "",
    type: "",
    unit: "",
    description: "",
    active: true,
  };

  const [newSaleOrder, setNewSaleOrder] = useState(defaultNewSaleOrder);

  // Fetch SaleOrders from the API
  useEffect(() => {
    const fetchSaleOrders = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/SaleOrders");
        setSaleOrders(response.data);
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaleOrders();
  }, []);

  const createSaleOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/api/saleOrders", newSaleOrder, {
        headers: { "Content-Type": "application/json" },
      });
      setMessage("SaleOrder created successfully!");
      setSaleOrders((prev) => [...prev, response.data]);
      setNewSaleOrder(defaultNewSaleOrder);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSaleOrder = async (saleOrder) => {
    setLoading(true);
    try {
      if (saleOrder.id) {
        // Update existing saleOrder
        const response = await axios.put(
          `/api/saleOrders/${saleOrder.id}`,
          saleOrder
        );
        setSaleOrders((prev) =>
          prev.map((existingSaleOrder) =>
            existingSaleOrder.id === saleOrder.id
              ? response.data
              : existingSaleOrder
          )
        );
        setMessage("SaleOrder updated successfully!");
      } else {
        // Create new SaleOrder
        const response = await axios.post("/api/saleOrders", saleOrder, {
          headers: { "Content-Type": "application/json" },
        });
        setSaleOrders((prev) => [...prev, response.data]);
        setMessage("SaleOrder saved successfully!");
      }
      setView("list");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSaleOrder = (saleOrderId) => {
    const saleOrder = saleOrders.find(
      (saleOrder) => saleOrder.id === saleOrderId
    );
    if (saleOrder) {
      setSelectedSaleOrder(saleOrder);
      setView("view");
    } else {
      setError("saleOrder not found.");
    }
  };

  const handleAddSaleOrder = () => {
    setSelectedSaleOrder(null);
    setNewSaleOrder(defaultNewSaleOrder);
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
    <div className="">
      <ToastContainer />
      <div className=" rounded-lg ">
    

        {view === "form" && (
          <SaleOrderForm
            selectedSaleOrder={selectedSaleOrder}
            newSaleOrder={newSaleOrder}
            setNewSaleOrder={setNewSaleOrder}
            createSaleOrder={createSaleOrder}
            handleSaveSaleOrder={handleSaveSaleOrder}
            handleCancel={handleCancel}
          />
        )}

        {view === "list" && (
          <SaleOrderList
            handleAddSaleOrder={handleAddSaleOrder}
            handleViewSaleOrder={handleViewSaleOrder}
          />
        )}
      </div>
    </div>
  );
};

export default SaleOrderPage;
