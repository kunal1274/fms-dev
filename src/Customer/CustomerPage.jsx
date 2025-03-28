import React, { useState, useEffect } from "react";
import CustomerForm from "./CustomerForm";
import CustomerList from "./CustomerList";
import CustomerViewPage from "./CustomerViewPage";
import axios from "axios";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const apiUrl = "your_api_url_here"; // Replace this with your actual API URL

const CustomerPage = () => {
  const [view, setView] = useState("list");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state
  const [customerList, setCustomerList] = useState([]);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    code: "",
    contactNum: "",
    currency: "",
    registrationNum: "",
    panNum: "",
    address: "",
    active: true,
  });
  // Fetch all customers on component mount

  const createCustomer = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        mergedUrl,
        { ...newCustomer },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Customer created:", response.data);
      setMessage("Customer created successfully!");
      setCustomerList((prev) => [...prev, response.data.data]);
      setNewCustomer({
        name: "",
        code: "",
        contactNum: "",
        currency: "",
        registrationNum: "",
        panNum: "",
        address: "",
        active: true,
      });
    } catch (error) {
      if (error.response) {
        console.error(`Error in response: ${error.response.data}`);
        setMessage(error.response.data.message || "Error creating customer");
      } else if (error.request) {
        console.error(`Error in request: ${error.request}`);
        setMessage("Network error, please try again.");
      } else {
        console.error(`Error: ${error.message}`);
        setMessage("An unexpected error occurred.");
      }
    }
  };
  // Handle view toggle
  const handleToggleView = () => {
    setView((prevView) => {
      if (prevView === "list") {
        return "view";
      } else {
        setMessage(""); // Clear messages when switching views
        setError(""); // Clear errors when switching views
        return "list";
      }
    });
  };

  // Save a new or updated customer
  const handleSaveCustomer = async (customer) => {
    setLoading(true); // Set loading to true when saving customer
    try {
      if (customer.id) {
        // Update existing customer
        const response = await axios.put(
          `${apiUrl}/customers/${customer.id}`,
          customer,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        setCustomers((prev) =>
          prev.map((c) => (c.id === customer.id ? response.data : c))
        );
        setMessage("Customer updated successfully!");
      } else {
        // Save new customer
        const response = await axios.post(`${apiUrl}/customers`, customer, {
          headers: { "Content-Type": "application/json" },
        });
        setCustomers((prev) => [...prev, response.data]);
        setMessage("Customer saved successfully!");
      }
      setView("list");
    } catch (error) {
      console.error("Error saving customer:", error);
      setError("Failed to save customer. Please try again.");
    } finally {
      setLoading(false); // Set loading to false once saving is done
    }
  };

  // View customer details
  const handleViewCustomer = (customerId) => {
    console.log("View button clicked for customer ID:", customerId);
    // Check if customers is an array and find the customer
    if (Array.isArray(customers)) {
      const customer = customers.find((c) => c.id === customerId);
      if (customer) {
        setSelectedCustomer(customer);
      } else {
        setError("Customer not found.");
      }
    } else {
      setError("Invalid customer data.");
    }
    setView("view");
    console.log("Navigating to view customer page with ID:", customerId);
    // Example: passing the ID to a view page, replace this with your actual routing logic
    navigate(`/customer/view/${customerId}`);
  };

  // Add a new customer
  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setView("form");
  };

  // Cancel operation
  const handleCancel = () => {
    setView("list");
    console.log("cancel click ");
  };
  const toggleView = (targetView) => {
    if (view !== targetView) {
      setView(targetView);
      console.log("Toggle function working: View changed to", targetView);
    } else {
      console.log("Error in running function: View did not change");
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
    <div className="  min-h-screen">
      <ToastContainer />
      <div className=" rounded-lg">
        {view === "form" && (
          <CustomerForm
            handleCancel={handleCancel}
            createCustomer={createCustomer}
            handleSaveCustomer={handleSaveCustomer}
            selectedCustomer={selectedCustomer}
          />
        )}

        {view === "list" && (
          <CustomerList
            customers={customers}
            handleAddCustomer={handleAddCustomer}
            handleViewCustomer={handleViewCustomer} // Toggle to customer view page
          />
        )}

        {view === "view" && (
          <CustomerViewPage
            customer={selectedCustomer}
            handleAddCustomer={handleAddCustomer}
            handleCancel={handleCancel}
            handleToggleView={handleToggleView}
          />
        )}
      </div>
    </div>
  );
};

export default CustomerPage;
