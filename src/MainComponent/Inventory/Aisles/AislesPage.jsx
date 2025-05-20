// import React, { useState } from "react";
// import AislesList from "./AislesList";
// import AislesForm from "./AislesForm";
// import AislesViewPage from "./AislesViewPagee";
// import { Button } from "../../../Component/Button/Button";

// export default function AislesPage() {
//   const [view, setView] = useState("list");
//   const [Aisless, setAisless] = useState([]);
//   const [selectedAisles, setSelectedAisles] = useState(null);

//   // Save or update a Aisles in state
//   const handleSaveAisles = (Aisles) => {
//     setAisless((prev) => {
//       const idx = prev.findIndex(
//         (w) => w.AislesAccountNo === Aisles.AislesAccountNo
//       );

//       if (idx !== -1) {
//         const updated = [...prev];
//         updated[idx] = Aisles;
//         return updated;
//       }
//       return [...prev, Aisles];
//     });
//     setView("list");
//   };

//   // Open the "Add Aisles" form
//   const handleAddAisles = () => {
//     setSelectedAisles(null);
//     setView("form");
//   };

//   // Show Aisles details
//   const handleViewAisles = (accountNo) => {
//     const found = Aisless.find((w) => w.AislesAccountNo === accountNo);
//     setSelectedAisles(found);
//     setView("details");
//   };

//   // Delete selected Aisless
//   const handleDeleteAisles = (toDeleteAccounts) => {
//     setAisless((prev) =>
//       prev.filter((w) => !toDeleteAccounts.includes(w.AislesAccountNo))
//     );
//   };

//   // Cancel form or detail view
//   const handleCancel = () => {
//     setView("list");
//     setSelectedAisles(null);
//   };

//   // Render header with dynamic title and actions
//   const renderHeader = () => {
//     let title = "Aisless";
//     let action = null;

//     if (view === "list") {
//       action = <Button onClick={handleAddAisles}>Add Aisles</Button>;
//     } else if (view === "form") {
//       title = selectedAisles ? "Edit Aisles" : "New Aisles";
//       action = (
//         <Button variant="secondary" onClick={handleCancel}>
//           Cancel
//         </Button>
//       );
//     } else if (view === "details") {
//       title = "Aisles Details";
//       action = (
//         <Button variant="secondary" onClick={handleCancel}>
//           Back to List
//         </Button>
//       );
//     }

//     return (
//       <div className="flex justify-between items-center mb-4">
//         {/* <h1 className="text-2xl font-semibold text-gray-800">{title}</h1> */}
//         {/* {action} */}
//       </div>
//     );
//   };

//   return (
//     <div className="w-full p-6 bg-white rounded-lg ">
//       {renderHeader()}

//       {view === "list" && (
//         <AislesList
//           Aisless={Aisless}
//         handleAddAisles={handleAddAisles}
//           onView={handleViewAisles}
//           onDelete={handleDeleteAisles}
//         />
//       )}

//       {view === "form" && (
//         <AislesForm
//           Aisles={selectedAisles}
//           onSave={handleSaveAisles}
//           onCancel={handleCancel}
//         />
//       )}

//       {view === "details" && selectedAisles && (
//         <AislesViewPage
//           Aisles={selectedAisles
            
//           }
//           onEdit={() => setView("form")}
//           onBack={handleCancel}
//         />
//       )}
//     </div>
//   );
// }
