import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
const BASE_URL = "https://fms-qkmw.onrender.com/fms/api/v0/purchaseorders";
const item = "https://fms-qkmw.onrender.com/fms/api/v0/items";
const customer = "https://fms-qkmw.onrender.com/fms/api/v0/customers";
// const navigate = useNavigate();
// ---------------------------
// Payment Modal Component (Create Payment)
const PaymentModal = ({ onClose, onSubmit, loading }) => {
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");

  // ADDED: New state for payment date. Default value is set to the current date/time
  // formatted as required for input type "datetime-local" (YYYY-MM-DDTHH:MM)
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
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-black-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-500 text-lg font-medium">Loading...</p>
      </div>
    );
  }
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

const PurchaseViewPage = ({ goBack, PurchaseId }) => {
  console.log("11", PurchaseId);
  // Removed duplicate declaration and initialize with PurchaseId if provided  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [isEdited, setIsEdited] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [purchasedata, setpurchasedata] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [discount, setDiscount] = useState(purchasedata?.discount || 0);
  const [tcs, setTcs] = useState(purchasedata?.withholdingTax || 0);
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [netAR, setNetAR] = useState(0);

  // Global form states
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const [price, setPrice] = useState(0);

  const [unit, setUnit] = useState("N/A");
  const [type, setType] = useState("N/A");
  const [tax, setTax] = useState(0);

  const [charges, setCharges] = useState(0);
  const [lineAmt, setLineAmt] = useState("0.00");
  const [advance, setAdvance] = useState(0);
  const [salesAddress, setSalesAddress] = useState(null);
  const [quantity, setQuantity] = useState(
    purchasedata?.quantity ? String(purchasedata.quantity) : "1"
  );

  // Update local state if purchasedata.quantity changes.
  useEffect(() => {
    if (purchasedata?.quantity) {
      setQuantity(String(purchasedata.quantity));
    }
  }, [purchasedata?.quantity]);
  // Additional states
  const [saleOrderNum, setSaleOrderNum] = useState(null);
  const [status, setStatus] = useState("Draft");
  const [_id, set_id] = useState("");
  const [summary, setSummary] = useState({
    totalLines: 0,
    totalNetAmount: 0,
    totalDiscountAmount: 0,
    totalTaxAmount: 0,
    totalWithholdingTax: 0,
    totalNetAmountAfterTax: 0,
    totalLineAmount: 0,
  });
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState({
    contactNum: "",
    currency: "",
    address: "",
  });
  const [itemDetails, setItemDetails] = useState({
    code: "",
    name: "",
    type: "",
    unit: "",
    price: 0,
    id: "",
  });
  const [originalpurchasedata, setOriginalpurchasedata] = useState(null);
  // Initial line item (for single item form)
  const [lineItems, setLineItems] = useState([
    {
      id: Date.now(),
      itemId: "",
      itemName: "",
      itemCode: "",
      unit: "",
      quantity: 1,
      price: 0,
      discount: 0,
      Status: "draft",
      charges: 0,
      tax: 0,
      tcs: 0,
      tds: 0,
      lineAmt: 0,
      amountBeforeTax: 0,
    },
  ]);
  const handleEdit = () => {
    // Save a copy of the current sale data
    setOriginalpurchasedata({ ...purchasedata });
    setIsEdited(true);
    setIsEditing(true);
  };
  // Fetch customers and items once
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(customersBaseUrl);
        setCustomers(response.data.data || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    const fetchItems = async () => {
      try {
        const response = await axios.get(itemsBaseUrl);
        setItems(response.data.data || []);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchCustomers();
    fetchItems();
  }, []);

  // Calculate total amount for a line item
  const calculateTotalAmount = (item) => {
    const quantityVal = Number(item.quantity) || 1;
    const priceVal = Number(item.price) || 0;
    const discountVal = Number(item.discount) || 0;
    const taxVal = Number(item.tax) || 0;
    const tcsVal = Number(item.tcs) || 0;
    const tdsVal = Number(item.tds) || 0;
    const chargesVal = Number(item.charges) || 0;

    const subtotal = quantityVal * priceVal;
    const discountAmount = (subtotal * discountVal) / 100;
    const amountBeforeTax = subtotal - discountAmount;
    const taxAmount = (amountBeforeTax * taxVal) / 100;
    const tcsAmount = (amountBeforeTax * tcsVal) / 100;
    const computedLineAmt =
      amountBeforeTax + taxAmount + tcsAmount + chargesVal;

    return {
      amountBeforeTax: isNaN(amountBeforeTax)
        ? "0.00"
        : amountBeforeTax.toFixed(2),
      lineAmt: isNaN(computedLineAmt) ? "0.00" : computedLineAmt.toFixed(2),
    };
  };

  // Update summary when lineItems change
  useEffect(() => {
    if (lineItems.length > 0) {
      const totalNetAmount = lineItems.reduce(
        (sum, item) => sum + Number(item.amountBeforeTax || 0),
        0
      );
      const totalDiscountAmount = lineItems.reduce(
        (sum, item) =>
          sum +
          Number(item.quantity) *
            Number(item.price) *
            (Number(item.discount) / 100),
        0
      );
      const totalTaxAmount = lineItems.reduce(
        (sum, item) =>
          sum + Number(item.amountBeforeTax) * (Number(item.tax) / 100),
        0
      );
      const totalWithholdingTax = lineItems.reduce(
        (sum, item) =>
          sum + Number(item.amountBeforeTax) * (Number(item.tcs) / 100),
        0
      );
      const totalNetAmountAfterTax = lineItems.reduce(
        (sum, item) => sum + Number(item.netAmtAfterTax || 0),
        0
      );
      const totalLineAmount = lineItems.reduce(
        (sum, item) => sum + Number(item.quantity) * Number(item.price),
        0
      );

      setSummary({
        totalLines: lineItems.length,
        totalNetAmount,
        totalDiscountAmount,
        totalTaxAmount,
        totalWithholdingTax,
        totalNetAmountAfterTax,
        totalLineAmount,
      });
    }
  }, [lineItems]);

  // When a global item is selected, update item details and defaults
  useEffect(() => {
    if (selectedItem) {
      const item = items.find((i) => i._id === selectedItem._id);
      if (item) {
        setItemDetails({
          name: item.name,
          code: item.code,
          type: item.type,
          unit: item.unit,
          price: item.price,
          id: item._id,
        });

        setPrice((prev) => prev || Number(item.price) || 0);
        setDiscount((prev) => (prev !== 0 ? prev : Number(item.discount) || 0));
        setTax((prev) => (prev !== 0 ? prev : Number(item.tax) || 0));
        setTcs((prev) => (prev !== 0 ? prev : Number(item.tcs) || 0));
        setQuantity((prev) => (prev !== 0 ? prev : 1));
      }
    }

    // Recalculate "Amount Before Tax" when item selection changes
    const discountAmount =
      (Number(discount) * Number(quantity) * Number(price)) / 100;
    const computedAmountBeforeTax =
      Number(quantity) * Number(price) - discountAmount;
    const taxAmount = (computedAmountBeforeTax * Number(tax)) / 100;
    const tcsAmount = (computedAmountBeforeTax * Number(tcs)) / 100;
    const computedTotalAmount = computedAmountBeforeTax + taxAmount + tcsAmount;

    setLineAmt(
      isNaN(computedTotalAmount) ? "0.00" : computedTotalAmount.toFixed(2)
    );
  }, [selectedItem, items, quantity, price, discount, tax, tcs]);

  // Global line amount calculation for single item form
  useEffect(() => {
    const discountAmount =
      (Number(discount) * Number(quantity) * Number(price)) / 100;
    const computedAmountBeforeTax =
      Number(quantity) * Number(price) - discountAmount;
    const taxAmount = (computedAmountBeforeTax * Number(tax)) / 100;
    const netAR =
      purchasedata?.netAmtAfterTax -
      (purchasedata?.paidAmt
        ? purchasedata.paidAmt.reduce((a, b) => a + b, 0)
        : 0);
    const tcsAmount = (computedAmountBeforeTax * Number(tcs)) / 100;
    const computedTotalAmount = computedAmountBeforeTax + taxAmount + tcsAmount;
    setLineAmt(
      isNaN(computedTotalAmount) ? "0.00" : computedTotalAmount.toFixed(2)
    );
  }, [quantity, price, discount, tax, tcs]);

  // Pre-calculate amountBeforeTax for table display
  const discountAmountForDisplay =
    (Number(discount) * Number(quantity) * Number(price)) / 100;
  const amountBeforeTax =
    Number(quantity) * Number(price) - discountAmountForDisplay;

  // Fetch sale detail by ID
  const fetchSaleDetail = useCallback(async (id) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${BASE_URL}/${id}`);
      if (response.status === 200) {
        const data = response.data.data || {};
        setpurchasedata(data);
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

  // Global line amount calculation for single item form
  useEffect(() => {
    const discountAmount =
      (Number(discount) * Number(quantity) * Number(price)) / 100;
    const computedAmountBeforeTax =
      Number(quantity) * Number(price) - discountAmount;
    const taxAmount = (computedAmountBeforeTax * Number(tax)) / 100;
    const tcsAmount = (computedAmountBeforeTax * Number(tcs)) / 100;
    const computedTotalAmount = computedAmountBeforeTax + taxAmount + tcsAmount;
    const netAR =
      purchasedata?.netAmtAfterTax -
      (purchasedata?.paidAmt
        ? purchasedata.paidAmt.reduce((a, b) => a + b, 0)
        : 0);
    setLineAmt(
      isNaN(computedTotalAmount) ? "0.00" : computedTotalAmount.toFixed(2)
    );
  }, [selectedItem, items, quantity, price, discount, tax, tcs]);
  // Automatically fetch sale details if PurchaseId is provided
  useEffect(() => {
    if (PurchaseId) {
      setInputPurchaseId(PurchaseId);
      fetchSaleDetail(PurchaseId);
    }
  }, [PurchaseId, fetchSaleDetail]);

  // Update isDraft flag based on purchasedata.status
  useEffect(() => {
    if (purchasedata?.status === "Draft") {
      setIsDraft(true);
    } else {
      setIsDraft(false);
    }
  }, [purchasedata]);

  // Handle search by Sale ID (if needed)
  const handleSearch = () => {
    if (!inputPurchaseId.trim()) {
      toast.warn("Please enter a Sale ID.");
      return;
    }
    fetchSaleDetail(inputPurchaseId);
  };
  useEffect(() => {
    if (purchasedata) {
      const paidAmount = purchasedata?.paidAmt
        ? purchasedata.paidAmt.reduce((a, b) => a + b, 0)
        : 0;

      const updatedNetAR = (purchasedata?.netAmtAfterTax || 0) - paidAmount;

      setNetAR(updatedNetAR); // Update state
    }
  }, [purchasedata]);
  // Handle edit: allow fields to be edited
  const handleEditCancel = () => {
    // Restore the sale data from the backup
    setpurchasedata(originalpurchasedata);
    setIsEdited(false);
    setIsEditing(false);
  };

  // Button labels and enabled states for status change

  // Handle sale update

  // Handle status update

  // Navigate to invoice page

  // Handle payment submission
  const handlePaymentSubmit = async (paymentData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${mergedUrl}/${PurchaseId}/payment`,
        paymentData,
        { withCredentials: false }
      );
      // Assuming API returns updated sale data with payments in response.data.data
      setpurchasedata(response.data.data || response.data);
      toast.success("Payment created successfully!");
      setShowPaymentModal(false);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred while submitting payment.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update customer details when selectedCustomer changes
  useEffect(() => {
    if (selectedCustomer) {
      const customer = customers.find((c) => c._id === selectedCustomer);
      if (customer) {
        setSelectedCustomerDetails({
          contactNum: customer.contactNum || "",
          currency: customer.currency || "",
          address: customer.address || "",
        });
      }
    } else {
      setSelectedCustomerDetails({
        contactNum: "",
        currency: "",
        address: "",
      });
    }
  }, [selectedCustomer, customers]);

  // Update item details when selectedItem changes (already handled above)

  // Handle changes in line item fields

  // Navigate back handler
  const goBackHandler = () => {
    navigate(-1);
  };

  // Handle create sales order

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-zinc-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-500 text-lg font-medium">
          Sale order view Page...
        </p>
      </div>
    );
  }
  const [inputPurchaseId, setInputPurchaseId] = useState(PurchaseId || "");
  const [purchaseData, setPurchaseData] = useState({});
  const navigate = useNavigate();

  // const [isEditing, setIsEditing] = useState(false);
  // isDraft is used to conditionally allow editing for some fields.

  const [state, setState] = useState({
    formData: {},
    loading: false,
    error: "",
    isEditing: false,
  });

  const handleInputChange = (e, field, nested = false) => {
    const { value } = e.target;
    setPurchaseData((prev) => {
      if (nested) {
        // Update nested fields (within 'item')
        return {
          ...prev,
          item: {
            ...(prev.item || {}),
            [field]: value,
          },
        };
      }
      // Update non-nested fields
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const fetchPurchaseDetail = useCallback(async (id) => {
    setState((prev) => ({ ...prev, loading: true, error: "" }));
    try {
      const response = await axios.get(
        `https://fms-qkmw.onrender.com/fms/api/v0/purchaseorders/${id}`
      );

      if (response.status === 200) {
        const data = response.data.data || {};
        setPurchaseData(data);
        console.log(data, "Fetched Purchase Data");
      } else {
        const msg = `Unexpected response status: ${response.status}`;
        setState((prev) => ({ ...prev, error: msg }));
        toast.error(msg);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "An unexpected error occurred. Please try again.";
      setState((prev) => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);
  const handleInvoice = () => {
    navigate(`/invoice/${PurchaseId}`);
  };
  // Automatically fetch Purchase details if PurchaseId is provided
  useEffect(() => {
    if (PurchaseId) {
      setInputPurchaseId(PurchaseId);
      fetchPurchaseDetail(PurchaseId);
    }
  }, [PurchaseId, fetchPurchaseDetail]);

  // Update isDraft based on the PurchaseData status (if available)
  useEffect(() => {
    if (purchaseData?.status === "Draft") {
      setIsDraft(true);
    } else {
      setIsDraft(false);
    }
  }, [purchaseData]);

  const toggleEdit = () =>
    setState((prev) => ({ ...prev, isEditing: !prev.isEditing }));

  const handleStatusUpdate = async (newStatus) => {
    console.log("Attempting to update status...");

    try {
      console.log("Sending PUT request...");
      const response = await axios.put(
        `https://befr8n.vercel.app/fms/api/v0/purchaseorders/${PurchaseId}`,
        { status: newStatus }
      );
      console.log("Response received 103:", response);

      setPurchaseData((prev) => {
        const updatedData = { ...prev, status: newStatus };
        console.log("Updated purchase data:", updatedData);
        return updatedData;
      });

      toast.success(`Status updated to ${newStatus}`);
      console.log(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error); // Logs the error to the console
      toast.error("Failed to update status.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, [name]: value },
    }));
  };
  const handleUpdate = async () => {
    if (window.confirm("Are you sure you want to update this Purchase?")) {
      setState((prev) => ({ ...prev, loading: true }));
      try {
        const response = await axios.put(
          `https://befr8n.vercel.app/fms/api/v0/purchaseorders/${PurchaseId}`,
          purchaseData
        );

        setPurchaseData(response.data.data);
        toast.success("Purchase updated successfully!");
        setState((prev) => ({ ...prev, isEditing: false }));
      } catch (err) {
        console.error("149", err); // Log the actual error to the console
        toast.error("Failed to update the purchase order.");
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    }
  };

  const buttonLabels = [
    { id: "Confirm", label: "Confirmed" },
    { id: "Cancel", label: "Cancelled" },
    { id: "Draft", label: "Draft" },
    { id: "Pick", label: "Picked" },
    { id: "Recive ", label: "Recived " },
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
  const isButtonEnabled = (button) => {
    return enabledButtons[purchaseData?.status]?.includes(button) ?? false;
  };

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

  const handleSave = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      await axios.put(
        `https://befr8n.vercel.app/fms/api/v0/Purchasesorders/${PurchaseId}`,
        state.formData
      );
      toast.success("Updated successfully!");
      setState((prev) => ({ ...prev, isEditing: false }));
    } catch (error) {
      toast.error("Failed to update the record.");
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="container mx-auto p-2">
      <h1 className="text-xl font-bold mb-4">Purchases Order View Page</h1>

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
      <div className="bg-white p-6 rounded-lg shadow-lg w-full">
        {" "}
        <div className="bg-white p-6 rounded-lg shadow-lg w-full">
          {/* Purchase Details Section */}
          <div className="grid gap-6 mb-4 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1">
            <div className="flex flex-col">
              <label className="font-bold">Purchase Order</label>
              <input
                type="text"
                value={purchaseData.orderNum}
                disabled
                className="border p-2 w-full"
              />
            </div>{" "}
            <div className="flex flex-col">
              <label className="font-bold">Purchase Invoiced Number</label>
              <input
                type="text"
                value={purchaseData?.invoiceNum || 0}
                disabled
                className="border p-2 w-full"
              />
            </div>{" "}
            <div className="flex flex-col">
              <label className="font-bold">Purchase Invoiced Date</label>
              <input type="text" disabled className="border p-2 w-full" />
            </div>
            <div className="flex flex-col">
              <label className="font-bold">vendor Name</label>
              <input
                type="text"
                value={purchaseData.vendor?.name || 0}
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
                value={purchaseData.vendor?.contactNum || ""}
                readOnly
                className="border border-gray-300 rounded-lg p-3 w-full bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">Currency</label>
              <input
                type="text"
                value={purchaseData.currency || 0}
                readOnly
                className="border border-gray-300 rounded-lg p-3 w-full bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">
                {" "}
                Purchase Status
              </label>
              <input
                type="text"
                value={purchaseData.status || 0}
                placeholder="Selected Status"
                disabled
                className="border border-gray-300 bg-gray-100 text-gray-600 rounded-lg p-3 w-full cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">Advance</label>
              <input
                type="text"
                value={purchaseData.advance}
                onChange={(e) =>
                  setPurchaseData({ ...purchaseData, advance: e.target.value })
                }
                disabled={!isEditing}
                className="border border-gray-300 rounded-lg p-3 w-full"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">
                vendor Address
              </label>
              <textarea
                value={purchaseData.vendor?.address || ""}
                onChange={(e) =>
                  setPurchaseData({
                    ...purchaseData,
                    PurchasesAddress: e.target.value,
                  })
                }
                disabled={!isEditing}
                className="border border-gray-300 rounded-lg p-3 w-full"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">Remarks</label>
              <textarea
                value={purchaseData.remarks || ""}
                onChange={(e) =>
                  setPurchaseData({ ...purchaseData, remarks: e.target.value })
                }
                // Only enable editing when both isEditing is true and the Purchase is in Draft status
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
                  <th className="border p-1 text-center">S.N</th>
                  <th className="border p-1 text-center">Item Code</th>
                  <th className="border p-1 w-60 text-center">Item Name</th>
                  <th className="border p-1 text-center">Qty</th>
                  <th className="border p-1 text-center">Unit</th>{" "}
                  <th className="border p-1 text-center">Price</th>
                  <th className="border p-1 text-center">Type</th>{" "}
                  <th className="border p-1 text-center">Discount %</th>
                  <th className="border p-1 text-center">Amount</th>
                  <th className="border p-1 text-center">Tax %</th>
                  <th className="border p-1 text-center">TCS/TDS %</th>
                  <th className="border p-1 text-center">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr key="sales-order-row" className="hover:bg-gray-50">
                  <td className="border text-center p-1">1</td>
                  <td className="border p-1">
                    {/* Show item code correctly */}
                    {selectedItem?.code || purchasedata?.item?.code || ""}
                  </td>
                  <td className="border p-1">
                    <select
                      value={selectedItem?._id || purchasedata?.item?._id || ""}
                      disabled={!isEdited && !isEditing}
                      onChange={(e) => {
                        const sel = items.find(
                          (item) => item._id === e.target.value
                        );
                        setSelectedItem(sel);
                        setpurchasedata((prev) => ({
                          ...prev,
                          item: sel, // Update purchasedata with selected item
                        }));
                      }}
                      className="border rounded p-1 text-center w-60"
                    >
                      <option value="">Select Item</option>
                      {items.map((itemOption) => (
                        <option key={itemOption._id} value={itemOption._id}>
                          {itemOption.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border p-1">
                    <input
                      type="text"
                      className="border rounded p-1 text-center w-24"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                      disabled={!isEditing}
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      type="text"
                      className="border rounded p-1 text-center w-24"
                      value={
                        selectedItem?.unit || purchasedata?.item?.unit || ""
                      }
                      onChange={(e) => setUnit(e.target.value)}
                      disabled={!isEditing}
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      type="text"
                      className="border rounded p-1 text-center w-24"
                      value={
                        selectedItem?.price || purchasedata?.item?.price || ""
                      }
                      onChange={(e) => setPrice(Number(e.target.value) || 0)}
                      disabled={!isEditing}
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      type="text"
                      disabled={!isEditing}
                      className="border rounded p-1 text-center w-24"
                      value={purchasedata.item?.type || selectedItem}
                      onChange={(e) => setType(Number(e.target.value) || 0)}
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      type="number"
                      className="border rounded p-1 text-center w-24"
                      value={discount || purchasedata.discount}
                      onChange={(e) => {
                        let newDiscount = Number(e.target.value);

                        // Prevent negative values and restrict to 2 digits
                        if (newDiscount < 0) newDiscount = 0;
                        if (newDiscount > 99) newDiscount = 99;

                        setDiscount(newDiscount);
                        setpurchasedata((prev) => ({
                          ...prev,
                          discount: newDiscount,
                        }));
                      }}
                      min="0"
                      max="99"
                      disabled={!isEditing}
                    />
                  </td>

                  <td className="border p-1">
                    {!isEditing ? (
                      <input
                        type="text"
                        className="border rounded p-1 text-center w-24"
                        value={
                          isNaN(purchasedata.lineAmt)
                            ? "0.00"
                            : purchasedata.lineAmt
                        }
                        onChange={(e) => handleAmountChange(e.target.value)}
                      />
                    ) : isNaN(amountBeforeTax) ? (
                      "0.00"
                    ) : (
                      parseFloat(amountBeforeTax).toFixed(2)
                    )}
                  </td>

                  {/* <td className="border p-1">
                        {" "}
                        {purchasedata.lineAmt || lineAmt}
                      </td> */}
                  <td className="border p-1">
                    <input
                      type="text"
                      className="border rounded p-1 text-center w-24"
                      value={tax || purchasedata.tax}
                      onChange={(e) => {
                        let newTax = e.target.value;
                        if (newTax.length > 2) return; // Restrict input to 2 digits
                        setTax(Number(newTax) || 0);
                      }}
                      disabled={!isEditing}
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      type="number"
                      className="border rounded p-1 text-center w-24"
                      value={tcs || purchasedata.withholdingTax}
                      onChange={(e) => {
                        let newTcs = e.target.value;
                        if (newTcs.length > 2) return; // Restrict input to 2 digits
                        setTcs(Number(newTcs) || 0);
                        setpurchasedata((prev) => ({
                          ...prev,
                          withholdingTax: Number(newTcs) || 0,
                        }));
                      }}
                      disabled={!isEditing}
                    />
                  </td>
                  {/* <td className="border p-1"> {purchasedata.netAR || netAR}</td> */}
                  <td className="border p-1 text-center">{lineAmt}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h5 className="text-xl font-bold mb-4 mt-2  ">Purchase Summary</h5>
          <div className="summary border p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded shadow-sm">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Charges</span>
              <span className="text-lg font-semibold text-gray-800">
                {purchaseData.charges || 0}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Combined Paid</span>
              <span className="text-lg font-semibold text-gray-800">
                {purchaseData.combinedPaid || 0}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Discount Amt</span>
              <span className="text-lg font-semibold text-gray-800">
                {purchaseData.discountAmt || 0}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Paid Amt</span>
              <span className="text-lg font-semibold text-gray-800">
                {purchaseData.paidAmt
                  ? purchaseData.paidAmt.reduce((a, b) => a + b, 0)
                  : 0}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Net Amt After Tax</span>
              <span className="text-lg font-semibold text-gray-800">
                {purchaseData.netAmtAfterTax || 0}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Net Payment Due</span>
              <span className="text-lg font-semibold text-gray-800">
                {purchaseData.netPaymentDue || 0}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Withholding Tax Amt</span>
              <span className="text-lg font-semibold text-gray-800">
                {purchaseData.withholdingTaxAmt || 0}
              </span>
            </div>{" "}
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">
                Carry Forward Advance
              </span>
              <span className="text-lg font-semibold text-gray-800">
                {purchaseData.carryForwardAdvance || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
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
          payments={purchaseData?.paidAmt}
        />
      )}
    </div>
  );
};

export default PurchaseViewPage;
