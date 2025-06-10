import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
import CompanyDropdown from "./CompanyDropdown";

const Footer = ({ onBack, onOk }) => {
  const initialForm = {
    company: localStorage.getItem("selectedCompany") || "",
  };

  const [form, setForm] = useState(initialForm);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    async function fetchCompanies() {
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
    }

    fetchCompanies();
  }, []);

  return (
    <footer className="flex justify-between items-center p-4 bg-white border-t">
      <CompanyDropdown companies={companies} form={form} setForm={setForm} />
    </footer>
  );
};

export default Footer;
