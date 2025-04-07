import { BrowserRouter, useNavigate } from "react-router-dom";
import Dashboard from "../src/components/dashBoard/Dashbord";

import { useState } from "react";

// import Dashboard from "./components/dashBoard/Dash.jsx";

function App() {
 
  return (
    <BrowserRouter>
 
      <Dashboard />
    </BrowserRouter>
  );
}

export default App;
