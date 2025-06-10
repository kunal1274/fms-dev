import React from "react";

const CompanyContext = React.createContext({
  form: { company: "" },
  setForm: () => {},
  companies: [],
});

export default CompanyContext;