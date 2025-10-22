import React from "react";

export const CompanyContext = React.createContext({
  form: { company: "" },
  setForm: () => {},
  companies: [],
});

export default CompanyContext;
