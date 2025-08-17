import { useEffect, useState } from "react";
import axios from "axios";
import Label from "../components/common/Common/Label/Label";
import Checkbox_with_words from "../components/layout/Checkbox_with_words/Checkbox_with_words";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const baseUrl = "https://befr8n.vercel.app";
const secondUrl = "/fms/api/v0";
const thirdUrl = "/customers";
const mergedUrl = `${baseUrl}${secondUrl}${thirdUrl}`;

function CustomerForm({ handleCancel }) {
  const [customerList, setCustomerList] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    contactNum: "",
    currency: "",
    registrationNum: "",
    panNum: "",
    address: "",
    active: true,
  });
  const [message, setMessage] = useState("");

  // Generate a unique customer account number
  const generateAccountNo = (customers) => {
    const lastAccountNo = customers
      .map((customer) => parseInt(customer.customerAccountNo.split("_")[1], 10))
      .filter((num) => !isNaN(num))
      .reduce((max, num) => Math.max(max, num), 0);

    return `CUST_${String(lastAccountNo + 1).padStart(3, "0")}`;
  };

  // Fetch Customers
  useEffect(() => {
    toast.info("Customer form opened!",


    );

    async function loadCustomers() {
      try {
        const response = await axios.get(mergedUrl, {
          headers: {
            // Authorization: `Bearer ${tokenCookie}`, // Uncomment if token is required
          },
          withCredentials: false,
        });
        console.log("Customer data fetched:", response.data);
        setCustomerList(response.data.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    }

    loadCustomers();
  }, []);

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "contactNum") {
        // Allow only digits and up to 10 characters
        if (/^\d*$/.test(value) && value.length <= 10) {
          return { ...prev, [name]: value };
        }
      } else if (name === "registrationNum") {
        // Allow only uppercase alphanumeric characters and up to 16 characters
        const uppercaseValue = value.toUpperCase();
        if (/^[A-Z0-9]*$/.test(uppercaseValue) && uppercaseValue.length <= 16) {
          return { ...prev, [name]: uppercaseValue };
        }
      } else if (name === "panNum") {
        // Allow only uppercase alphanumeric characters and exactly 10 characters
        const uppercaseValue = value.toUpperCase();
        if (/^[A-Z0-9]*$/.test(uppercaseValue) && uppercaseValue.length <= 10) {
          return { ...prev, [name]: uppercaseValue };
        }
      } else {
        // Handle other fields normally
        return { ...prev, [name]: value };
      }
      return prev; // Return previous state if no valid change
    });
  };


  // Create New Customer
  const createCustomer = async (e) => {
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

      toast.success("Customer created successfully!", {
        position: "top-right", // Adjust position if necessary
        autoClose: 1000,
      });
      console.log("Customer created successfully");
      setTimeout(() => {
      handleCancel();
    }, 3000);
     
      setCustomerList((prev) => [...prev, response.data.data]);
      setFormData({
        name: "",
        contactNum: "",
        currency: "",
        registrationNum: "",
        panNum: "",
        address: "",
        active: true,
      });
    }
    catch (error) {
      toast.error("Customer save error! Please try again.", {
        position: "top-right", // Adjust position if necessary
        autoClose: 1000,
      });
   
     
    }
  };

  // Reset the form
  const handleReset = () => {
    setFormData({
      name: "",
      contactNum: "",
      currency: "",
      registrationNum: "",
      panNum: "",
      address: "",
      active: true,
    });
    setMessage("");
    const accountNo = generateAccountNo(customerList);
    setFormData((prev) => ({ ...prev, customerAccountNo: accountNo }));
  };

  return (
    <>
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4 text-center">Add New Customer</h1>

      <form onSubmit={createCustomer}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white shadow-lg rounded-lg w-full max-w-2xl p-8">
            {/* Upload Photo */}
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
                Upload Photo
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* cUSTOMERACC */}

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-gray-600 mb-2">
                  Name<span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="  Customer Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-300"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="contactNum" className="block text-gray-600 mb-2">
                  Phone Number<span className="text-red-500">*</span>
                </label>
                <input
                  id="contactNum"
                  name="contactNum"
                  type="tel"
                  placeholder="Contact No"
                  value={formData.contactNum}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-300"
                  required
                />
              </div>

              {/* Currency */}
              <div>
                <label htmlFor="currency" className="block text-gray-600 mb-2">
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:outline-none focus:ring focus:ring-blue-300"
                >
                  <option value="">Select Currency</option>
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>

              {/* PAN Number */}
              <div>
                <label htmlFor="panNum" className="block text-gray-600 mb-2">
                  PAN Number
                </label>
                <input
                  id="panNum"
                  name="panNum"
                  type="text"
                  placeholder="Customer PAN "
                  value={formData.panNum}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>

              {/* Registration Number */}
              <div>
                <label htmlFor="registrationNum" className="block text-gray-600 mb-2">
                  Registration Number
                </label>
                <input
                  id="registrationNum"
                  name="registrationNum"
                  type="text"
                  placeholder=" Registration No "
                  value={formData.registrationNum}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>

              {/* Billing Address */}
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-gray-600 mb-2">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  placeholder=" Customer Address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="4"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring focus:ring-blue-300"
                ></textarea>
              </div>
            </div>
            <div className="flex items-center">
              <Label label="Active" className="font-semibold text-blue-600" />
              <Checkbox_with_words
                name="active"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-300"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
            </div>
            {/* Submit and Reset Buttons */}
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
          </div>
        </div>
      </form>
    </>
  );
}

export default CustomerForm;
