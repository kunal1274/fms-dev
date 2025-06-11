import React, { useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import Main from "../Main/Main";
import Footer from "../Footer/Footer";

const Dashboard = () => {
  // Sidebar open/closed
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Which menu is active: Customer, Vendor, Item, Sale, Purchase
  const [selectedMenu, setSelectedMenu] = useState("Customer");

  // Toggle sidebar width
  const handleSidebarToggle = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Switch main view
  const handleSelectMenu = (menu) => {
    setSelectedMenu(menu);
  };

  // Handler stubs for CustomerList
  const handleAddNew = () => {
    console.log("Add new", selectedMenu);
    // e.g. open a modal or navigate to form
  };
  const handleView = (id) => {
    console.log("View", selectedMenu, id);
    // e.g. navigate to detail page
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        isOpen={sidebarOpen}
        selectedMenu={selectedMenu}
        onSelectMenu={handleSelectMenu}
      />

      <div className="flex flex-col flex-1">
        <Header onSidebarToggle={handleSidebarToggle} />

        <main className="flex-1 w-full overflow-auto">
          <Main
            sidebarOpen={sidebarOpen}
            selectedMenu={selectedMenu}
            onAddNew={handleAddNew}
            onView={handleView}
          />
        </main>
         <Footer /> 
      </div>

    </div>
  );
};

export default Dashboard;
