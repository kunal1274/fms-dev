import React, { useState, useEffect, useRef } from "react";

const   CompanyDropdown = ({ companies, selectedCompany, onCompanyChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Find the currently selected company object
  const selectedCompanyObj = companies.find((c) => c.id === selectedCompany);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        type="button"
        className="w-full inline-flex justify-between items-center bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {selectedCompanyObj ? (
          <div className="flex items-center">
            {selectedCompanyObj.iconUrl && (
              <img
                src={selectedCompanyObj.iconUrl}
                alt={selectedCompanyObj.companyName}
                className="w-5 h-5 mr-2"
              />
            )}
            <span>
              {selectedCompanyObj.companyCode} -{" "}
              {selectedCompanyObj.companyName}
            </span>
          </div>
        ) : (
          <span>Select a company</span>
        )}
        {/* Chevron Icon */}
        <svg
          className="w-5 h-5 ml-2 -mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 overflow-auto rounded-md focus:outline-none">
          {companies.map((company) => (
            <li
              key={company.id}
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-indigo-50 group"
              onClick={() => {
                onCompanyChange(company.id);
                setIsOpen(false);
              }}
            >
              {company.iconUrl && (
                <img
                  src={company.iconUrl}
                  alt={company.companyName}
                  className="w-5 h-5 mr-2"
                />
              )}
              {/* Always show code */}
              <span className="font-medium">{company.companyCode}</span>
              {/* Show name on hover */}
              <span className="ml-2 text-sm text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                {company.companyName}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CompanyDropdown;
