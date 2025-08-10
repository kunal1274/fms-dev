import React from "react";
// Keep your existing import path/name
import Dashbord from "./Component/Dashbord/Dashbord";
// import Dashbord  from "./MainComponent/Company/CompanyForm";
const App = () => {
  return (
    // Full-height, responsive container with safe scrolling
    <div className="min-h-screen w-full flex flex-col bg-white overflow-x-hidden">
      {/* Allow children to control vertical scroll without clipping */}
      <div className="flex-1 min-h-0">
        <Dashbord />
      </div>
    </div>
  );
};

export default App;
