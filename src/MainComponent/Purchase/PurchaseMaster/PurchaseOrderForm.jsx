import { useCallback, useEffect, useState } from "react";
import axios from "axios";
// import Invoice from "./Invoice/Icopy";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import PurchaseorderViewPage from "./PurchaseOrderViewPage";
const SummaryCard = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-lg font-semibold text-gray-800">{value}</span>
  </div>
);
const PurchaseOrderform = ({ handleCancel }) => {
  const warehousesBaseUrl =
    "https://fms-qkmw.onrender.com/fms/api/v0/warehouses";
  const itemsBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/items";
  const siteBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/sites";
  const VendorsBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/Vendors";
  const PurchasesOrderUrl = "https://fms-qkmw.onrender.com/fms/api/v0/Purchasesorders";
  const paymentTerms = [
    "COD",
    "Net30D",
    "Net7D",
    "Net15D",
    "Net45D",
    "Net60D",
    "Net90D",
    "Advance",
  ];
  const [form, setForm] = useState({
    site: "",
    warehouse: "",
    // Add other form fields if needed
  });
  const [goForInvoice, setGoPurchaseInvoice] = useState(null);
  const [advance, setAdvance] = useState(0);
  const [Vendors, setVendors] = useState([]);
  const [viewingPurchaseId, setViewingPurchaseId] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState("");
  const [items, setItems] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [PurchaseOrderNum, setPurchaseOrderNum] = useState(null);
  const [sites, setSites] = useState([]);
  // Global form states (for a single order line)
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [tcs, setTcs] = useState(0);
  const [charges, setCharges] = useState(0);
  const [lineAmt, setLineAmt] = useState("0.00");
  const [PurchasesAddress, setPurchasesAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  // Editing and status management states
  const [isEdited, setIsEdited] = useState(false);
  const [status, setStatus] = useState("Draft");
  const [_id, set_id] = useState("");

  // Navigation and Location for Edit mode
  // const navigate = useNavigate();
  // const location = useLocation();

  // If coming back in edit mode, pre-populate form fields accordingly
  useEffect(() => {
    if (location.state && location.state.edit && location.state.PurchaseOrderNum) {
      setPurchaseOrderNum(location.state.PurchaseOrderNum);
      setIsEdited(true);
      // Optionally, fetch Purchase order details here from your API.
    }
  }, [location.state]);

  // -------------------------
  // Line Items State (for detailed items table)
  // -------------------------
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

  const [summary, setSummary] = useState({
    totalLines: 0,
    totalNetAmount: 0,
    totalDiscountAmount: 0,
    totalTaxAmount: 0,
    totalWithholdingTax: 0,
    totalNetAmountAfterTax: 0,
    totalLineAmount: 0,
  });

  // -------------------------
  // Fetch Vendors & Items
  // -------------------------
  useEffect(() => {
    const fetchVendors = async () => {
      console.log("Fetching Vendors...");
      try {
        const response = await axios.get(VendorsBaseUrl);
        console.log("Vendors fetched:", response.data);
        setVendors(response.data.data || []);
      } catch (error) {
        console.error("Error fetching Vendors:", error);
      }
    };

    const fetchItems = async () => {
      console.log("Fetching items...");
      try {
        const response = await axios.get(itemsBaseUrl);
        console.log("Items fetched:", response.data);
        setItems(response.data.data || []);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    const fetchWarehouses = async () => {
      console.log("Fetching warehouses...");
      try {
        const response = await axios.get(warehousesBaseUrl);
        console.log("Warehouses fetched:", response.data);
        setItems(response.data.data || []); // <- likely a mistake, you probably meant `setWarehouses`
      } catch (error) {
        console.error("Error fetching warehouses:", error);
      }
    };

    const fetchSiteBaseUrl = async () => {
      console.log("Fetching site base data...");
      try {
        const response = await axios.get(siteBaseUrl);
        console.log("Site base data fetched:", response.data);
        setItems(response.data.data || []); // <- again, likely meant `setSites` or similar
      } catch (error) {
        console.error("Error fetching site base data:", error);
      }
    };

    fetchSiteBaseUrl();
    fetchVendors();
    fetchWarehouses();
    fetchItems();
  }, []);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // -------------------------
  // Basic Form Validation
  // -------------------------
  const validateForm = () => {
    if (!selectedVendor) {
      toast.warn("⚠️ No Purchase order selected to delete.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      toast.warn("⚠️ Vendor selection is required.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });

      return false;
    }
    if (!selectedItem) {
      toast.warn("⚠️Item selection is required.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });

      return false;
    }
    return true;
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.warn("⚠️ Please fill all the mandatory fields correctly.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });

      return;
    }
    if (!selectedItem) {
      toast.warn("⚠️ Please select an item.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });

      return;
    }

    // Construct payload from global fields
    const payload = {
      Vendor: selectedVendor,
      item: selectedItem._id || selectedItem.id || "",
      quantity: Number(quantity) || 1,
      price: Number(price) || 0,
      discount: Number(discount) || 0,
      remarks: remarks,
      tax: Number(tax) || 0,
      withholdingTax: Number(tcs) || 0,
      charges: Number(charges) || 0,
      advance: Number(advance) || 0,
      PurchasesAddress: PurchasesAddress,
    };

    console.log("📌 Payload being sent:", payload);

    try {
      setLoading(true);
      const { data } = await axios.post(PurchasesOrderUrl, payload, {
        headers: { "Content-Type": "application/json" },
      });
      // Set Purchase order number and mark as created/editable.
      setPurchaseOrderNum(data.data.orderNum);
      set_id(data.data._id);
      console.log(data.data._id, "id");
      setIsEdited(true);
      toast.success(
        `Purchases Order Created Successfully! Order Number: ${data.data.orderNum}`,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );
    } catch (error) {
      console.error("🚨 Error response:", error.response);
      toast.error(
        `Error: ${
          error.response?.data?.message || "Failed to create Purchases Order"
        }`,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        }
      );
    } finally {
      setLoading(false);
    }
  };

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
    const tdsAmount = (amountBeforeTax * tdsVal) / 100;

    const computedLineAmt =
      amountBeforeTax + taxAmount + tcsAmount + chargesVal;

    console.log("🔹 Subtotal:", subtotal);
    console.log("🔹 Discount (%):", discountVal);
    console.log("🔹 Discount Amount:", discountAmount);
    console.log("🔹 Amount Before Tax:", amountBeforeTax);
    console.log("🔹 Tax Amount:", taxAmount);
    console.log("🔹 TCS Amount:", tcsAmount);
    console.log("🔹 TDS Amount:", tdsAmount);
    console.log(
      "🔹 Final Line Amount:",
      isNaN(computedLineAmt) ? 0 : computedLineAmt.toFixed(2)
    );

    return {
      amountBeforeTax: isNaN(amountBeforeTax)
        ? "0.00"
        : amountBeforeTax.toFixed(2),
      lineAmt: isNaN(computedLineAmt) ? "0.00" : computedLineAmt.toFixed(2),
    };
  };

  // Updates a line item field and recalculates amounts
  const handleLineItemChange = (id, field, value) => {
    setLineItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === "discount" ? Number(value) || 0 : value,
              ...calculateTotalAmount({
                ...item,
                [field]: field === "discount" ? Number(value) || 0 : value,
              }),
            }
          : item
      )
    );
  };

  // Updated Handler for Line Item Item-Selection

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

  // -------------------------
  // Fetch Vendor Details on Vendor Selection
  // -------------------------
  const [selectedVendorDetails, setSelectedVendorDetails] = useState({
    contactNum: "",
    currency: "",
    address: "",
    email: "",
  });
  useEffect(() => {
    if (selectedVendor) {
      const Vendor = Vendors.find((c) => c._id === selectedVendor);
      if (Vendor) {
        setSelectedVendorDetails({
          contactNum: Vendor.contactNum || "",
          currency: Vendor.currency || "",
          address: Vendor.address || "",
          email: Vendor.email || "", // ← correct!
        });
      }
    } else {
      setSelectedVendorDetails({
        contactNum: "",
        currency: "",
        address: "",
        email: "",
      });
    }
  }, [selectedVendor, Vendors]);

  // -------------------------
  // Fetch Item Details on Global Item Selection
  // -------------------------
  const [itemDetails, setItemDetails] = useState({
    code: "",
    name: "",
    type: "",
    unit: "",
    price: 0,
    id: "",
  });

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
        // Set default values
        setPrice(Number(item.price) || 0);
        setDiscount(Number(item.discount) || 0);
        setTax(Number(item.tax) || 0);
        setTcs(Number(item.tcs) || 0);
        setQuantity(Number(item.quantity) || 0);
      }
    }
  }, [selectedItem, items]);

  // -------------------------
  // Global Line Amount Calculation (for the single item form)
  // -------------------------
  useEffect(() => {
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
  }, [quantity, price, discount, tax, tcs]);

  // Pre-calculate amountBeforeTax for table display
  const discountAmountForDisplay =
    (Number(discount) * Number(quantity) * Number(price)) / 100;
  const amountBeforeTax =
    Number(quantity) * Number(price) - discountAmountForDisplay;

  // -------------------------
  // Navigation: Go Back
  // -------------------------
  const goBack = () => {
    navigate(-1);
  };

  // -------------------------
  // Handle Edit button click:
  // Navigate to the Purchase Order View Page with the Purchase order identifier.
  // -------------------------
  const handleEdit = () => {
    setViewingPurchaseId(_id);
  };
  // -------------------------
  // Render Component
  // -------------------------
  return (
    <div className="">
      <ToastContainer />
      {/* Header Buttons */}
      <div className="flex justify-between ">
        <div className="flex items-center space-x-2">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            {" "}
            <button
              type="button"
              className="text-blue-600 mt-2 text-sm hover:underline"
            >
              Upload Photo
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11c1.656 0 3-1.344 3-3s-1.344-3-3-3-3 1.344-3 3 1.344 3 3 3zm0 2c-2.761 0-5 2.239-5 5v3h10v-3c0-2.761-2.239-5-5-5z"
                />
              </svg>{" "}
            </button>
          </div>
          <h3 className="text-xl font-semibold">Purchase Order Form</h3>
        </div>
      </div>

      <form
        onSubmit={handleCreate}
        className="bg-white shadow-none rounded-lg divide-y divide-gray-200"
      >
        {/* Business Details */}
        <section className="p-6">
          <div className="flex flex-wrap w-full gap-2">
            {/* Maintain Section */}
            <div className="p-2 h-17 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-6">
                <div className="flex flex-nowrap gap-2">
                  {PurchaseOrderNum ? (
                    <>
                      <button
                        type="button"
                        disabled
                        className="px-3 py-2 w-36 text-xs font-medium border border-gray-300 rounded-md bg-gray-200 cursor-not-allowed"
                      >
                        Create
                      </button>
                      <button
                        onClick={handleEdit}
                        type="button"
                        className="px-3 py-2 w-36 text-xs font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-100"
                      >
                        Edit
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleCreate}
                      type="submit"
                      className="px-3 py-2 w-36 text-xs font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-100"
                    >
                      Create
                    </button>
                  )}
                  <button
                    onClick={handleCancel}
                    className="px-3 py-2 w-36 text-xs font-medium text-red-600 bg-white border border-red-400 rounded-md hover:bg-red-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Purchase Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Purchase Order */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Purchase Order
              </label>
              <input
                type="text"
                name="PurchaseOrder"
                value={PurchaseOrderNum || ""}
                placeholder="Purchase Order"
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Vendor Account
              </label>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select Vendor</option>
                {Vendors.map((Vendor) => (
                  <option key={Vendor._id} value={Vendor._id}>
                    {Vendor.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-4 h-full">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Vendor Name
                  </label>
                  <input
                    type="text"
                    value={selectedVendorDetails?.account || ""}
                    placeholder="Vendor Account"
                    className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                    readOnly
                  />
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Contact Email
                  </label>
                  <input
                    type="text"
                    value={selectedVendorDetails.email}
                    placeholder="Contact Email"
                    className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                    readOnly
                  />
                </div>
              </div>
              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Vendor Address
                </label>
                <textarea
                  rows="4"
                  value={selectedVendorDetails?.address || ""}
                  readOnly
                  className="mt-1 w-full  p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Name + Currency */}
            </div>
            {/* Order Date */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Contact Details
              </label>
              <input
                type="text"
                value={selectedVendorDetails.contactNum}
                placeholder="Contact Number"
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Currency
              </label>
              <input
                type="text"
                value={selectedVendorDetails?.currency || ""}
                placeholder="Currency"
                readOnly
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Order Date
              </label>
              <input
                type="date"
                name="orderDate"
                value={form.orderDate}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>

            {/* Created On */}
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
            </div>

            {/* Order Status */}
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
            </div>

            {/* Conditional Vendor Details */}
            {selectedVendorDetails && (
              <>
                {/* Currency */}

                {/* Email (User Editable) */}

                {/* Purchase Agreement No */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Purchase Agreement No (if applicable)
                  </label>
                  <input
                    type="text"
                    name="PurchaseAgreementNo"
                    value={form.PurchaseAgreementNo}
                    onChange={handleChange}
                    className="mt-1 w-full p-2 border rounded"
                  />
                </div>

                {/* Purchase Reference No */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Purchase Reference No
                  </label>
                  <input
                    type="text"
                    name="purchaseRef"
                    value={form.purchaseRef}
                    onChange={handleChange}
                    className="mt-1 w-full p-2 border rounded"
                  />
                </div>

                {/* Purchase Address */}

                {/* Contact Details */}

                {/* Contact Email */}

                {/* Site */}
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
                </div>

                {/* Payment Terms */}
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
                </div>

                {/* Delivery Mode */}
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

                {/* Order ID */}
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

                {/* Advance */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Advance Payment Amount
                  </label>
                  <input
                    type="text"
                    name="advance"
                    value={advance}
                    onChange={(e) => {
                      const value =
                        Number(e.target.value.replace(/\D/g, "")) || 0;
                      setAdvance(value);
                    }}
                    className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </>
            )}

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Remarks
              </label>
              <textarea
                name="remarks"
                rows="4"
                value={form.remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
          </div>
        </section>

        <section className="p-6">
          <div className="max-h-96 overflow-y-auto mt-4 border rounded-lg bg-white">
            <div className="space-y-6 p-4">
              <table className="min-w-full border-collapse text-sm text-gray-700">
                <thead className="bg-gray-100 text-gray-900 uppercase text-xs font-semibold sticky top-0 z-10">
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
                      "Discount %",        "Discountamount",
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
                    <td className="border text-center px-2 py-1">1</td>

                    <td className="border px-2 py-1 text-center">
                      {selectedItem?.code || ""}
                    </td>

                    <td className="border px-2 py-1">
                      <select
                        value={selectedItem?._id || ""}
                        disabled={!isEdited}
                        onChange={(e) => {
                          const sel = items.find(
                            (item) => item._id === e.target.value
                          );
                          setSelectedItem(sel);
                          if (sel) setPrice(Number(sel.price) || 0);
                        }}
                        className="w-full border rounded px-2 py-1"
                      >
                        <option value="">Select Item</option>
                        {items.map((itemOption) => (
                          <option key={itemOption._id} value={itemOption._id}>
                            {itemOption.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="border px-2 py-1 text-center">
                      <input
                        type="text"
                        value={selectedItem?.description || ""}
                        readOnly
                        className="w-full border rounded text-center px-2 py-1 bg-gray-100"
                      />
                    </td>

                    <td className="border px-2 py-1 text-center">
                      <input
                        type="text"
                        placeholder="Site"
                        className="w-full border rounded text-center px-2 py-1"
                      />
                    </td>

                    <td className="border px-2 py-1 text-center">
                      <input
                        type="text"
                        placeholder="Warehouse"
                        className="w-full border rounded text-center px-2 py-1"
                      />
                    </td>

                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        className="w-full border rounded text-center px-2 py-1"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Number(e.target.value) || 0)
                        }
                      />
                    </td>

                    <td className="border px-2 py-1 text-center">
                      <input
                        type="text"
                        value={selectedItem?.unit || ""}
                        readOnly
                        className="w-full border rounded text-center px-2 py-1 bg-gray-100"
                      />
                    </td>

                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        className="w-full border rounded text-center px-2 py-1"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value) || 0)}
                      />
                    </td>

                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        className="w-full border rounded text-center px-2 py-1"
                        value={discount}
                        onChange={(e) =>
                          setDiscount(Number(e.target.value) || 0)
                        }
                      />
                    </td>
      <td className="border px-2 py-1">
                      <input
                        type="text"
                        className="w-full border rounded text-center px-2 py-1"
                        value={discount}
                        onChange={(e) =>
                          setDiscount(Number(e.target.value) || 0)
                        }
                      />
                    </td>
                    <td className="border px-2 py-1 text-center">
                      {isNaN(amountBeforeTax)
                        ? "0.00"
                        : amountBeforeTax.toFixed(2)}
                    </td>

                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        className="w-full border rounded text-center px-2 py-1"
                        value={tax}
                        onChange={(e) => setTax(Number(e.target.value) || 0)}
                      />
                    </td>

                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        className="w-full border rounded text-center px-2 py-1"
                        value={tcs}
                        onChange={(e) => setTcs(Number(e.target.value) || 0)}
                      />
                    </td>

                    <td className="border px-2 py-1 text-center">{lineAmt}</td>
                  </tr>
                </tbody>
              </table>

              {/* Summary Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                <SummaryCard label="Advance" value={advance} />
                <SummaryCard
                  label="Subtotal /  line amount"
                  value={
                    isNaN(amountBeforeTax) ? "0.00" : amountBeforeTax.toFixed(2)
                  }
                />
                <SummaryCard label="Discount" value={discount} />
                <SummaryCard label="Total Tax" value={lineAmt} />
                <SummaryCard
                  label="Total Tds/ Tcs"
                  value={
                    isNaN(amountBeforeTax) ? "0.00" : amountBeforeTax.toFixed(2)
                  }
                />
                <SummaryCard
                  label="Grand Total"
                  value={isNaN(lineAmt) ? "0.00" : lineAmt}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="py-6 flex items-center justify-between">
          {/* Left side - Reset Button */}
          <div>
            <button
              type="button"
              // onClick={handleReset}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Reset
            </button>
          </div>

          {/* Right side - Go Back and Create Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            >
              Go Back
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Create
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PurchaseOrderform;
