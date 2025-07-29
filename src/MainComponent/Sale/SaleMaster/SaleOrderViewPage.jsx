import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
// const { saleId } = useParams();
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const baseUrl = "https://befr8n.vercel.app";
const secondUrl = "/fms/api/v0";
const thirdUrl = "/salesorders";
const mergedUrl = `${baseUrl}${secondUrl}${thirdUrl}`;

const PaymentModal = ({ onClose, onSubmit, loading }) => {
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");

  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 16)
  );

  const handleSubmit = () => {
    if (!amount || isNaN(amount)) {
      toast.error("Please enter a valid amount");
      return;
    }
    const paymentData = {
      amount: parseFloat(amount),
      transactionId,
      paymentMode,
      date: new Date(paymentDate), // Convert string to Date object if needed by your backend
    };
    console.log("Submitting payment:", paymentData);
    onSubmit(paymentData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-96 transform transition-all duration-300 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
        >
          <x size={20} />
        </button>

        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Create Payment
        </h2>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Enter amount"
          />
        </div>

        {/* Transaction ID Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transaction ID
          </label>
          <input
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Enter transaction ID"
          />
        </div>

        {/* Payment Mode Select */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Mode
          </label>
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="Cash">Cash</option>
            <option value="CreditCard">Credit Card</option>
            <option value="DebitCard">Debit Card</option>
            <option value="Online">Online</option>
            <option value="UPI">UPI</option>
            <option value="Crypto">Crypto</option>
            <option value="Barter">Barter</option>
          </select>
        </div>

        {/* Payment Date Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Date
          </label>
          <input
            type="datetime-local"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 text-sm rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 text-sm rounded-lg border bg-blue-500 text-white hover:bg-blue-600 transition"
          >
            {loading ? "Processing..." : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Payment History Modal Component (View Payments)
const PaymentHistoryModal = ({ onClose, payments }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-md max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4">Payment History</h2>
        {payments && payments.length > 0 ? (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="border p-2">Amount</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Transaction ID</th>
                <th className="border p-2">Payment Mode</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={index}>
                  <td className="border p-2">{payment.amount.toFixed(2)}</td>
                  <td className="border p-2">
                    {new Date(payment.date).toLocaleString()}
                  </td>
                  <td className="border p-2">{payment.transactionId || 0}</td>
                  <td className="border p-2">{payment.paymentMode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No payments found.</p>
        )}
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-3 py-2 border rounded text-sm bg-gray-100 hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const SaleorderViewPage = ({ goBack, saleId }) => {
  console.log(saleId, "saleId");
  const [inputSaleId, setInputSaleId] = useState("");
  const [saleData, setSaleData] = useState(null);
  const [isEdited, setIsEdited] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // isDraft is used to conditionally allow editing for some fields.
  const [isDraft, setIsDraft] = useState(false);
  const [form, setForm] = useState({
    createdOn: "",
    site: "",
    warehouse: "",
    paymentTerms: "",
    deliveryMode: "",
    orderId: "",
  });
  // States to control modal visibility
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);

  // const navigate = useNavigate();
  const handleInputChange = (e, field, nested = false) => {
    const { value } = e.target;
    setSaleData((prev) => ({
      ...prev,
      item: nested
        ? {
            ...(prev.item || {}), // Ensure prev.item exists
            [field]: value,
          }
        : prev.item,
      ...(nested ? {} : { [field]: value }), // Update top-level fields if not nested
    }));
  };

  // Fetch sale detail by ID
  const fetchSaleDetail = useCallback(async (id) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `https://befr8n.vercel.app/fms/api/v0/salesorders/${id}`
      );

      if (response.status === 200) {
        const data = response.data.data || {};
        setSaleData(data);
        console.log(data, "Fetched Sale Data");
      } else {
        const msg = `Unexpected response status: ${response.status}`;
        setError(msg);
        toast.error(msg);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Automatically fetch sale details if saleId is provided
  useEffect(() => {
    if (saleId) {
      setInputSaleId(saleId);
      fetchSaleDetail(saleId);
    }
  }, [saleId, fetchSaleDetail]);

  // Update isDraft based on the saleData status (if available)
  useEffect(() => {
    if (saleData?.status === "Draft") {
      setIsDraft(true);
    } else {
      setIsDraft(false);
    }
  }, [saleData]);

  // Handle search (if you need to search by a new Sale ID)
  const handleSearch = () => {
    if (!inputSaleId.trim()) {
      toast.warn("Please enter a Sale ID.");
      return;
    }
    fetchSaleDetail(inputSaleId);
  };

  // Handle edit: set flags so that fields become editable
  const handleEdit = () => {
    setIsEdited(true);
    setIsEditing(true);
  };

  // Modified handleUpdate to ch  isButtonEnabled(eck if the sale order was edited before proceeding.

  // Button labels for status change
  const buttonLabels = [
    { id: "Confirm", label: "Confirmed" },
    { id: "Cancel", label: "Cancelled" },
    { id: "Draft", label: "Draft" },
    { id: "Ship", label: "Shipped" },
    { id: "Deliver", label: "Delivered" },
    { id: "Invoice", label: "Invoiced" },
    { id: "Admin Mode", label: "AdminMode" },
    { id: "Any Mode", label: "AnyMode" },
  ];

  // Define which buttons are enabled for which statuses.
  const enabledButtons = {
    Draft: ["Confirmed", "Cancelled", "AdminMode", "AnyMode"],
    Confirmed: ["Shipped", "Cancelled", "AdminMode", "AnyMode"],
    Shipped: ["Delivered", "Cancelled", "AdminMode", "AnyMode"],
    Delivered: ["Invoiced", "AdminMode", "AnyMode"],
    Invoiced: ["AdminMode", "AnyMode"],
    Cancelled: ["AdminMode", "AnyMode"],
    AdminMode: ["Draft", "AnyMode"],
    AnyMode: [
      "Draft",
      "Confirmed", // if that’s the intended label
      "Shipped",
      "Delivered",
      "Invoiced",
      "Cancelled",
      "AdminMode",
    ],
  };
  const handleUpdate = async () => {
    if (window.confirm("Are you sure you want to update this sale?")) {
      setLoading(true);
      try {
        // Prepare your updated data from saleData
        const updatedData = { ...saleData };

        // Send the PUT request with the updated data
        const response = await axios.put(
          `${mergedUrl}/${saleId}`,
          updatedData,
          { withCredentials: false }
        );

        // Update the saleData state with the response from the server
        setSaleData(response.data);
        setSaleData(response.data.data);

        // Optionally show a success message
        toast.success("Sale updated successfully!");

        // Exit edit mode
        setIsEditing(false);
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "An unexpected error occurred.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };
  // isButtonEnabled now uses saleData.status instead of an undefined variable.
  const isButtonEnabled = (button) => {
    return enabledButtons[saleData?.status]?.includes(button) ?? false;
  };

  // Define a simple handler for status button clicks.

  const handleStatusUpdate = async (newStatus) => {
    console.log("handleStatusUpdate called with newStatus:", newStatus);

    // Check if the button for the new status is enabled
    if (!isButtonEnabled(newStatus)) {
      console.error(
        "Status change not allowed in current state for status:",
        newStatus
      );
      toast.error("Status change not allowed in current state.");
      return; // Exit if status change is not allowed
    }
    console.log("Status change allowed. Proceeding with user confirmation...");

    // Ask user confirmation to proceed
    if (
      window.confirm(`Are you sure you want to change status to ${newStatus}?`)
    ) {
      console.log("User confirmed status change to:", newStatus);
      setLoading(true);
      try {
        // Build the URL for the PATCH request
        const patchUrl = `${mergedUrl}/${saleId}/status`;
        console.log("Sending PATCH request to URL:", patchUrl, "with data:", {
          newStatus: newStatus,
        });

        // Send the PATCH request
        const response = await axios.patch(
          patchUrl,
          { newStatus: newStatus },
          { withCredentials: false }
        );
        console.log("Received response: 185", response);

        // Check for success response status
        if (response.status === 200) {
          console.log(
            "Status update successful. Updating saleData with: 189",
            response.data
          );
          // Assuming API returns the updated sale data under response.data.data
          setSaleData(response.data);
          toast.success(`Status updated to ${newStatus}`);
        } else {
          console.error("Unexpected response status:", response.status);
          toast.error(`Error: Unexpected response status ${response.status}`);
        }
      } catch (err) {
        console.error("Error occurred during PATCH request:", err);
        const errorMessage =
          err.response?.data?.message ||
          "An unexpected error occurred while updating status.";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
        console.log("Loading state set to false.");
      }
    } else {
      console.log("User cancelled the status update.");
    }
  };
  // Navigate to the invoice page.
  const handleInvoice = () => {
    navigate(`/invoice/${saleId}`);
  };

  // Function to handle submitting the payment to the backend
  const handlePaymentSubmit = async (paymentData) => {
    setLoading(true);
    try {
      // Adjust the endpoint as needed for your backend
      const response = await axios.post(
        `${mergedUrl}/${saleId}/payment`,
        paymentData,
        { withCredentials: false }
      );
      console.log("Payment response:", response.data);
      setSaleData(response.data);
      toast.success("Payment created successfully!");
      // Optionally update saleData with the new payment info (e.g., response.data.data)
      // For example, if your backend returns updated sale data including the paidAmt array:
      // setSaleData(response.data.data);
      setShowPaymentModal(false);
    } catch (error) {
      console.error("Error submitting payment:", error);
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred while submitting payment.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-zinc-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-500 text-lg font-medium">Loading...</p>
      </div>
    );
  }
  return (
    <div className="container mx-auto p-2">
      {/* Page Header */}
      <h1 className="text-xl font-bold mb-4">Sales Order View Page</h1>

      {/* Parent Div that contains 3 inner Divs */}
      <div className="flex flex-wrap gap-2">
        {/* First Div: Maintain Section */}
        <div className="p-2 h-17 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Maintain Section */}
            <div className="flex flex-col gap-2 p-4 border rounded-lg bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">Maintain</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleInvoice}
                  className="px-3 py-1 text-xs font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-100"
                >
                  Invoice
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className={`px-3 py-1 text-xs font-medium border rounded-md transition ${
                    loading
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-white border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 text-xs font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={goBack}
                  className="px-3 py-1 text-xs font-medium text-red-600 bg-white border border-red-400 rounded-md hover:bg-red-50"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Status Change Section */}
            <div className="flex flex-col gap-2 p-4 border rounded-lg bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">
                Status Change
              </h2>
              <div className="flex flex-wrap gap-2">
                {buttonLabels.map((button) => (
                  <button
                    key={button.id}
                    type="button"
                    className={`px-3 py-1 text-xs font-medium border rounded-md transition-all ${
                      isButtonEnabled(button.label)
                        ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                        : "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                    }`}
                    disabled={!isButtonEnabled(button.label) || loading}
                    onClick={() => handleStatusUpdate(button.label)}
                  >
                    {button.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Settlement Section */}
            <div className="flex flex-col gap-2 p-4 border rounded-lg bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">
                Settlement
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="px-3 py-1 text-xs font-medium text-white bg-green-600 border border-green-500 rounded-md hover:bg-green-700"
                >
                  Create Payment
                </button>
                <button
                  onClick={() => setShowPaymentHistoryModal(true)}
                  className="px-3 py-1 text-xs font-medium text-white bg-blue-600 border border-blue-500 rounded-md hover:bg-blue-700"
                >
                  View Payments
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {!loading && saleData && (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full">
          {/* Sale Details Section */}
          <div className="grid gap-6 mb-4 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1">
            <div className="flex flex-col">
              <label className="font-bold">Sale Order</label>
              <input
                type="text"
                value={saleData?.orderNum || 0}
                disabled
                className="border p-2 w-full"
              />
            </div>{" "}
            <div className="flex flex-col">
              <label className="font-bold">Sale Invoiced Number</label>
              <input
                type="text"
                value={saleData?.invoiceNum || 0}
                disabled
                className="border p-2 w-full"
              />
            </div>{" "}
            <div className="flex flex-col">
              <label className="font-bold">Sale Invoiced Date</label>
              <input type="text" disabled className="border p-2 w-full" />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Customer Account
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {`${customer.code} ${customer.name}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="font-bold">Customer Name</label>
              <input
                type="text"
                value={saleData.customer?.name || 0}
                disabled={!isEdited}
                className="border p-2 w-full"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">
                Contact Number
              </label>
              <input
                type="text"
                value={saleData.customer?.contactNum || ""}
                readOnly
                className="border border-gray-300 rounded-lg p-3 w-full bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">Currency</label>
              <input
                type="text"
                value={saleData.currency || 0}
                readOnly
                className="border border-gray-300 rounded-lg p-3 w-full bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">Status</label>
              <input
                type="text"
                value={saleData.status || 0}
                placeholder="Selected Status"
                disabled
                className="border border-gray-300 bg-gray-100 text-gray-600 rounded-lg p-3 w-full cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">Advance</label>
              <input
                type="text"
                value={saleData.advance || ""}
                onChange={(e) =>
                  setSaleData({ ...saleData, advance: e.target.value })
                }
                disabled={!isEditing}
                className="border border-gray-300 rounded-lg p-3 w-full"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">
                Customer Address
              </label>
              <textarea
                value={saleData.salesAddress || 0}
                onChange={(e) =>
                  setSaleData({ ...saleData, salesAddress: e.target.value })
                }
                disabled={!isEditing}
                className="border border-gray-300 rounded-lg p-3 w-full"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Created on
              </label>
              <input
                type="text"
                value={form.createdOn || ""}
                readOnly
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Order Status
              </label>
              <input
                type="text"
                value={status}
                placeholder="Selected Status"
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                readOnly
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Site
              </label>
              <select
                name="site"
                value={form.site}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              >
                <option value="">Select</option>
                {sites.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Warehouse */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Warehouse
              </label>
              <select
                name="warehouse"
                value={form.warehouse}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              >
                <option value="">Select</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Terms of payment
              </label>
              <select
                name="paymentTerms"
                value={form.paymentTerms}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select type</option>
                {paymentTerms.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Delivery Mode
              </label>
              <input
                type="text"
                name="deliveryMode"
                value={form.deliveryMode}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Order Id
              </label>
              <input
                type="text"
                name="orderId"
                value={form.orderId}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Advance Payment Amount
              </label>
              <input
                type="text"
                name="advance"
                value={advance}
                onChange={(e) => {
                  const value = Number(e.target.value.replace(/\D/g, "")) || 0;
                  setAdvance(value);
                }}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">Remarks</label>
              <textarea
                value={saleData.remarks || ""}
                onChange={(e) =>
                  setSaleData({ ...saleData, remarks: e.target.value })
                }
                // Only enable editing when both isEditing is true and the sale is in Draft status
                disabled={!isEditing}
                className="border border-gray-300 rounded-lg p-3 w-full"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="max-h-96 overflow-y-auto mt-6">
            <table className="min-w-full border-collapse border border-gray-300 text-sm text-gray-700">
              <thead className="bg-gray-100 text-gray-900 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S.N
                  </th>
                  <th className="border p-3 text-center">Item Code</th>
                  <th className="border px-4 py-2">Item Name</th>
                  <th className="border px-4 py-2">Site</th>{" "}
                  <th className="border px-4 py-2">Warehouse</th>
                  <th className="border p-3 text-center">Qty</th>
                  <th className="border p-3 text-center">Price</th>
                  <th className="border p-3 text-center">Unit</th>
                  <th className="border p-3 text-center">Type</th>
                  <th className="border p-3 text-center">Amount</th>
                  <th className="border p-3 text-center">Discount %</th>
                  <th className="border p-3 text-center">Tax %</th>
                  <th className="border p-3 text-center">TCS/TDS %</th>
                  <th className="border p-3 text-center">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="border p-3">1</td>
                  <td className="border p-3">{saleData.item?.code || 0}</td>
                  <td className="border p-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={saleData.item?.name || 0}
                        className="border rounded p-1 text-center w-full"
                      />
                    ) : (
                      saleData.item?.name
                    )}
                  </td>
                  <td className="border p-3 text-center">
                    {" "}
                    {isEditing ? (
                      <input
                        type="text"
                        value={saleData.quantity || null}
                        onChange={(e) => handleInputChange(e, "quantity")}
                        className="border rounded p-1 text-center w-full"
                      />
                    ) : (
                      saleData.quantity
                    )}
                  </td>
                  <td className="border p-3 text-center">
                    {isEditing ? (
                      <input
                        type="text"
                        value={saleData.item?.price || null}
                        onChange={(e) => handleInputChange(e, "price", true)}
                        className="border rounded p-1 text-center w-full"
                      />
                    ) : (
                      saleData.item?.price
                    )}
                  </td>
                  <td className="border p-3 text-center">
                    <select
                      name="unit"
                      value={saleData?.unit || null}
                      onChange={(e) => handleInputChange(e, "unit")}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-300"
                      disabled={!isEditing}
                    >
                      <option value="kgs">KG - Kilogram</option>

                      <option value="mt ">Metric tonnes</option>
                      <option value="ea">Ea - Each</option>
                      <option value="lbs"> lbs - pounds</option>

                      <option value="hr">Hour</option>
                      <option value="min">Minutes</option>
                      <option value="qty">Quantity</option>
                    </select>
                  </td>
                  <td className="border p-3 text-center">
                    {saleData.item?.type || null}
                  </td>
                  <td className="border p-3 text-center">
                    {isEditing ? (
                      <input
                        type="text"
                        value={saleData?.lineAmt || null}
                        onChange={(e) => handleInputChange(e, "lineAmt")}
                        className="border rounded p-1 text-center w-full"
                      />
                    ) : (
                      saleData?.lineAmt
                    )}
                  </td>

                  <td className="border p-3 text-center">
                    {isEditing ? (
                      <input
                        type="text"
                        value={saleData.discount || null}
                        onChange={(e) => handleInputChange(e, "discount")}
                        className="border rounded p-1 text-center w-full"
                      />
                    ) : (
                      saleData.discount
                    )}
                  </td>
                  <td className="border p-3 text-center">
                    {" "}
                    {isEditing ? (
                      <input
                        type="text"
                        value={saleData.tax || null}
                        onChange={(e) => handleInputChange(e, "tax")}
                        className="border rounded p-1 text-center w-full"
                      />
                    ) : (
                      saleData.tax
                    )}
                  </td>
                  <td className="border p-3 text-center">
                    {isEditing ? (
                      <input
                        type="text"
                        value={saleData.withholdingTax || null}
                        onChange={(e) => handleInputChange(e, "withholdingTax")}
                        className="border rounded p-1 text-center w-full"
                      />
                    ) : (
                      saleData.withholdingTax
                    )}
                  </td>
                  <td className="border p-3 text-center">
                    {isEditing ? (
                      <input
                        type="text"
                        value={saleData.netAR || null}
                        onChange={(e) => handleInputChange(e, "netAR")}
                        className="border rounded p-1 text-center w-full"
                      />
                    ) : (
                      saleData.netAR
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <h5 className="text-xl font-bold mb-4 mt-2  ">Sale Summary</h5>
          <div className="summary border p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded shadow-sm">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Charges</span>
              <span className="text-lg font-semibold text-gray-800">
                {saleData.charges || 0}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Combined Paid</span>
              <span className="text-lg font-semibold text-gray-800">
                {saleData.combinedPaid || 0}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Discount Amt</span>
              <span className="text-lg font-semibold text-gray-800">
                {saleData.discountAmt || 0}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Paid Amt</span>
              <span className="text-lg font-semibold text-gray-800">
                {saleData.paidAmt
                  ? saleData.paidAmt.reduce((a, b) => a + b, 0)
                  : 0}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Net Amt After Tax</span>
              <span className="text-lg font-semibold text-gray-800">
                {saleData.netAmtAfterTax || 0}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Net Payment Due</span>
              <span className="text-lg font-semibold text-gray-800">
                {saleData.netPaymentDue || 0}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Withholding Tax Amt</span>
              <span className="text-lg font-semibold text-gray-800">
                {saleData.withholdingTaxAmt || 0}
              </span>
            </div>{" "}
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">
                Carry Forward Advance
              </span>
              <span className="text-lg font-semibold text-gray-800">
                {saleData.carryForwardAdvance || 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Conditionally render the Payment Modals */}
      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          onSubmit={handlePaymentSubmit}
          loading={loading}
        />
      )}
      {showPaymentHistoryModal && (
        <PaymentHistoryModal
          onClose={() => setShowPaymentHistoryModal(false)}
          payments={saleData?.paidAmt}
        />
      )}
    </div>
  );
};

export default SaleorderViewPage;
