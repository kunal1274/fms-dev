import React, { useState, useEffect } from "react";
import SiteList from "./Sitelist";
import SiteForm from "./SiteForm";
import SiteViewPage from "./SiteViewPagee";
import { Button } from "../../../../src/Component/Button/Button";

export default function SitePage() {
  const [view, setView] = useState("list");
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);

  // Fetch initial sites if needed
  useEffect(() => {
    // axios.get('/api/sites').then(res => setSites(res.data));
  }, []);

  // Save or update a site in state
  const handleSaveSite = (site) => {
    setSites((prev) => {
      const idx = prev.findIndex((s) => s.siteAccountNo === site.siteAccountNo);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = site;
        return updated;
      }
      return [...prev, site];
    });
    setView("list");
  };

  // Show form for adding a new site
  const handleAddSite = () => {
    setSelectedSite(null);
    setView("form");
  };

  // View details for a selected site
  const handleViewSite = (accountNo) => {
    const found = sites.find((s) => s.siteAccountNo === accountNo);
    setSelectedSite(found);
    setView("details");
  };

  // Delete sites by account numbers
  const handleDeleteSites = (toDelete) => {
    setSites((prev) => prev.filter((s) => !toDelete.includes(s.siteAccountNo)));
  };

  // Cancel form or details view
  const handleCancel = () => {
    setView("list");
    setSelectedSite(null);
  };

  // Dynamic header
  const renderHeader = () => {
    let title = "Sites";
    let action = <Button onClick={handleAddSite}>Add Site</Button>;

    if (view === "form") {
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      );
    }

    if (view === "details") {
      title = "Site Details";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Back to List
        </Button>
      );
    }

    return (
      <div className="flex justify-between items-center mb-4">
        {/* <h1 className="text-2xl font-semibold text-gray-800">{title}</h1> */}
        {/* {action} */}
      </div>
    );
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg ">
      {renderHeader()}

      {view === "list" && (
        <SiteList
          sites={sites}
          handleAddSite={handleAddSite}
          onView={handleViewSite}
          onDelete={handleDeleteSites}
        />
      )}

      {view === "form" && (
        <SiteForm
          site={selectedSite}
          onSave={handleSaveSite}
          handleCancel={handleCancel}
        />
      )}

      {view === "details" && selectedSite && (
        <SiteViewPage
          site={selectedSite}
          onEdit={() => setView("form")}
          handleCancel={handleCancel}
        />
      )}
    </div>
  );
}
