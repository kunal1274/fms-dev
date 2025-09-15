import { useEffect, useState } from "react";
import axios from "axios";
// import Invoice from "./Invoice"; // Uncomment if you have an Invoice component
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const data = {
  invoiceId: "INV-1001",
  status: "Draft",
  creationDate: "2025-09-11T10:00:00Z",
  customer: {
    id: "CUST-001",
    name: "ABC Pvt Ltd",
    currency: "INR",
    address: "123 Business Street, Bengaluru, India",
    email: "accounts@abcpvt.com",
    contactNum: "+91-9876543210",
  },
  remarks: "Sample free taxing invoice for demo.",
  transactionType: "Credit Note",
  ledgerAccount: "Sales Return Ledger",
  invoiceDate: "2025-09-11",
  items: [
    {
      id: "ITEM-001",
      code: "PRD-100",
      name: "Product A",
      description: "Sample product A",
      site: "Site-01",
      warehouse: "WH-01",
      unit: "PCS",
      quantity: 10,
      price: 250,
      discount: 5,
      tax: 18,
      tcs: 1,
      amountBeforeTax: 2375,
      totalAmount: 2801.5,
    },
    {
      id: "ITEM-002",
      code: "PRD-200",
      name: "Product B",
      description: "Sample product B",
      site: "Site-01",
      warehouse: "WH-02",
      unit: "BOX",
      quantity: 5,
      price: 500,
      discount: 0,
      tax: 12,
      tcs: 0,
      amountBeforeTax: 2500,
      totalAmount: 2800,
    },
  ],
  summary: {
    totalLines: 2,
    totalNetAmount: 4875,
    totalDiscountAmount: 125,
    totalTaxAmount: 801.5,
    totalWithholdingTax: 23.75,
    totalLineAmount: 5601.5,
  },
};

const SummaryCard = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-lg font-semibold text-gray-800">{value}</span>
  </div>
);
const FreeTaxingInvoice = (  ) => {
  const itemsBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/items";
  const CustomersBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/Customers";
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
  const [advance, setAdvance] = useState(0);
  const [Customer, setCustomer] = useState([]);
  const [Customers, setCustomers] = useState([]);
  const [viewingPurchaseId, setViewingPurchaseId] = useState(null);
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState("");
  const [items, setItems] = useState([]);
  const [remarks, setRemarks] = useState("");

  const [purchaseOrderNum, setPurchaseOrderNum] = useState(null);
  // Global form states (for a single order line)
  const [selectedCustomer, setSelectedCustomer] = useState("");
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
  // Fetch Customers & Items
  // -------------------------
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(CustomersBaseUrl);
        setCustomers(response.data.data || []);
      } catch (error) {
        console.error("Error fetching Customers:", error);
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
  const [isEditing, setIsEditing] = useState(true);
  const handleCancel = () => {
    if (prevFormData) {
      setFormData(prevFormData); // restore saved data
    }
    setIsEditing(false);
  };
  const handleUpdate = async () => {
    if (window.confirm("Are you sure you want to update this customer?")) {
      setLoading(true);

      // Create a custom green spinner icon for the toast
      const loaderIcon = (
        <div
          style={{
            display: "inline-block",
            width: "20px",
            height: "20px",
            border: "3px solid #4CAF50",
            borderTop: "3px solid transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
      );

      // Show a loading toast with our custom icon
      const toastId = toast.loading("Updating...", {
        icon: loaderIcon,
        position: "top-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
      });

      try {
        const response = await axios.put(
          `${mergedUrl}/${customerId}`,
          formData,
          { withCredentials: false }
        );

        if (response.status === 200) {
          setCustomerDetail(response.data);
          setIsEditing(false);
          toast.update(toastId, {
            render: "Customer updated successfully!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
            progress: undefined,
          });
        } else {
          console.error(`Unexpected response status: ${response.status}`);
          toast.update(toastId, {
            render: "Failed to update customer. Please try again.",
            type: "error",
            isLoading: false,
            autoClose: 3000,
            progress: undefined,
          });
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "An unexpected error occurred.";
        console.error("Error updating customer:", err);
        toast.update(toastId, {
          render: errorMessage,
          type: "error",
          isLoading: false,
          autoClose: 3000,
          progress: undefined,
        });
      } finally {
        setLoading(false);
        // toggleView();
      }
    }
  };

  // -------------------------
  // Basic Form Validation
  // -------------------------
  const validateForm = () => {
    if (!selectedCustomer) {
      toast.warn("⚠️ No purchase order selected to delete.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      toast.warn("⚠️ Customer selection is required.", {
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
  // Fetch Customer Details on Customer Selection
  // -------------------------
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState({
    contactNum: "",
    currency: "",
    address: "",
    email: "",
  });
  useEffect(() => {
    if (selectedCustomer) {
      const Customer = Customers.find((c) => c._id === selectedCustomer);
      if (Customer) {
        setSelectedCustomerDetails({
          contactNum: Customer.contactNum || "",
          currency: Customer.currency || "",
          address: Customer.address || "",
          email: Customer.email || "", // ← correct!
        });
      }
    } else {
      setSelectedCustomerDetails({
        contactNum: "",
        currency: "",
        address: "",
        email: "",
      });
    }
  }, [selectedCustomer, Customers]);

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
      <div className="flex justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
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
              </svg>
            </button>
          </div>
          <h3 className="text-xl font-semibold"> Free Taxing Invoice</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={!isEditing} // disable when not editing
            className={` h-8 px-3 border  rounded transition ${
              isEditing
                ? "bg-red-400 text-white hover:bg-red-500" // editable → light red
                : "bg-gray-300 text-gray-600 cursor-not-allowed" // not editable → grey
            }`}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={goBack}
            className=" h-8 px-3 border  bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Go Back
          </button>

          <button
            type="button"
            onClick={() => {
              if (isEditing) {
                handleUpdate(); // already editing → update
              } else {
                handleEdit(); // not editing → switch to edit mode
              }
            }}
            className={` h-8 px-3 border rounded transition ${
              isEditing
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-green-200 hover:bg-gray-300"
            }`}
          >
            {isEditing ? "Update" : "Edit"}
          </button>
        </div>
      </div>

      {/* Form */}
      <form
  
        className="bg-white shadow-none rounded-lg divide-y divide-gray-200"
      >
        {/* Business Details */}
        <section className="p-3">
          <div className="flex flex-wrap w-full gap-2">
            <div className="p-2 h-17 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-3 w-full">
             
              </div>
            </div>
          </div>

          <h2 className="text-lg font-medium text-gray-700 mb-4 mt-4">
            Free Taxing Invoice
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Free Tax Invoice no/ ID
              </label>
              <input
                type="text"
                name="purchaseOrder"
                value={purchaseOrderNum || ""}
                placeholder="Purchase Order"
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                readOnly
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Invoice ID
              </label>
              <input
                type="text"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Creation Date & Time
              </label>
              <input
                type="text"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Customer Account
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setselectedCustomer(e.target.value)}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select Customer</option>
                {Customers.map((Customer) => (
                  <option key={Customer._id} value={Customer._id}>
                    {Customer.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-4 h-full">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={selectedCustomerDetails?.account || ""}
                    placeholder="Customer Account"
                    className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                    readOnly
                  />
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={selectedCustomerDetails.email}
                    placeholder=" Currency"
                    className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                    readOnly
                  />
                </div>
              </div>
              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Customer Address
                </label>
                <textarea
                  rows="4"
                  value={selectedCustomerDetails?.address || ""}
                  readOnly
                  className="mt-1 w-full  p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Name + Currency */}
            </div>
            <div className="sm:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-4 h-full">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Order Status
                  </label>
                  <input
                    type="text"
                    value={selectedCustomerDetails?.account || ""}
                    placeholder="Customer Account"
                    className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                    readOnly
                  />
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Purchase Agreement No (if applicable)
                  </label>
                  <input
                    type="text"
                    value={selectedCustomerDetails.email}
                    placeholder=" Currency"
                    className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                    readOnly
                  />
                </div>
              </div>
              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Remarks
                </label>
                <textarea
                  rows="4"
                  value={selectedCustomerDetails?.address || ""}
                  readOnly
                  className="mt-1 w-full  p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Name + Currency */}
            </div>
            {selectedCustomerDetails && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Transaction type
                  </label>
                  <input type="text" className="w-full p-2 border rounded" />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Total Invoice Amount
              </label>
              <input type="text" className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Posted Ledger Account
              </label>
              <input
                type="text"
                value={advance}
                onChange={(e) =>
                  setAdvance(Number(e.target.value.replace(/\D/g, "")) || 0)
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Invoice_date
              </label>
              <input type="text" className="w-full p-2 border rounded" />
            </div>
          </div>
        </section>

        {/* ...Line Items Table and Summary goes here (already provided) */}
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
                      "Posting Account",
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
                    <td className="border text-center px-2 py-1">1</td>

                    <td className="border px-2 py-1 text-center">
                      {selectedItem?.code || ""}
                    </td>

                    <td className="border px-2 py-1">
                      <select
                        value={selectedItem?._id || ""}
                        disabled={!isEdited && purchaseOrderNum}
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
        <div className="py-6 flex items-center justify-between px-6">
          <div>
            <button
              type="button"
              // onClick={handleReset}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Reset
            </button>
          </div>

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

export default FreeTaxingInvoice;
