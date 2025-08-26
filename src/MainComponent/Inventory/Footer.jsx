import React, { useState, useEffect } from "react";
import axios from "axios";
import CompanyDropdown from "./CompanyDropdown";

const Footer = () => {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({
    company: localStorage.getItem("selectedCompany") || "",
  });

  // Load companies on mount
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

  // Handle selection change + API + localStorage
  const handleCompanyChange = async (id) => {
    setForm((prev) => ({ ...prev, company: id }));
    localStorage.setItem("selectedCompany", id);
    try {
      await axios.post("https://fms-qkmw.onrender.com/fms/api/v0/selected-company", {
        companyId: id,
      });
    } catch (error) {
      console.error("Error saving selected company:", error);
    }
  };

  return (
    <footer className="flex justify-end items-center p-4 bg-white border-t">
      <CompanyDropdown
        companies={companies}
        selectedCompany={form.company}
        onCompanyChange={handleCompanyChange}
      />
    </footer>
  );
};

export default Footer;
