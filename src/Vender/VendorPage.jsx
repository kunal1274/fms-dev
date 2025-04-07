import React, { useState } from "react";
import VendorForm from "../Vender/VendorForm";
import VendorList from "../Vender/VendorList";
import VendorViewPage from "../Vender/VendorViewPage"; // Import the detail page
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const VendorPage = () => {
  const [view, setView] = useState("list"); // Default to show VendorList
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null); // Store the selected Vendor
  const [loading, setLoading] = useState(false);
  // Utility function to find a vendor by account number
  const findVendorByAccountNo = (accountNo) => {
    return vendors.find((vendor) => vendor.vendorAccountNo === accountNo);
  };

  // Handles saving Vendor data (both adding new or updating existing)
  const handleSaveVendor = (vendor) => {
    setVendors((prevVendors) => {
      const existingVendorIndex = prevVendors.findIndex(
        (existingVendor) =>
          existingVendor.vendorAccountNo === vendor.vendorAccountNo
      );

      if (existingVendorIndex !== -1) {
        // Update existing Vendor
        const updatedVendors = [...prevVendors];
        updatedVendors[existingVendorIndex] = vendor;
        setView("details");
        return updatedVendors;
      } else {
        // Add new Vendor
        return [...prevVendors, vendor];
      }
    });

    setView("list");
  };

  // Handles view toggle to vendor details
  const handleViewVendor = (vendorAccountNo) => {
    const vendor = findVendorByAccountNo(vendorAccountNo);
    setSelectedVendor(vendor); // Set the selected vendor
    setView("details"); // Switch to the detail view
  };

  // Handles vendor deletion
  const handleDeleteVendor = (selectedVendors) => {
    setVendors((prevVendors) =>
      prevVendors.filter(
        (vendor) => !selectedVendors.includes(vendor.vendorAccountNo)
      )
    );
  };

  // Handles cancel operation to return to Vendor list
  const handleCancel = () => {
    setView("list");
  };

  // Handles the addition of a new vendor
  const handleAddVendor = () => {
    setSelectedVendor(null);
    setView("form");
  };
 
  return (
     <div className="  min-h-screen">
         <ToastContainer />
         <div className=" rounded-lg">
        {view === "form" && (
          <VendorForm
            handleSaveVendor={handleSaveVendor}
            handleCancel={handleCancel} // Pass the cancel handler
          />
        )}

        {view === "list" && (
          <VendorList
            vendors={vendors}
            handleAddVendor={handleAddVendor}
            handleViewVendor={handleViewVendor} // Pass the view handler
            handleDeleteVendor={handleDeleteVendor}
          />
        )}

        {view === "details" && selectedVendor && (
          <VendorViewPage
            vendor={selectedVendor}
            handleSaveVendor={handleSaveVendor} // Pass the save handler
            toggleView={() => setView("list")} // Pass a function to toggle back to the list
          />
        )}
      </div>
    </div>
  );
};

export default VendorPage;
