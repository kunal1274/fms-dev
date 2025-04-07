import React, { useState, useEffect } from "react";
import axios from "axios";
import ItemForm from "./ItemForm";
import ItemList from "./ItemList";
import ItemviewPage from "./ItemviewPage ";
import { ToastContainer } from "react-toastify";

const Page = () => {
  const [view, setView] = useState("list");
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const defaultNewItem = {
    name: "",
    price: "",
    type: "",
    unit: "",
    description: "",
    active: true,
  };

  const [newItem, setNewItem] = useState(defaultNewItem);

  // Fetch items from the API
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/items");
        setItems(response.data);
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const createItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/api/items", newItem, {
        headers: { "Content-Type": "application/json" },
      });
      setMessage("Item created successfully!");
      setItems((prev) => [...prev, response.data]);
      setNewItem(defaultNewItem);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (item) => {
    setLoading(true);
    try {
      if (item.id) {
        // Update existing item
        const response = await axios.put(`/api/items/${item.id}`, item);
        setItems((prev) =>
          prev.map((existingItem) =>
            existingItem.id === item.id ? response.data : existingItem
          )
        );
        setMessage("Item updated successfully!");
      } else {
        // Create new item
        const response = await axios.post("/api/items", item, {
          headers: { "Content-Type": "application/json" },
        });
        setItems((prev) => [...prev, response.data]);
        setMessage("Item saved successfully!");
      }
      setView("list");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewItem = (itemId) => {
    const item = items.find((item) => item.id === itemId);
    if (item) {
      setSelectedItem(item);
      setView("view");
    } else {
      setError("Item not found.");
    }
  };

  const handleAddItem = () => {
    setSelectedItem(null);
    setNewItem(defaultNewItem);
    setView("form");
  };

  const handleCancel = () => {
    setView("list");
    setMessage("");
    setError("");
  };

  const handleError = (error) => {
    if (error.response) {
      // setError(error.response.data.message || "Server error occurred.");
    } else if (error.request) {
      setError("Network error. Please try again.");
    } else {
      setError("An unexpected error occurred.");
    }
  };

  return (
    <div className=" bg-zinc-50 min-h-screen">
     <div className=" rounded-lg">
     {view === "form" && (
          <ItemForm
            selectedItem={selectedItem}
            newItem={newItem}
            setNewItem={setNewItem}
            createItem={createItem}
            handleSaveItem={handleSaveItem}
            handleCancel={handleCancel}
          />
        )}

{view === "list" && (
          <ItemList
            items={items}
            handleAddItem={handleAddItem}
            handleViewItem={handleViewItem}
          />
        )}
{view === "view" && (
          <ItemviewPage
            item={selectedItem}
            handleCancel={handleCancel}
            handleAddItem={handleAddItem}
          />
        )}
      </div>
    
    </div>
  );
};

export default Page;
