import React from 'react'
import { Button } from "../../../Component/Button/Button";
import LocationForm from './LocationForm';
import Location from './Location.jsx';
import LocationViewPage from '../Location/LocationViewPage';


const LocationPage = () => {
  const [view, setView] = useState("list");
  const [location, setLocataion] = useState([]);
  const [selectedLocation, setSelectedLocataion] = useState(null);

  /** Save or update a Locataion */
  const handleSaveLocation = (Locataion) => {
    setLocataion((prev) => {
      const idx = prev.findIndex(
        (c) => c.LocataionAccountNo === Locataion.LocataionAccountNo
      );

      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = Locataion;
        return updated;
      }
      return [...prev, Locataion];
    });
    setView("list");
  };

  /** Open the "Add Locataion" form */
  const handleAddLocation = () => {
    setSelectedLocataion(null);
    setView("form");
  };

  /** Show Locataion details */
  const handleViewLocation = (LocataionAccountNo) => {
    const cust = Location.find(
      (c) => c.LocataionAccountNo === LocataionAccountNo
    );
    setSelectedLocataion(cust);
    setView("details");
  };

  /** Delete selected Locataions */
  const handleDeleteLocation = (toDeleteAccounts) => {
    setLocations((prev) =>
      prev.filter((c) => !toDeleteAccounts.includes(c.locationAccountNo))
    );
  };

  /** Cancel form or detail view */
  const handleCancel = () => setView("list");

  /** Render header with title and actions */
  const renderHeader = () => {
    let title = "locations";
    let action = null;

    if (view === "list") {
      action = <Button onClick={handleAddLocation}>Add Location</Button>;
    } else if (view === "form") {
      title = selectedLocation ? "Edit Location" : "New Location";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      );
    } else if (view === "details") {
      title = "Location Details";
      action = (
        <Button variant="secondary" onClick={handleCancel}>
          Back to List
        </Button>
      );
    }

    return (
      <div className="flex justify-between ">
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        {action}
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-lg ">
      <div>
        {view === "list" && (
          <Location
            locations={location}
            handleAddLocation={handleAddLocation}
            onView={handleViewLocation}
            onDelete={handleDeleteLocation}
          />
        )}

        {view === "form" && (
          <LocationForm
            location={selectedLocation}
            handleAddLocation={handleAddLocation}
            handleCancel={handleCancel}
          />
        )}
        {view === "details" && selectedLocation && (
          <LocationViewPage
            location={selectedLocation}
            onEdit={() => setView("form")}
            onBack={handleCancel}
          />
        )}
      </div>
    </div>
  );
};


export default LocationPage