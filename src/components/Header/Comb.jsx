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
  FaSearch,
  FaBell,
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

const SidebarLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleSubMenu = (menu) =>
    setActiveMenu(activeMenu === menu ? null : menu);
  const toggleReportSubMenu = () =>
    setActiveSubmenu(activeSubmenu === "report" ? null : "report");

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSearchBlur = () => setSearchTerm("");

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`bg-white overflow-y-auto transition-all scrollbar-hide ${
          isSidebarOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Toggle Button */}
        <div
          onClick={toggleSidebar}
          className="flex items-center justify-between p-3 mt-2 cursor-pointer"
          role="button"
          aria-label="Toggle Sidebar"
        >
          {isSidebarOpen && (
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
          isOpen={isSidebarOpen}
        />
        <SidebarItem
          icon={<FaUser />}
          label="Customer"
          path="/customer"
          isOpen={isSidebarOpen}
        />
        <SidebarItem
          icon={<FaBox />}
          label="Item"
          path="/itempage"
          isOpen={isSidebarOpen}
        />

        {/* Sales Menu */}
        <div>
          <SidebarItem
            icon={<FaMarsDouble />}
            label="Sales"
            isOpen={isSidebarOpen}
            onClick={() => toggleSubMenu("sales")}
          />
          {activeMenu === "sales" && isSidebarOpen && (
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
                  {...item}
                  isOpen={isSidebarOpen}
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
                      {...subItem}
                      isOpen={isSidebarOpen}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Inventory */}
        <SidebarItem
          icon={<FaBuilding />}
          label="Company"
          path="/CompanyPage"
          isOpen={isSidebarOpen}
        />
        <div>
          <SidebarItem
            icon={<FaWarehouse />}
            label="Inventory"
            isOpen={isSidebarOpen}
            onClick={() => toggleSubMenu("inventory")}
          />
          {activeMenu === "inventory" && isSidebarOpen && (
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
                  {...item}
                  isOpen={isSidebarOpen}
                />
              ))}
            </div>
          )}
        </div>

        <SidebarItem
          icon={<FaTruck />}
          label="Vendor"
          path="/vender"
          isOpen={isSidebarOpen}
        />

        {/* Purchase */}
        <div>
          <SidebarItem
            icon={<FaCartPlus />}
            label="Purchase"
            isOpen={isSidebarOpen}
            onClick={() => toggleSubMenu("purchase")}
          />
          {activeMenu === "purchase" && isSidebarOpen && (
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
                  {...item}
                  isOpen={isSidebarOpen}
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
                      {...subItem}
                      isOpen={isSidebarOpen}
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
          isOpen={isSidebarOpen}
        />
        <SidebarItem
          icon={<FaUniversity />}
          label="Bank"
          path="/bank"
          isOpen={isSidebarOpen}
        />
        <SidebarItem
          icon={<FaPercentage />}
          label="Tax"
          path="/tax"
          isOpen={isSidebarOpen}
        />
        <SidebarItem
          icon={<FaWrench />}
          label="Setting"
          path="/setting"
          isOpen={isSidebarOpen}
        />
      </div>

      {/* Header & Content */}
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center text-sm bg-gray-100 shadow px-4 py-2">
          {/* Search Section */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onBlur={handleSearchBlur}
              placeholder="Search"
              className="block w-48 border text-sm border-gray-300 rounded-full py-1.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 hover:shadow-sm"
              aria-label="Search"
            />
            <FaSearch className="absolute text-sm left-3 top-2.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Right Section: Notifications and Profile */}
          <div className="flex items-center space-x-3">
            <FaBell
              className="cursor-pointer text-gray-600 hover:text-blue-500 transition duration-150"
              aria-label="Notifications"
            />
            <div className="flex items-center space-x-2 hover:bg-gray-100 rounded-full px-2 py-1 transition cursor-pointer">
              <img
                src="https://via.placeholder.com/28"
                alt="profile"
                className="rounded-full w-7 h-7 hover:ring-2 hover:ring-blue-400 transition"
                aria-label="User Profile"
              />
              <span className="text-sm">Moni Roy</span>
            </div>
          </div>
        </header>

        {/* Main content placeholder */}
        <main className="flex-1 p-4 bg-gray-50 overflow-auto">
          {/* Add your route-based content here */}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
