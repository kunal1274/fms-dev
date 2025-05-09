import React, { useState } from 'react';

export default function ConfirmPopUp({ onSubmit, onCancel }) {
  // API endpoints
const itemsBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/items";
const customersBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/customers";
const salesOrderUrl = "https://fms-qkmw.onrender.com/fms/api/v0/salesorders";
  const [form, setForm] = useState({
    customerAcc: '',
    customerName: '',
    itemNo: '',
    itemName: '',
    orderQuantity: '',
    confirmQuantity: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
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
  }, [selectedItem, items]);  useEffect(() => {
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
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };
 useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(customersBaseUrl);
        setCustomers(response.data.data || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
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
  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white rounded-lg shadow-md max-w-3xl mx-auto"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Sale Order Form
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Customer Account */}
        <div>
          <label
            htmlFor="customerAcc"
            className="block text-sm font-medium text-gray-600"
          >
            Customer Account
          </label>
          <input
            type="text"
            name="customerAcc"
            id="customerAcc"
            value={form.customerAcc}
            onChange={handleChange}
            placeholder="e.g. ACC-12345"
            className="mt-1 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>

        {/* Customer Name */}
        <div>
          <label
            htmlFor="customerName"
            className="block text-sm font-medium text-gray-600"
          >
            Customer Name
          </label>
          <input
            type="text"
            name="customerName"
            id="customerName"
            value={form.customerName}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            className="mt-1 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>

        {/* Item No */}
        <div>
          <label
            htmlFor="itemNo"
            className="block text-sm font-medium text-gray-600"
          >
            Item No.
          </label>
          <input
            type="text"
            name="itemNo"
            id="itemNo"
            value={form.itemNo}
            onChange={handleChange}
            placeholder="e.g. ITEM-001"
            className="mt-1 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>

        {/* Item Name */}
        <div>
          <label
            htmlFor="itemName"
            className="block text-sm font-medium text-gray-600"
          >
            Item Name
          </label>
          <input
            type="text"
            name="itemName"
            id="itemName"
            value={form.itemName}
            onChange={handleChange}
            placeholder="e.g. Widget A"
            className="mt-1 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>

        {/* Order Quantity */}
        <div>
          <label
            htmlFor="orderQuantity"
            className="block text-sm font-medium text-gray-600"
          >
            Order Quantity
          </label>
          <input
            type="number"
            name="orderQuantity"
            id="orderQuantity"
            value={form.orderQuantity}
            onChange={handleChange}
            placeholder="e.g. 10"
            className="mt-1 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            min="0"
            required
          />
        </div>

        {/* Confirm Quantity */}
        <div>
          <label
            htmlFor="confirmQuantity"
            className="block text-sm font-medium text-gray-600"
          >
            Confirm Quantity
          </label>
          <input
            type="number"
            name="confirmQuantity"
            id="confirmQuantity"
            value={form.confirmQuantity}
            onChange={handleChange}
            placeholder="e.g. 10"
            className="mt-1 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            min="0"
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
