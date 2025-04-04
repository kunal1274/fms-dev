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

const SidebarItem = ({ icon, label, isOpen, path, onClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === path;

  const handleClick = () => {
    if (path) navigate(path);
    if (onClick) onClick();
  };

  return (
    <div
      onClick={handleClick}
      className={`sidebar-item ${isActive ? "active" : ""}`}
      role="button"
      aria-label={label}
    >
      <span className="sidebar-icon">{icon}</span>
      {isOpen && <span className="sidebar-label">{label}</span>}
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
    <div className={`sidebar-container ${isOpen ? "open" : "closed"}`}>
      <div
        onClick={toggleSidebar}
        className="sidebar-toggle"
        role="button"
        aria-label="Toggle Sidebar"
      >
        <div className="toggle-logo">
          {isOpen && <span className="logo-text">Nimami</span>}
        </div>
        <FaBars className="toggle-icon" />
      </div>

      <SidebarItem icon={<FaHome />} label="Dashboard" path="/dashboard" isOpen={isOpen} />
      <SidebarItem icon={<FaUser />} label="Customer" path="/customer" isOpen={isOpen} />
      <SidebarItem icon={<FaBox />} label="Item" path="/itempage" isOpen={isOpen} />

      <div className="sidebar-menu">
        <SidebarItem
          icon={<FaMarsDouble />}
          label="Sales"
          isOpen={isOpen}
          onClick={() => toggleSubMenu("sales")}
        />
        {activeMenu === "sales" && isOpen && (
          <div className="sidebar-submenu">
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
              <div className="sidebar-subsubmenu">
                {[
                  { label: "By Customer", path: "/bycustomerreport", icon: <FaUsers /> },
                  { label: "By Item", path: "/byitemreport", icon: <FaBoxes /> },
                  { label: "By Invoice", path: "/ReportByInvoice", icon: <FaFileInvoiceDollar /> },
                  { label: "By Confirm", path: "/ByConfirmReport", icon: <FaCheckCircle /> },
                  { label: "By Payment", path: "/ReportByPayment", icon: <FaMoneyCheckAlt /> },
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

      <SidebarItem icon={<FaBuilding />} label="Company" path="/CompanyPage" isOpen={isOpen} />

      <div className="sidebar-menu">
        <SidebarItem
          icon={<FaWarehouse />}
          label="Inventory"
          path="/Inventory"
          isOpen={isOpen}
          onClick={() => toggleSubMenu("inventory")}
        />
        {activeMenu === "inventory" && isOpen && (
          <div className="sidebar-submenu">
            {[
              { label: "Inventory Transaction", path: "/InventoryTransaction", icon: <FaExchangeAlt /> },
              { label: "On-Hand Inventory", path: "/OnHandInventory", icon: <FaClipboardList /> },
            ].map((item) => (
              <SidebarItem key={item.label} icon={item.icon} label={item.label} path={item.path} isOpen={isOpen} />
            ))}
          </div>
        )}
      </div>

      <SidebarItem icon={<FaTruck />} label="Vendor" path="/vender" isOpen={isOpen} />

      <div className="sidebar-menu">
        <SidebarItem
          icon={<FaCartPlus />}
          label="Purchase"
          path="/purchasepage"
          isOpen={isOpen}
          onClick={() => toggleSubMenu("purchase")}
        />
        {activeMenu === "purchase" && isOpen && (
          <div className="sidebar-submenu">
            {[
              { label: "All Purchase Orders", path: "/purchasepage", icon: <FaListAlt /> },
              { label: "Confirm Purchase Orders", path: "/ConfirmPurchaseorder", icon: <FaCheck /> },
              { label: "Report", path: null, onClick: toggleReportSubMenu, icon: <FaChartBar /> },
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
              <div className="sidebar-subsubmenu">
                {[
                  { label: "By Vendor", path: "/byvendorreport", icon: <FaUsers /> },
                  { label: "By Item", path: "/byitemreport", icon: <FaBoxes /> },
                  { label: "By Invoice", path: "/ReportByInvoice", icon: <FaFileInvoiceDollar /> },
                  { label: "By Confirm", path: "/ByConfirmReport", icon: <FaCheckCircle /> },
                  { label: "By Payment", path: "/ReportByPayment", icon: <FaMoneyCheckAlt /> },
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

      <SidebarItem icon={<FaBookOpen />} label="Ledger" path="/ledger" isOpen={isOpen} />
      <SidebarItem icon={<FaUniversity />} label="Bank" path="/bank" isOpen={isOpen} />
      <SidebarItem icon={<FaPercentage />} label="Tax" path="/tax" isOpen={isOpen} />
      <SidebarItem icon={<FaWrench />} label="Setting" path="/setting" isOpen={isOpen} />
    </div>
  );
};

export default Sidebar;
