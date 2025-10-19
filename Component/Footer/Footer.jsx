import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaChevronDown,
  FaBell,
  FaCog,
  FaBuilding,
  FaClock,
} from "react-icons/fa";

const Footer = () => {
  const [companies, setCompanies] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const dropdownRef = useRef(null);

  const [form, setForm] = useState({
    company: localStorage.getItem("selectedCompany") || "",
  });

  const selectedCompanyObj = companies.find((c) => c.id === form.company);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(
          "https://fms-qkmw.onrender.com/fms/api/v0/companies"
        );
        const data = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setCompanies(data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCompanyChange = async (id) => {
    setForm((prev) => ({ ...prev, company: id }));
    localStorage.setItem("selectedCompany", id);
    try {
      await axios.post(
        "https://fms-qkmw.onrender.com/fms/api/v0/selected-company",
        { companyId: id }
      );
    } catch (error) {
      console.error("Error saving selected company:", error);
    }
    setIsOpen(false);
  };

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
    <footer className="bg-white border-b h-12 border-gray-200 px-3 py-2 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-end h-full text-gray-600">
        <div className="flex items-center gap-4">
          {/* Company Dropdown */}
          <div className="relative group" ref={dropdownRef}>
            {/* Button */}
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-2 py-1 text-sm hover:bg-gray-100"
            >
              {selectedCompanyObj?.iconUrl ? (
                <img
                  src={selectedCompanyObj.iconUrl}
                  alt="Icon"
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <FaBuilding className="w-4 h-4" />
              )}
              <span>{selectedCompanyObj?.companyCode || "No Company"}</span>
              <FaChevronDown className="text-gray-500" />
            </button>

            {/* Hover Tooltip */}
            {selectedCompanyObj && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-200 text-gray-800 text-xs px-3 py-1 rounded shadow-md whitespace-nowrap z-50">
                {selectedCompanyObj.companyCode} -{" "}
                {selectedCompanyObj.companyName}
              </div>
            )}

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-60 bg-white border border-gray-300 shadow-lg rounded-md z-50 max-h-60 overflow-y-auto">
                {companies.map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      handleCompanyChange(company.id);
                      setIsOpen(false);
                    }}
                  >
                    {company.iconUrl && (
                      <img
                        src={company.iconUrl}
                        alt={company.companyName}
                        className="w-4 h-4 rounded-full"
                      />
                    )}
                    <div className="flex flex-col text-sm">
                      <span className="font-semibold">
                        {company.companyCode}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {company.companyName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clock Display */}
          <div className="flex items-center gap-1">
            <FaClock className="w-4 h-4" />
            <span className="text-sm font-mono">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
