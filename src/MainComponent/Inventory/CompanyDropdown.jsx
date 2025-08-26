import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown } from "react-icons/fa";

const CompanyDropdown = ({ companies, selectedCompany, onCompanyChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Find selected company object
  const selectedCompanyObj = companies.find((c) => c.id === selectedCompany);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Toggle Button with hover tooltip */}
      <div className="relative group inline-block">
        <button
          type="button"
          className="inline-flex justify-between items-center bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {selectedCompanyObj ? (
            <div className="flex items-center space-x-2">
              {selectedCompanyObj.iconUrl && (
                <img
                  src={selectedCompanyObj.iconUrl}
                  alt={selectedCompanyObj.companyName}
                  className="w-5 h-5"
                />
              )}
              <span className="font-medium">
                {selectedCompanyObj.companyCode} 
              
              </span>
            </div>
          ) : (
            <span className="text-gray-500">Select a company</span>
          )}
          <FaChevronDown className="ml-2 text-gray-500" />
        </button>
        {/* Tooltip for button */}
        {selectedCompanyObj && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-2 hidden group-hover:block bg-yellow-200 text-gray-800 text-sm px-3 py-1 rounded shadow-lg whitespace-nowrap">
            {selectedCompanyObj.companyCode} - {selectedCompanyObj.companyName}
          </div>
        )}
      </div>

      {/* Dropdown List opens upward and adjusts width to content */}
      {isOpen && (
        <ul className="absolute z-10 bottom-full mb-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto min-w-max">
          {companies.map((company) => (
            <li key={company.id} className="relative group">
              <div
                onClick={() => {
                  onCompanyChange(company.id);
                  setIsOpen(false);
                }}
                className="flex items-center px-4 py-2 cursor-pointer hover:bg-indigo-50 whitespace-nowrap"
              >
                {company.iconUrl && (
                  <img
                    src={company.iconUrl}
                    alt={company.companyName}
                    className="w-5 h-5 mr-2"
                  />
                )}
                <span className="font-medium">
                  {company.companyCode} - {company.companyName}
                </span>
              </div>
              {/* Tooltip above list item */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1 hidden group-hover:block bg-yellow-200 text-gray-800 text-sm px-3 py-1 rounded shadow-lg whitespace-nowrap">
                {company.companyCode} - {company.companyName}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CompanyDropdown;
