import React from "react";

const Footer = ({ onSidebarToggle }) => {
  return (
    <Footer className="bg-white border-b h-12 border-gray-200 px-3 py-2 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between h-9">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Hamburger Menu */}
          <button
            onClick={onSidebarToggle}
            className="text-gray-600 hover:text-gray-800 focus:outline-none"
            aria-label="Toggle Sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="pl-8 pr-2 py-1 text-sm rounded-md bg-gray-100 text-gray-700 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-300 focus:outline-none transition"
            />
            <svg
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <button className="relative text-gray-600 hover:text-gray-800 focus:outline-none">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {/* Badge */}
            <span className="absolute top-0 right-0 block h-1.5 w-1.5 rounded-full bg-red-500"></span>
          </button>

          {/* Profile */}
          <div className="flex items-center space-x-2">
            <img
              src="/path/to/profile-pic.png"
              alt="Profile"
              className="h-6 w-6 rounded-full object-cover"
            />
            {/* <span className="text-sm font-medium text-gray-800">John Doe</span> */}
          </div>
        </div>
      </div>
    </Footer>
  );
};

export default Footer;
