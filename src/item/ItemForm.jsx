import { useEffect, useState } from "react";
import axios from "axios";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const baseUrl = "https://fms-qkmw.onrender.com";
const secondUrl = "/fms/api/v0";
const thirdUrl = "/items";
const mergedUrl = `${baseUrl}${secondUrl}${thirdUrl}`;

function ItemForm({ handleCancel }) {
  const [itemList, setItemList] = useState([]);
  const [formData, setFormData] = useState({
    itemNum: "",

    name: "",
    type: "",
    description: "",
    unit: "",
    price: "",
    active: false,
  });

  const [file, setFile] = useState("");
  const [message, setMessage] = useState("");
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // Generate a unique item account number
  const generateAccountNo = (items) => {
    const lastAccountNo = items
      .map((item) => parseInt(item.itemAccountNo.split("_")[1], 10))
      .filter((num) => !isNaN(num))
      .reduce((max, num) => Math.max(max, num), 0);

    return `CUST_${String(lastAccountNo + 1).padStart(3, "0")}`;
  };

  // Fetch items
  useEffect(() => {
    toast.info("item form opened!");

    async function loadItem() {
      try {
        const response = await axios.get(mergedUrl, {
          headers: {
            // Authorization: `Bearer ${tokenCookie}`, // Uncomment if token is required
          },
          withCredentials: false,
        });
        console.log("Item data fetched:", response.data);
        setItemList(response.data.data);
      } catch (error) {
        console.error(
          "Item save error:",
          error.response?.data || error.message
        );
        toast.error(
          error.response?.data?.message || "Item save error! Please try again."
        );
      }
    }

    loadItem();
  }, []);

  // Create New Item
  const createItem = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        mergedUrl,
        { ...formData },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Show toast notification
      toast.success("Item created successfully!");
      console.log("Item created successfully");

      // Wait 1 second before running handleCancel
      setTimeout(() => {
        handleCancel();
        toast.success("Item created successfully!");
      }, 1000);

      // Continue with other state updates
      setItemList((prev) => [...prev, response.data.data]);
      setFormData({
        itemNum: "",
        name: "",
        description: "",
        type: "",
        unit: "",
        price: "",
        active: "",
      });
    } catch (error) {
      toast.error("Item save error! Please try again.");
    }
  };

  // Reset the form
  const handleReset = () => {
    setFormData({
      name: "",
      Name: "",
      type: "",
      description: "",
      unit: "",
      price: "",
      active: false,
    });
    setMessage("");
    const accountNo = generateAccountNo(itemList);
    setFormData((prev) => ({ ...prev, itemAccountNo: accountNo }));
  };

  return (
    <>
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4 text-center">Add New Item</h1>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white shadow-lg rounded-lg w-full max-w-2xl p-8">
          <form onSubmit={createItem}>
            {/* Item Photo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
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
              </div>
              <button
                type="button"
                className="text-blue-600 mt-2 text-sm hover:underline"
              >
                Upload Item Photo
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="itemName" className="block text-gray-600 mb-2">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                  required
                />
              </div>
              <div>
                <label htmlFor="itemCode" className="block text-gray-600 mb-2">
                  Item Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="itemNum"
                  value={formData.itemNum}
                  onChange={
                    (e) =>
                      setFormData({
                        ...formData,
                        itemNum: e.target.value.toUpperCase(),
                      }) // Update itemNum
                  }
                  className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                  required
                />
              </div>
              <div>
                <label htmlFor="price" className="block text-gray-600 mb-2">
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!isNaN(value) && Number(value) >= 0) {
                      // Ensure input is a positive number
                      setFormData({ ...formData, price: value });
                    } else {
                      setFormData({ ...formData, price: "" }); // Reset if input is invalid
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                  required
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-gray-600 mb-2">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                >
                  <option value="">Select type</option>
                  <option value="Goods">Goods</option>
                  <option value="Services">Services</option>
                </select>
              </div>

              <div>
                <label htmlFor="unit" className="block text-gray-600 mb-2">
                  Unit
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                >
                  <option value="">Select unit</option>

                  <option value="kgs">KG - Kilogram</option>

                  <option value="mt ">Metric tonnes</option>
                  <option value="ea">Ea - Each</option>
                  <option value="lbs"> lbs - pounds</option>

                  <option value="hr">Hour</option>
                  <option value="min">Minutes</option>
                  <option value="qty">Quantity</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-gray-600 mb-2"
                >
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-gray-600 mb-2">
                Upload Item Photo
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="border p-2 w-full"
              />
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="text-gray-500 hover:text-gray-700"
              >
                Reset
              </button>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default ItemForm;
