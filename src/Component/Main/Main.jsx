import React from "react";
import CustomerList from "../../MainComponent/Customer/CustomerPage";
import CompanyPage from "../../MainComponent/Company/CompanyPage";
import SalePage from "../../MainComponent/Sale/SalePage";
import VendorPage from "../../MainComponent/Vendor/VendorPage";

import ItemPage from "../../MainComponent/Item/Inventry";
import PurchasePage from "../../MainComponent/Purchase/PurchasePage";

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
      {selectedMenu === "SalePage" && (
        <div className="text-gray-700">
          
          <SalePage onAddNew={onAddNew} onView={onView} />
        </div>
      )}
      {selectedMenu === "PurchasePage" && (
        <div className="text-gray-700">
          {" "}
          <PurchasePage onAddNew={onAddNew} onView={onView} />
        </div>
      )}
      {selectedMenu === "Item" && (
        <div className="text-gray-700">
          {" "}
          <ItemPage onAddNew={onAddNew} onView={onView} />
        </div>
      )}
    </main>
  );
}
