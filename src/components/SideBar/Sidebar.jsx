import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
      className={`bg-white h-screen transition-all ${isOpen ? "w-64" : "w-16"}`}
    >
      {/* Toggle Button */}
      <div
        onClick={toggleSidebar}
        className="flex items-center justify-between p-3 mt-2 cursor-pointer"
        role="button"
        aria-label="Toggle Sidebar"
      >
        {isOpen && (
          <span className="text-lg font-bold h-12 w-auto ml-6 mt-3 ">
            Nimami
          </span>
        )}
        <FaBars />
      </div>

      {/* Sidebar Items */}
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
                path: null, // No navigation, just opens submenu
                onClick: toggleReportSubMenu,
                icon: <FaChartBar />,
              },
            ].map((item) => (
              <SidebarItem
                key={item.label}
                icon={item.icon || <FaBox />}
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
                    icon={subItem.icon || <FaBox />}
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

      {/* Additional Menus */}
      <SidebarItem
        icon={<FaBuilding />}
        label="Company"
        path="/CompanyPage"
        isOpen={isOpen}
      />

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
                icon={item.icon || <FaBox />}
                label={item.label}
                path={item.path}
                isOpen={isOpen}
              />
            ))}
          </div>
        )}
      </div>

      {/* inventry trancstion fliter item  search bar  */}
      {/* on hand inventry  */}

      <SidebarItem
        icon={<FaTruck />}
        label="Vendor"
        path="/vender"
        isOpen={isOpen}
      />

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
                path: null, // No navigation, just opens submenu
                onClick: toggleReportSubMenu,
                icon: <FaChartBar />,
              },
            ].map((item) => (
              <SidebarItem
                key={item.label}
                icon={item.icon || <FaBox />}
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
                    icon={subItem.icon || <FaBox />}
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
