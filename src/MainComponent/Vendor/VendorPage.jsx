import React, { useState } from "react";

import VendorList from "./Vendorlist";
import VendorViewPage from "./Vv";
import { Button } from "../../Component/Button/Button";
import VendorForm from "./V";
// import VendorList from "./Vendorlist";

/**
 * VendorPage: Parent component for Vendor management flows
 * - List view
 * - Add/Edit form
 * - Detail view
 */
const VendorPage = () => {
  const [view, setView] = useState("list");
  const [Vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);

  /** Save or update a Vendor */
  const handleSaveVendor = (Vendor) => {
    setVendors((prev) => {
      const idx = prev.findIndex(
        (c) => c.VendorAccountNo === Vendor.VendorAccountNo
      );

      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = Vendor;
        return updated;
      }
      return [...prev, Vendor];
    });
    setView("list");
  };

  /** Open the "Add Vendor" form */
  const handleAddVendor = () => {
    setSelectedVendor(null);
    setView("form");
  };

  /** Show Vendor details */
  const handleViewVendor = (VendorAccountNo) => {
    const cust = Vendors.find((c) => c.VendorAccountNo === VendorAccountNo);
    setSelectedVendor(cust);
    setView("details");
  };

  /** Delete selected Vendors */
  const handleDeleteVendor = (toDeleteAccounts) => {
    setVendors((prev) =>
      prev.filter((c) => !toDeleteAccounts.includes(c.VendorAccountNo))
    );
  };

  /** Cancel form or detail view */
  const handleCancel = () => setView("list");

  /** Render header with title and actions */
  const renderHeader = () => {
    let title = "Vendors";
    let action = null;

    if (view === "list") {
      action = <Button onClick={handleAddVendor}>Add Vendor</Button>;
    } else if (view === "form") {
      title = selectedVendor ? "Edit Vendor" : "New Vendor";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      );
    } else if (view === "details") {
      title = "Vendor Details";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Back to List
        </Button>
      );
    }

    return (
      <div className="flex justify-between ">
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        {action}
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-lg ">
      <div>
        {view === "list" && (
          <VendorList
            Vendors={Vendors}
            handleAddVendor={handleAddVendor}
            onView={handleViewVendor}
            onDelete={handleDeleteVendor}
          />
        )}

        {view === "form" && (
          <VendorForm
            Vendor={selectedVendor}
            handleAddVendor={handleAddVendor}
            handleCancel={handleCancel}
          />
        )}
        {view === "details" && selectedVendor && (
          <VendorViewPage
            Vendor={selectedVendor}
            onEdit={() => setView("form")}
            onBack={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default VendorPage;
