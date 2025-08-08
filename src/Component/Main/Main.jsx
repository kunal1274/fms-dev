import React from "react";
import CustomerList from "../../MainComponent/Customer/CustomerPage";
import CompanyPage from "../../MainComponent/Company copy/CompanyPage";
import SalePage from "../../MainComponent/Sale/Sale/SaleManegment";
import VendorPage from "../../MainComponent/Vendor/VendorPage";
import InventoryManegment from "../../MainComponent/Inventory/Item Master/Item/Inventory Mangement/InventoryManegment";
import PurchasePage from "../../MainComponent/Purchase/Purchase/PurchaseManegment";
import TaxPage from "../../MainComponent/Tax/TaxPage";
// import WarehousePage from "../../MainComponent/Inventory/Warehouse/WarehousePage";
// import ItemPage from "../../MainComponent/Inventory/Item/ItemPage";

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
      {selectedMenu === "Inventory" && (
        <InventoryManegment onAddNew={onAddNew} onView={onView} />
      )}
      {selectedMenu === "itemPage" && (
        <ItemPage onAddNew={onAddNew} onView={onView} />
      )}
      {selectedMenu === "TaxPage" && (
        <TaxPage onAddNew={onAddNew} onView={onView} />
      )}
    </main>
  );
}
