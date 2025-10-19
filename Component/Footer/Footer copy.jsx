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
    <header className="bg-white border-b h-12 border-gray-200 px-3 py-2 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between h-9">
        {/* Left Section */}
        <div className="flex items-center gap-4 text-gray-600">
          <FaCog title="Settings" className="w-5 h-5 hover:text-indigo-600 cursor-pointer" />
          <div className="flex items-center gap-1">
            <FaBuilding title="Company" className="w-5 h-5" />
            <span className="text-sm">
              {selectedCompanyObj?.companyCode || "No Company"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <FaClock className="w-4 h-4" />
            <span className="text-sm font-mono">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          <button className="relative text-gray-600 hover:text-gray-800 focus:outline-none">
            <FaBell className="w-5 h-5" />
            <span className="absolute top-0 right-0 block h-1.5 w-1.5 rounded-full bg-red-500"></span>
          </button>

          <img
            src="/path/to/profile-pic.png"
            alt="Profile"
            className="h-6 w-6 rounded-full object-cover"
          />

          {/* Company Dropdown */}
          <div className="relative inline-block text-left" ref={dropdownRef}>
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

              {/* Hover Tooltip */}
              {selectedCompanyObj && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-2 hidden group-hover:block bg-yellow-200 text-gray-800 text-sm px-3 py-1 rounded shadow-lg whitespace-nowrap">
                  {selectedCompanyObj.companyCode} -{" "}
                  {selectedCompanyObj.companyName}
                </div>
              )}
            </div>

            {/* Dropdown List */}
           
          </div>
        </div>
      </div>
    </header>
  );
};

export default Footer;
