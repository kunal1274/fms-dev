import React, { useEffect, useState } from "react";
import { FaCog } from "react-icons/fa";
import { navItems } from "@/constants/navItems";

export default function Sidebar({
  isOpen,
  selectedTop,
  selectedSub,
  onSelectMenu,
}) {
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const topItem = navItems.find((n) => n.label === selectedTop);
    setExpanded(topItem?.subItems?.length ? selectedTop : null);
  }, [selectedTop]);

  const handleTopClick = (item) => {
    const hasSubs = !!item.subItems?.length;
    if (hasSubs) {
      const willExpand = expanded !== item.label;
      setExpanded(willExpand ? item.label : null);
      if (willExpand) {
        onSelectMenu(item.label, item.subItems?.[0]?.label ?? null);
      } else {
        onSelectMenu(item.label, selectedSub);
      }
    } else {
      onSelectMenu(item.label, null);
      setExpanded(null);
    }
  };

  const handleSubClick = (top, sub) => onSelectMenu(top.label, sub.label);

  return (
    <aside
      className={`flex flex-col justify-between bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-3 h-full transition-all duration-300 ${
        isOpen ? "w-56" : "w-16"
      }`}
      aria-label="Sidebar"
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
            const activeTop = selectedTop === item.label;
            const isExpanded = expanded === item.label;
            const hasSubs = !!item.subItems?.length;

            return (
              <div key={item.label}>
                <button
                  onClick={() => handleTopClick(item)}
                  title={item.label}
                  aria-expanded={hasSubs ? isExpanded : undefined}
                  className={`group flex items-center p-2 rounded-lg transition-all w-full ${
                    activeTop ? "bg-gray-700" : "hover:bg-gray-700"
                  } ${isOpen ? "justify-between" : "justify-center"}`}
                >
                  <span
                    className={`flex items-center ${
                      isOpen ? "" : "justify-center w-full"
                    }`}
                  >
                    <Icon
                      className={`text-xl flex-shrink-0 transition-transform ${
                        isOpen ? "mr-[6px]" : ""
                      } ${
                        activeTop ? "text-yellow-400" : "text-gray-400"
                      } group-hover:scale-110`}
                    />
                    {isOpen && (
                      <span className="text-base font-medium text-white group-hover:text-amber-300">
                        {item.label}
                      </span>
                    )}
                  </span>
                  {isOpen && hasSubs && (
                    <span className="text-sm text-gray-300">
                      {isExpanded ? "▾" : "▸"}
                    </span>
                  )}
                </button>

                {isOpen && hasSubs && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subItems.map((sub) => {
                      const SubIcon = sub.icon;
                      const activeSub = activeTop && selectedSub === sub.label;
                      return (
                        <button
                          key={sub.label}
                          onClick={() => handleSubClick(item, sub)}
                          title={sub.label}
                          className={`flex items-center p-2 rounded-lg transition-all w-full ${
                            activeSub ? "bg-gray-700" : "hover:bg-gray-700"
                          }`}
                        >
                          <SubIcon
                            className={`text-lg flex-shrink-0 transition-transform mr-2 ${
                              activeSub ? "text-yellow-400" : "text-gray-400"
                            } group-hover:scale-110`}
                          />
                          <span className="text-sm font-normal text-white group-hover:text-amber-300">
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
          className="group w-full flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 transition-all shadow-inner"
          onClick={() => console.log("Toggle theme")}
          title="Theme"
          aria-label="Theme"
        >
          <FaCog className="text-xl transition-transform group-hover:rotate-90" />
          {isOpen && (
            <span className="ml-2 text-sm font-medium text-white">Theme</span>
          )}
        </button>
      </div>
    </aside>
  );
}
