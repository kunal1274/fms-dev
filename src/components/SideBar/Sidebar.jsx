import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";
import {
  FaHome,
  FaUser,
  FaBox,
  FaBars,
  FaWrench,
  FaChartBar,
  FaListAlt,
  FaCheck,
  FaUsers,
  FaBoxes,
  FaExchangeAlt,
  FaClipboardList,
  FaFileInvoiceDollar,
  FaCheckCircle,
  FaMoneyCheckAlt,
  FaBuilding,
  FaWarehouse,
  FaTruck,
  FaCartPlus,
  FaBookOpen,
  FaUniversity,
  FaPercentage,
  FaMarsDouble,
} from "react-icons/fa";
import nimamiLogo from "./nimami.jpeg";

const SidebarItem = ({ icon, label, isOpen, path, onClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <div
      onClick={() => {
        if (path) navigate(path);
        if (onClick) onClick();
      }}
      className={`flex items-center space-x-3 p-3 hover:bg-gray-100 cursor-pointer transition ${
        isActive ? "bg-gray-200 font-semibold" : ""
      }`}
      role="button"
      aria-label={label}
    >
      {icon}
      {isOpen && <span className="text-sm">{label}</span>}
    </div>
  );
};

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleSubMenu = (menu) =>
    setActiveMenu(activeMenu === menu ? null : menu);
  const toggleReportSubMenu = () =>
    setActiveSubmenu(activeSubmenu === "report" ? null : "report");

  return (
    <div
      className={`bg-white h-screen overflow-y-auto transition-all ${
        isOpen ? "w-64" : "w-16"
      } scrollbar-hide`}
    >
      {/* Toggle Section */}
      <div
        onClick={toggleSidebar}
        className="flex items-center bg-zinc-200 justify-between px-4 h-11 cursor-pointer"
        role="button"
        aria-label="Toggle Sidebar"
      >
        <div className="flex items-center space-x-2">
          {/* <img src={nimamiLogo} alt="Logo" className="h-6 w-6 rounded-full" /> */}
          {isOpen && <span className="text-lg font-bold">Nimami</span>}
        </div>
        <FaBars className="text-sm" />
      </div>

      {/* Main Sidebar Items */}
      <SidebarItem
        icon={<FaHome />}
        label="Dashboard"
        path="/dashboard"
        isOpen={isOpen}
      />
      <SidebarItem
        icon={<FaUser />}
        label="Customer"
        path="/customer"
        isOpen={isOpen}
      />
      <SidebarItem
        icon={<FaBox />}
        label="Item"
        path="/itempage"
        isOpen={isOpen}
      />

      {/* Sales Menu */}
      <div>
        <SidebarItem
          icon={<FaMarsDouble />}
          label="Sales"
          isOpen={isOpen}
          onClick={() => toggleSubMenu("sales")}
        />
        {activeMenu === "sales" && isOpen && (
          <div className="ml-6 space-y-2">
            {[
              {
                label: "All Sale Orders",
                path: "/salepage",
                icon: <FaListAlt />,
              },
              {
                label: "Confirm Sale Orders",
                path: "/ConfirmSaleorder",
                icon: <FaCheck />,
              },
              {
                label: "Report",
                path: null,
                onClick: toggleReportSubMenu,
                icon: <FaChartBar />,
              },
            ].map((item) => (
              <SidebarItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                path={item.path}
                isOpen={isOpen}
                onClick={item.onClick}
              />
            ))}
            {activeSubmenu === "report" && (
              <div className="ml-6 space-y-2">
                {[
                  {
                    label: "By Customer",
                    path: "/bycustomerreport",
                    icon: <FaUsers />,
                  },
                  {
                    label: "By Item",
                    path: "/byitemreport",
                    icon: <FaBoxes />,
                  },
                  {
                    label: "By Invoice",
                    path: "/ReportByInvoice",
                    icon: <FaFileInvoiceDollar />,
                  },
                  {
                    label: "By Confirm",
                    path: "ByConfirmReport",
                    icon: <FaCheckCircle />,
                  },
                  {
                    label: "By Payment",
                    path: "/ReportByPayment",
                    icon: <FaMoneyCheckAlt />,
                  },
                ].map((subItem) => (
                  <SidebarItem
                    key={subItem.label}
                    icon={subItem.icon}
                    label={subItem.label}
                    path={subItem.path}
                    isOpen={isOpen}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Other Menus */}
      <SidebarItem
        icon={<FaBuilding />}
        label="Company"
        path="/CompanyPage"
        isOpen={isOpen}
      />

      {/* Inventory Menu */}
      <div>
        <SidebarItem
          icon={<FaWarehouse />}
          label="Inventory"
          path="/Inventory"
          isOpen={isOpen}
          onClick={() => toggleSubMenu("inventory")}
        />
        {activeMenu === "inventory" && isOpen && (
          <div className="ml-6 space-y-2">
            {[
              {
                label: "Inventory Transaction",
                path: "/InventoryTransaction",
                icon: <FaExchangeAlt />,
              },
              {
                label: "On-Hand Inventory",
                path: "/OnHandInventory",
                icon: <FaClipboardList />,
              },
            ].map((item) => (
              <SidebarItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                path={item.path}
                isOpen={isOpen}
              />
            ))}
          </div>
        )}
      </div>

      <SidebarItem
        icon={<FaTruck />}
        label="Vendor"
        path="/vender"
        isOpen={isOpen}
      />

      {/* Purchase Menu */}
      <div>
        <SidebarItem
          icon={<FaCartPlus />}
          label="Purchase"
          path="/purchasepage"
          isOpen={isOpen}
          onClick={() => toggleSubMenu("purchase")}
        />
        {activeMenu === "purchase" && isOpen && (
          <div className="ml-6 space-y-2">
            {[
              {
                label: "All Purchase Orders",
                path: "/purchasepage",
                icon: <FaListAlt />,
              },
              {
                label: "Confirm Purchase Orders",
                path: "/ConfirmPurchaseorder",
                icon: <FaCheck />,
              },
              {
                label: "Report",
                path: null,
                onClick: toggleReportSubMenu,
                icon: <FaChartBar />,
              },
            ].map((item) => (
              <SidebarItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                path={item.path}
                isOpen={isOpen}
                onClick={item.onClick}
              />
            ))}
            {activeSubmenu === "report" && (
              <div className="ml-6 space-y-2">
                {[
                  {
                    label: "By Vendor",
                    path: "/byvendorreport",
                    icon: <FaUsers />,
                  },
                  {
                    label: "By Item",
                    path: "/byitemreport",
                    icon: <FaBoxes />,
                  },
                  {
                    label: "By Invoice",
                    path: "/ReportByInvoice",
                    icon: <FaFileInvoiceDollar />,
                  },
                  {
                    label: "By Confirm",
                    path: "ByConfirmReport",
                    icon: <FaCheckCircle />,
                  },
                  {
                    label: "By Payment",
                    path: "/ReportByPayment",
                    icon: <FaMoneyCheckAlt />,
                  },
                ].map((subItem) => (
                  <SidebarItem
                    key={subItem.label}
                    icon={subItem.icon}
                    label={subItem.label}
                    path={subItem.path}
                    isOpen={isOpen}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* More Items */}
      <SidebarItem
        icon={<FaBookOpen />}
        label="Ledger"
        path="/ledger"
        isOpen={isOpen}
      />
      <SidebarItem
        icon={<FaUniversity />}
        label="Bank"
        path="/bank"
        isOpen={isOpen}
      />
      <SidebarItem
        icon={<FaPercentage />}
        label="Tax"
        path="/tax"
        isOpen={isOpen}
      />
      <SidebarItem
        icon={<FaWrench />}
        label="Setting"
        path="/setting"
        isOpen={isOpen}
      />
    </div>
  );
};

export default Sidebar;
