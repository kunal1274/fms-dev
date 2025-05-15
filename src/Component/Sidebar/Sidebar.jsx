import React, { useState } from "react";
import {
  FaUser,
  FaTruck,
  FaBoxOpen,
  FaShoppingCart,
  FaCartPlus,
  FaCog,
  FaWarehouse,
  FaMapMarkerAlt,
} from "react-icons/fa";

const navItems = [
  { label: "Customer", icon: FaUser },
  { label: "Company", icon: FaTruck },
  { label: "Vendor", icon: FaTruck },
  {
    label: "Inventory",
    icon: FaBoxOpen,
    subItems: [
      { label: "Site", icon: FaMapMarkerAlt },
      { label: "Warehouse", icon: FaWarehouse },

      { label: "Item", icon: FaBoxOpen },
    ],
  },
  { label: "Sale", icon: FaShoppingCart },
  { label: "Purchase", icon: FaCartPlus },
  { label: "User", icon: FaUser },
];

export default function Sidebar({
  isOpen,
  selectedMenu,
  onSelectMenu, // now gets called with both top & sub labels
}) {
  const [expanded, setExpanded] = useState(null); // which parent is open

  const handleClick = (item) => {
    if (item.subItems) {
      // toggle Inventory open/closed
      setExpanded(expanded === item.label ? null : item.label);
    } else {
      // regular top-level
      onSelectMenu(item.label);
      setExpanded(null);
    }
  };

  const handleSubClick = (sub) => {
    onSelectMenu(sub.label);
  };

  return (
    <aside
      className={`
        flex flex-col justify-between bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900
        text-white p-3 h-full transition-all duration-300 ease-in-out 
        ${isOpen ? "w-48" : "w-16"}
      `}
    >
      <div>
        {isOpen && (
          <div className="text-2xl font-extrabold mb-6 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500">
            Namami
          </div>
        )}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const activeTop = selectedMenu === item.label;
            const isExpanded = expanded === item.label;

            return (
              <div key={item.label}>
                <button
                  onClick={() => handleClick(item)}
                  title={item.label}
                  className={`
                    group flex items-center p-2 rounded-lg transition-all duration-200
                    ${activeTop ? "bg-gray-700" : "hover:bg-gray-700"}
                    ${isOpen ? "justify-start" : "justify-center"}
                  `}
                >
                  <Icon
                    className={`
                      text-xl flex-shrink-0 transition-transform duration-200
                      ${isOpen ? "mr-[2px]" : ""}
                      ${activeTop ? "text-yellow-400" : "text-gray-400"}
                      group-hover:scale-110
                    `}
                  />
                  {isOpen && (
                    <span className="ml-3 text-base font-medium text-white group-hover:text-amber-300">
                      {item.label}
                    </span>
                  )}
                </button>

                {/* render sub-menu if Inventory is expanded */}
                {isOpen && item.subItems && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subItems.map((sub) => {
                      const SubIcon = sub.icon;
                      const activeSub = selectedMenu === sub.label;
                      return (
                        <button
                          key={sub.label}
                          onClick={() => handleSubClick(sub)}
                          title={sub.label}
                          className={`
                            flex items-center p-2 rounded-lg transition-all duration-200
                            ${activeSub ? "bg-gray-700" : "hover:bg-gray-700"}
                          `}
                        >
                          <SubIcon
                            className={`
                              text-lg flex-shrink-0 transition-transform duration-200
                              ${activeSub ? "text-yellow-400" : "text-gray-400"}
                              group-hover:scale-110
                            `}
                          />
                          <span className="ml-2 text-sm font-normal text-white group-hover:text-amber-300">
                            {sub.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
      <div>
        <button
          className="w-full flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 transition-all duration-200 shadow-inner"
          onClick={() => console.log("Toggle theme")}
        >
          <FaCog className="text-xl transition-transform duration-300 group-hover:rotate-90" />
          {isOpen && (
            <span className="ml-2 text-sm font-medium text-white">Theme</span>
          )}
        </button>
      </div>
    </aside>
  );
}
