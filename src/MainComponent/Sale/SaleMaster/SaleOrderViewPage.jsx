import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Keep if you navigate to invoice pages that render this:
import Invoice from "../Invoice/Icopy";

/** ---------- API ROOTS (single source) ---------- */
const API_ROOT = "https://fms-qkmw.onrender.com/fms/api/v0";
const SALES_URL = `${API_ROOT}/salesorders`;
const META_URL = API_ROOT;
const warehousesBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/warehouses";
const itemsBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/items";
const siteBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/sites";
const customersBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/customers";
const salesOrderUrl = "https://fms-qkmw.onrender.com/fms/api/v0/salesorders";
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
                  <td className="border p-2">
                    {Number(payment?.amount || 0).toFixed(2)}
                  </td>
                  <td className="border p-2">
                    {payment?.date
                      ? new Date(payment.date).toLocaleString()
                      : ""}
                  </td>
                  <td className="border p-2">{payment?.transactionId || ""}</td>
                  <td className="border p-2">{payment?.paymentMode || ""}</td>
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
      date: new Date(paymentDate),
    };
    onSubmit(paymentData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-96 transform transition-all duration-300 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
          aria-label="Close"
        >
          ×
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
  // ---------- Constants ----------
  const defaultTerms = [
    "Immediate",
    "Net 7",
    "Net 15",
    "Net 30",
    "Net 45",
    "Net 60",
  ];
  const paymentTerms = useMemo(
    () => [
      "Net 30",
      "Net 60",
      "Net 90",
      "Due on Receipt",
      "End of Month",
      "Custom",
    ],
    []
  );
  const handleSimpleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // ---------- State ----------
  const [inputSaleId, setInputSaleId] = useState("");
  const [saleData, setSaleData] = useState(null);
  const [isEdited, setIsEdited] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDraft, setIsDraft] = useState(false);

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
  const setFormData = setForm;

  const [extras, setExtras] = useState({
    saleAgreementNo: "",
    contactEmail: "",
    purchaseRef: "",
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
    const [discountamount, setDiscountamount] = useState(0); // %
  const [tax, setTax] = useState(0); // %
  const [tcs, setTcs] = useState(0); // %
  const [advance, setAdvance] = useState(0);
  const [itemCode, setItemCode] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemUnit, setItemUnit] = useState("");

  const navigate = useNavigate();
  const { id: urlId } = useParams();
  const SaleId = saleId;
  const id = urlId;
  const finalId = useMemo(() => saleId || urlId, [saleId, urlId]);

  // ---------- Helpers ----------
  const normalizeData = (res) => res?.data?.data ?? res?.data ?? res;
  const safeDateTime = (d) => (d ? new Date(d).toLocaleString() : "");
  const getOrderDate = (data) => data?.orderDate || data?.createdAt || "";

  const getSiteId = (s) =>
    typeof s === "object" ? s._id || s.id || "" : String(s || "");
  const getSiteLabel = (s) =>
    typeof s === "object" ? s.name || s.code || getSiteId(s) : String(s || "");

  const getWhId = (w) =>
    typeof w === "object" ? w._id || w.id || "" : String(w || "");
  const getWhLabel = (w) =>
    typeof w === "object" ? w.name || w.code || getWhId(w) : String(w || "");

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

  /** ---- IMPORTANT: Hooks before any return ---- */
  const paymentTermsOptions = useMemo(() => {
    const current = (form.paymentTerms || saleData?.paymentTerms || "").trim();
    const base = [...defaultTerms];
    if (current && !base.includes(current)) base.unshift(current);
    return base;
  }, [form.paymentTerms, saleData?.paymentTerms, defaultTerms]);

  // ---------- Fetchers ----------
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
        // "An unexpected error occurred. Please try again.";
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

  // ---------- Effects ----------
  useEffect(() => {
    async function fetchSaleDetailOnce() {
      setLoading(true);
      try {
        const response = await axios.get(`${SALES_URL}/${SaleId || id}`);
        if (response.status === 200) {
          const data = response?.data?.data ?? response?.data;
          setSaleData(data);

          setFormData((prev) => ({
            ...prev,
            ...data,
            createdOn: safeDateTime(data?.createdAt),
            orderDate: safeDateTime(data?.orderDate || data?.createdAt),
          }));

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
          setError(`Unexpected response status: ${response.status}`);
        }
      } catch (error) {
        const serverData = error?.response?.data;
        const errorMessage =
          (typeof serverData === "string" && serverData) ||
          serverData?.message ||
          "An unexpected error occurred. Please try again.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    if (SaleId || id) {
      fetchSaleDetailOnce();
    } else {
      toast.error("No Sale ID provided in props or URL.");
    }
  }, [SaleId, id]);

  useEffect(() => {
    fetchSites();
    fetchWarehouses();
    fetchCustomers();
    fetchItems();
  }, [fetchSites, fetchWarehouses, fetchCustomers, fetchItems]);

  useEffect(() => {
    setIsDraft(saleData?.status === "Draft");
  }, [saleData?.status]);

  // ---------- UI Actions ----------
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

  const handleUpdate = async () => {
    const idToUse = finalId || inputSaleId;
    if (!idToUse) {
      toast.error("No Sale ID available for update.");
      return;
    }
    if (!window.confirm("Are you sure you want to update this sale?")) return;

    setLoading(true);
    try {
      const payload = {
        ...saleData,
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
        customer:
          selectedCustomer || saleData?.customer?._id || saleData?.customer,
        salesAddress:
          saleData?.salesAddress || saleData?.customer?.address || "",
        advance: Number(advance) || 0,
        quantity: Number(quantity) || 0,
        discount: Number(discount) || 0,
        tax: Number(tax) || 0,
        withholdingTax: Number(tcs) || 0,
        lineAmt: Number(lineAmt) || 0,
        netAR: Number(lineAmt) || 0,
        netAmtAfterTax: Number(lineAmt) || 0,
        netPaymentDue: Number(lineAmt) || 0,
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
  const [loadingCustomers, setLoadingCustomers] = useState(false);
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

  /** ---------- Early Return AFTER all hooks declared ---------- */
  if (loading && !saleData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-zinc-500 border-t-transparent"></div>
        <p className="mt-4 text-lg font-medium text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2">
      <ToastContainer />
      <h1 className="mb-4 text-xl font-bold">Sales Order View Page</h1>

      {/* Maintain / Status / Settlement */}
     <div className="flex flex-wrap w-full gap-2">
      <div className="p-2 h-17 bg-white">
       <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-6">
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

      {!loading && saleData && (
          <div className="p-2 h-17 bg-white">
          {/* === Header Fields === */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Sale Order
              </label>
              <input
                type="text"
                name="saleOrder"
                value={saleData?.orderNum ?? ""}
                placeholder="Sale Order"
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Customer Account
              </label>
              <select
                value={selectedCustomer || saleData?.customer?._id || ""}
                disabled={!isEditing}
                onChange={(e) => onSelectCustomer(e.target.value)}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">
                  {loadingCustomers ? "Loading…" : "Select Customer"}
                </option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {`${c.code} ${c.name}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-4 h-full">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={
                      saleData?.customer?.name ??
                      selectedCustomerDetails?.name ??
                      ""
                    }
                    placeholder="Customer Name"
                    className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Contact Email
                  </label>
                  <input
                    type="text"
                    value={
                      extras.contactEmail ??
                      selectedCustomerDetails?.email ??
                      ""
                    }
                    onChange={(e) =>
                      setExtras((x) => ({ ...x, contactEmail: e.target.value }))
                    }
                    disabled={!isEditing}
                    placeholder="Contact Email"
                    className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Customer Address
                </label>
                <textarea
                  rows="4"
                  value={
                    saleData?.salesAddress ??
                    saleData?.customer?.address ??
                    selectedCustomerDetails?.address ??
                    ""
                  }
                  onChange={(e) =>
                    setSaleData((prev) =>
                      prev ? { ...prev, salesAddress: e.target.value } : prev
                    )
                  }
                  disabled={!isEditing}
                  className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Contact Details
              </label>
              <input
                type="text"
                value={
                  saleData?.customer?.contactNum ??
                  selectedCustomerDetails?.contactNum ??
                  ""
                }
                placeholder="Contact Number"
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                readOnly
              />
            </div>
 <div>
              <label className="block text-sm font-medium text-gray-600">
              Sale Agreement No
              </label>
              <input
                type="text"
                value={saleData?.orderNum ?? ""}
                placeholder="Sale Order No"
                readOnly
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Currency
              </label>
              <input
                type="text"
                value={
                  saleData?.currency ?? selectedCustomerDetails?.currency ?? ""
                }
                placeholder="Currency"
                readOnly
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

             <div>
              <label className="block text-sm font-medium text-gray-600">
                Purchase Reference No
              </label>
              <input
                type="text"
                name="purchaseRef"
                value={form.purchaseRef ?? ""}
                onChange={handleSimpleChange}
                disabled={!isEditing}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Order Date{" "}
              </label>
              <input
                type="text"
                value={form.orderDate ?? saleData?.orderDate ?? ""}
                readOnly
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
 <div>
              <label className="block text-sm font-medium text-gray-600">
                Order Status
              </label>
              <input
                type="text"
                value={saleData?.status ?? status ?? ""}
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Created on
              </label>
              <input
                type="text"
                value={form.createdOn ?? ""}
                readOnly
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

           

            {/* Optional entries */}
          <div>
              <label className="block text-sm font-medium text-gray-600">
                Terms of payment
              </label>
              <select
                name="paymentTerms"
                value={form.paymentTerms ?? saleData?.paymentTerms ?? ""}
                onChange={handleSimpleChange}
                disabled={!isEditing}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select type</option>
                {paymentTerms.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          

            

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Delivery Mode
              </label>
              <input
                type="text"
                name="deliveryMode"
                value={form.deliveryMode ?? ""}
                onChange={handleSimpleChange}
                disabled={!isEditing}
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
                value={form.orderId ?? ""}
                onChange={handleSimpleChange}
                disabled={!isEditing}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Advance Payment Amount
              </label>
              <input
                type="number"
                name="advance"
                value={advance}
                onChange={(e) => setAdvance(Number(e.target.value) || 0)}
                disabled={!isEditing}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={form.remarks ?? saleData?.remarks ?? ""}
                onChange={handleSimpleChange}
                disabled={!isEditing}
                placeholder="e.g. Sector 98, Noida, Uttar Pradesh, 201301"
                rows={4}
                className="mt-1 m w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
   
          {/* === Lines Section === */}
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
                           "Discountamount ",
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
                            const idVal = getWhId(w);
                            return (
                              <option key={idVal} value={idVal}>
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
  <td className="border px-2 py-1">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full rounded border px-2 py-1 text-center"
                          value={discountamount}
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

                      {/* TCS/TDS % */}
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

                {/* Summary */}
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
