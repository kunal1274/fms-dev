// import React, { useState, useEffect, useCallback } from "react";
// import axios from "axios";
// import { useNavigate, useLocation } from "react-router-dom";
// import { toast, ToastContainer } from "react-toastify";

// // API endpoints
// const itemsBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/items";
// const vendorsBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/vendors";
// const purchasesOrderUrl =
//   "https://fms-qkmw.onrender.com/fms/api/v0/purchaseorders";
// // mergedUrl is the same as purchasesOrderUrl for update and payment requests.
// const mergedUrl = purchasesOrderUrl;

// const PaymentModal = ({ onClose, onSubmit, loading }) => {
//   console.log("PaymentModal rendered");
//   const [amount, setAmount] = useState("");
//   const [transactionId, setTransactionId] = useState("");
//   const [paymentMode, setPaymentMode] = useState("Cash");
//   // New state for payment date with default value formatted for input "datetime-local"
//   const [paymentDate, setPaymentDate] = useState(
//     new Date().toISOString().slice(0, 16)
//   );

//   const handleSubmit = () => {
//     console.log("PaymentModal: handleSubmit called");
//     if (!amount || isNaN(amount)) {
//       toast.error("Please enter a valid amount");
//       console.log("PaymentModal: Invalid amount", amount);
//       return;
//     }
//     const paymentData = {
//       amount: parseFloat(amount),
//       transactionId,
//       paymentMode,
//       date: new Date(paymentDate),
//     };
//     console.log("Submitting payment:", paymentData);
//     onSubmit(paymentData);
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
//       <div className="bg-white p-6 rounded-2xl shadow-2xl w-96 transform transition-all duration-300 relative">
//         {/* Close Button */}
//         <button
//           onClick={() => {
//             console.log("PaymentModal: onClose clicked");
//             onClose();
//           }}
//           className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
//         >
//           <span style={{ fontSize: "20px", fontWeight: "bold" }}>X</span>
//         </button>

//         <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
//           Create Payment
//         </h2>

//         {/* Amount Input */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Amount
//           </label>
//           <input
//             type="number"
//             value={amount}
//             onChange={(e) => {
//               console.log("PaymentModal: Amount changed to", e.target.value);
//               setAmount(e.target.value);
//             }}
//             className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//             placeholder="Enter amount"
//           />
//         </div>

//         {/* Transaction ID Input */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Transaction ID
//           </label>
//           <input
//             type="text"
//             value={transactionId}
//             onChange={(e) => {
//               console.log(
//                 "PaymentModal: Transaction ID changed to",
//                 e.target.value
//               );
//               setTransactionId(e.target.value);
//             }}
//             className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//             placeholder="Enter transaction ID"
//           />
//         </div>

//         {/* Payment Mode Select */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Payment Mode
//           </label>
//           <select
//             value={paymentMode}
//             onChange={(e) => {
//               console.log(
//                 "PaymentModal: Payment mode changed to",
//                 e.target.value
//               );
//               setPaymentMode(e.target.value);
//             }}
//             className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//           >
//             <option value="Cash">Cash</option>
//             <option value="CreditCard">Credit Card</option>
//             <option value="DebitCard">Debit Card</option>
//             <option value="Online">Online</option>
//             <option value="UPI">UPI</option>
//             <option value="Crypto">Crypto</option>
//             <option value="Barter">Barter</option>
//           </select>
//         </div>

//         {/* Payment Date Input */}
//         <div className="mb-6">
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Payment Date
//           </label>
//           <input
//             type="datetime-local"
//             value={paymentDate}
//             onChange={(e) => {
//               console.log(
//                 "PaymentModal: Payment date changed to",
//                 e.target.value
//               );
//               setPaymentDate(e.target.value);
//             }}
//             className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//           />
//         </div>

//         {/* Buttons */}
//         <div className="flex justify-end gap-1">
//           <button
//             onClick={() => {
//               console.log("PaymentModal: Cancel clicked");
//               onClose();
//             }}
//             disabled={loading}
//             className="px-5 py-2 text-sm rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 transition"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={loading}
//             className="px-5 py-2 text-sm rounded-lg border bg-blue-500 text-white hover:bg-blue-600 transition"
//           >
//             {loading ? "Processing..." : "OK"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const PaymentHistoryModal = ({ onClose, payments }) => {
//   console.log("PaymentHistoryModal rendered with payments:", payments);
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//       <div className="bg-white p-4 rounded shadow-md max-w-lg w-full">
//         <h2 className="text-xl font-bold mb-4">Payment History</h2>
//         {payments && payments.length > 0 ? (
//           <table className="w-full text-sm border-collapse">
//             <thead>
//               <tr>
//                 <th className="border p-2">Amount</th>
//                 <th className="border p-2">Date</th>
//                 <th className="border p-2">Transaction ID</th>
//                 <th className="border p-2">Payment Mode</th>
//               </tr>
//             </thead>
//             <tbody>
//               {payments.map((payment, index) => (
//                 <tr key={index}>
//                   <td className="border p-2">{payment.amount.toFixed(2)}</td>
//                   <td className="border p-2">
//                     {new Date(payment.date).toLocaleString()}
//                   </td>
//                   <td className="border p-2">{payment.transactionId || ""}</td>
//                   <td className="border p-2">{payment.paymentMode}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <p>No payments found.</p>
//         )}
//         <div className="flex justify-end mt-4">
//           <button
//             onClick={() => {
//               console.log("PaymentHistoryModal: Close clicked");
//               onClose();
//             }}
//             className="px-3 py-2 border rounded text-sm bg-gray-100 hover:bg-gray-200"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const PurchaseOrderViewPage = ({ PurchaseId }) => {
//   console.log("PurchaseOrderViewPage rendered with PurchaseId:", PurchaseId);
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Component states
//   const [inputpurchaseId, setInputPurchaseId] = useState("");
//   const [purchaseData, setPurchaseData] = useState(null);
//   const [items, setItems] = useState([]);
//   const [vendors, setvendors] = useState([]);
//   const [remarks, setRemarks] = useState("");
//   const [isEdited, setIsEdited] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [isDraft, setIsDraft] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [discount, setDiscount] = useState(purchaseData?.discount || 0);
//   const [tcs, setTcs] = useState(purchaseData?.withholdingTax || 0);
//   // Payment modal states
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
//   const [netAR, setNetAR] = useState(0);

//   // Global form states
//   const [selectedvendor, setSelectedvendor] = useState("");
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [price, setPrice] = useState(0);
//   const [unit, setUnit] = useState("N/A");
//   const [type, setType] = useState("N/A");
//   const [tax, setTax] = useState(0);
//   const [charges, setCharges] = useState(0);
//   const [lineAmt, setLineAmt] = useState("0.00");
//   const [advance, setAdvance] = useState(0);
//   const [purchasesAddress, setpurchasesAddress] = useState(null);
//   const [quantity, setQuantity] = useState(
//     purchaseData?.quantity ? String(purchaseData.quantity) : "1"
//   );

//   // Update local state if purchaseData.quantity changes.
//   useEffect(() => {
//     console.log(
//       "useEffect: purchaseData.quantity changed to",
//       purchaseData?.quantity
//     );
//     if (purchaseData?.quantity) {
//       setQuantity(String(purchaseData.quantity));
//     }
//   }, [purchaseData?.quantity]);

//   // Additional states
//   const [purchaseOrderNum, setpurchaseOrderNum] = useState(null);
//   const [status, setStatus] = useState("Draft");
//   const [_id, set_id] = useState("");
//   const [summary, setSummary] = useState({
//     totalLines: 0,
//     totalNetAmount: 0,
//     totalDiscountAmount: 0,
//     totalTaxAmount: 0,
//     totalWithholdingTax: 0,
//     totalNetAmountAfterTax: 0,
//     totalLineAmount: 0,
//   });
//   const [selectedvendorDetails, setSelectedvendorDetails] = useState({
//     contactNum: "",
//     currency: "",
//     address: "",
//   });
//   const [itemDetails, setItemDetails] = useState({
//     code: "",
//     name: "",
//     type: "",
//     unit: "",
//     price: 0,
//     id: "",
//   });
//   const [originalpurchaseData, setOriginalpurchaseData] = useState(null);
//   // Initial line item (for single item form)
//   const [lineItems, setLineItems] = useState([
//     {
//       id: Date.now(),
//       itemId: "",
//       itemName: "",
//       itemCode: "",
//       unit: "",
//       quantity: 1,
//       price: 0,
//       discount: 0,
//       Status: "draft",
//       charges: 0,
//       tax: 0,
//       tcs: 0,
//       tds: 0,
//       lineAmt: 0,
//       amountBeforeTax: 0,
//     },
//   ]);

//   // Handler to activate edit mode and save backup data
//   const handleEdit = () => {
//     console.log("handleEdit called");
//     setOriginalpurchaseData({ ...purchaseData });
//     setIsEdited(true);
//     setIsEditing(true);
//   };

//   // Fetch vendors and items once
//   useEffect(() => {
//     console.log("useEffect: Fetching vendors and items");
//     const fetchvendors = async () => {
//       try {
//         console.log("Fetching vendors...");
//         const response = await axios.get(vendorsBaseUrl);
//         console.log("Fetched vendors:", response.data.data);
//         setvendors(response.data.data || []);
//       } catch (error) {
//         console.error("Error fetching vendors:", error);
//       }
//     };

//     const fetchItems = async () => {
//       try {
//         console.log("Fetching items...");
//         const response = await axios.get(itemsBaseUrl);
//         console.log("Fetched items:", response.data.data);
//         setItems(response.data.data || []);
//       } catch (error) {
//         console.error("Error fetching items:", error);
//       }
//     };

//     fetchvendors();
//     fetchItems();
//   }, []);

//   // Consolidated global line amount calculation for single item form
//   useEffect(() => {
//     console.log("useEffect: Recalculating line amount", {
//       quantity,
//       price,
//       discount,
//       tax,
//       tcs,
//     });
//     const discountAmount =
//       (Number(discount) * Number(quantity) * Number(price)) / 100;
//     const computedAmountBeforeTax =
//       Number(quantity) * Number(price) - discountAmount;
//     const taxAmount = (computedAmountBeforeTax * Number(tax)) / 100;
//     const tcsAmount = (computedAmountBeforeTax * Number(tcs)) / 100;
//     const computedTotalAmount = computedAmountBeforeTax + taxAmount + tcsAmount;
//     setLineAmt(
//       isNaN(computedTotalAmount) ? "0.00" : computedTotalAmount.toFixed(2)
//     );
//   }, [quantity, price, discount, tax, tcs, selectedItem, items]);

//   // Pre-calculate amountBeforeTax for table display
//   const discountAmountForDisplay =
//     (Number(discount) * Number(quantity) * Number(price)) / 100;
//   const amountBeforeTax =
//     Number(quantity) * Number(price) - discountAmountForDisplay;

//   // Fetch purchase detail by ID
//   const fetchPurchaseDetail = useCallback(async (id) => {
//     console.log("fetchPurchaseDetail called with id:", id);
//     setLoading(true);
//     setError("");
//     try {
//       const response = await axios.get(`${purchasesOrderUrl}/${id}`);
//       console.log("API response in fetchPurchaseDetail:", response);
//       if (response.status === 200) {
//         const data = response.data.data || {};
//         setPurchaseData(data);
//         console.log("Fetched purchase Data:", data);
//       } else {
//         const msg = `Unexpected response status: ${response.status}`;
//         setError(msg);
//         toast.error(msg);
//         console.error(msg);
//       }
//     } catch (error) {
//       const errorMessage =
//         error.response?.data?.message ||
//         "An unexpected error occurred. Please try again.";
//       setError(errorMessage);
//       toast.error(errorMessage);
//       console.error("Error in fetchPurchaseDetail:", errorMessage);
//     } finally {
//       setLoading(false);
//       console.log("fetchPurchaseDetail finished");
//     }
//   }, []);

//   // Automatically fetch purchase details if PurchaseId is provided
//   useEffect(() => {
//     console.log("useEffect: Checking for PurchaseId prop", PurchaseId);
//     if (PurchaseId) {
//       setInputPurchaseId(PurchaseId);
//       fetchPurchaseDetail(PurchaseId);
//     }
//   }, [PurchaseId, fetchPurchaseDetail]);

//   // Update isDraft flag based on purchaseData.status
//   useEffect(() => {
//     console.log(
//       "useEffect: Updating isDraft based on purchaseData.status",
//       purchaseData?.status
//     );
//     setIsDraft(purchaseData?.status === "Draft");
//   }, [purchaseData]);

//   // Handle search by purchase ID (if needed)
//   const handleSearch = () => {
//     console.log("handleSearch called with inputpurchaseId:", inputpurchaseId);
//     if (!inputpurchaseId.trim()) {
//       toast.warn("Please enter a purchase ID.");
//       console.warn("handleSearch: No purchase ID entered");
//       return;
//     }
//     fetchPurchaseDetail(inputpurchaseId);
//   };

//   // Recalculate netAR when purchaseData is updated
//   useEffect(() => {
//     console.log("useEffect: Recalculating netAR");
//     if (purchaseData) {
//       const paidAmount = purchaseData?.paidAmt
//         ? purchaseData.paidAmt.reduce((a, b) => a + b, 0)
//         : 0;
//       const updatedNetAR = (purchaseData?.netAmtAfterTax || 0) - paidAmount;
//       setNetAR(updatedNetAR);
//       console.log("Calculated netAR:", updatedNetAR);
//     }
//   }, [purchaseData]);

//   // Cancel edit by restoring original purchase data
//   const handleEditCancel = () => {
//     console.log("handleEditCancel called");
//     setPurchaseData(originalpurchaseData);
//     setIsEdited(false);
//     setIsEditing(false);
//   };

//   // Status button labels and mapping for allowed transitions
//   const buttonLabels = [
//     { id: "Confirm", label: "Confirmed" },
//     { id: "Cancel", label: "Cancelled" },
//     { id: "Draft", label: "Draft" },
//     { id: "Recived", label: "Recived" },
//     { id: "Deliver", label: "Delivered" },
//     { id: "Invoice", label: "Invoiced" },
//     { id: "Admin Mode", label: "AdminMode" },
//     { id: "Any Mode", label: "AnyMode" },
//   ];

//   const enabledButtons = {
//     Draft: ["Confirmed", "Cancelled", "AdminMode", "AnyMode"],
//     Confirmed: ["Recived", "Cancelled", "AdminMode", "AnyMode"],
//     Recived: ["Delivered", "Cancelled", "AdminMode", "AnyMode"],
//     Delivered: ["Invoiced", "AdminMode", "AnyMode"],
//     Invoiced: ["AdminMode", "AnyMode"],
//     Cancelled: ["AdminMode", "AnyMode"],
//     AdminMode: ["Draft", "AnyMode"],
//     AnyMode: [
//       "Draft",
//       "Confirmed",
//       "Recived",
//       "Delivered",
//       "Invoiced",
//       "Cancelled",
//       "AdminMode",
//     ],
//   };

//   const isButtonEnabled = (button) => {
//     const enabled =
//       enabledButtons[purchaseData?.status]?.includes(button) ?? false;
//     console.log(
//       `isButtonEnabled: For status ${purchaseData?.status}, button ${button} enabled?`,
//       enabled
//     );
//     return enabled;
//   };

//   // Handle purchase update
//   const handleUpdate = async () => {
//     console.log("handleUpdate called");
//     if (window.confirm("Are you sure you want to update this purchase?")) {
//       setLoading(true);
//       setError(""); // Clear previous errors
//       try {
//         // Merge individual states into the purchaseData
//         const updatedData = {
//           ...purchaseData,
//           item: selectedItem ? selectedItem._id : purchaseData.item?._id,
//           quantity,
//           price,
//           discount,
//           tax,
//           tcs,
//           // Include other edited fields if necessary
//         };
//         console.log("Updating purchase with data:", updatedData);

//         const response = await axios.put(
//           `${mergedUrl}/${PurchaseId}`, // Use PurchaseId (the prop) consistently
//           updatedData,
//           { withCredentials: false }
//         );

//         if (response.status === 200) {
//           toast.info("Updating the vendor...", { autoClose: 1000 });
//           console.log("Update response:", response.data);
//           setTimeout(() => {
//             setPurchaseData(response.data.data);
//             toast.success("Purchase updated successfully!");
//             setIsEditing(false);
//             console.log("Purchase data updated:", response.data.data);
//           }, 1000);
//         } else {
//           throw new Error(`Unexpected response status: ${response.status}`);
//         }
//       } catch (err) {
//         const errorMessage =
//           err.response?.data?.message || "An unexpected error occurred.";
//         setError(errorMessage);
//         toast.error(errorMessage);
//         console.error("handleUpdate error:", errorMessage);
//       } finally {
//         setLoading(false);
//         console.log("handleUpdate finished");
//       }
//     }
//   };

//   // Handle status update
//   const handleStatusUpdate = async (newStatus) => {
//     console.log("handleStatusUpdate called with newStatus:", newStatus);
//     if (!isButtonEnabled(newStatus)) {
//       toast.error("Status change not allowed in current state.");
//       console.warn("Status update not allowed for:", newStatus);
//       return;
//     }
//     if (
//       window.confirm(`Are you sure you want to change status to ${newStatus}?`)
//     ) {
//       setLoading(true);
//       try {
//         const patchUrl = `${mergedUrl}/${PurchaseId}/status`; // Use PurchaseId consistently
//         console.log("Patching status at:", patchUrl);
//         const response = await axios.patch(
//           patchUrl,
//           { newStatus },
//           { withCredentials: false }
//         );
//         if (response.status === 200) {
//           setPurchaseData(response.data.data || response.data);
//           toast.success(`Status updated to ${newStatus}`);
//           console.log("Status update successful:", response.data);
//         } else {
//           toast.error(`Error: Unexpected response status ${response.status}`);
//           console.error(
//             "Unexpected response status in status update:",
//             response.status
//           );
//         }
//       } catch (err) {
//         const errorMessage =
//           err.response?.data?.message ||
//           "An unexpected error occurred while updating status.";
//         toast.error(errorMessage);
//         console.error("handleStatusUpdate error:", errorMessage);
//       } finally {
//         setLoading(false);
//         console.log("handleStatusUpdate finished");
//       }
//     }
//   };

//   // Navigate to invoice page
//   const handleInvoice = () => {
//     console.log("handleInvoice called");
//     navigate(`/invoice/${PurchaseId}`); // Use PurchaseId consistently
//   };

//   // Handle payment submission
//   const handlePaymentSubmit = async (paymentData) => {
//     console.log("handlePaymentSubmit called with:", paymentData);
//     setLoading(true);
//     try {
//       const response = await axios.post(
//         `${mergedUrl}/${PurchaseId}/payment`, // Use PurchaseId consistently
//         paymentData,
//         { withCredentials: false }
//       );
//       console.log("Payment submission response:", response.data);
//       // Assuming API returns updated purchase data with payments in response.data.data
//       setPurchaseData(response.data.data || response.data);
//       toast.success("Payment created successfully!");
//       setShowPaymentModal(false);
//     } catch (error) {
//       const errorMessage =
//         error.response?.data?.message ||
//         "An error occurred while submitting payment.";
//       toast.error(errorMessage);
//       console.error("handlePaymentSubmit error:", errorMessage);
//     } finally {
//       setLoading(false);
//       console.log("handlePaymentSubmit finished");
//     }
//   };

//   // Update vendor details when selectedvendor changes
//   useEffect(() => {
//     console.log("useEffect: selectedvendor changed to", selectedvendor);
//     if (selectedvendor) {
//       const vendor = vendors.find((c) => c._id === selectedvendor);
//       if (vendor) {
//         console.log("Found selected vendor:", vendor);
//         setSelectedvendorDetails({
//           contactNum: vendor.contactNum || "",
//           currency: vendor.currency || "",
//           address: vendor.address || "",
//         });
//       }
//     } else {
//       setSelectedvendorDetails({
//         contactNum: "",
//         currency: "",
//         address: "",
//       });
//     }
//   }, [selectedvendor, vendors]);

//   // Navigate back using local handler
//   const goBackHandler = () => {
//     console.log("goBackHandler called");
//     navigate(-1);
//   };

//   if (loading) {
//     console.log("Rendering loading state");
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
//         <div className="w-16 h-16 border-4 border-zinc-500 border-t-transparent border-solid rounded-full animate-spin"></div>
//         <p className="mt-4 text-zinc-500 text-lg font-medium">
//           Purchase order view Page...
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="">
//       <ToastContainer />
//       {/* Page Header */}
//       <h1 className="text-xl font-bold mb-4">Purchase Order View Page</h1>

//       <div className="flex flex-wrap gap-2">
//         {/* Maintain Section */}
//         <div className="p-2 h-17 bg-white">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="flex flex-col gap-2 p-4 border rounded-lg bg-gray-50">
//               <h2 className="text-sm font-semibold text-gray-700">Maintain</h2>
//               <div className="flex flex-wrap gap-2">
//                 <button
//                   onClick={() => {
//                     console.log("Invoice button clicked");
//                     handleInvoice();
//                   }}
//                   className="px-3 py-1 text-xs font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-100"
//                 >
//                   Invoice
//                 </button>
//                 <button
//                   onClick={handleUpdate}
//                   disabled={loading}
//                   className={`px-3 py-1 text-xs font-medium border rounded-md transition ${
//                     loading
//                       ? "bg-gray-300 cursor-not-allowed"
//                       : "bg-white border-gray-300 hover:bg-gray-100"
//                   }`}
//                 >
//                   {loading ? "Saving..." : "Save"}
//                 </button>
//                 <button
//                   onClick={() => {
//                     console.log("Edit button clicked");
//                     handleEdit();
//                   }}
//                   className="px-3 py-1 text-xs font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-100"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => {
//                     console.log("Cancel edit button clicked");
//                     handleEditCancel();
//                   }}
//                   disabled={!isEditing}
//                   className={`px-3 py-1 text-xs font-medium border border-gray-300 rounded-md ${
//                     isEditing
//                       ? "bg-white hover:bg-gray-100"
//                       : "bg-gray-200 cursor-not-allowed"
//                   }`}
//                 >
//                   Cancel edit
//                 </button>
//                 <button
//                   onClick={() => {
//                     console.log("Close button clicked");
//                     goBackHandler();
//                   }}
//                   className="px-3 py-1 text-xs font-medium text-red-600 bg-white border border-red-400 rounded-md hover:bg-red-50"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>

//             {/* Status Change Section */}
//             <div className="flex flex-col gap-2 p-4 border rounded-lg bg-gray-50">
//               <h2 className="text-sm font-semibold text-gray-700">
//                 Status Change
//               </h2>
//               <div className="flex flex-wrap gap-2">
//                 {buttonLabels.map((button) => (
//                   <button
//                     key={button.id}
//                     type="button"
//                     className={`px-3 py-1 text-xs font-medium border rounded-md transition-all ${
//                       isButtonEnabled(button.label)
//                         ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
//                         : "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
//                     }`}
//                     disabled={!isButtonEnabled(button.label) || loading}
//                     onClick={() => {
//                       console.log("Status button clicked:", button.label);
//                       handleStatusUpdate(button.label);
//                     }}
//                   >
//                     {button.id}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Settlement Section */}
//             <div className="flex flex-col gap-2 p-4 border rounded-lg bg-gray-50">
//               <h2 className="text-sm font-semibold text-gray-700">
//                 Settlement
//               </h2>
//               <div className="flex flex-wrap gap-2">
//                 <button
//                   onClick={() => {
//                     console.log("Create Payment button clicked");
//                     setShowPaymentModal(true);
//                   }}
//                   className="px-3 py-1 text-xs font-medium text-white bg-green-600 border border-green-500 rounded-md hover:bg-green-700"
//                 >
//                   Create Payment
//                 </button>
//                 <button
//                   onClick={() => {
//                     console.log("View Payments button clicked");
//                     setShowPaymentHistoryModal(true);
//                   }}
//                   className="px-3 py-1 text-xs font-medium text-white bg-blue-600 border border-blue-500 rounded-md hover:bg-blue-700"
//                 >
//                   View Payments
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {error && <p className="text-red-500 mb-4">{error}</p>}
//       {!loading && purchaseData && (
//         <div className="bg-white p-6 rounded-lg shadow-lg w-full">
//           {/* Purchase Details Section */}
//           <div className="grid gap-6 mb-4 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1">
//             <div className="flex flex-col">
//               <label className="font-bold">Purchase Order</label>
//               <input
//                 type="text"
//                 value={purchaseData?.orderNum || ""}
//                 disabled
//                 className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300 bg-gray-100 cursor-not-allowed"
//                 readOnly
//               />
//             </div>
//             <div className="flex flex-col">
//               <label className="font-bold">Purchase Invoiced Number</label>
//               <input
//                 type="text"
//                 value={purchaseData?.invoiceNum || ""}
//                 disabled
//                 className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300 bg-gray-100 cursor-not-allowed"
//                 readOnly
//               />
//             </div>
//             <div className="flex flex-col">
//               <label className="font-bold">Purchase Invoiced Date</label>
//               <input
//                 type="text"
//                 value={
//                   purchaseData?.invoiceDate
//                     ? new Date(purchaseData.invoiceDate).toLocaleString()
//                     : "N/A"
//                 }
//                 disabled
//                 className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300 bg-gray-100 cursor-not-allowed"
//                 readOnly
//               />
//             </div>
//             <div className="flex flex-col">
//               <label className="font-bold">Vendor Name</label>
//               <select
//                 disabled={!isEdited}
//                 value={purchaseData.vendor?._id || selectedVendor}
//                 onChange={(e) => {
//                   const vendorId = e.target.value;
//                   console.log("vendor select changed to:", vendorId);
//                   setSelectedVendor(vendorId);
//                   const vendor = vendors.find((c) => c._id === vendorId);
//                   setPurchaseData({ ...purchaseData, vendor });
//                 }}
//                 className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
//               >
//                 <option value="">Select vendor</option>
//                 {vendors.map((vendor) => (
//                   <option key={vendor._id} value={vendor._id}>
//                     {vendor.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="flex flex-col">
//               <label className="font-semibold text-gray-700">
//                 Contact Number
//               </label>
//               <input
//                 type="text"
//                 value={
//                   purchaseData.vendor?.contactNum ||
//                   selectedvendorDetails.contactNum
//                 }
//                 readOnly
//                 className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300 bg-gray-100 cursor-not-allowed"
//               />
//             </div>
//             <div className="flex flex-col">
//               <label className="font-semibold text-gray-700">Currency</label>
//               <input
//                 type="text"
//                 value={
//                   purchaseData.vendor?.currency ||
//                   selectedvendorDetails.currency
//                 }
//                 readOnly
//                 className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300 bg-gray-100 cursor-not-allowed"
//               />
//             </div>
//             <div className="flex flex-col">
//               <label className="font-semibold text-gray-700">Status</label>
//               <input
//                 type="text"
//                 value={purchaseData.status || ""}
//                 disabled
//                 readOnly
//                 className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300 bg-gray-100 cursor-not-allowed"
//               />
//             </div>
//             <div className="flex flex-col">
//               <label className="font-semibold text-gray-700">Advance</label>
//               <input
//                 type="number"
//                 value={purchaseData.advance || ""}
//                 onChange={(e) => {
//                   console.log("Advance changed to:", e.target.value);
//                   setPurchaseData({ ...purchaseData, advance: e.target.value });
//                 }}
//                 disabled={!isEditing}
//                 className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
//               />
//             </div>
//             <div className="flex flex-col">
//               <label className="font-semibold text-gray-700">
//                 vendor Address
//               </label>
//               <textarea
//                 value={purchaseData.purchasesAddress || ""}
//                 onChange={(e) => {
//                   console.log("vendor address changed to:", e.target.value);
//                   setPurchaseData({
//                     ...purchaseData,
//                     purchasesAddress: e.target.value,
//                   });
//                 }}
//                 rows="4"
//                 disabled={!isEditing}
//                 className="border border-gray-300 rounded-lg p-1 w-full focus:outline-none focus:ring focus:ring-blue-300"
//               />
//             </div>
//             <div className="flex flex-col">
//               <label className="font-semibold text-gray-700">Remarks</label>
//               <textarea
//                 value={purchaseData.remarks || ""}
//                 onChange={(e) => {
//                   console.log("Remarks changed to:", e.target.value);
//                   setPurchaseData({ ...purchaseData, remarks: e.target.value });
//                 }}
//                 rows="4"
//                 disabled={!isEditing}
//                 className="border border-gray-300 rounded-lg p-1 w-full focus:outline-none focus:ring focus:ring-blue-300"
//               />
//             </div>
//           </div>

//           {/* Line Item Table */}
//           <div className="overflow-x-auto max-h-96 mt-4">
//             <div className="space-y-6">
//               <div className="overflow-x-auto overflow-y-auto max-w-full">
//                 <table className="min-w-full border-collapse border border-gray-300 text-sm text-gray-700">
//                   <thead className="bg-gray-100 text-gray-900 uppercase text-xs font-semibold">
//                     <tr>
//                       <th className="border p-1 text-center">S.N</th>
//                       <th className="border p-1 text-center">Item Code</th>
//                       <th className="border p-1 w-60 text-center">Item Name</th>
//                       <th className="border p-1 text-center">Qty</th>
//                       <th className="border p-1 text-center">QQty</th>
//                       <th className="border p-1 text-center">Unit</th>
//                       <th className="border p-1 text-center">Price</th>
//                       <th className="border p-1 text-center">Type</th>
//                       <th className="border p-1 text-center">Discount %</th>
//                       <th className="border p-1 text-center">Amount</th>
//                       <th className="border p-1 text-center">Tax %</th>
//                       <th className="border p-1 text-center">TCS/TDS %</th>
//                       <th className="border p-1 text-center">Total Amount</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     <tr key="purchases-order-row" className="hover:bg-gray-50">
//                       <td className="border text-center p-1">1</td>
//                       <td className="border p-1">
//                         {selectedItem?.code || purchaseData?.item?.code || ""}
//                       </td>
//                       <td className="border p-1">
//                         <select
//                           value={
//                             selectedItem?._id || purchaseData?.item?._id || ""
//                           }
//                           disabled={!isEdited && !isEditing}
//                           onChange={(e) => {
//                             console.log(
//                               "Item select changed to:",
//                               e.target.value
//                             );
//                             const sel = items.find(
//                               (item) => item._id === e.target.value
//                             );
//                             setSelectedItem(sel);
//                             setPurchaseData((prev) => ({
//                               ...prev,
//                               item: sel,
//                             }));
//                           }}
//                           className="border rounded p-1 text-left w-60"
//                         >
//                           <option value="">Select Item</option>
//                           {items.map((itemOption) => (
//                             <option key={itemOption._id} value={itemOption._id}>
//                               {itemOption.name}
//                             </option>
//                           ))}
//                         </select>
//                       </td>
//                       <td className="border p-1">
//                         <input
//                           type="text"
//                           className="border rounded p-1 text-center w-24"
//                           value={quantity}
//                           onChange={(e) => {
//                             console.log("Quantity changed to:", e.target.value);
//                             setQuantity(Number(e.target.value) || 0);
//                           }}
//                           disabled={!isEditing}
//                         />
//                       </td>{" "}
//                       <td className="border p-1">
//                         <input
//                           type="text"
//                           className="border rounded p-1 text-center w-24"
//                           value={quantity}
//                           // onChange={(e) => {
//                           //   console.log("Quantity changed to:", e.target.value);
//                           //   setQuantity(Number(e.target.value) || 0);
//                           // }}
//                           disabled={!isEditing}
//                         />
//                       </td>
//                       <td className="border p-1">
//                         <input
//                           type="text"
//                           className="border rounded p-1 text-center w-24"
//                           value={
//                             selectedItem?.unit || purchaseData?.item?.unit || ""
//                           }
//                           onChange={(e) => {
//                             console.log("Unit changed to:", e.target.value);
//                             setUnit(e.target.value);
//                           }}
//                           disabled={!isEditing}
//                         />
//                       </td>
//                       <td className="border p-1">
//                         <input
//                           type="text"
//                           className="border rounded p-1 text-center w-24"
//                           value={
//                             selectedItem?.price ||
//                             purchaseData?.item?.price ||
//                             ""
//                           }
//                           onChange={(e) => {
//                             console.log("Price changed to:", e.target.value);
//                             setPrice(Number(e.target.value) || 0);
//                           }}
//                           disabled={!isEditing}
//                         />
//                       </td>
//                       <td className="border p-1">
//                         <input
//                           type="text"
//                           disabled={!isEditing}
//                           className="border rounded p-1 text-center w-24"
//                           value={
//                             purchaseData.item?.type || selectedItem?.type || ""
//                           }
//                           onChange={(e) => {
//                             console.log("Type changed to:", e.target.value);
//                             setType(e.target.value);
//                           }}
//                         />
//                       </td>
//                       <td className="border p-1">
//                         <input
//                           type="number"
//                           className="border rounded p-1 text-center w-24"
//                           value={discount || purchaseData.discount}
//                           onChange={(e) => {
//                             let newDiscount = Number(e.target.value);
//                             console.log("Discount changed to:", newDiscount);
//                             if (newDiscount < 0) newDiscount = 0;
//                             if (newDiscount > 99) newDiscount = 99;
//                             setDiscount(newDiscount);
//                             setPurchaseData((prev) => ({
//                               ...prev,
//                               discount: newDiscount,
//                             }));
//                           }}
//                           min="0"
//                           max="99"
//                           disabled={!isEditing}
//                         />
//                       </td>
//                       <td className="border p-1">
//                         {isNaN(amountBeforeTax)
//                           ? "0.00"
//                           : parseFloat(amountBeforeTax).toFixed(2)}
//                       </td>
//                       <td className="border p-1">
//                         <input
//                           type="text"
//                           className="border rounded p-1 text-center w-24"
//                           value={tax || purchaseData.tax}
//                           onChange={(e) => {
//                             let newTax = e.target.value;
//                             console.log("Tax changed to:", newTax);
//                             if (newTax.length > 2) return;
//                             setTax(Number(newTax) || 0);
//                           }}
//                           disabled={!isEditing}
//                         />
//                       </td>
//                       <td className="border p-1">
//                         <input
//                           type="number"
//                           className="border rounded p-1 text-center w-24"
//                           value={tcs || purchaseData.withholdingTax}
//                           onChange={(e) => {
//                             let newTcs = e.target.value;
//                             console.log("TCS/TDS changed to:", newTcs);
//                             if (newTcs.length > 2) return;
//                             setTcs(Number(newTcs) || 0);
//                             setPurchaseData((prev) => ({
//                               ...prev,
//                               withholdingTax: Number(newTcs) || 0,
//                             }));
//                           }}
//                           disabled={!isEditing}
//                         />
//                       </td>
//                       <td className="border p-1 text-center">{lineAmt}</td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>

//               {/* Summary Section */}
//               <div className="summary border p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded shadow-sm">
//                 <div className="flex flex-col">
//                   <span className="text-sm text-gray-600">Charges</span>
//                   <span className="text-lg font-semibold text-gray-800">
//                     {purchaseData.charges || 0}
//                   </span>
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-sm text-gray-600">Combined Paid</span>
//                   <span className="text-lg font-semibold text-gray-800">
//                     {purchaseData.combinedPaid || 0}
//                   </span>
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-sm text-gray-600">Discount Amt</span>
//                   <span className="text-lg font-semibold text-gray-800">
//                     {purchaseData.discountAmt || 0}
//                   </span>
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-sm text-gray-600">Paid Amt</span>
//                   <span className="text-lg font-semibold text-gray-800">
//                     {purchaseData.totalPaid}
//                   </span>
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-sm text-gray-600">
//                     Net Amt After Tax
//                   </span>
//                   <span className="text-lg font-semibold text-gray-800">
//                     {purchaseData.netAmtAfterTax || 0}
//                   </span>
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-sm text-gray-600">Net Payment Due</span>
//                   <span className="text-lg font-semibold text-gray-800">
//                     {purchaseData.netPaymentDue || 0}
//                   </span>
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-sm text-gray-600">
//                     Withholding Tax Amt
//                   </span>
//                   <span className="text-lg font-semibold text-gray-800">
//                     {purchaseData.withholdingTaxAmt || 0}
//                   </span>
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-sm text-gray-600">
//                     Carry Forward Advance
//                   </span>
//                   <span className="text-lg font-semibold text-gray-800">
//                     {purchaseData.carryForwardAdvance || 0}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {showPaymentModal && (
//         <PaymentModal
//           onClose={() => {
//             console.log("Closing PaymentModal");
//             setShowPaymentModal(false);
//           }}
//           onSubmit={handlePaymentSubmit}
//           loading={loading}
//         />
//       )}
//       {showPaymentHistoryModal && (
//         <PaymentHistoryModal
//           onClose={() => {
//             console.log("Closing PaymentHistoryModal");
//             setShowPaymentHistoryModal(false);
//           }}
//           payments={purchaseData?.paidAmt || []}
//         />
//       )}
//     </div>
//   );
// };

// export default PurchaseOrderViewPage;
import React from 'react'

const PurchaseOrderViewPage = () => {
  return (
    <div>PurchaseOrderViewPage</div>
  )
}

export default PurchaseOrderViewPage