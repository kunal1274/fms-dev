import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Keep if you navigate to invoice pages that render this:
import Invoice from "../Invoice/Icopy";

const API_ROOT = "https://befr8n.vercel.app/fms/api/v0";
const SALES_URL = `${API_ROOT}/salesorders`;
const META_URL = API_ROOT; // items, sites, warehouses, customers

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

const SaleorderViewPage = ({ saleId, goBack }) => {
  // API constants (safe defaults; keep if not already defined higher up)
  const API_BASE = "https://fms-qkmw.onrender.com/fms/api/v0";
  const SALES_URL = `${API_BASE}/salesorders`;
  const META_URL = API_BASE;

  // Payment terms: ensure we include the current one if it's not in list
  const defaultTerms = [
    "Immediate",
    "Net 7",
    "Net 15",
    "Net 30",
    "Net 45",
    "Net 60",
  ];

  // State
  const [inputSaleId, setInputSaleId] = useState("");
  const [saleData, setSaleData] = useState(null);
  const [isEdited, setIsEdited] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDraft, setIsDraft] = useState(false);

  // Header form + extras (for fields not in base JSON)
  const [form, setForm] = useState({
    orderId: "",
    deliveryMode: "",
    paymentTerms: "",
    site: "",
    warehouse: "",
    purchaseRef: "",
    createdOn: "",
    orderDate: "",
  });
  // Alias so your earlier snippet `setFormData(...)` keeps working
  const setFormData = setForm;

  const [extras, setExtras] = useState({
    saleAgreementNo: "",
    contactEmail: "",
    purchaseRef: "", // mirror for safety
  });

  // Meta lists
  const [sites, setSites] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);

  const [loadingSites, setLoadingSites] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  // Selected master data
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSite, setSelectedSite] = useState("");

  // Line/edit values
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0); // %
  const [tax, setTax] = useState(0); // %
  const [tcs, setTcs] = useState(0); // %
  const [advance, setAdvance] = useState(0);
  const [itemCode, setItemCode] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemUnit, setItemUnit] = useState("");

  const navigate = useNavigate();
  const { id: urlId } = useParams();

  // Map variables so your logging snippet can use SaleId || id
  const SaleId = saleId;
  const id = urlId;

  // Accept either prop or URL param
  const finalId = useMemo(() => saleId || urlId, [saleId, urlId]);

  /** =========================
   *  HELPERS
   *  ========================= */
  const normalizeData = (res) => res?.data?.data ?? res?.data ?? res;

  const safeDateTime = (d) => (d ? new Date(d).toLocaleString() : "");

  const getOrderDate = (data) => data?.orderDate || data?.createdAt || "";

  // Site/Warehouse label helpers (defensive with id/string/object)
  const getSiteId = (s) =>
    typeof s === "object" ? s._id || s.id || "" : String(s || "");
  const getSiteLabel = (s) =>
    typeof s === "object" ? s.name || s.code || getSiteId(s) : String(s || "");

  const getWhId = (w) =>
    typeof w === "object" ? w._id || w.id || "" : String(w || "");
  const getWhLabel = (w) =>
    typeof w === "object" ? w.name || w.code || getWhId(w) : String(w || "");

  // Derived amounts
  const amountBeforeTax = useMemo(() => {
    const qty = Number(quantity) || 0;
    const pr = Number(price) || 0;
    const discPct = Math.min(Math.max(Number(discount) || 0, 0), 100);
    const gross = qty * pr;
    return gross - (gross * discPct) / 100;
  }, [quantity, price, discount]);

  const lineAmt = useMemo(() => {
    const base = amountBeforeTax;
    const taxAmt = (base * (Number(tax) || 0)) / 100;
    const tcsAmt = (base * (Number(tcs) || 0)) / 100;
    return (base + taxAmt + tcsAmt).toFixed(2);
  }, [amountBeforeTax, tax, tcs]);

  const paidTotal = useMemo(() => {
    const arr = saleData?.paidAmt;
    if (!Array.isArray(arr)) return 0;
    return arr.reduce((sum, v) => {
      if (typeof v === "number") return sum + v;
      if (v && typeof v === "object") return sum + Number(v.amount || 0);
      return sum;
    }, 0);
  }, [saleData?.paidAmt]);

  /** =========================
   *  FETCHERS
   *  ========================= */
  const fetchSaleDetail = useCallback(async (saleOrderId) => {
    if (!saleOrderId) {
      toast.error("No Sale ID provided in props or URL.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${SALES_URL}/${saleOrderId}`, {
        withCredentials: false,
      });
      if (response.status !== 200) {
        const msg = `Unexpected response status: ${response.status}`;
        setError(msg);
        toast.error(msg);
        return;
      }
      const data = normalizeData(response) || {};
      setSaleData(data);

      // Prime header form and extras
      setForm((prev) => ({
        ...prev,
        orderId: data?.orderId || "",
        deliveryMode: data?.deliveryMode || "",
        paymentTerms: data?.paymentTerms || "",
        site: data?.site?._id || data?.site || "",
        warehouse: data?.warehouse?._id || data?.warehouse || "",
        purchaseRef: data?.purchaseRef || data?.extras?.purchaseRef || "",
        createdOn: safeDateTime(data?.createdAt),
        orderDate: safeDateTime(getOrderDate(data)),
      }));
      setExtras((ex) => ({
        ...ex,
        saleAgreementNo: data?.extras?.saleAgreementNo || "",
        contactEmail: data?.extras?.contactEmail || "",
        purchaseRef: data?.extras?.purchaseRef || "",
      }));

      // Prime customer/item/line
      setSelectedCustomer(data?.customer?._id || "");
      setAdvance(Number(data?.advance ?? 0) || 0);

      const it = data?.item || {};
      setSelectedItem(it?._id ? it : null);
      setItemCode(it?.code || "");
      setItemDesc(it?.name || "");
      setItemUnit(it?.unit || "");
      setPrice(Number(it?.price || data?.price || 0) || 0);

      setQuantity(Number(data?.quantity || 0) || 0);
      setDiscount(Number(data?.discount || 0) || 0);
      setTax(Number(data?.tax || 0) || 0);
      setTcs(Number(data?.withholdingTax || 0) || 0);

      toast.success("Sale loaded successfully");
    } catch (err) {
      const serverData = err?.response?.data;
      const errorMessage =
        (typeof serverData === "string" && serverData) ||
        serverData?.message ||
        "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSites = useCallback(async () => {
    setLoadingSites(true);
    try {
      const res = await axios.get(`${META_URL}/sites`, {
        withCredentials: false,
      });
      const list = normalizeData(res) || [];
      setSites(Array.isArray(list) ? list : []);
      toast.success("Sites loaded");
    } catch {
      toast.error("Failed to load sites");
    } finally {
      setLoadingSites(false);
    }
  }, []);

  const fetchWarehouses = useCallback(async () => {
    setLoadingWarehouses(true);
    try {
      const res = await axios.get(`${META_URL}/warehouses`, {
        withCredentials: false,
      });
      const list = normalizeData(res) || [];
      setWarehouses(Array.isArray(list) ? list : []);
      toast.success("Warehouses loaded");
    } catch {
      toast.error("Failed to load warehouses");
    } finally {
      setLoadingWarehouses(false);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await axios.get(`${META_URL}/customers`, {
        withCredentials: false,
      });
      const list = normalizeData(res) || [];
      setCustomers(Array.isArray(list) ? list : []);
      toast.success("Customers loaded");
    } catch {
      toast.error("Failed to load customers");
    }
  }, []);

  const fetchItems = useCallback(async () => {
    setLoadingItems(true);
    try {
      const res = await axios.get(`${META_URL}/items`, {
        withCredentials: false,
      });
      const list = normalizeData(res) || [];
      setItems(Array.isArray(list) ? list : []);
      toast.success("Items loaded");
    } catch {
      toast.error("Failed to load items");
    } finally {
      setLoadingItems(false);
    }
  }, []);

  /** =========================
   *  EFFECTS
   *  ========================= */
  // Your exact logging-style effect, but endpoint fixed to /salesorders/:id
  useEffect(() => {
    async function fetchSaleDetailOnce() {
      console.log("▶️ fetchSaleDetail start", { SaleId, id });
      setLoading(true);
      try {
        console.log("🔄 About to call axios.get");
        const response = await axios.get(`${SALES_URL}/${SaleId || id}`);
        console.log("✅ axios.get returned", response);

        if (response.status === 200) {
          console.log("✅ Status 200, data:", response.data);
          console.log("➡️ Calling setSaleDetail");
          // normalize in case backend returns {data: {...}} vs direct object
          const data = response?.data?.data ?? response?.data;
          setSaleData(data);

          console.log("➡️ Calling setFormData");
          setFormData({
            ...form,
            ...data, // spread fetched Saledata
            createdOn: safeDateTime(data?.createdAt),
            orderDate: safeDateTime(data?.orderDate || data?.createdAt),
          });
          console.log("✅ State updated with SaleDetail and formData");

          // Prime some local edit states for the line
          const it = data?.item || {};
          setSelectedItem(it?._id ? it : null);
          setItemCode(it?.code || "");
          setItemDesc(it?.name || "");
          setItemUnit(it?.unit || "");
          setPrice(Number(it?.price || data?.price || 0) || 0);

          setQuantity(Number(data?.quantity || 0) || 0);
          setDiscount(Number(data?.discount || 0) || 0);
          setTax(Number(data?.tax || 0) || 0);
          setTcs(Number(data?.withholdingTax || 0) || 0);
          setAdvance(Number(data?.advance ?? 0) || 0);

          setInputSaleId(String(SaleId || id || ""));
        } else {
          console.log(
            "⚠️ Unexpected status",
            response.status,
            response.statusText
          );
          setError(`Unexpected response status: ${response.status}`);
        }
      } catch (error) {
        console.error("❌ Error fetching Saledetails", error);
        const serverData = error?.response?.data;
        const errorMessage =
          (typeof serverData === "string" && serverData) ||
          serverData?.message ||
          "An unexpected error occurred. Please try again.";
        console.log("❗ Resolved errorMessage:", errorMessage);
        setError(errorMessage);
      } finally {
        console.log(
          "🔚 fetchSaleDetail finally block – setting loading to false"
        );
        setLoading(false);
      }
    }

    console.log("🔄 useEffect triggered");
    if (SaleId || id) {
      fetchSaleDetailOnce();
    } else {
      toast.error("No Sale ID provided in props or URL.");
    }
  }, [SaleId, id]); // <= keep exactly as you asked

  // Load meta lists (sites, warehouses, customers, items)
  useEffect(() => {
    fetchSites();
    fetchWarehouses();
    fetchCustomers();
    fetchItems();
  }, [fetchSites, fetchWarehouses, fetchCustomers, fetchItems]);

  useEffect(() => {
    setIsDraft(saleData?.status === "Draft");
  }, [saleData?.status]);

  /** =========================
   *  UI ACTIONS
   *  ========================= */
  const handleSearch = () => {
    if (!inputSaleId.trim()) {
      toast.warn("Please enter a Sale ID.");
      return;
    }
    fetchSaleDetail(inputSaleId.trim());
  };

  const handleEdit = () => {
    setIsEdited(true);
    setIsEditing(true);
  };

  // Persist changes
  const handleUpdate = async () => {
    const idToUse = finalId || inputSaleId;
    if (!idToUse) {
      toast.error("No Sale ID available for update.");
      return;
    }
    if (!window.confirm("Are you sure you want to update this sale?")) return;

    setLoading(true);
    try {
      // Compose payload based on current edits
      const payload = {
        ...saleData,
        // header
        orderId: form.orderId || saleData?.orderId,
        deliveryMode: form.deliveryMode ?? saleData?.deliveryMode,
        paymentTerms: form.paymentTerms || saleData?.paymentTerms,
        site: form.site || saleData?.site,
        warehouse: form.warehouse || saleData?.warehouse,
        purchaseRef: form.purchaseRef || saleData?.purchaseRef,
        extras: {
          ...(saleData?.extras || {}),
          saleAgreementNo:
            extras.saleAgreementNo ||
            (saleData?.extras || {}).saleAgreementNo ||
            "",
          contactEmail:
            extras.contactEmail || (saleData?.extras || {}).contactEmail || "",
          purchaseRef:
            extras.purchaseRef || (saleData?.extras || {}).purchaseRef || "",
        },

        // customer
        customer:
          selectedCustomer || saleData?.customer?._id || saleData?.customer,

        salesAddress:
          saleData?.salesAddress || saleData?.customer?.address || "",

        // numeric/lines
        advance: Number(advance) || 0,
        quantity: Number(quantity) || 0,
        discount: Number(discount) || 0,
        tax: Number(tax) || 0,
        withholdingTax: Number(tcs) || 0,
        lineAmt: Number(lineAmt) || 0,
        netAR: Number(lineAmt) || 0,
        netAmtAfterTax: Number(lineAmt) || 0,
        netPaymentDue: Number(lineAmt) || 0,

        // item object
        item: {
          ...(saleData?.item || {}),
          _id: selectedItem?._id || saleData?.item?.id || saleData?.item?._id,
          code: itemCode || saleData?.item?.code,
          name: itemDesc || saleData?.item?.name,
          unit: itemUnit || saleData?.item?.unit,
          price: Number(price) || Number(saleData?.item?.price) || 0,
          type: selectedItem?.type || saleData?.item?.type || "",
        },
      };

      const response = await axios.put(`${SALES_URL}/${idToUse}`, payload, {
        withCredentials: false,
      });

      const updated = normalizeData(response);
      setSaleData(updated);

      // Resync UI with updated record
      await fetchSaleDetail(idToUse);
      toast.success("Sale updated successfully!");
      setIsEditing(false);
    } catch (err) {
      const serverData = err?.response?.data;
      const errorMessage =
        (typeof serverData === "string" && serverData) ||
        serverData?.message ||
        "An unexpected error occurred.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
      "Confirmed",
      "Shipped",
      "Delivered",
      "Invoiced",
      "Cancelled",
      "AdminMode",
    ],
  };

  const isButtonEnabled = (button) =>
    enabledButtons[saleData?.status]?.includes(button) ?? false;

  const handleStatusUpdate = async (newStatus) => {
    const idToUse = finalId || inputSaleId;
    if (!idToUse) {
      toast.error("No Sale ID available for status update.");
      return;
    }
    if (!isButtonEnabled(newStatus)) {
      toast.error("Status change not allowed in current state.");
      return;
    }
    if (!window.confirm(`Change status to ${newStatus}?`)) return;

    setLoading(true);
    try {
      const patchUrl = `${SALES_URL}/${idToUse}/status`;
      const response = await axios.patch(
        patchUrl,
        { newStatus },
        { withCredentials: false }
      );
      if (response.status === 200) {
        const updated = normalizeData(response);
        setSaleData(updated);
        toast.success(`Status updated to ${newStatus}`);
      } else {
        toast.error(`Unexpected response status ${response.status}`);
      }
    } catch (err) {
      const serverData = err?.response?.data;
      const errorMessage =
        (typeof serverData === "string" && serverData) ||
        serverData?.message ||
        "An unexpected error occurred while updating status.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInvoice = () => {
    const idToUse = finalId || inputSaleId;
    if (!idToUse) {
      toast.error("No Sale ID available to open invoice.");
      return;
    }
    navigate(`/invoice/${idToUse}`);
  };

  const handlePaymentSubmit = async (paymentData) => {
    const idToUse = finalId || inputSaleId;
    if (!idToUse) {
      toast.error("No Sale ID available to create payment.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `${SALES_URL}/${idToUse}/payment`,
        paymentData,
        { withCredentials: false }
      );
      const updated = normalizeData(response);
      setSaleData(updated);
      toast.success("Payment created successfully!");
      setShowPaymentModal(false);
    } catch (error) {
      const serverData = error?.response?.data;
      const errorMessage =
        (typeof serverData === "string" && serverData) ||
        serverData?.message ||
        "An error occurred while submitting payment.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Line selection handlers
  const onSelectItem = (itemId) => {
    const found = items.find((it) => String(it._id) === String(itemId));
    setSelectedItem(found || null);
    setItemCode(found?.code || "");
    setItemDesc(found?.name || "");
    setItemUnit(found?.unit || "");
    setPrice(Number(found?.price || 0));
  };

  const onSelectSite = (val) => {
    setSelectedSite(val);
    setForm((f) => ({ ...f, site: val }));
  };

  const onSelectWarehouse = (val) => {
    setForm((f) => ({ ...f, warehouse: val }));
  };

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);

  /** =========================
   *  RENDER
   *  ========================= */
  if (loading && !saleData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-zinc-500 border-t-transparent"></div>
        <p className="mt-4 text-lg font-medium text-zinc-500">Loading...</p>
      </div>
    );
  }

  // Build payment terms list including current value (e.g., Net30D)
  const paymentTermsOptions = useMemo(() => {
    const current = (form.paymentTerms || saleData?.paymentTerms || "").trim();
    const base = [...defaultTerms];
    if (current && !base.includes(current)) base.unshift(current);
    return base;
  }, [form.paymentTerms, saleData?.paymentTerms]);

  return (
    <div className="container mx-auto p-2">
      <ToastContainer />
      <h1 className="mb-4 text-xl font-bold">Sales Order View Page</h1>

      {/* Quick Load by ID */}
      <div className="mb-3 flex gap-2">
        <input
          type="text"
          placeholder="Enter Sale ID"
          value={inputSaleId}
          onChange={(e) => setInputSaleId(e.target.value)}
          className="w-60 rounded border p-2"
        />
        <button
          onClick={handleSearch}
          className="rounded border bg-white px-3 py-2 text-sm font-medium hover:bg-gray-100"
        >
          Load
        </button>
      </div>

      {/* Maintain / Status / Settlement */}
      <div className="flex flex-wrap gap-2">
        <div className="h-17 bg-white p-2">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Maintain */}
            <div className="flex flex-col gap-2 rounded-lg border bg-gray-50 p-4">
              <h2 className="text-sm font-semibold text-gray-700">Maintain</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleInvoice}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium hover:bg-gray-100"
                >
                  Invoice
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className={`rounded-md border px-3 py-1 text-xs font-medium transition ${
                    loading
                      ? "cursor-not-allowed bg-gray-300"
                      : "bg-white border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleEdit}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={goBack ? goBack : () => navigate(-1)}
                  className="rounded-md border border-red-400 bg-white px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Status Change */}
            <div className="flex flex-col gap-2 rounded-lg border bg-gray-50 p-4">
              <h2 className="text-sm font-semibold text-gray-700">
                Status Change
              </h2>
              <div className="flex flex-wrap gap-2">
                {buttonLabels.map((button) => (
                  <button
                    key={button.id}
                    type="button"
                    className={`rounded-md border px-3 py-1 text-xs font-medium transition-all ${
                      isButtonEnabled(button.label)
                        ? "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                        : "cursor-not-allowed border-gray-300 bg-gray-200 text-gray-400"
                    }`}
                    disabled={!isButtonEnabled(button.label) || loading}
                    onClick={() => handleStatusUpdate(button.label)}
                  >
                    {button.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Settlement */}
            <div className="flex flex-col gap-2 rounded-lg border bg-gray-50 p-4">
              <h2 className="text-sm font-semibold text-gray-700">
                Settlement
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="rounded-md border border-green-500 bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                >
                  Create Payment
                </button>
                <button
                  onClick={() => setShowPaymentHistoryModal(true)}
                  className="rounded-md border border-blue-500 bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                >
                  View Payments
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <p className="mb-4 text-red-500">{error}</p>}

      {!loading && saleData && (
        <div className="w-full rounded-lg bg-white p-6 shadow-lg">
          {/* === Header Fields (exactly as requested) === */}
          <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Sale Order */}
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">Sale Order</label>
              <input
                type="text"
                value={saleData?.orderType || "Sales"}
                readOnly
                className="w-full rounded border bg-gray-100 p-2"
              />
            </div>

            {/* Customer Account */}
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">
                Customer Account
              </label>
              <input
                type="text"
                value={saleData?.customer?.code || ""}
                readOnly
                className="w-full rounded border bg-gray-100 p-2"
              />
            </div>

            {/* Customer Name */}
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">
                Customer Name
              </label>
              <input
                type="text"
                value={saleData?.customer?.name || ""}
                readOnly
                className="w-full rounded border bg-gray-100 p-2"
              />
            </div>

            {/* Contact Email (from extras) */}
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">
                Contact Email
              </label>
              <input
                type="email"
                value={extras.contactEmail}
                onChange={(e) =>
                  setExtras((x) => ({ ...x, contactEmail: e.target.value }))
                }
                disabled={!isEditing}
                className={`w-full rounded border p-2 ${
                  isEditing ? "" : "bg-gray-100"
                }`}
              />
            </div>

            {/* Customer Address */}
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">
                Customer Address
              </label>
              <textarea
                value={
                  saleData?.salesAddress || saleData?.customer?.address || ""
                }
                onChange={(e) =>
                  setSaleData((prev) =>
                    prev ? { ...prev, salesAddress: e.target.value } : prev
                  )
                }
                disabled={!isEditing}
                className={`w-full rounded border p-2 ${
                  isEditing ? "" : "bg-gray-100"
                }`}
              />
            </div>

            {/* Contact Details */}
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">
                Contact Details
              </label>
              <input
                type="text"
                value={saleData?.customer?.contactNum || ""}
                readOnly
                className="w-full rounded border bg-gray-100 p-2"
              />
            </div>

            {/* Currency */}
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">Currency</label>
              <input
                type="text"
                value={saleData?.currency || ""}
                readOnly
                className="w-full rounded border bg-gray-100 p-2"
              />
            </div>

            {/* Sale Order no */}
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">
                Sale Order no
              </label>
              <input
                type="text"
                value={saleData?.orderNum || ""}
                readOnly
                className="w-full rounded border bg-gray-100 p-2"
              />
            </div>

            {/* Purchase Reference No */}
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">
                Purchase Reference No
              </label>
              <input
                type="text"
                value={form.purchaseRef}
                onChange={(e) =>
                  setForm((f) => ({ ...f, purchaseRef: e.target.value }))
                }
                disabled={!isEditing}
                className={`w-full rounded border p-2 ${
                  isEditing ? "" : "bg-gray-100"
                }`}
              />
            </div>

            {/* Order Date */}
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">Order Date</label>
              <input
                type="text"
                value={form.orderDate}
                readOnly
                className="w-full rounded border bg-gray-100 p-2"
              />
            </div>

            {/* Created on */}
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">Created on</label>
              <input
                type="text"
                value={form.createdOn}
                readOnly
                className="w-full rounded border bg-gray-100 p-2"
              />
            </div>

            {/* Order Status */}
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">
                Order Status
              </label>
              <input
                type="text"
                value={saleData?.status || ""}
                readOnly
                className="w-full rounded border bg-gray-100 p-2"
              />
            </div>

            {/* Sale Agreement No (if applicable) */}
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">
                Sale Agreement No (if applicable)
              </label>
              <input
                type="text"
                value={extras.saleAgreementNo}
                onChange={(e) =>
                  setExtras((x) => ({ ...x, saleAgreementNo: e.target.value }))
                }
                disabled={!isEditing}
                className={`w-full rounded border p-2 ${
                  isEditing ? "" : "bg-gray-100"
                }`}
              />
            </div>

            {/* Terms of payment */}
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">
                Terms of payment
              </label>
              <select
                name="paymentTerms"
                value={form.paymentTerms || saleData?.paymentTerms || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, paymentTerms: e.target.value }))
                }
                disabled={!isEditing}
                className={`w-full rounded border p-2 ${
                  isEditing ? "" : "bg-gray-100"
                }`}
              >
                <option value="">Select type</option>
                {paymentTermsOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Delivery Mode */}
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">
                Delivery Mode
              </label>
              <input
                type="text"
                name="deliveryMode"
                value={form.deliveryMode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deliveryMode: e.target.value }))
                }
                disabled={!isEditing}
                className={`w-full rounded border p-2 ${
                  isEditing ? "" : "bg-gray-100"
                }`}
              />
            </div>

            {/* Order Id */}
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">Order Id</label>
              <input
                type="text"
                name="orderId"
                value={form.orderId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, orderId: e.target.value }))
                }
                disabled={!isEditing}
                className={`w-full rounded border p-2 ${
                  isEditing ? "" : "bg-gray-100"
                }`}
              />
            </div>

            {/* Advance Payment Amount */}
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">
                Advance Payment Amount
              </label>
              <input
                type="number"
                value={advance}
                onChange={(e) => setAdvance(Number(e.target.value) || 0)}
                disabled={!isEditing}
                className={`w-full rounded border p-2 ${
                  isEditing ? "" : "bg-gray-100"
                }`}
              />
            </div>

            {/* Remarks */}
            <div className="col-span-full flex flex-col">
              <label className="font-semibold text-gray-700">Remarks</label>
              <textarea
                value={saleData?.remarks || ""}
                onChange={(e) =>
                  setSaleData((prev) =>
                    prev ? { ...prev, remarks: e.target.value } : prev
                  )
                }
                disabled={!isEditing}
                className={`w-full rounded border p-2 ${
                  isEditing ? "" : "bg-gray-100"
                }`}
              />
            </div>
          </div>

          {/* === Lines Section (your requested table) === */}
          <section className="p-6">
            <div className="mt-4 max-h-96 overflow-y-auto rounded-lg border bg-white">
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      {[
                        "S.N",
                        "Item Code",
                        "Item Name",
                        "Description",
                        "Site",
                        "Warehouse",
                        "Qty",
                        "Unit",
                        "Price",
                        "Discount %",
                        "Amount",
                        "Tax %",
                        "TCS/TDS %",
                        "Total Amount",
                      ].map((header, index) => (
                        <th
                          key={index}
                          className="border border-gray-300 px-2 py-1 text-center"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    <tr key="purchase-order-row" className="hover:bg-gray-50">
                      <td className="border px-2 py-1 text-center">1</td>

                      {/* Item Code */}
                      <td className="border px-2 py-1 text-center">
                        {itemCode}
                      </td>

                      {/* Item Name (select) */}
                      <td className="border px-2 py-1">
                        <select
                          value={selectedItem?._id || ""}
                          disabled={loadingItems || !isEditing}
                          onChange={(e) => onSelectItem(e.target.value)}
                          className="w-full rounded border px-2 py-1"
                        >
                          <option value="">
                            {loadingItems ? "Loading…" : "Select Item"}
                          </option>
                          {items.map((itemOption) => (
                            <option key={itemOption._id} value={itemOption._id}>
                              {itemOption.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Description */}
                      <td className="border px-2 py-1 text-center">
                        <input
                          type="text"
                          value={itemDesc}
                          readOnly
                          className="w-full rounded border bg-gray-100 px-2 py-1 text-center"
                        />
                      </td>

                      {/* Site */}
                      <td className="border px-2 py-1">
                        <select
                          value={String(selectedSite || form.site || "")}
                          onChange={(e) => onSelectSite(e.target.value)}
                          disabled={!isEditing}
                          className="m mt-1 w-full rounded border p-2 focus:ring-2 focus:ring-blue-200"
                        >
                          <option value="">
                            {loadingSites
                              ? "Loading…"
                              : sites.length
                              ? "Select Site"
                              : "No sites found"}
                          </option>
                          {sites.map((site) => (
                            <option
                              key={getSiteId(site)}
                              value={getSiteId(site)}
                            >
                              {getSiteLabel(site)}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Warehouse */}
                      <td className="border px-2 py-1">
                        <select
                          name="warehouse"
                          value={String(form.warehouse || "")}
                          onChange={(e) =>
                            onSelectWarehouse(String(e.target.value))
                          }
                          className="w-full rounded border px-2 py-1"
                          disabled={
                            loadingWarehouses ||
                            !warehouses.length ||
                            !isEditing
                          }
                        >
                          <option value="">
                            {loadingWarehouses
                              ? "Loading…"
                              : "Select Warehouse"}
                          </option>
                          {warehouses.map((w) => {
                            const id = getWhId(w);
                            return (
                              <option key={id} value={id}>
                                {getWhLabel(w)}
                              </option>
                            );
                          })}
                        </select>
                      </td>

                      {/* Qty */}
                      <td className="border px-2 py-1">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full rounded border px-2 py-1 text-center"
                          value={quantity}
                          onChange={(e) =>
                            setQuantity(Number(e.target.value) || 0)
                          }
                          readOnly={!isEditing}
                        />
                      </td>

                      {/* Unit */}
                      <td className="border px-2 py-1 text-center">
                        <input
                          type="text"
                          value={itemUnit}
                          readOnly
                          className="w-full rounded border bg-gray-100 px-2 py-1 text-center"
                        />
                      </td>

                      {/* Price */}
                      <td className="border px-2 py-1">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full rounded border px-2 py-1 text-center"
                          value={price}
                          onChange={(e) =>
                            setPrice(Number(e.target.value) || 0)
                          }
                          readOnly={!isEditing}
                        />
                      </td>

                      {/* Discount % */}
                      <td className="border px-2 py-1">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full rounded border px-2 py-1 text-center"
                          value={discount}
                          onChange={(e) =>
                            setDiscount(Number(e.target.value) || 0)
                          }
                          readOnly={!isEditing}
                        />
                      </td>

                      {/* Amount (before tax) */}
                      <td className="border px-2 py-1 text-center">
                        {isNaN(amountBeforeTax)
                          ? "0.00"
                          : amountBeforeTax.toFixed(2)}
                      </td>

                      {/* Tax % */}
                      <td className="border px-2 py-1">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full rounded border px-2 py-1 text-center"
                          value={tax}
                          onChange={(e) => setTax(Number(e.target.value) || 0)}
                          readOnly={!isEditing}
                        />
                      </td>

                      {/* TCS/TDS % -> maps to withholdingTax */}
                      <td className="border px-2 py-1">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full rounded border px-2 py-1 text-center"
                          value={tcs}
                          onChange={(e) => setTcs(Number(e.target.value) || 0)}
                          readOnly={!isEditing}
                        />
                      </td>

                      {/* Total Amount */}
                      <td className="border px-2 py-1 text-center">
                        {lineAmt}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Summary (your compact set) */}
                <div className="grid grid-cols-1 gap-4 bg-gray-50 p-4 sm:grid-cols-2 md:grid-cols-4">
                  <SummaryCard label="Advance" value={advance} />
                  <SummaryCard
                    label="Subtotal / line amount"
                    value={
                      isNaN(amountBeforeTax)
                        ? "0.00"
                        : amountBeforeTax.toFixed(2)
                    }
                  />
                  <SummaryCard label="Discount (%)" value={discount} />
                  <SummaryCard label="Total (incl tax)" value={lineAmt} />
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Modals */}
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

/** Simple summary card (used in the line summary block) */
const SummaryCard = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-lg font-semibold text-gray-800">
      {String(value ?? "")}
    </span>
  </div>
);

export default SaleorderViewPage;
