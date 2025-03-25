import { FaSearch, FaBell } from "react-icons/fa";

const Header = () => {
  return (
    <header className="flex justify-between items-center bg-white shadow-md px-6 py-3">
      {/* Search Section */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search"
          className="block w-full border border-gray-300 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Search" // Accessibility improvement
        />
        <FaSearch className="absolute left-4 top-3 text-gray-400" />
      </div>

      {/* Right Section: Notifications and Profile */}
      <div className="flex items-center space-x-4">
        <FaBell className="cursor-pointer" aria-label="Notifications" />
        <div className="flex items-center space-x-2">
          <img
            src="https://via.placeholder.com/32"
            alt="profile"
            className="rounded-full w-8 h-8"
            aria-label="User Profile" // Accessibility improvement
          />
          <span className="text-sm">Moni Roy</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
