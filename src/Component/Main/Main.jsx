import React from "react";
import CustomerList from "../../MainComponent/Customer/CustomerPage";
import CompanyPage from "../../MainComponent/Company/CompanyPage";
import SalePage from "../../MainComponent/Sale/SalePage";
import VendorPage from "../../MainComponent/Vendor/VendorPage";

import Inventry from "../../MainComponent/Inventory/Item/ItemPage";
import PurchasePage from "../../MainComponent/Purchase/PurchasePage";
import SitePage from "../../MainComponent/Inventory/Site/SitePage";
import WarehousePage from "../../MainComponent/Inventory/Warehouse/WarehousePage";

export default function Main({ sidebarOpen, selectedMenu, onAddNew, onView }) {
  return (
    <main
      className={`transition-all duration-300 p-6 ${
        sidebarOpen ? "ml-88" : "ml-17"
      }`}
    >
      {selectedMenu === "Customer" && (
        <CustomerList onAddNew={onAddNew} onView={onView} />
      )}{" "}
      {selectedMenu === "Company" && (
        <CompanyPage onAddNew={onAddNew} onView={onView} />
      )}
      {selectedMenu === "Vendor" && (
        <div className="text-gray-700">
          {" "}
          <VendorPage onAddNew={onAddNew} onView={onView} />
        </div>
      )}
      {selectedMenu === "Sale" && (
        <div className="text-gray-700">
          <SalePage onAddNew={onAddNew} onView={onView} />
        </div>
      )}
      {selectedMenu === "Purchase" && (
        <div className="text-gray-700">
          <PurchasePage onAddNew={onAddNew} onView={onView} />
        </div>
      )}
      {selectedMenu === "Item" && (
        <Inventry onAddNew={onAddNew} onView={onView} />
      )}
      {selectedMenu === "Site" && (
        <SitePage onAddNew={onAddNew} onView={onView} />
      )}{" "}
      {selectedMenu === "Warehouse" && (
        <WarehousePage onAddNew={onAddNew} onView={onView} />
      )}
    </main>
  );
}
