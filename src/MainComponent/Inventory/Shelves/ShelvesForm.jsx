// import React, { useState, useEffect, useCallback } from "react";
// import axios from "axios";
// import { toast, ToastContainer } from "react-toastify";

// export default function Shelves

// Form({ handleCancel }) {
//   // ─── Form State ─────────────────────────────────────────
//   const [form, setForm] = useState({
//     ShelvesAccountNo: "",
//     name: "",
//     siteId: "",
//     type: "",
//     description: "",
//   });

//   // ─── API Bases ──────────────────────────────────────────
//   const apiBase = "https://fms-qkmw.onrender.com/fms/api/v0/Shelvess";
//   const apiSite = "https://fms-qkmw.onrender.com/fms/api/v0/sites";

//   // ─── Data Lists ─────────────────────────────────────────
//   const [Shelvess, setShelvess] = useState([]);
//   const [sites, setSites] = useState([]);

//   // ─── Helpers ───────────────────────────────────────────
//   const generateAccountNo = useCallback((list) => {
//     const lastIndex = list
//       .map((c) => parseInt(c.ShelvesAccountNo?.split("_")[1], 10))
//       .filter((n) => !isNaN(n))
//       .reduce((max, n) => Math.max(max, n), 0);
//     return `WARE_${String(lastIndex + 1).padStart(3, "0")}`;
//   }, []);

//   // ─── Load existing Shelvess & Sites once ───────────────
//   useEffect(() => {
//     (async () => {
//       try {
//         const [whRes, siteRes] = await Promise.all([
//           axios.get(apiBase),
//           axios.get(apiSite),
//         ]);

//         const whList = Array.isArray(whRes.data.data)
//           ? whRes.data.data
//           : whRes.data;
//         const rawSites = Array.isArray(siteRes.data.data)
//           ? siteRes.data.data
//           : siteRes.data;

//         setShelvess(whList);
//         setSites(rawSites);

//         setForm((prev) => ({
//           ...prev,
//           ShelvesAccountNo: generateAccountNo(whList),
//         }));
//       } catch (err) {
//         console.error("Fetch error:", err);
//         toast.error("Couldn’t load Shelvess or sites");
//       }
//     })();
//   }, [apiBase, apiSite, generateAccountNo]);

//   // ─── Handlers ────────────────────────────────────────────
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleReset = () => {
//     setForm((prev) => ({
//       ...prev,
//       ShelvesAccountNo: generateAccountNo(Shelvess),
//     }));
//   };

//   const createShelves = async (e) => {
//     e.preventDefault();
//     // Map form.siteId to API expected "site" field
//     const payload = {
//       ShelvesAccountNo: form.ShelvesAccountNo,
//       name: form.name,
//       type: form.type,
//       site: form.siteId,
//       description: form.description,
//     };
//     try {
//       await axios.post(apiBase, payload);
//       toast.success("Shelves created successfully");
//       handleCancel();
//     } catch (err) {
//       console.error("Create error:", err.response || err);
//       const msg = err.response?.data?.message || "Error creating Shelves";
//       toast.error(msg);
//     }
//   };

//   return (
//     <div>
//       <ToastContainer />

//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <div className="flex items-center space-x-4">
//           <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
//             <button
//               type="button"
//               className="text-blue-600 text-sm hover:underline"
//             >
//               Upload Photo
//             </button>
//           </div>
//           <h3 className="text-xl font-semibold">Shelves Form</h3>
//         </div>
//       </div>

//       <form
//         onSubmit={createShelves}
//         className="bg-white rounded-lg divide-y divide-gray-200"
//       >
//         {/* Business Details */}
//         <section className="p-6">
//           <h2 className="text-lg font-medium text-gray-700 mb-4">
//             Shelves Details
//           </h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//             {/* Code */}
//             <div>
//               <label className="block text-sm font-medium text-gray-600">
//                 Shelves Code
//               </label>
//               <input
//                 name="ShelvesAccountNo"
//                 value={form.ShelvesAccountNo}
//                 readOnly
//                 placeholder="Auto-generated"
//                 className="mt-1 w-full cursor-not-allowed p-2 border rounded focus:ring-2 focus:ring-blue-200"
//               />
//             </div>

//             {/* Name */}
//             <div>
//               <label className="block text-sm font-medium text-gray-600">
//                 Shelves Name
//               </label>
//               <input
//                 name="name"
//                 value={form.name}
//                 onChange={handleChange}
//                 placeholder="e.g. Central Shelves"
//                 required
//                 className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
//               />
//             </div>

//             {/* Site Select */}
//             <div>
//               <label className="block text-sm font-medium text-gray-600">
//                 Site
//               </label>
//               <select
//                 name="siteId"
//                 value={form.siteId}
//                 onChange={handleChange}
//                 required
//                 className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
//               >
//                 <option value="">Select a site…</option>
//                 {sites.length ? (
//                   sites.map((s) => (
//                     <option key={s._id} value={s._id}>
//                       {(s.siteAccountNo || s.SiteAccountNo) + " – " + s.name}
//                     </option>
//                   ))
//                 ) : (
//                   <option disabled>Loading sites...</option>
//                 )}
//               </select>
//             </div>

//             {/* Type */}
//             <div>
//               <label className="block text-sm font-medium text-gray-600">
//                 Type
//               </label>
//               <select
//                 name="type"
//                 value={form.type}
//                 onChange={handleChange}
//                 required
//                 className="mt-1 w-full p-2 border rounded"
//               >
//                 <option value="">Select type</option>
//                 <option value="Physical">Physical</option>
//                 <option value="Virtual">Virtual</option>
//               </select>
//             </div>

//             {/* Description */}
//             <div className="sm:col-span-2">
//               <label className="block text-sm font-medium text-gray-600">
//                 Shelves Description
//               </label>
//               <textarea
//                 name="description"
//                 value={form.description}
//                 onChange={handleChange}
//                 placeholder="e.g. 123 MG Road, Bengaluru, Karnataka, 560001"
//                 rows={4}
//                 required
//                 className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
//               />
//             </div>
//           </div>
//         </section>

//         {/* Action Buttons */}
//         <div className="py-6 flex items-center justify-between">
//           <button
//             type="button"
//             onClick={handleReset}
//             className="text-gray-500 hover:text-gray-700 text-sm"
//           >
//             Reset
//           </button>

//           <div className="flex gap-4">
//             <button
//               type="button"
//               onClick={handleCancel}
//               className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
//             >
//               Go Back
//             </button>
//             <button
//               type="submit"
//               className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//             >
//               Create
//             </button>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// }
