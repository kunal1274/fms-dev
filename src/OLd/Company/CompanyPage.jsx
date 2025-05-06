                                    import React, { useState } from "react";
import CompanyForm from "./CompanyForm";
import CompanyList from "./CompanyList";
import CompanyViewPage from "./CompanyViewPage";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



const apiUrl = "your_api_url_here"; // Replace this with your actual API URL

const CompanyPage = () => {
  // Single state for companies list
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [view, setView] = useState("list");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [newCompany, setNewCompany] = useState({
    companyAccountNo: "",
    companyCode: "",
    companyName: "",
    email: "",
    gstAddress: "",
    taxInfo: "",
  });

  const navigate = useNavigate();

  // Create a new company
  const createCompany = async (e) => {
    e.preventDefault();
    try {
      // Construct endpoint URL (adjust the path as needed)
      const response = await axios.post(
        `${apiUrl}/companies`,
        { ...newCompany },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Company created:", response.data);
      setMessage("Company created successfully!");
      // Assuming the new company data is in response.data.data; adjust if needed
      setCompanies((prevCompanies) => [...prevCompanies, response.data.data]);
      // Reset the new company form state
      setNewCompany({
        companyAccountNo: "",
        companyCode: "",
        companyName: "",
        email: "",
        gstAddress: "",
        taxInfo: "",
      });
    } catch (error) {
      if (error.response) {
        console.error(`Error in response: ${error.response.data}`);
        setMessage(error.response.data.message || "Error creating Company");
      } else if (error.request) {
        console.error(`Error in request: ${error.request}`);
        setMessage("Network error, please try again.");
      } else {
        console.error(`Error: ${error.message}`);
        setMessage("An unexpected error occurred.");
      }
    }
  };

  // Toggle view between list and view
  const handleToggleView = () => {
    setView((prevView) => {
      if (prevView === "list") {
        return "view";
      } else {
        setMessage(""); // Clear messages when switching views
        setError("");   // Clear errors when switching views
        return "list";
      }
    });
  };

  // Save a new or updated company
  const handleSaveCompany = async (company) => {
    setLoading(true);
    try {
      if (company.id) {
        // Update existing company
        const response = await axios.put(
          `${apiUrl}/companies/${company.id}`,
          company,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        setCompanies((prevCompanies) =>
          prevCompanies.map((c) => (c.id === company.id ? response.data : c))
        );
        setMessage("Company updated successfully!");
      } else {
        // Save new company
        const response = await axios.post(`${apiUrl}/companies`, company, {
          headers: { "Content-Type": "application/json" },
        });
        setCompanies((prevCompanies) => [...prevCompanies, response.data]);
        setMessage("Company saved successfully!");
      }
      setView("list");
    } catch (error) {
      console.error("Error saving Company:", error);
      setError("Failed to save Company. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // View company details
  const handleViewCompany = (companyId) => {
    console.log("View button clicked for Company ID:", companyId);
    if (Array.isArray(companies)) {
      const company = companies.find((c) => c.id === companyId);
      if (company) {
        setSelectedCompany(company);
      } else {
        setError("Company not found.");
      }
    } else {
      setError("Invalid Company data.");
    }
    setView("view");
    console.log("Navigating to view Company page with ID:", companyId);
    navigate(`/company/view/${companyId}`);
  };

  // Add a new company (switch to form view)
  const handleAddCompany = () => {
    setSelectedCompany(null);
    setView("form");
  };

  // Cancel current operation and go back to list view
  const handleCancel = () => {
    setView("list");
    console.log("Cancel clicked");
  };

  // A generic toggle view function (if needed)
  const toggleView = (targetView) => {
    if (view !== targetView) {
      setView(targetView);
      console.log("Toggle function working: View changed to", targetView);
    } else {
      console.log("Error in running function: View did not change");
    }
  };

  return (
    <div className=" bg-zinc-50 min-h-screen">
    
    <div className=" rounded-lg">
    {view === "form" && (
          <CompanyForm
            handleCancel={handleCancel}
            createCompany={createCompany}
            handleSaveCompany={handleSaveCompany}
            selectedCompany={selectedCompany}
            newCompany={newCompany}
            setNewCompany={setNewCompany}
          />
        )}

{view === "list" && (
          <CompanyList
            companies={companies}
            handleAddCompany={handleAddCompany}
            handleViewCompany={handleViewCompany}
          />
        )}

{view === "view" && (
          <CompanyViewPage
            company={selectedCompany}
            handleAddCompany={handleAddCompany}
            handleCancel={handleCancel}
            handleToggleView={handleToggleView}
          />
        )}
    </div>
  </div>
   
  );
};

export default CompanyPage;
