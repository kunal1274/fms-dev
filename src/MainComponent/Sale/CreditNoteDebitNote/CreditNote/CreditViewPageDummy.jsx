import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./c.css";

const SummaryCard = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-lg font-semibold text-gray-800">
      {String(value ?? "")}
    </span>
  </div>
);

const CreditViewPagee = ({ creditId, credit }) => {
  const [isEditing, setIsEditing] = useState(true);
  const [isEdited, setIsEdited] = useState(true);
  const [prevFormData, setPrevFormData] = useState(null);

  const [formData, setFormData] = useState({ ...credit });
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ orderId: "", remarks: "", warehouse: "" });

  // States for dropdowns and details
  const [credits, setCredits] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState({
    name: "",
    currency: "",
    address: "",
  });
  const [status, setStatus] = useState("");

  // Items
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemCode, setItemCode] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemUnit, setItemUnit] = useState("");

  // Sites & warehouses
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [loadingSites, setLoadingSites] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  // Amounts
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [tcs, setTcs] = useState(0);
  const [charges, setCharges] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [remarks, setRemarks] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  // Derived calculations
  const amountBeforeTax = quantity * price - discount;
  const lineAmt =
    amountBeforeTax +
    (amountBeforeTax * tax) / 100 +
    (amountBeforeTax * tcs) / 100;

  // Handlers
  const handleCancel = () => {
    if (prevFormData) {
      setFormData(prevFormData); // restore saved data
    }
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEdited(true);
    setIsEditing(true);
  };

  const handleSimpleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSelectCustomer = (id) => {
    setSelectedCustomer(id);
    const found = credits.find((c) => c._id === id);
    if (found) {
      setSelectedCustomerDetails({
        name: found.name,
        currency: found.currency,
        address: found.address,
      });
    }
  };

  const onSelectItem = (id) => {
    const found = items.find((i) => i._id === id);
    if (found) {
      setSelectedItem(found);
      setItemCode(found.code || "");
      setItemDesc(found.description || "");
      setItemUnit(found.unit || "");
    }
  };

  const onSelectSite = (id) => {
    setSelectedSite(id);
  };

  const onSelectWarehouse = (id) => {
    setForm((f) => ({ ...f, warehouse: id }));
  };

  const getSiteId = (site) => site._id || site.id || site.code;
  const getSiteLabel = (site) => site.name || site.label;

  const getWhId = (wh) => wh._id || wh.id || wh.code;
  const getWhLabel = (wh) => wh.name || wh.label;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-black-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-500 text-lg font-medium">
          Credit view page
        </p>
      </div>
    );
  }

  return (
    <div className="">
      <ToastContainer />
      {/* Header */}
      <div className="flex justify-between ">
        <div className="flex items-center space-x-2">
          <h3 className="text-xl font-semibold"> Credit Note Details</h3>
        </div>
      </div>

      {/* ---- form starts ---- */}
      <form className="bg-white shadow-none rounded-lg divide-y divide-gray-200">
        {/* Maintain */}
        <section className="p-6">
          <div className="flex flex-wrap w-full gap-2">
            <div className="p-2 h-17 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-6">
                <div className="flex flex-nowrap gap-2">
                  <button
                    type="submit"
                    className="px-3 py-2 w-36 text-xs font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-100"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-3 py-2 w-36 text-xs font-medium text-red-600 bg-white border border-red-400 rounded-md hover:bg-red-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sale details */}
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Credit Note Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Credit Note ID
              </label>
              <input
                type="text"
                name="saleOrder"
                placeholder="Sale Order"
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                readOnly
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Reference Transaction ID
              </label>
              <input
                type="text"
                readOnly
                className="w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Issue Date & Time
              </label>
              <input
                type="datetime-local"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Customer Account
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => onSelectCustomer(e.target.value)}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">
                  {loadingCustomers ? "Loading…" : "Select Customer"}
                </option>
                {credits.map((c) => (
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
                    value={selectedCustomerDetails.name}
                    placeholder="Customer Name"
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
                    value={selectedCustomerDetails.currency}
                    placeholder="Currency"
                    readOnly
                    className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Customer Address
                </label>
                <textarea
                  rows="4"
                  value={selectedCustomerDetails.address}
                  readOnly
                  className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>{" "}
              {selectedCustomerDetails && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Reason
                    </label>
                    <input type="text" className="w-full p-2 border rounded" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Credit Note Status
                    </label>
                    <input
                      type="text"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Total Credit Amount
              </label>
              <input
                type="text"
                value={selectedCustomerDetails.currency}
                placeholder="Currency"
                readOnly
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Posted Ledger Account
              </label>
              <input
                type="text"
                className="mt-1 w-full p-2 border rounded  text-gray-500 "
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
                onChange={handleSimpleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={form.remarks}
                // onChange={handleChange}
                placeholder="e.g. Sector 98, Noida, Uttar Pradesh, 201301"
                rows={4}
                className="mt-1 m w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
          </div>
        </section>

        {/* Items table */}
        <section className="p-6">
          <div className="max-h-96 overflow-y-auto mt-4 border rounded-lg bg-white">
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    {[
                      "S.N",
                      "Invoice id agints Credit",
                      "Item Code",
                      "Item Name",
                      "Description",
                      "Site",
                      "Warehouse",
                      "Qty",
                      "Unit",
                      "Price",
                      "Discount%",
                      "DiscountAmount",
                      "Amount",
                      "Tax %",
                      "TCS/TDS %",
                      "Total Amount",
                      "Currency",
                      "Order Id",
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
                    <td className="border px-2 py-1 text-center">{itemCode}</td>
                    <td className="border px-2 py-1">
                      <select
                        value={selectedItem?._id || ""}
                        disabled={loadingItems}
                        onChange={(e) => onSelectItem(e.target.value)}
                        className="w-full border rounded px-2 py-1"
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
                    <td className="border px-2 py-1 text-center">
                      <input
                        type="text"
                        value={itemDesc}
                        readOnly
                        className="w-full border rounded text-center px-2 py-1 bg-gray-100"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <select
                        value={selectedSite}
                        onChange={(e) => onSelectSite(e.target.value)}
                        className="mt-1 m w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="">
                          {loadingSites
                            ? "Loading…"
                            : sites.length
                            ? "Select Site"
                            : "No sites found"}
                        </option>
                        {sites.map((site) => (
                          <option key={getSiteId(site)} value={getSiteId(site)}>
                            {getSiteLabel(site)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border px-2 py-1">
                      <select
                        name="warehouse"
                        value={String(form.warehouse || "")}
                        onChange={(e) =>
                          onSelectWarehouse(String(e.target.value))
                        }
                        className="w-full border rounded px-2 py-1"
                        disabled={loadingWarehouses || !warehouses.length}
                      >
                        <option value="">
                          {loadingWarehouses ? "Loading…" : "Select Warehouse"}
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
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
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
                        value={itemUnit}
                        readOnly
                        className="w-full border rounded text-center px-2 py-1 bg-gray-100"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full border rounded text-center px-2 py-1"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value) || 0)}
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
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
                    </td>{" "}
                    <td className="border px-2 py-1 text-center">
                      {isNaN(amountBeforeTax)
                        ? "0.00"
                        : amountBeforeTax.toFixed(2)}
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full border rounded text-center px-2 py-1"
                        value={tax}
                        onChange={(e) => setTax(Number(e.target.value) || 0)}
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full border rounded text-center px-2 py-1"
                        value={tcs}
                        onChange={(e) => setTcs(Number(e.target.value) || 0)}
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full border rounded text-center px-2 py-1"
                        value={tcs}
                        onChange={(e) => setTcs(Number(e.target.value) || 0)}
                      />
                    </td>{" "}
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full border rounded text-center px-2 py-1"
                        value={tcs}
                        onChange={(e) => setTcs(Number(e.target.value) || 0)}
                      />
                    </td>{" "}
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full border rounded text-center px-2 py-1"
                        value={tcs}
                        onChange={(e) => setTcs(Number(e.target.value) || 0)}
                      />
                    </td>{" "}
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full border rounded text-center px-2 py-1"
                        value={lineAmt}
                        onChange={(e) => setTcs(Number(e.target.value) || 0)}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                <SummaryCard label="Advance" value={advance} />
                <SummaryCard
                  label="Subtotal / line amount"
                  value={
                    isNaN(amountBeforeTax) ? "0.00" : amountBeforeTax.toFixed(2)
                  }
                />
                <SummaryCard label="Discount (%)" value={discount} />
                <SummaryCard label="Total (incl tax)" value={lineAmt} />
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
      </form>
    </div>
  );
};

export default CreditViewPagee;
