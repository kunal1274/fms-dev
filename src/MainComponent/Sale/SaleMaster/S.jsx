import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Invoice from "./Invoice/Icopy";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

// API endpoints
const itemsBaseUrl = "https://befr8n.vercel.app/fms/api/v0/items";
const customersBaseUrl = "https://befr8n.vercel.app/fms/api/v0/customers";
const salesOrderUrl = "https://befr8n.vercel.app/fms/api/v0/salesorders";

const SaleOrderForm = ({ handleCancel }) => {
  // -------------------------
  // Global States & Form Fields
  // -------------------------
  const [goForInvoice, setGoSaleInvoice] = useState(null);
  const [advance, setAdvance] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [remarks, setRemarks] = useState("");
  // Global form states (for a single order line – note that a separate lineItems array is also maintained)
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedItem, setSelectedItem] = useState(null); // for global selection
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [tcs, setTcs] = useState(0);
  const [charges, setCharges] = useState(0);
  const [lineAmt, setLineAmt] = useState(0);

  const [salesAddress, setSalesAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saleOrderNum, setSaleOrderNum] = useState(null);

  // States for editing and status management

  const [isEdited, setIsEdited] = useState(false);

  const [status, setStatus] = useState("Draft"); // Initial status

  // For URL navigation
  const navigate = useNavigate();

  // For update status – _id is kept though its setting may be adjusted per your API response.
  const [_id, set_id] = useState("");

  // -------------------------
  // Line Items State (for detailed items table)
  // -------------------------
  const [lineItems, setLineItems] = useState([
    {
      id: Date.now(),
      itemId: "", // *** ADDED: Field to store the selected item’s id ***
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
  // Fetch Customers & Items (Only one useEffect needed – removed duplicate)
  // -------------------------
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(customersBaseUrl);
        // Assuming customers are in response.data.data
        setCustomers(response.data.data || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    const fetchItems = async () => {
      try {
        const response = await axios.get(itemsBaseUrl);
        // Assuming items are in response.data.data
        setItems(response.data.data || []);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchCustomers();
    fetchItems();
  }, []);

  // -------------------------
  // Global Line Amount Calculation (for the single item form)
  // -------------------------
  // useEffect(() => {
  //   // Convert discount percentage to actual discount value
  //   const discountAmount = (price * quantity * discount) / 100;

  //   // Calculate the final line amount after applying the discount
  //   const computedLineAmt = price * quantity - discountAmount;

  //   // Ensure the amount is not negative
  //   setLineAmt(computedLineAmt > 0 ? computedLineAmt : 0);
  // }, [quantity, price, discount]);

  // -------------------------
  // Basic Form Validation (Corrected: now checking selectedItem instead of a function)
  // -------------------------
  const validateForm = () => {
    if (!selectedCustomer) {
      alert("Customer selection is required.");
      return false;
    }

    if (!selectedItem) {
      // CHANGED: previously was checking handleItemSelection
      alert("Item selection is required.");
      return false;
    }
    return true;
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fill all the mandatory fields correctly.");
      return;
    }

    if (!selectedItem) {
      alert("Please select an item.");
      return;
    }

    // Construct payload from global fields (you may want to include lineItems as needed)
    const payload = {
      customer: selectedCustomer,
      item: selectedItem._id || selectedItem.id || "",
      quantity: Number(quantity),
      price: Number(price),
      discount: Number(discount),
      remarks: remarks,
      tax: Number(tax),
      withholdingTax: Number(tcs),
      charges: Number(charges),
      // lineAmt: Number(lineAmt), // commented out as before
      advance: Number(advance),
      salesAddress: salesAddress,
    };

    console.log("📌 Payload being sent:", payload);

    try {
      setLoading(true);
      const { data } = await axios.post(salesOrderUrl, payload, {
        headers: { "Content-Type": "application/json" },
      });

      setSaleOrderNum(data.data.orderNum);
      alert(
        `Sales Order Created Successfully! Order Number: ${data.data.orderNum}`
      );
    } catch (error) {
      console.error("🚨 Error response:", error.response);
      alert(
        `Error: ${
          error.response?.data?.message || "Failed to create Sales Order"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalAmount = (item) => {
    const quantityVal = item.quantity || 0;
    const priceVal = item.price || 0;
    const discountVal = item.discount || 0;
    const taxVal = item.tax || 0;
    const tcsVal = item.tcs || 0;
    const tdsVal = item.tds || 0;
    const chargesVal = item.charges || 0;

    const subtotal = quantityVal * priceVal;
    const discountAmount = (subtotal * discountVal) / 100;
    const amountBeforeTax = subtotal - discountAmount;
    const taxAmount = (amountBeforeTax * taxVal) / 100;
    const tcsAmount = (amountBeforeTax * tcsVal) / 100;
    const tdsAmount = (amountBeforeTax * tdsVal) / 100;

    const computedLineAmt = (
      amountBeforeTax +
      taxAmount +
      tcsAmount +
      chargesVal
    ).toFixed(2);

    // Debugging logs
    console.log("🔹 Subtotal:", subtotal);
    console.log("🔹 Discount (%):", discountVal);
    console.log("🔹 Discount Amount:", discountAmount);
    console.log("🔹 Amount Before Tax:", amountBeforeTax);
    console.log("🔹 Tax Amount:", taxAmount);
    console.log("🔹 TCS Amount:", tcsAmount);
    console.log("🔹 TDS Amount:", tdsAmount);
    console.log("🔹 Final Line Amount:", computedLineAmt);

    return {
      amountBeforeTax: amountBeforeTax.toFixed(2),
      lineAmt: computedLineAmt,
    };
  };

  // Updates a line item field and recalculates amounts
  const handleLineItemChange = (id, field, value) => {
    setLineItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
              ...calculateTotalAmount({
                ...item,
                [field]: field === "discount" ? Number(value) || 0 : value,
              }),
            }
          : item
      )
    );
  };

  // -------------------------
  // Updated Handler for Line Item Item-Selection
  // -------------------------
  const handleItemSelection = (lineItemId, selectedItemId) => {
    const selectedItemData = items.find((item) => item._id === selectedItemId);
    console.log(selectedItemData, "line item selection");
    if (selectedItemData) {
      // Update the line item with the selected item details
      handleLineItemChange(lineItemId, "itemId", selectedItemData._id); // *** ADDED: save item id
      handleLineItemChange(lineItemId, "itemCode", selectedItemData.code);
      handleLineItemChange(lineItemId, "itemName", selectedItemData.name);
      handleLineItemChange(lineItemId, "price", selectedItemData.price);
      handleLineItemChange(lineItemId, "unit", selectedItemData.unit);
      // Optionally, update other fields like tax or discount if needed
    }
  };

  // Update summary when lineItems change
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
  // Fetch Customer Details on Customer Selection
  // -------------------------
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState({
    contactNum: "",
    currency: "",
    address: "",
  });

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

  // -------------------------
  // Fetch Item Details on Global Item Selection (Corrected)
  // -------------------------
  const [itemDetails, setItemDetails] = useState({
    code: "",
    name: "",
    type: "",
    unit: "",
    price: 0,
    id: "",
  });
  // useEffect(() => {
  //   if (selectedItem) {
  //     // CHANGED: Compare using selectedItem._id
  //     const item = items.find((i) => i._id === selectedItem._id);
  //     if (item) {
  //       setItemDetails({
  //         name: item.name,
  //         code: item.code,
  //         type: item.type,
  //         unit: item.unit,
  //         price: item.price,
  //         id: item._id,
  //       });
  //       setPrice(item.price);
  //       setDiscount(item.discount);
  //       // FIXED: Use correct setter names for tax and tcs (changed from settcs(item.tds))
  //       setTax(item.tax);
  //       setTcs(item.tcs);
  //       setQuantity(item.quantity || 0);
  //       setLineAmt(item.price * (item.quantity || 0) - item.discount + charges);
  //     }
  //   }
  // }, [selectedItem, charges, items]);

  // -------------------------
  // Navigation: Go Back (Updated to use navigate)
  // -------------------------
  const goBack = () => {
    // Instead of setViewingSaleId (undefined), navigate back in history
    navigate(-1);
  };

  // -------------------------
  // Update Sales Order Status
  // -------------------------
  // const handleStatusUpdate = async (newStatus) => {
  //   console.log("handleStatusUpdate called with newStatus:", newStatus);

  //   // Check if the button for the new status is enabled
  //   if (!isButtonEnabled(newStatus)) {
  //     console.error(
  //       "Status change not allowed in current state for status:",
  //       newStatus
  //     );
  //     toast.error("Status change not allowed in current state.");
  //     return; // Exit if status change is not allowed
  //   }
  //   console.log("Status change allowed. Proceeding with user confirmation...");

  //   // Ask user confirmation to proceed
  //   if (
  //     window.confirm(`Are you sure you want to change status to ${newStatus}?`)
  //   ) {
  //     console.log("User confirmed status change to:", newStatus);
  //     setLoading(true);
  //     try {
  //       // Build the URL for the PATCH request
  //       const patchUrl = `${mergedUrl}/${saleId}/status`;
  //       console.log("Sending PATCH request to URL:", patchUrl, "with data:", {
  //         newStatus: newStatus,
  //       });

  //       // Send the PATCH request
  //       const response = await axios.patch(
  //         patchUrl,
  //         { newStatus: newStatus },
  //         { withCredentials: false }
  //       );
  //       console.log("Received response: 185", response);

  //       // Check for success response status
  //       if (response.status === 200) {
  //         console.log(
  //           "Status update successful. Updating saleData with: 189",
  //           response.data
  //         );
  //         // Assuming API returns the updated sale data under response.data.data
  //         setSaleData(response.data);
  //         toast.success(`Status updated to ${newStatus}`);
  //       } else {
  //         console.error("Unexpected response status:", response.status);
  //         toast.error(`Error: Unexpected response status ${response.status}`);
  //       }
  //     } catch (err) {
  //       console.error("Error occurred during PATCH request:", err);
  //       const errorMessage =
  //         err.response?.data?.message ||
  //         "An unexpected error occurred while updating status.";
  //       toast.error(errorMessage);
  //     } finally {
  //       setLoading(false);
  //       console.log("Loading state set to false.");
  //     }
  //   } else {
  //     console.log("User cancelled the status update.");
  //   }
  // };

  // const handleStatusChange = (newStatus) => {
  //   updateStatus(newStatus);
  // };

  // const isButtonEnabled = (button) => {
  //   return enabledButtons[status]?.includes(button) ?? false;
  // };

  // const handleButtonClick = (button) => {
  //   if (isButtonEnabled(button)) {
  //     console.log(`Clicked ${button} button, changing status.`);
  //     handleStatusChange(button);
  //   }
  // };

  // -------------------------
  // Button Labels & Enable Conditions
  // -------------------------

  // Button labels for status change
  // const buttonLabels = [
  //   { id: "Confirm", label: "Confirmed" },
  //   { id: "Cancel", label: "Cancelled" },
  //   { id: "Draft", label: "Draft" },
  //   { id: "Ship", label: "Shipped" },
  //   { id: "Deliver", label: "Delivered" },
  //   { id: "Invoice", label: "Invoiced" },
  //   { id: "Admin Mode", label: "AdminMode" },
  //   { id: "Any Mode", label: "AnyMode" },
  // ];

  // Define which buttons are enabled for which statuses.
  // const enabledButtons = {
  //   Draft: ["Confirmed", "Cancelled", "AdminMode", "AnyMode"],
  //   Confirmed: ["Shipped", "Cancelled", "AdminMode", "AnyMode"],
  //   Shipped: ["Delivered", "Cancelled", "AdminMode", "AnyMode"],
  //   Delivered: ["Invoiced", "AdminMode", "AnyMode"],
  //   Invoiced: ["AdminMode", "AnyMode"],
  //   Cancelled: ["AdminMode", "AnyMode"],
  //   AdminMode: ["Draft", "AnyMode"],
  //   AnyMode: [
  //     "Draft",
  //     "Confirmed", // if that’s the intended label
  //     "Shipped",
  //     "Delivered",
  //     "Invoiced",
  //     "Cancelled",
  //     "AdminMode",
  //   ],
  // };

  // -------------------------
  // Fetch Sales Order Summary (if needed)
  // -------------------------

  // -------------------------
  // Updated handleUpdate Function (Fixed URL & removed undefined variables)
  // -------------------------

  // Amount before tax is (quantity * price) minus discount.
  const discountAmount = (discount * quantity * price) / 100; // Calculate discount in percentage

  const amountBeforeTax = quantity * price - discountAmount; // Apply discount to get amount before tax

  const taxAmount = (amountBeforeTax * tax) / 100; // Calculate tax in percentage
  const tcsAmount = (amountBeforeTax * tcs) / 100; // Calculate TCS/TDS in percentage

  const totalAmount = (amountBeforeTax + taxAmount + tcsAmount).toFixed(2); // Final total amount

  // Total Amount adds tax and TCS/TDS to the base amount

  useEffect(() => {
    if (selectedItem) {
      // Find item from list based on _id
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
        setPrice(item.price);
        setDiscount(item.discount);
        setTax(item.tax);
        setTcs(item.tcs);
        setQuantity(item.quantity || 0);
      }
    }
  }, [selectedItem, items]);

  useEffect(() => {
    // Convert discount from percentage to actual amount\

    const discountAmount = (discount * quantity * price) / 100;

    // Calculate the amount before tax
    const amountBeforeTax = quantity * price - discountAmount;

    // Calculate tax and TCS/TDS based on amount before tax
    const taxAmount = (amountBeforeTax * tax) / 100;
    const tcsAmount = (amountBeforeTax * tcs) / 100;

    // Calculate the total amount
    const computedTotalAmount = amountBeforeTax + taxAmount + tcsAmount;

    // Update state
    setLineAmt(computedTotalAmount.toFixed(2));
  }, [quantity, price, discount, tax, tcs]);

  // -------------------------
  // Render Component
  // -------------------------
 
  return (
    <>
      {goForInvoice ? (
        <Invoice saleOrderNum={goForInvoice} goBack={goBack} />
      ) : (
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="container mx-auto p-2">
            <div className="bg-white p-2 rounded-lg shadow-lg w-full">
              <h1 className="text-xl font-bold mb-4">
                Sale Order Creation Page
              </h1>
              <div className="p-2 w-full">
                <div className="flex flex-wrap  w-full gap-2">
                  {/* First Div: Maintain Section */}
                  <div className="p-2 h-17 bg-white">
                    {" "}
                    {/* <h2 className="text-sm font-semibold text-gray-700">
                      Maintain
                    </h2> */}
                    <div className="grid grid-cols-1 md:grid-cols-3  w-full gap-6">
                      {/* Maintain Section */}
                      <div className="flex flex-wrap gap-2">
                        {/* <button
                          onClick={() =>
                            saleOrderNum && navigate(`/invoice/${saleId}`)
                          }
                          disabled={true} // Button is always disabled
                          className="px-3 py-2 text-xs  w-24 font-medium border border-gray-300 rounded-md bg-gray-200 cursor-not-allowed"
                        >
                          Invoice
                        </button> */}

                        <button
                          onClick={handleCreate}
                          className="px-3 py-2 w-36 text-xs font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-100"
                        >
                          Create
                        </button>

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
              </div>
              <div className="grid gap-6 mb-4 mt-3 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1">
                {/* Sale Order Number */}
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700">
                    Sale Order
                  </label>
                  <input
                    type="text"
                    name="saleOrder"
                    value={saleOrderNum || ""}
                    placeholder="Sale Order"
                    className="border border-gray-300 rounded-lg p-3 w-full bg-gray-100 cursor-not-allowed"
                    readOnly
                  />
                </div>

                {/* Customer Name Selection */}
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700">
                    Customer Name
                  </label>
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="border border-gray-300 rounded-lg p-3 w-full"
                  >
                    <option value="">Select Customer</option>
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Customer Details */}
                {selectedCustomerDetails && (
                  <>
                    <div className="flex flex-col">
                      <label className="font-semibold text-gray-700">
                        Currency
                      </label>
                      <input
                        type="text"
                        value={selectedCustomerDetails.currency}
                        placeholder="Currency"
                        className="border border-gray-300 rounded-lg p-3 w-full bg-gray-100 cursor-not-allowed"
                        readOnly
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold text-gray-700">
                        Contact Details
                      </label>
                      <input
                        type="text"
                        value={selectedCustomerDetails.contactNum}
                        placeholder="Contact Number"
                        className="border border-gray-300 rounded-lg p-3 w-full bg-gray-100 cursor-not-allowed"
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
                    className="border border-gray-300 rounded-lg p-3 w-full"
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      console.log("Advance value updated to:", value);
                      setAdvance(value);
                    }}
                  />
                </div>

                {/* Order Status */}
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700">
                    Order Status
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <input
                      type="text"
                      value={status}
                      placeholder="Selected Status"
                      disabled
                      className="border border-gray-300 bg-gray-100 text-gray-600 rounded-lg p-3 w-full cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Customer Address */}
                {selectedCustomerDetails && (
                  <div className="flex flex-col">
                    <label className="font-semibold text-gray-700">
                      Customer Address
                    </label>
                    <textarea
                      name="address"
                      value={selectedCustomerDetails.address}
                      disabled={!isEdited}
                      placeholder="Customer Address / Buyer Address / Billing Address"
                      className="border border-gray-300 rounded-lg p-3 w-full bg-gray-100 cursor-not-allowed"
                      readOnly
                    />
                  </div>
                )}
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700">
                    Sale Address
                  </label>
                  <textarea
                    name="address"
                    onChange={(e) => setSalesAddress(e.target.value)}
                    placeholder="Customer Address / Buyer Address / Billing Address"
                    className="border border-gray-300 rounded-lg p-3 w-full"
                  />
                </div>
                {/* Remarks */}
                <div className="flex flex-col mt-4">
                  <label className="font-semibold text-gray-700">Remarks</label>
                  <textarea
                    name="remarks"
                    placeholder="Remarks"
                    onChange={(e) => setRemarks(e.target.value)}
                    className="border border-gray-300 rounded-lg p-3 w-full"
                  />
                </div>
              </div>
            </div>

            {/* -------------------------
                 Line Items Table (Removed nested form; now wrapped in a div)
                 ------------------------- */}
            <div className="max-h-96 overflow-y-auto mt-4">
              <div className="space-y-6">
                <table className="min-w-full border-collapse border border-gray-300 text-sm text-gray-700">
                  <thead className="bg-gray-100 text-gray-900 uppercase text-xs font-semibold">
                    <tr>
                      <th className="border p-3 text-center">S.N</th>
                      <th className="border p-3 text-center">Item Code</th>
                      <th className="border p-3 w-60 text-center">Item Name</th>
                      <th className="border p-3 text-center">Qty</th>
                      <th className="border p-3 text-center">Unit</th>
                      <th className="border p-3 text-center">Price</th>
                      <th className="border p-3 text-center">Discount %</th>
                      <th className="border p-3 text-center">Amount</th>
                      <th className="border p-3 text-center">Tax %</th>
                      <th className="border p-3 text-center">TCS/TDS %</th>
                      <th className="border p-3 text-center">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr key="sales-order-row" className="hover:bg-gray-50">
                      {/* Serial Number */}
                      <td className="border text-center p-3">1</td>

                      {/* Item Code (displayed from the selected item) */}
                      <td className="border p-3">
                        {selectedItem ? selectedItem.code : ""}
                      </td>

                      {/* Item Name Dropdown: Select an item from the master list */}
                      <td className="border p-3">
                        <select
                          value={selectedItem ? selectedItem._id : ""}
                          disabled={!isEdited && saleOrderNum}
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
                          className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
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
                      <td className="border p-3">
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded-md p-2"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                        />
                      </td>

                      {/* Unit (displayed from the selected item) */}
                      <td className="border p-3">
                        {selectedItem ? selectedItem.unit : ""}
                      </td>

                      {/* Price Input */}
                      <td className="border p-3">
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md p-2"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                        />
                      </td>

                      {/* Discount % Input */}
                      <td className="border p-3">
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md p-2"
                          value={discount}
                          onChange={(e) => setDiscount(e.target.value)}
                        />
                      </td>

                      {/* Amount before Tax (base amount less discount) */}
                      <td className="border p-3">
                        {amountBeforeTax.toFixed(2)}
                      </td>

                      {/* Tax % Input */}
                      <td className="border p-3">
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded-md p-2"
                          value={tax}
                          onChange={(e) => setTax(e.target.value)}
                        />
                      </td>

                      {/* TCS/TDS % Input */}
                      <td className="border p-3">
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded-md p-2"
                          value={tcs}
                          onChange={(e) => setTcs(e.target.value)}
                        />
                      </td>

                      {/* Total Amount (Amount before tax + Tax Amount + TCS/TDS Amount) */}
                      <td className="border p-3">{lineAmt}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </form>
      )}
    </>
  );
};

export default SaleOrderForm;
{
  /* Status Change Section */
}
{
  /* <div className="flex flex-col gap-2 p-4 border rounded-lg bg-gray-50">
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
                      </div> */
}

{
  /* Settlement Section */
}
{
  /* <div className="flex flex-col gap-2 p-4 border rounded-lg bg-gray-50">
                        <h2 className="text-sm font-semibold text-gray-700">
                          Settlement
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          <button
                            className={`px-3 py-1 text-xs font-medium text-white border rounded-md ${
                              saleOrderNum
                                ? "bg-green-600 border-green-500 hover:bg-green-700"
                                : "bg-gray-400 border-gray-300 cursor-not-allowed"
                            }`}
                            disabled={!saleOrderNum} // Disable if saleOrderNum is empty
                          >
                            Create Payment
                          </button>

                          <button
                            className={`px-3 py-1 text-xs font-medium text-white border rounded-md ${
                              saleOrderNum
                                ? "bg-blue-600 border-blue-500 hover:bg-blue-700"
                                : "bg-gray-400 border-gray-300 cursor-not-allowed"
                            }`}
                            disabled={!saleOrderNum} // Disable if saleOrderNum is empty
                          >
                            View Payments
                          </button>
                        </div>
                      </div> */
}
