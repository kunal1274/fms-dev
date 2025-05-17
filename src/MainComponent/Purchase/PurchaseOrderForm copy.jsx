import { useEffect, useState } from "react";
import axios from "axios";
// import Invoice from "./Invoice"; // Uncomment if you have an Invoice component
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const PurchaseOrderForm = ({ handleCancel }) => {
  const itemsBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/items";
  const VendorsBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/vendors";
  const PurchasesOrderUrl =
    "https://fms-qkmw.onrender.com/fms/api/v0/purchasesorders";
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
  const [goForInvoice, setGoPurchaseInvoice] = useState(null);
  const [advance, setAdvance] = useState(0);  const [vendor, setVendor] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [viewingPurchaseId, setViewingPurchaseId] = useState(null);
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState("");
  const [items, setItems] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [purchaseOrderNum, setPurchaseOrderNum] = useState(null);

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
  const [purchasesAddress, setPurchasesAddress] = useState(null);
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
    if (
      location.state &&
      location.state.edit &&
      location.state.purchaseOrderNum
    ) {
      setPurchaseOrderNum(location.state.purchaseOrderNum);
      setIsEdited(true);
      // Optionally, fetch purchase order details here from your API.
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
      try {
        const response = await axios.get(VendorsBaseUrl);
        setVendors(response.data.data || []);
      } catch (error) {
        console.error("Error fetching vendors:", error);
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

    fetchVendors();
    fetchItems();
  }, []);

  // -------------------------
  // Basic Form Validation
  // -------------------------
  const validateForm = () => {
    if (!selectedVendor) {
      toast.warn("⚠️ No purchase order selected to delete.", {
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
      vendor: selectedVendor,
      item: selectedItem._id || selectedItem.id || "",
      quantity: Number(quantity) || 1,
      price: Number(price) || 0,
      discount: Number(discount) || 0,
      remarks: remarks,
      tax: Number(tax) || 0,
      withholdingTax: Number(tcs) || 0,
      charges: Number(charges) || 0,
      advance: Number(advance) || 0,
      purchasesAddress: purchasesAddress,
    };

    console.log("📌 Payload being sent:", payload);

    try {
      setLoading(true);
      const { data } = await axios.post(purchasesOrderUrl, payload, {
        headers: { "Content-Type": "application/json" },
      });
      // Set purchase order number and mark as created/editable.
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
      const vendor = vendors.find((c) => c._id === selectedVendor);
      if (vendor) {
        setSelectedVendorDetails({
          contactNum: vendor.contactNum || "",
          currency: vendor.currency || "",
          address: vendor.address || "",
          email: vendor.email || "", // ← correct!
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
  }, [selectedVendor, vendors]);

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
  // Navigate to the purchase Order View Page with the purchase order identifier.
  // -------------------------
  const handleEdit = () => {
    setViewingPurchaseId(_id);
  };

  // -------------------------
  // Render Component
  // -------------------------
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-blue-500 text-lg font-medium">Loading...</p>
      </div>
    );
  }
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
                  {purchaseOrderNum ? (
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
            <div className="">
              <label className="block text-sm font-medium text-gray-600">
                Purchase Order
              </label>

              <input
                type="text"
                name="purchaseOrder"
                value={purchaseOrderNum || ""}
                placeholder="Purchase Order"
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Vendor Name
              </label>
              <select
                value={selectedVendor}
                onChange={(e) => setselectedVendor(e.target.value)}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select Vendor</option>
                {vendors.map((Vendor) => (
                  <option key={Vendor._id} value={Vendor._id}>
                    {Vendor.name}
                  </option>
                ))}
              </select>
            </div>{" "}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-600">
                Order Status
              </label>

              <input
                type="text"
                value={status}
                placeholder="Selected Status"
                disabled
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                readOnly
              />
            </div>{" "}
            {selectedVendorDetails && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Currency
                  </label>{" "}
                  <input
                    type="text"
                    value={selectedVendorDetails.currency}
                    placeholder="Currency"
                    className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                    readOnly
                  />
                </div>{" "}
                {selectedVendorDetails && (
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-600">
                      Vendor Address
                    </label>
                    <textarea
                      name="address"
                      rows="4"
                      value={selectedVendorDetails.address}
                      disabled={!isEdited}
                      placeholder="Vendor Address / Buyer Address / Billing Address"
                      className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                      readOnly
                    />
                  </div>
                )}{" "}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-600">
                    Purchase Address
                  </label>
                  <textarea
                    name="address"
                    rows="4"
                    onChange={(e) => setPurchasesAddress(e.target.value)}
                    placeholder="Vendor Address / Buyer Address / Billing Address"
                    className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-600">
                    Contact Details
                  </label>{" "}
                  <input
                    type="text"
                    value={selectedVendorDetails.contactNum}
                    placeholder="Contact Number"
                    className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                    readOnly
                  />
                </div>{" "}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-600">
                    Contact email
                  </label>{" "}
                  <input
                    type="text"
                    value={selectedVendorDetails.email}
                    placeholder="Contact Number"
                    className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Terms of payment
                  </label>
                  <select
                    name="paymentTerms"
                    required
                    className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">Select type</option>
                    {paymentTerms.map((type) => (
                      <option key={type.trim()} value={type.trim()}>
                        {type.trim()}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-600">
                    Advance
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <input
                      type="text"
                      value={advance}
                      name="advance"
                      placeholder="Advance"
                      className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                      onChange={(e) => {
                        const value =
                          Number(e.target.value.replace(/\D/g, "")) || 0;
                        setAdvance(value);
                      }}
                    />{" "}
                  </div>
                </div>
              </>
            )}{" "}
            {/* Remarks */}
            <div className="flex flex-col ">
              <label className="block text-sm font-medium text-gray-600">
                Remarks
              </label>
              <textarea
                name="remarks"
                placeholder="Remarks"
                rows="4"
                onChange={(e) => setRemarks(e.target.value)}
                className="border border-gray-300 rounded-lg p-1 w-full focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>{" "}
          </div>
        </section>

        <section className="p-6">
          <div className="max-h-96 overflow-y-auto mt-4">
            <div className="space-y-6">
              <table className="min-w-full border-collapse border border-gray-300 text-sm text-gray-700">
                <thead className="bg-gray-100 text-gray-900 uppercase text-xs font-semibold">
                  <tr>
                    <th className="border p-1 text-center">S.N</th>
                    <th className="border p-1 text-center">Item Code</th>
                    <th className="border p-1 w-60 text-center">Item Name</th>
                    <th className="border p-1 text-center">Qty</th>
                    <th className="border p-1 text-center">Unit</th>
                    <th className="border p-1 text-center">Price</th>
                    <th className="border p-1 text-center">Discount %</th>
                    <th className="border p-1 text-center">Amount</th>
                    <th className="border p-1 text-center">Tax %</th>
                    <th className="border p-1 text-center">TCS/TDS %</th>
                    <th className="border p-1 text-center">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr key="purchases-order-row" className="hover:bg-gray-50">
                    {/* Serianpml Number */}
                    <td className="border text-center p-1">1</td>
                    {/* Item Code (displayed from the selected item) */}
                    <td className="border p-1">
                      {selectedItem ? selectedItem.code : ""}
                    </td>
                    {/* Item Name Dropdown */}
                    <td className="border p-1">
                      <select
                        value={selectedItem ? selectedItem._id : ""}
                        disabled={!isEdited && purchaseOrderNum}
                        onChange={(e) => {
                          const sel = items.find(
                            (item) => item._id === e.target.value
                          );
                          setSelectedItem(sel);
                          if (sel) {
                            setPrice(Number(sel.price) || 0);
                          }
                        }}
                        className="border rounded p-1 text-left w-60"
                      >
                        <option value="">Select Item</option>
                        {items.map((itemOption) => (
                          <option key={itemOption._id} value={itemOption._id}>
                            {itemOption.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    {/* Quantity Input */}
                    <td className="border p-1">
                      <input
                        type="text  "
                        className="border rounded p-1 text-center w-24"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Number(e.target.value) || 0)
                        }
                      />
                    </td>
                    {/* Unit (displayed from the selected item) */}
                    <td className="border p-1">
                      <input
                        type="text"
                        value={selectedItem ? selectedItem.unit : ""}
                        readOnly // Ensures it's only for display, remove if editing is needed
                        className="border rounded p-1 text-center w-24"
                      />
                    </td>

                    {/* Price Input */}
                    <td className="border p-1">
                      <input
                        type="text"
                        value={price}
                        className="border rounded p-1 text-center w-24"
                        onChange={(e) => setPrice(Number(e.target.value) || 0)}
                      />
                    </td>
                    {/* Discount % Input */}
                    <td className="border p-1">
                      <input
                        type="text"
                        className="border rounded p-1 text-center w-24"
                        value={discount}
                        onChange={(e) =>
                          setDiscount(Number(e.target.value) || 0)
                        }
                      />
                    </td>
                    {/* Amount before Tax */}
                    <td className="border p-1 text-center">
                      {isNaN(amountBeforeTax)
                        ? "0.00"
                        : amountBeforeTax.toFixed(2)}
                    </td>
                    {/* Tax % Input */}
                    <td className="border p-1">
                      <input
                        type="text"
                        className="border rounded p-1 text-center w-24"
                        value={tax}
                        onChange={(e) => setTax(Number(e.target.value) || 0)}
                      />
                    </td>
                    {/* TCS/TDS % Input */}
                    <td className="border p-1">
                      <input
                        type="text"
                        className="border rounded p-1 text-center w-24"
                        value={tcs}
                        onChange={(e) => setTcs(Number(e.target.value) || 0)}
                      />
                    </td>
                    {/* Total Amount */}
                    <td className="border p-1 text-center">{lineAmt}</td>
                  </tr>
                </tbody>
              </table>{" "}
              <div className="summary border p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded shadow-sm">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600">Advance</span>
                  <span className="text-lg font-semibold text-gray-800">
                    {advance}
                  </span>
                </div>{" "}
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600"> Amt</span>
                  <span className="text-lg font-semibold text-gray-800">
                    {isNaN(amountBeforeTax)
                      ? "0.00"
                      : amountBeforeTax.toFixed(2)}
                  </span>
                </div>{" "}
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600"> Discount</span>
                  <span className="text-lg font-semibold text-gray-800">
                    {discount}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600">Line Amt</span>
                  <span className="text-lg font-semibold text-gray-800">
                    {lineAmt}
                  </span>
                </div>
              </div>
            </div>{" "}
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

export default PurchaseOrderForm;
