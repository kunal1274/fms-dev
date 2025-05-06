import React, { useState } from "react";
import Label from "../zoho/Azoho/Common/Label/Label";
import TextInput from "../zoho/Azoho/Common/Input/Input";
import Checkbox_with_words from "../components/layout/Checkbox_with_words/Checkbox_with_words";

const BankForm = ({ handleSaveItem, handleCancel }) => {
  const initialFormState = {
    itemNo: "",
    itemName: "",
    accountHolderName: "",
    currency: "",
    unit: "",
    ifsc:"",
    active: false,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
  
    let newValue = value;
  
    if (name === "itemNo") {
      // Allow only numeric values and limit to 20 digits
      newValue = value.replace(/[^0-9]/g, "").slice(0, 20);
    } else if (name === "itemName" || name === "accountHolderName") {
      // Allow only letters and spaces, and limit to 35 characters
      newValue = value.replace(/[^a-zA-Z\s]/g, ""); 
      if (newValue.length > 0) {
        // Capitalize the first letter of each word
        newValue = newValue.replace(/\b\w/g, (char) => char.toUpperCase());
      }
      if (newValue.length > 35) {
        newValue = newValue.slice(0, 35);
        setError("Field must not exceed 35 characters.");
      } else {
        setError(""); // Clear error if the length is valid
      }
    } else if (name === "ifsc") {
      // Convert IFSC code to uppercase and limit to 25 characters
      newValue = value.toUpperCase().slice(0, 25);
    } else if (name === "currency") {
      // Convert Currency to uppercase and limit to 25 characters
      newValue = value.toUpperCase().slice(0, 25);
    }
  
    // Update the form data state
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : newValue,
    }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation logic
    if (!formData.itemNo || !formData.itemName || !formData.ifsc || !formData.accountHolderName || !formData.currency || !formData.unit) {
      setError("Please fill all required fields with valid data. Item Name and Account Holder Name should start with a capital letter. IFSC Code should be alphanumeric in uppercase.");
      return;
    }

    // Saving data
    handleSaveItem(formData);
    alert("Bank saved successfully!");
    setError("");
    setFormData(initialFormState);
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setError("");
  };

  return (
    <div className="bg-blue-400 mt-44 p-8 min-h-screen">
      <div className="bg-slate-50 rounded-lg p-6">
        <header className="text-center bg-white py-2 border border-blue-300 rounded-full mb-5">
          <h2 className="text-lg font-bold text-blue-500">Bank Creation Form</h2>
        </header>

        {error && <div className="text-red-500 font-semibold mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label label="Bank Account No." className="font-semibold text-blue-600" />
              <TextInput
                name="itemNo"
                placeholder="Enter Bank Account No"
                value={formData.itemNo}
                onChange={handleChange}
                className="border border-green-600 w-full p-2 rounded-lg"
                required
              />
            </div>

            <div>
              <Label label="Bank Name" className="font-semibold text-blue-600" />
              <TextInput
                name="itemName"
                placeholder="Enter Bank Name"
                value={formData.itemName}
                onChange={handleChange}
                className="border border-green-600 w-full p-2 rounded-lg"
                required
              />
            </div>

            <div>
              <Label label="Account Holder Name" className="font-semibold text-blue-600" />
              <TextInput
                name="accountHolderName"
                placeholder="Enter Account Holder Name"
                value={formData.accountHolderName}
                onChange={handleChange}
                className="border border-green-600 w-full p-2 rounded-lg"
                required
              />
            </div>

            <div>
              <Label label="Currency" className="font-semibold text-blue-600" />
              <TextInput
                name="currency"
                placeholder="Enter Currency"
                value={formData.currency}
                onChange={handleChange}
                className="border border-green-600 w-full p-2 rounded-lg"
                required
              />
            </div>

            <div>
              <Label label="Account Type" className="font-semibold text-blue-600" />
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="border border-green-600 w-full p-2 rounded-lg"
                required
              >
                <option value="">Select Account Type</option>
                <option value="Saving Account">Saving Account</option>
                <option value="Current Account">Current Account</option>
              </select>
            </div>


            <div>
              <Label label="IFSC " className="font-semibold text-blue-600" />
              <TextInput
                name="ifsc"
                placeholder="Enter IFSC Code"
                value={formData.ifsc}
                onChange={handleChange}
                className="border border-green-600 w-full p-2 rounded-lg"
                required
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center">
            <Label label="Active" className="font-semibold text-blue-600" />
            <Checkbox_with_words
              name="active"
              cls="m-1 text-blue-700"
              checked={formData.active}
              onChange={handleChange}
            />
          </div>

          <div className="text-center">
            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-full mt-4">
              Save
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-red-500 text-white py-2 px-4 rounded-full mt-4 ml-4"
            >
              Reset
            </button>
            <button
              type="button"
              className="ml-3 bg-zinc-700 text-white py-2 px-4 rounded-full mt-4"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankForm;
