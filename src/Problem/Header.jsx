import { useState } from "react";
import { FaSearch, FaBell, FaBars } from "react-icons/fa";
import "./Header.css";

function Header({ toggleSidebar, sidebarOpen }) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchBlur = () => {
    setSearchTerm("");
  };

  return (
    <header className="header">
      <div className="header-left">
        {toggleSidebar && (
          <FaBars className="hamburger-icon" onClick={toggleSidebar} />
        )}
        <div className="header-search">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onBlur={handleSearchBlur}
            placeholder="Search"
            className="search-input"
            aria-label="Search"
          />
          <FaSearch className="search-icon" />
        </div>
      </div>
      <div className="header-right">
        <FaBell className="notification-icon" aria-label="Notifications" />
        <div className="profile">
          <img
            src="https://via.placeholder.com/28"
            alt="profile"
            className="profile-img"
            aria-label="User Profile"
          />
          <span className="profile-name">Moni Roy</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
