import React from "react";

const ProformaConfirmationInvoice = () => {
  // Static Mock Data
  const invoice = {
    proformaNo: "PF-00123",
    proformaDate: "2025-07-15",
    salesOrderNo: "SO-45678",
    customerAccount: "CUST-789",
    customerName: "Ratxen Solutions Pvt Ltd",
    customerAddress: "123 Tech Park, Ranchi, Jharkhand",
    deliveryAddress: "Warehouse B, Bokaro Steel City",
    contactPerson: "Mr. Dev Ratxen",
    paymentTerms: "Net 30 Days",
    currency: "INR",
    validityDate: "2025-07-31",
    deliveryMode: "Courier",
    estimatedDeliveryDate: "2025-07-20",
    orderStatus: "Confirmed",
    remarks: "Urgent delivery requested",
    items: [
      {
        code: "ITEM001",
        name: "Product A",
        description: "High-quality product A",
        site: "Main Site",
        warehouse: "WH-A",
        quantity: 10,
        uom: "Nos",
        unitPrice: 100,
        discount: 10,
        amount: 1000,
        taxPercent: 18,
        tdsPercent: 1,
        totalAmount: 1070,
      },
      {
        code: "ITEM002",
        name: "Product B",
        description: "Premium product B",
        site: "Main Site",
        warehouse: "WH-B",
        quantity: 5,
        uom: "Nos",
        unitPrice: 200,
        discount: 0,
        amount: 1000,
        taxPercent: 18,
        tdsPercent: 0,
        totalAmount: 1180,
      },
    ],
    advance: 500,
    subtotal: 2000,
    totalDiscount: 10,
    totalTax: 360,
    totalTds: 10,
    grandTotal: 2350,
  };

  const {
    proformaNo,
    proformaDate,
    salesOrderNo,
    customerAccount,
    customerName,
    customerAddress,
    deliveryAddress,
    contactPerson,
    paymentTerms,
    currency,
    validityDate,
    deliveryMode,
    estimatedDeliveryDate,
    orderStatus,
    remarks,
    items,
    advance,
    subtotal,
    totalDiscount,
    totalTax,
    totalTds,
    grandTotal,
  } = invoice;

  return (
    <div className="p-6 text-sm text-gray-700">
      <h2 className="text-lg font-bold mb-4">
        Sales Proforma Confirmation Invoice
      </h2>

      {/* Header Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <strong>Proforma No:</strong> {proformaNo}
        </div>
        <div>
          <strong>Proforma Date:</strong> {proformaDate}
        </div>
        <div>
          <strong>Sales Order No:</strong> {salesOrderNo}
        </div>
        <div>
          <strong>Customer Account:</strong> {customerAccount}
        </div>
        <div>
          <strong>Customer Name:</strong> {customerName}
        </div>
        <div>
          <strong>Customer Address:</strong> {customerAddress}
        </div>
        <div>
          <strong>Delivery Address:</strong> {deliveryAddress}
        </div>
        <div>
          <strong>Contact Person:</strong> {contactPerson}
        </div>
        <div>
          <strong>Payment Terms:</strong> {paymentTerms}
        </div>
        <div>
          <strong>Currency:</strong> {currency}
        </div>
        <div>
          <strong>Validity Date:</strong> {validityDate}
        </div>
        <div>
          <strong>Delivery Mode:</strong> {deliveryMode}
        </div>
        <div>
          <strong>Estimated Delivery Date:</strong> {estimatedDeliveryDate}
        </div>
        <div>
          <strong>Order Status:</strong> {orderStatus}
        </div>
        <div className="col-span-2">
          <strong>Remarks:</strong> {remarks}
        </div>
      </div>

      {/* Line Items Table */}
      <table className="min-w-full border border-gray-300 mb-6 text-xs">
        <thead className="bg-gray-100">
          <tr>
            {[
              "S.no",
              "Item Code",
              "Name",
              "Description",
              "Site",
              "Warehouse",
              "Quantity",
              "UOM",
              "Unit Price",
              "Discount",
              "Amount",
              "Tax (%)",
              "TDS/TCS (%)",
              "Total Amount",
            ].map((heading, idx) => (
              <th key={idx} className="border px-2 py-1 text-left">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{idx + 1}</td>
              <td className="border px-2 py-1">{item.code}</td>
              <td className="border px-2 py-1">{item.name}</td>
              <td className="border px-2 py-1">{item.description}</td>
              <td className="border px-2 py-1">{item.site}</td>
              <td className="border px-2 py-1">{item.warehouse}</td>
              <td className="border px-2 py-1">{item.quantity}</td>
              <td className="border px-2 py-1">{item.uom}</td>
              <td className="border px-2 py-1">{item.unitPrice}</td>
              <td className="border px-2 py-1">{item.discount}</td>
              <td className="border px-2 py-1">{item.amount}</td>
              <td className="border px-2 py-1">{item.taxPercent}</td>
              <td className="border px-2 py-1">{item.tdsPercent}</td>
              <td className="border px-2 py-1">{item.totalAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Advance:</strong> {advance}
        </div>
        <div>
          <strong>Subtotal:</strong> {subtotal}
        </div>
        <div>
          <strong>Total Discount:</strong> {totalDiscount}
        </div>
        <div>
          <strong>Total Tax:</strong> {totalTax}
        </div>
        <div>
          <strong>Total TDS/TCS:</strong> {totalTds}
        </div>
        <div className="text-lg font-bold col-span-2">
          <strong>Grand Total:</strong> {grandTotal}
        </div>
      </div>
    </div>
  );
};

export default ProformaConfirmationInvoice;
