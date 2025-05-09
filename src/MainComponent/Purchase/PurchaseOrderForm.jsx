import { useEffect, useState } from "react";
import axios from "axios";
// import Invoice from "./Invoice"; // Uncomment if you have an Invoice component
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

// API endpoints
const itemsBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/items";
const vendorsBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/vendors";
const purchasesOrderUrl = "https://fms-qkmw.onrender.com/fms/api/v0/purchaseorders";

const PurchaseOrderForm = ({ handleCancel }) => {
  // -------------------------
  // Global States & Form Fields
  // -------------------------
  const [isEdited, setIsEdited] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [purchasesAddress, setPurchasesAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const [status] = useState("Draft");
  const [purchaseOrderNum, setPurchaseOrderNum] = useState(null);
  const navigate = useNavigate();
  const [goForInvoice, setGoSaleInvoice] = useState(null);
  const [advance, setAdvance] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [remarks, setRemarks] = useState("");
  // Global form states (for a single order line)
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedItem, setSelectedItem] = useState(null); // global selection
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [tcs, setTcs] = useState(0);
  const [charges, setCharges] = useState(0);
  const [lineAmt, setLineAmt] = useState(0);
  // Selected vendor
  const [selectedVendor, setSelectedVendor] = useState("");

  // -------------------------
  // Line Items State
  // -------------------------
  const [lineItems, setLineItems] = useState([
    {
      id: Date.now(),
      itemId: "",
      itemCode: "",
      itemName: "",
      unit: "",
      quantity: 1,
      price: 0,
      discount: 0,
      tax: 0,
      tcs: 0,
      charges: 0,
      amountBeforeTax: 0,
      lineAmt: 0,
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
      console.log("Fetching vendors...");
      try {
        const response = await axios.get(vendorsBaseUrl);
        console.log("Fetched vendors:", response.data.data);
        setVendors(response.data.data || []);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };

    const fetchItems = async () => {
      console.log("Fetching items...");
      try {
        const response = await axios.get(itemsBaseUrl);
        console.log("Fetched items:", response.data.data);
        setItems(response.data.data || []);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchVendors();
    fetchItems();
  }, []);
  useEffect(() => {
    if (lineItems.length > 0) {
      const totalNetAmount = lineItems.reduce(
        (sum, item) => sum + (item.amountBeforeTax || 0),
        0
      );

      const totalDiscountAmount = lineItems.reduce(
        (sum, item) => sum + item.quantity * item.price * (item.discount / 100),
        0
      );

      const totalTaxAmount = lineItems.reduce(
        (sum, item) => sum + item.amountBeforeTax * (item.tax / 100),
        0
      );

      const totalWithholdingTax = lineItems.reduce(
        (sum, item) => sum + item.amountBeforeTax * (item.tcs / 100),
        0
      );

      const totalNetAmountAfterTax = lineItems.reduce(
        (sum, item) => sum + (item.netAmtAfterTax || 0),
        0
      );

      const totalLineAmount = lineItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
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
  // Vendor Details (for display)
  // -------------------------
  const [selectedVendorDetails, setSelectedVendorDetails] = useState({
    contactNum: "",
    currency: "",
    address: "",
  });

  useEffect(() => {
    if (selectedVendor) {
      const vendor = vendors.find((v) => v._id === selectedVendor);
      console.log("Vendor selected:", vendor);
      if (vendor) {
        setSelectedVendorDetails({
          contactNum: vendor.contactNum || "",
          currency: vendor.currency || "",
          address: vendor.address || "",
        });
      }
    } else {
      console.log("No vendor selected, clearing vendor details");
      setSelectedVendorDetails({ contactNum: "", currency: "", address: "" });
    }
  }, [selectedVendor, vendors]);

  // -------------------------
  // Calculation Logic for a Line Item
  // -------------------------
  const calculateTotalAmount = (item) => {
    const quantityVal = Number(item.quantity) || 0;
    const priceVal = Number(item.price) || 0;
    const discountVal = Number(item.discount) || 0;
    const taxVal = Number(item.tax) || 0;
    const tcsVal = Number(item.tcs) || 0;
    const chargesVal = Number(item.charges) || 0;

    const subtotal = quantityVal * priceVal;
    const discountAmount = (subtotal * discountVal) / 100;
    const amountBeforeTax = subtotal - discountAmount;
    const taxAmount = (amountBeforeTax * taxVal) / 100;
    const tcsAmount = (amountBeforeTax * tcsVal) / 100;

    const computedLineAmt = Number(
      (amountBeforeTax + taxAmount + tcsAmount + chargesVal).toFixed(2)
    );

    console.log(
      "Calculating totals for item:",
      item,
      "=> subtotal:",
      subtotal,
      "discountAmount:",
      discountAmount,
      "amountBeforeTax:",
      amountBeforeTax,
      "taxAmount:",
      taxAmount,
      "tcsAmount:",
      tcsAmount,
      "lineAmt:",
      computedLineAmt
    );

    return {
      amountBeforeTax: Number(amountBeforeTax.toFixed(2)),
      lineAmt: computedLineAmt,
    };
  };

  // -------------------------
  // Update a Line Item Field and Recalculate
  // -------------------------
  const handleLineItemChange = (id, field, value) => {
    console.log(`Changing line item ${id} field '${field}' to:`, value);
    setLineItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const newValue = [
            "quantity",
            "price",
            "discount",
            "tax",
            "tcs",
            "charges",
          ].includes(field)
            ? Number(value)
            : value;
          const updatedItem = { ...item, [field]: newValue };
          const calculated = calculateTotalAmount(updatedItem);
          const finalItem = { ...updatedItem, ...calculated };
          console.log("Updated line item:", finalItem);
          return finalItem;
        }
        return item;
      })
    );
  };

  // -------------------------
  // Handle Item Selection for a Line Item
  // -------------------------
  const handleItemSelection = (lineItemId, selectedItemId) => {
    console.log(
      `Handling item selection for line item ${lineItemId} with selected item id: ${selectedItemId}`
    );
    const selectedItemData = items.find((item) => item._id === selectedItemId);
    console.log(
      `For line item ${lineItemId}, item selected:`,
      selectedItemData
    );
    if (selectedItemData) {
      handleLineItemChange(lineItemId, "itemId", selectedItemData._id);
      handleLineItemChange(lineItemId, "itemCode", selectedItemData.code);
      handleLineItemChange(lineItemId, "itemName", selectedItemData.name);
      handleLineItemChange(lineItemId, "price", selectedItemData.price);
      handleLineItemChange(lineItemId, "unit", selectedItemData.unit);
      // Optionally update tax, discount, etc.
    }
  };

  // -------------------------
  // Remove a Line Item
  // -------------------------
  const removeLineItem = (id) => {
    console.log("Removing line item with id:", id);
    setLineItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // -------------------------
  // Add a New Line Item
  // -------------------------
  const addLineItem = () => {
    const newItem = {
      id: Date.now(),
      itemId: "",
      itemCode: "",
      itemName: "",
      unit: "",
      quantity: 1,
      price: 0,
      discount: 0,
      tax: 0,
      tcs: 0,
      charges: 0,
      amountBeforeTax: 0,
      lineAmt: 0,
    };
    console.log("Adding new line item:", newItem);
    setLineItems((prev) => [...prev, newItem]);
  };

  // -------------------------
  // Update Summary When Line Items Change
  // -------------------------
  useEffect(() => {
    console.log("Updating summary based on line items...", lineItems);
    const totalNetAmount = lineItems.reduce(
      (sum, item) => sum + Number(item.amountBeforeTax),
      0
    );
    const totalDiscountAmount = lineItems.reduce(
      (sum, item) => sum + item.quantity * item.price * (item.discount / 100),
      0
    );
    const totalTaxAmount = lineItems.reduce(
      (sum, item) => sum + Number(item.amountBeforeTax) * (item.tax / 100),
      0
    );
    const totalTcsAmount = lineItems.reduce(
      (sum, item) => sum + Number(item.amountBeforeTax) * (item.tcs / 100),
      0
    );
    const totalLineAmt = lineItems.reduce(
      (sum, item) => sum + Number(item.lineAmt),
      0
    );

    const newSummary = {
      totalLines: lineItems.length,
      totalNetAmount,
      totalDiscountAmount,
      totalTaxAmount,
      totalTcsAmount,
      totalLineAmt,
    };
    console.log("Updated summary:", newSummary);
    setSummary(newSummary);
  }, [lineItems]);

  // -------------------------
  // Validate Form Before Submission
  // -------------------------
  const validateForm = () => {
    if (!selectedVendor) {
      console.log("Validation error: Vendor selection is required.");
      alert("Vendor selection is required.");
      return false;
    }
    if (!selectedItem) {
      // CHANGED: previously was checking handleItemSelection
      alert("Item selection is required.");
      return false;
    }
    return true;
  };
  // -------------------------
  // Handle Purchase Order Creation
  // -------------------------

  const handleCreate = async (e) => {
    e.preventDefault();
    console.log("Form submitted");
    if (!validateForm()) return;

    // Note: Updated payload to use purchasesAddress (instead of undefined salesAddress)
    const payload = {
      item: selectedItem,
      vendor: selectedVendor,
      quantity: Number(quantity),
      price: Number(price),
      discount: Number(discount),
      remarks: remarks,
      tax: Number(tax),
      withholdingTax: Number(tcs),
      charges: Number(charges),
      advance: Number(advance),
      purchaseAddress: purchasesAddress,
    };

    console.log("323 Payload being sent:", payload);

    try {
      setLoading(true);
      const { data } = await axios.post(purchasesOrderUrl, payload, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Purchase order created successfully:", data);
      setPurchaseOrderNum(data.data.orderNum);
      alert(
        ` 333Purchase Order Created Successfully! Order Number: ${data.data.orderNum}`
      );
    } catch (error) {
      console.error("Error response 336:", error.response);
      alert(
        `Error: ${
          error.response?.data?.message || "Failed to create Purchase Order"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Navigation Helper
  // -------------------------
  const goBack = () => {
    console.log("Navigating back...");
    navigate(-1);
  };

  // For our single (top) line item in the table, we calculate totals from global state:
  const computedTotals = selectedItem
    ? calculateTotalAmount({
        quantity,
        price,
        discount,
        tax,
        tcs,
        charges,
      })
    : { amountBeforeTax: 0, lineAmt: 0 };

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
    <>
      {goForInvoice ? (
        // Replace the div below with your Invoice component if needed.
        // <Invoice PurchaseOrderNum={goForInvoice} goBack={goBack} />
        <div>Invoice Component Placeholder</div>
      ) : (
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="container mx-auto p-2">
            <div className="bg-white p-2 rounded-lg shadow-lg w-full">
              <h1 className="text-xl font-bold mb-4">
                Purchase Order Creation Page
              </h1>
              <div className="p-2 w-full">
                <div className="flex flex-wrap w-full gap-2">
                  <div className="p-2 h-17 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-6">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          className="px-3 py-2 w-36 text-xs font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-100"
                        >
                          Create
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            console.log("Cancel button clicked");
                            handleCancel();
                          }}
                          className="px-3 py-2 w-36 text-xs font-medium text-red-600 bg-white border border-red-400 rounded-md hover:bg-red-50"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Top Section: Purchase Order Info & Vendor Details */}
              <div className="grid gap-6 mb-4 mt-3 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1">
                {/* Purchase Order Number */}
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700">
                    Purchase Order
                  </label>
                  <input
                    type="text"
                    name="PurchaseOrder"
                    value={purchaseOrderNum || ""}
                    placeholder="Purchase Order"
                    className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300  bg-gray-100 cursor-not-allowed"
                    readOnly
                  />
                </div>

                {/* Vendor Name Selection */}
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700">
                    Vendor Name
                  </label>
                  <select
                    value={selectedVendor}
                    onChange={(e) => {
                      console.log("Vendor changed to:", e.target.value);
                      setSelectedVendor(e.target.value);
                    }}
                    className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map((vendor) => (
                      <option key={vendor._id} value={vendor._id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vendor Details */}
                {selectedVendorDetails && (
                  <>
                    <div className="flex flex-col">
                      <label className="font-semibold text-gray-700">
                        Currency
                      </label>
                      <input
                        type="text"
                        value={selectedVendorDetails.currency}
                        placeholder="Currency"
                        className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300  bg-gray-100 cursor-not-allowed"
                        readOnly
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold text-gray-700">
                        Contact Details
                      </label>
                      <input
                        type="text"
                        value={selectedVendorDetails.contactNum}
                        placeholder="Contact Number"
                        className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300  bg-gray-100 cursor-not-allowed"
                        readOnly
                      />
                    </div>    <div className="flex flex-col">
                      <label className="font-semibold text-gray-700">
                        Contact Email
                      </label>
                      <input
                        type="text"
                        value={selectedVendorDetails.email}
                        placeholder="Contact Number"
                        className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300  bg-gray-100 cursor-not-allowed"
                        readOnly
                      />
                    </div>
                  </>
                )}

                {/* Advance Payment */}
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700">Advance</label>
                  <input
                    type="text"
                    value={advance}
                    name="advance"
                    placeholder="Advance"
                    className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      console.log("Advance changed:", value);
                      setAdvance(value);
                    }}
                  />
                </div>

                {/* Order Status */}
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700">
                    Order Status
                  </label>
                  <input
                    type="text"
                    value={status}
                    placeholder="Selected Status"
                    disabled
                    className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300  bg-gray-100 cursor-not-allowed"
                  />
                </div>

                {/* Vendor Address */}
                {selectedVendorDetails && (
                  <div className="flex flex-col">
                    <label className="font-semibold text-gray-700">
                      Vendor Address
                    </label>
                    <textarea
                      name="address"
                      value={selectedVendorDetails.address}
                      disabled
                      placeholder="Vendor Address / Buyer Address / Billing Address"
                      rows="4"
                      className=" border border-gray-300 rounded-lg p-1 w-full focus:outline-none focus:ring focus:ring-blue-300 first-line:border  bg-gray-100 cursor-not-allowed"
                      readOnly
                    />
                  </div>
                )}

                {/* Purchase Address */}
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700">
                    Purchase Address
                  </label>
                  <textarea
                    name="address"
                    value={purchasesAddress}
                    onChange={(e) => {
                      console.log("Purchase Address changed:", e.target.value);
                      setPurchasesAddress(e.target.value);
                    }}
                    rows="4"
                    placeholder="Purchase Address"
                    className="border border-gray-300 rounded-lg p-1 w-full focus:outline-none focus:ring focus:ring-blue-300"
                  />
                </div>

                {/* Remarks */}
                <div className="flex flex-col mt-4">
                  <label className="font-semibold text-gray-700">Remarks</label>
                  <textarea
                    name="remarks"
                    value={remarks}
                    rows="4"
                    placeholder="Remarks"
                    onChange={(e) => {
                      console.log("Remarks changed:", e.target.value);
                      setRemarks(e.target.value);
                    }}
                    className="border border-gray-300 rounded-lg p-1 w-full focus:outline-none focus:ring focus:ring-blue-300"
                  />
                </div>
              </div>
            </div>

            {/* -------------------------
                 Line Items Table
                 ------------------------- */}
            <div className="mt-4">
              <h2 className="text-lg font-bold mb-2">Line Items</h2>
              <div className="overflow-x-auto">
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
                    <tr key="sales-order-row" className="hover:bg-gray-50">
                      {/* Serial Number */}
                      <td className="border text-center p-1">1</td>

                      {/* Item Code (displayed from the selected item) */}
                      <td className="border p-1">
                        {selectedItem ? selectedItem.code : ""}
                      </td>

                      {/* Item Name Dropdown */}
                      <td className="border text-center p-1">
                        <select
                          value={selectedItem ? selectedItem._id : ""}
                          onChange={(e) => {
                            // Find the selected item in the fetched items array
                            const sel = items.find(
                              (item) => item._id === e.target.value
                            );
                            setSelectedItem(sel);
                            // Optionally pre-fill the price when an item is selected
                            if (sel) {
                              setPrice(Number(sel.price));
                            }
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

                      {/* Quantity Input */}
                      <td className="border p-1">
                        <input
                          type="number"
                     className="border rounded p-1 text-center w-24"
                          value={quantity}
                          onChange={(e) => {
                            console.log("Quantity changed:", e.target.value);
                            setQuantity(e.target.value);
                          }}
                        />
                      </td>
                      <td className="border p-1">
                        <input
                          type="number"
                     className="border rounded p-1 text-center w-24"
                          value={quantity}
                          onChange={(e) => {
                            console.log("Quantity rcv :", e.target.value);
                            setQuantity(e.target.value);
                          }}
                        />
                      </td>
                      {/* Unit (displayed from the selected item) */}
                      <td className="border p-1 text-center">
                        {selectedItem ? selectedItem.unit : ""}
                      </td>

                      {/* Price Input */}
                      <td className="border p-1">
                        <input
                          type="text"
                          className="border rounded p-1 text-center w-24"
                          value={price}
                          onChange={(e) => {
                            console.log("Price changed:", e.target.value);
                            setPrice(e.target.value);
                          }}
                        />
                      </td>

                      {/* Discount % Input */}
                      <td className="border p-1">
                        <input
                          type="text"
                          className="border rounded p-1 text-center w-24"
                          value={discount}
                          onChange={(e) => {
                            console.log("Discount changed:", e.target.value);
                            setDiscount(e.target.value);
                          }}
                        />
                      </td>

                      {/* Amount before Tax (computed) */}
                      <td className="border p-1 text-center">
                        {computedTotals.amountBeforeTax.toFixed(2)}
                      </td>

                      {/* Tax % Input */}
                      <td className="border p-1">
                        <input
                          type="number"
                            className="border rounded p-1 text-center w-24"
                          value={tax}
                          onChange={(e) => {
                            console.log("Tax changed:", e.target.value);
                            setTax(e.target.value);
                          }}
                        />
                      </td>

                      {/* TCS/TDS % Input */}
                      <td className="border p-1">
                        <input
                          type="number"
                          className="border rounded p-1 text-center w-24"
                          value={tcs}
                          onChange={(e) => {
                            console.log("TCS/TDS changed:", e.target.value);
                            setTcs(e.target.value);
                          }}
                        />
                      </td>

                      {/* Total Amount */}
                      <td className="border p-1 text-center">{computedTotals.lineAmt}</td>

                      {/* Actions */}
                    </tr>
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={() => {
                  console.log("Add Line Item button clicked");
                  addLineItem();
                }}
                className="mt-2 px-3 py-2 text-xs font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-100"
              >
                Add Line Item
              </button>
            </div>
          </div>
          <ToastContainer />
        </form>
      )}
    </>
  );
};

export default PurchaseOrderForm;
