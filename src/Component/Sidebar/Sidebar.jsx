import React from "react";
import {
  FaUser,
  FaTruck,
  FaBoxOpen,
  FaShoppingCart,
  FaCartPlus,
  FaCog,
} from "react-icons/fa";

const navItems = [
  { label: "Customer", icon: FaUser },
  { label: "Company", icon: FaTruck },
  { label: "Vendor", icon: FaTruck },
  { label: "Item", icon: FaBoxOpen },
  { label: "Sale", icon: FaShoppingCart },
  { label: "Purchase", icon: FaCartPlus },
  { label: "User", icon: FaUser },
];

export default function Sidebar({ isOpen, selectedMenu, onSelectMenu }) {
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
            const active = selectedMenu === item.label;

            return (
              <button
                key={item.label}
                onClick={() => onSelectMenu(item.label)}
                title={item.label}
                className={`
        group flex items-center p-2 rounded-lg transition-all duration-200
        ${active ? "bg-gray-700" : "hover:bg-gray-700"}
        ${isOpen ? "justify-start" : "justify-center"}
      `}
              >
                <Icon
                  className={`
          text-xl flex-shrink-0 transition-transform duration-200
          ${isOpen ? "mr-[2px]" : ""}
          ${active ? "text-yellow-400" : "text-gray-400"}
          group-hover:scale-110
        `}
                />
                {isOpen && (
                  <span className="ml-3 text-base font-medium text-white group-hover:text-amber-300">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="">
        <button
          className="w-full flex items-center justify-center  rounded-lg bg-gray-700 hover:bg-gray-600 transition-all duration-200 shadow-inner"
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
