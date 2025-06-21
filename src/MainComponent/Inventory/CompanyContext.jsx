import React, { createContext, useContext, useState, useEffect } from "react";

const SelectedCompanyContext = createContext();

export const SelectedCompanyProvider = ({ children }) => {
  const [selectedCompany, setSelectedCompany] = useState(
    localStorage.getItem("selectedCompany") || ""
  );

  useEffect(() => {
    if (selectedCompany) {
      localStorage.setItem("selectedCompany", selectedCompany);
    }
  }, [selectedCompany]);

  return (
    <SelectedCompanyContext.Provider value={{ selectedCompany, setSelectedCompany }}>
      {children}
    </SelectedCompanyContext.Provider>
  );
};

export const useSelectedCompany = () => useContext(SelectedCompanyContext);
