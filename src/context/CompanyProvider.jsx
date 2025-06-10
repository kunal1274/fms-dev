import React, { createContext, useState } from 'react';

export const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
  const [form, setForm] = useState({ company: '' });
  const [companies, setCompanies] = useState([]);

  return (
    <CompanyContext.Provider value={{ form, setForm, companies, setCompanies }}>
      {children}
    </CompanyContext.Provider>
  );
};
