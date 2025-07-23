import React, { useState } from "react";

// Simple summary card component
const SummaryCard = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-lg font-semibold text-gray-800">{value}</span>
  </div>
);

const PurchaseProformaConfirmationInvoice = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [tcs, setTcs] = useState(0);
  const [isEdited, setIsEdited] = useState(true);

  const [items] = useState([
    {
      _id: "1",
      code: "ITEM001",
      name: "Item One",
      description: "Desc A",
      unit: "Nos",
      price: 100,
    },
    {
      _id: "2",
      code: "ITEM002",
      name: "Item Two",
      description: "Desc B",
      unit: "Kg",
      price: 200,
    },
  ]);

  const advance = 0;

  const amountBeforeTax =
    quantity * price - (quantity * price * discount) / 100;
  const taxAmount = (amountBeforeTax * tax) / 100;
  const tcsAmount = (amountBeforeTax * tcs) / 100;
  const finalAmount = amountBeforeTax + taxAmount + tcsAmount;

  return (
    <div className="p-6 text-sm text-gray-700">
      <h2 className="text-lg font-bold mb-4">
        Purchase Proforma Confirmation Invoice
      </h2>

      {/* Header Form Section */}
      <section className="p-6 bg-white rounded Vendor">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            {
              label: "Purchase Proforma confirmation No.",
              placeholder: "Auto-generated",
              readOnly: true,
            },
            {
              label: "Purchase Proforma Confirmation Date",
              placeholder: "DD-MM-YYYY",
            },
            {
              label: "Purchase Order No:",
              placeholder: "Auto-generated",
              readOnly: true,
            },
            { label: "Vendor Account:", isSelect: true },
            { label: "Vendor Name:" },
            { label: "Contact Person:", placeholder: "e.g. John Doe" },
            { label: "Vendor Address", isTextarea: true, rows: 4 },
            { label: "Payment Terms:", placeholder: "Enter terms" },
            { label: "Currency:", placeholder: "e.g. INR" },
            {
              label: "Proforma Confirmation Validity date",
              placeholder: "DD-MM-YYYY",
            },
            { label: "Delivery Mode:", placeholder: "e.g. Courier" },
            { label: "Estimated Delivery Date:", placeholder: "DD-MM-YYYY" },
            { label: "Order Status:", placeholder: "Pending" },
            { label: "Remarks", isTextarea: true, rows: 4 },
          ].map((field, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-600">
                {field.label}
              </label>
              {field.isSelect ? (
                <select className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200">
                  <option>Select Vendor</option>
                </select>
              ) : field.isTextarea ? (
                <textarea
                  rows={field.rows}
                  className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                  placeholder={field.placeholder}
                />
              ) : (
                <input
                  type="text"
                  className={`mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 ${
                    field.readOnly ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  placeholder={field.placeholder}
                  readOnly={field.readOnly}
                />
              )}
            </div>
          ))}
          <div className="flex items-center gap-2 ml-1">
            <label className="text-blue-600 font-medium">Active</label>
            <input type="checkbox" className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* Items Table */}
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
                      disabled={!isEdited}
                      onChange={(e) => {
                        const sel = items.find(
                          (item) => item._id === e.target.value
                        );
                        setSelectedItem(sel);
                        if (sel) {
                          setPrice(Number(sel.price) || 0);
                          setQuantity(1);
                          setDiscount(0);
                          setTax(0);
                          setTcs(0);
                        }
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

                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      min="0"
                      className="w-full border rounded text-center px-2 py-1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
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
                      type="number"
                      className="w-full border rounded text-center px-2 py-1"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                    />
                  </td>

                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      className="w-full border rounded text-center px-2 py-1"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                    />
                  </td>

                  <td className="border px-2 py-1 text-center">
                    {isNaN(amountBeforeTax)
                      ? "0.00"
                      : amountBeforeTax.toFixed(2)}
                  </td>

                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      className="w-full border rounded text-center px-2 py-1"
                      value={tax}
                      onChange={(e) => setTax(Number(e.target.value))}
                    />
                  </td>

                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      className="w-full border rounded text-center px-2 py-1"
                      value={tcs}
                      onChange={(e) => setTcs(Number(e.target.value))}
                    />
                  </td>

                  <td className="border px-2 py-1 text-center">
                    {isNaN(finalAmount) ? "0.00" : finalAmount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Summary Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
              <SummaryCard label="Advance" value={advance.toFixed(2)} />
              <SummaryCard
                label="Subtotal / line amount"
                value={
                  isNaN(amountBeforeTax) ? "0.00" : amountBeforeTax.toFixed(2)
                }
              />
              <SummaryCard label="Discount (%)" value={discount.toFixed(2)} />
              <SummaryCard
                label="Total Tax"
                value={isNaN(taxAmount) ? "0.00" : taxAmount.toFixed(2)}
              />
              <SummaryCard
                label="Total Tds/ Tcs"
                value={isNaN(tcsAmount) ? "0.00" : tcsAmount.toFixed(2)}
              />
              <SummaryCard
                label="Grand Total"
                value={isNaN(finalAmount) ? "0.00" : finalAmount.toFixed(2)}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PurchaseProformaConfirmationInvoice;
