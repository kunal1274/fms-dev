import React from "react";
import PropTypes from "prop-types";

/**
 * Reusable tab navigation component.
 *
 * @param {string[]} tabs - Array of tab labels
 * @param {string} activeTab - Currently selected tab
 * @param {(tab: string) => void} onTabClick - Callback when a tab is clicked
 */
function NavTabs({ tabs, activeTab, onTabClick }) {
  return (
    <nav className="w-full bg-white p-4 border-b">
      <ul className="flex flex-wrap space-x-6">
        {tabs.map((tab) => (
          <li
            key={tab}
            onClick={() => onTabClick(tab)}
            className={`cursor-pointer pb-2 transition-colors duration-200 \${
              activeTab === tab
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab}
          </li>
        ))}
      </ul>
    </nav>
  );
}

NavTabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.string),
  activeTab: PropTypes.string,
  onTabClick: PropTypes.func,
};

NavTabs.defaultProps = {
  tabs: [],
  activeTab: null,
  onTabClick: () => {},
};

export default NavTabs;
