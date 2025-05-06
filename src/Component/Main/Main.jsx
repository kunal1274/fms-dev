import React from "react";
import CustomerList from "../../MainComponent/Customer/CustomerPage";
import CompanyPage from "../../MainComponent/Company/CompanyPage";
// import CompanyPage from "../Company/CompanyrPage";
import VendorPage from "../../MainComponent/Vendor/VendorPage";
import SaleOrderPage from "../../MainComponent/Sale/SaleOrderPage";
import PurchaseOrderPage from "../../MainComponent/Purchase/PurchaseOrderPage";

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
      {selectedMenu === "Item" && (
        <div className="text-gray-700">Item section coming soon…</div>
      )}
      {selectedMenu === "Sale" && (
        <div className="text-gray-700">
          <SaleOrderPage onAddNew={onAddNew} onView={onView} />
        </div>
      )}
      {selectedMenu === "Purchase" && (
        <PurchaseOrderPage onAddNew={onAddNew} onView={onView} />
      )}
    </main>
  );
}
