import React, { useState } from "react";

import CompanyViewPage from "./CompanyViewPage";
import { Button } from "../../Component/Button/Button";
import CompanyForm from "./CompanyForm";
import CompanyList from "./Companylist";

const CompanyPage = () => {
  const [view, setView] = useState("list");
  const [Companys, setCompanys] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  /** Save or update a Company */
  const handleSaveCompany = (Company) => {
    setCompanys((prev) => {
      const idx = prev.findIndex(
        (c) => c.CompanyAccountNo === Company.CompanyAccountNo
      );

      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = Company;
        return updated;
      }
      return [...prev, Company];
    });
    setView("list");
  };

  /** Open the "Add Company" form */
  const handleAddCompany = () => {
    setSelectedCompany(null);
    setView("form");
  };

  /** Show Company details */
  const handleViewCompany = (CompanyAccountNo) => {
    const cust = Companys.find(
      (c) => c.CompanyAccountNo === CompanyAccountNo
    );
    setSelectedCompany(cust);
    setView("details");
  };

  /** Delete selected Companys */
  const handleDeleteCompany = (toDeleteAccounts) => {
    setCompanys((prev) =>
      prev.filter((c) => !toDeleteAccounts.includes(c.CompanyAccountNo))
    );
  };

  /** Cancel form or detail view */
  const handleCancel = () => setView("list");

  /** Render header with title and actions */
  const renderHeader = () => {
    let title = "Companys";
    let action = null;

    if (view === "list") {
      action = <Button onClick={handleAddCompany}>Add Company</Button>;
    } else if (view === "form") {
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
      <div className="flex justify-between ">
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        {action}
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-lg ">
      <div>
        {view === "list" && (
          <CompanyList
            Companys={Companys}
            handleAddCompany={handleAddCompany}
            onView={handleViewCompany}
            onDelete={handleDeleteCompany}
          />
        )}

        {view === "form" && (
          <CompanyForm
            Company={selectedCompany}
            handleAddCompany={handleAddCompany}
            handleCancel={handleCancel}
          />
        )}
        {view === "details" && selectedCompany && (
          <CompanyViewPage
            Company={selectedCompany}
            onEdit={() => setView("form")}
            onBack={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default CompanyPage;
