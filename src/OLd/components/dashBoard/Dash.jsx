import { useState } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import Sidebar from "../SideBar/Sidebar";
import "./Dash.css";
import Header from "../Header/Header";
import CustomerPage from "../../Customer/CustomerPage";
import ItemPage from "../../item/Itempage";
import VendorPage from "../../Vender/VendorPage";
import SaleOrderPage from "../../Sale/SaleOrderPage";
import AllocationHistory from "../../Sale/ByReport/AllocationHistory";
import ByInvoiced from "../../Sale/ByReport/ByInvoiced";
import ByPayment from "../../Sale/ByReport/ByPayment";
import PurchaseAllocationHistory from "../../Purchase/ByReport/PurchaseAllocationHistory";
import PurchaseCancelSaleOrder from "../../Purchase/ByReport/PurchaseCancelSaleOrder";
import PurchaseConfirmSaleOrder from "../../Purchase/ByReport/PurchaseConfirmSaleOrder";
import ByVendorReport from "../../Purchase/ByReport/ByVendorReport";
import InventryTransaction from "../../Sale/InventryTransaction";
import InventoryHand from "../../Sale/HandOnInventry";
import PurchaseOrderPage from "../../Purchase/PurchaseOrderPage";
import Invoice from "../../Sale/Invoice/Icopy";
import SaleorderViewPage from "../../Sale/SaleorderViewPage";
import ByCustomerReport from "../../Sale/ByReport/ByCustomerReport";
import ByConfirmReport from "../../Sale/ByReport/ByConfirmReport";
import ByItemReport from "../../Sale/ByReport/ByItemReport";
import CompanyForm from "../../Company/CompanyForm";
import CompanyViewPage from "../../Company/CompanyViewPage";
import CompanyList from "../../Company/CompanyList";
import CompanyPage from "../../Company/CompanyPage";
import Confirmsaleorder from "../../Sale/ConfirmSaleOrder";
import CancelsaleOrder from "../../Sale/CancelSaleOrder";

const Dashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleNavigation = (route) => {
    navigate(route);
  };

  return (
    <div className={`dashboard-container ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <header className="dashboard-header">
        <Header />
      </header>
      <aside className={`dashboard-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          onNavigate={handleNavigation}
        />
      </aside>
      <main className="dashboard-main">
        <Routes>
          <Route path="/PurchaseAllocationHistory" element={<PurchaseAllocationHistory />} />
          <Route path="/ByVendorReport" element={<ByVendorReport />} />
          <Route path="/PurchaseCancelSaleOrder" element={<PurchaseCancelSaleOrder />} />
          <Route path="/PurchaseConfirmSaleOrder" element={<PurchaseConfirmSaleOrder />} />
          <Route path="/customer" element={<CustomerPage />} />
          <Route path="/itempage" element={<ItemPage />} />
          <Route path="/vender" element={<VendorPage />} />
          <Route path="/salepage" element={<SaleOrderPage />} />
          <Route path="/invoice/:saleOrderNum" element={<Invoice />} />
          <Route path="/AllocationHistory" element={<AllocationHistory />} />
          <Route path="/purchasepage" element={<PurchaseOrderPage />} />
          <Route path="/saleorderviewpage" element={<SaleorderViewPage />} />
          <Route path="/bycustomerreport" element={<ByCustomerReport />} />
          <Route path="/byitemreport" element={<ByItemReport />} />
          <Route path="/CompanyForm" element={<CompanyForm />} />
          <Route path="/CompanyViewPage" element={<CompanyViewPage />} />
          <Route path="/CompanyList" element={<CompanyList />} />
          <Route path="/CompanyPage" element={<CompanyPage />} />
          <Route path="/ByConfirmReport" element={<ByConfirmReport />} />
          <Route path="/ConfirmSaleorder" element={<Confirmsaleorder />} />
          <Route path="/CancelSaleOrder" element={<CancelsaleOrder />} />
          <Route path="/ReportByInvoice" element={<ByInvoiced />} />
          <Route path="/ReportByPayment" element={<ByPayment />} />
          <Route path="/OnHandInventory" element={<InventoryHand />} />
          <Route path="/InventoryTransaction" element={<InventryTransaction />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;
