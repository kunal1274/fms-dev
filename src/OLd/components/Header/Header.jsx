import { useState } from "react";
import { FaSearch, FaBell } from "react-icons/fa";

function Header() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchBlur = () => {
    setSearchTerm(""); // clear input on blur
  };

  return (
    <header className="flex justify-between items-center text-sm bg-zinc-200  px-2 py-1">
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
  );
}

export default Header;
