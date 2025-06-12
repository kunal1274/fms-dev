// src/pages/CompanyPage.jsx
import React, { useState } from "react";
import CompanyForm from "./CompanyForm";
import CompanyList from "./CompanyList";
import CompanyViewPage from "./CompanyViewPage";
import { Button } from "../../Component/Button/Button";

const CompanyPage = () => {
  const [view, setView] = useState("list"); // "list" | "form" | "details"
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Save or update a company, then go back to list
  const handleSaveCompany = (company) => {
    setCompanies((prev) => {
      const idx = prev.findIndex(
        (c) => c.companyAccountNo === company.companyAccountNo
      );
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = company;
        return updated;
      }
      return [...prev, company];
    });
    setView("list");
  };

  // Switch to blank form for adding
  const handleAddCompany = () => {
    setSelectedCompany(null);
    setView("form");
  };

  // Show details for a given account number
  const handleViewCompany = (companyAccountNo) => {
    const found = companies.find(
      (c) => c.companyAccountNo === companyAccountNo
    );
    setSelectedCompany(found);
    setView("details");
  };

  // Remove companies by their account numbers
  const handleDeleteCompany = (toDeleteAccountNos) => {
    setCompanies((prev) =>
      prev.filter((c) => !toDeleteAccountNos.includes(c.companyAccountNo))
    );
  };

  // Cancel out of form/detail back to list
  const handleCancel = () => setView("list");

  // Header with dynamic title and primary action
  const renderHeader = () => {
    let title = "Companies";
    let action = <Button onClick={handleAddCompany}>Add Company</Button>;

    if (view === "form") {
      title = selectedCompany ? "Edit Company" : "New Company";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      );
    } else if (view === "details") {
      title = "Company Details";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Back to List
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        {action}
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-lg ">
      {view === "list" && (
        <CompanyList
          companies={companies}
          handleAddCompany={handleAddCompany}
          onView={handleViewCompany}
          onDelete={handleDeleteCompany}
        />
      )}

      {view === "form" && (
        <CompanyForm company={selectedCompany} handleCancel={handleCancel} />
      )}

      {view === "details" && selectedCompany && (
        <CompanyViewPage
          company={selectedCompany}
          onEdit={() => setView("form")}
          onBack={handleCancel}
        />
      )}
    </div>
  );
};

export default CompanyPage;
