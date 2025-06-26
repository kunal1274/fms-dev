import React, { useState } from "react";
import SiteList from "./SiteList";
import SiteForm from "./SiteForm";


export default function SitePage() {
  const [view, setView] = useState("list"); // "list" | "form" | "details"
  const [selectedId, setSelectedId] = useState(null); // Mongo _id of the Site

  // Handlers to switch views
  const handleAddSite = () => {
    setSelectedId(null);
    setView("form");
  };
  const handleViewSite = (id) => {
    setSelectedId(id);
    setView("list");
  };
  const handleEditSite = () => {
    setView("form");
  };
  const handleCancel = () => {
    setSelectedId(null);
    setView("list");
  };
  const handleSaved = () => {
    // after create or update
    setView("list");
  };

  return (
    <div>
      {view === "list" && (
        <SiteList handleAddSite={handleAddSite} onView={handleViewSite} />
      )}

      {view === "form" && (
        <SiteForm
          SiteId={selectedId}
          onSave={handleSaved}
          handleCancel={handleCancel}
        />
      )}

      {view === "details" && (
        <SiteViewPage
          SiteId={selectedId}
          onEdit={handleEditSite}
          onBack={handleCancel}
        />
      )}
    </div>
  );
}
