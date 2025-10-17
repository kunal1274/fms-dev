import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "https://your-api-url.com/journal"; // Replace with your real endpoint

const JournalCreationForm = () => {
  const [form, setForm] = useState({});
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [tcs, setTcs] = useState(0);
  const [isEdited, setIsEdited] = useState(true);

  const amountBeforeTax = quantity * price * (1 - discount / 100);
  const lineAmt = (
    amountBeforeTax +
    (amountBeforeTax * tax) / 100 +
    (amountBeforeTax * tcs) / 100
  ).toFixed(2);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get("https://your-api-url.com/items");
        setItems(res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch items:", err.message);
      }
    };

    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      lineItems: [
        {
          itemId: selectedItem?._id,
          quantity,
          price,
          discount,
          tax,
          tcs,
          lineAmount: parseFloat(lineAmt),
        },
      ],
    };

    try {
      const response = await axios.post(API_URL, payload);
      console.log("POST Response:", response.data);
      toast.success("Journal created successfully!");
      setForm({});
    } catch (error) {
      console.error("POST Error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message ||
          "Failed to create journal. Please try again."
      );
    }
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <button
                type="button"
                className="text-blue-600 text-sm hover:underline"
              >
                Upload Photo
              </button>
            </div>
            <h3 className="text-xl font-semibold">Journal Creation Form</h3>
          </div>
        </div>

        {/* Journal Details */}
        <section className="p-6 bg-white rounded dd">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Journal Info
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "Transaction ID",
              "Journal Type",
              "Reference Number (PO/SO/Prod Order)",
              "Journal Status",
              "Supplier/Customer ID",
              "Supplier/Customer Name",
              "External Code",
              "Remarks",
              "Creation Date",
            ].map((label, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-600">
                  {label}
                </label>
                <input className="mt-1 w-full p-2 border rounded" />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Reference Type
              </label>
              <select className="mt-1 w-full p-2 border rounded">
                <option value="">Select</option>
                <option value="input">Input</option>
                <option value="adjustment">Adjustment</option>
                <option value="transfer">Transfer</option>
                <option value="counting">Counting</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Transaction Type
              </label>
              <select className="mt-1 w-full p-2 border rounded">
                <option value="">Select</option>
                <option value="input">Input</option>
                <option value="adjustment">Adjustment</option>
                <option value="transfer">Transfer</option>
                <option value="counting">Counting</option>
              </select>
            </div>

            <div className="flex items-center mt-6">
              <input type="checkbox" className="h-4 w-4" />
              <label className="ml-2 text-sm font-medium text-gray-600">
                Active
              </label>
            </div>
          </div>
        </section>

        {/* Line Item Table */}
        <section className="p-6 bg-white rounded dd">
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm text-gray-700">
              <thead className="bg-gray-100 text-gray-900 uppercase text-xs font-semibold sticky top-0 z-10">
                <tr>
                  {[
                    "S.N",
                    "Item Code",
                    "Item Name",
                    "Description",
                    "Qty",
                    "Unit",
                    "Price",
                    "Discount %",
                    "Amount",
                    "Tax %",
                    "TCS/TDS %",
                    "Total Amount",
                  ].map((header, idx) => (
                    <th key={idx} className="border px-2 py-1 text-center">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border px-2 py-1 text-center">1</td>
                  <td className="border px-2 py-1 text-center">
                    {selectedItem?.code || ""}
                  </td>
                  <td className="border px-2 py-1">
                    <select
                      value={selectedItem?._id || ""}
                      onChange={(e) => {
                        const sel = items.find(
                          (item) => item._id === e.target.value
                        );
                        setSelectedItem(sel);
                        if (sel) setPrice(Number(sel.price || 0));
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
                  <td className="border px-2 py-1 text-center bg-gray-100">
                    {selectedItem?.description || ""}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full border rounded text-center px-2 py-1"
                    />
                  </td>
                  <td className="border px-2 py-1 text-center bg-gray-100">
                    {selectedItem?.unit || ""}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full border rounded text-center px-2 py-1"
                    />
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-full border rounded text-center px-2 py-1"
                    />
                  </td>
                  <td className="border px-2 py-1 text-center">
                    {isNaN(amountBeforeTax)
                      ? "0.00"
                      : amountBeforeTax.toFixed(2)}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <input
                      type="number"
                      value={tax}
                      onChange={(e) => setTax(Number(e.target.value))}
                      className="w-full border rounded text-center px-2 py-1"
                    />
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <input
                      type="number"
                      value={tcs}
                      onChange={(e) => setTcs(Number(e.target.value))}
                      className="w-full border rounded text-center px-2 py-1"
                    />
                  </td>
                  <td className="border px-2 py-1 text-center">{lineAmt}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Inventory Details */}
        <section className="p-6 bg-gray-50 rounded dd">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Inbound Site",
              "Outbound Site",
              "Inbound Warehouse",
              "Batch Number",
              "Serial Number",
              "Location Bin",
              "Quality Check Status",
              "Approved By (Optional)",
            ].map((label, i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-gray-600">
                  {label}
                </label>
                <input
                  type="text"
                  placeholder={label}
                  className="mt-1 w-full p-2 border rounded"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Buttons */}
        <div className="flex justify-between py-6">
          <button
            type="reset"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Reset
          </button>
          <div className="flex gap-4">
            <button
              type="button"
              className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Go Back
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default JournalCreationForm;
