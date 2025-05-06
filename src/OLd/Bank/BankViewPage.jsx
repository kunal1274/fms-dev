import React, { useState } from 'react';
import Checkbox_with_words from "../components/layout/Checkbox_with_words/Checkbox_with_words";
import { Label } from 'flowbite-react';
import TextInput from '../zoho/Azoho/Common/Input/Input';

const BankViewPage = ({ item = {}, handleSaveCustomer, toggleView, onClose, handleSaveItem }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...item });

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Validations and transformations
        let transformedValue = value;

        switch (name) {
            case 'currency':
                transformedValue = value.toUpperCase().slice(0, 25); // Uppercase, max 25
                break;
            case 'ifsc':
                transformedValue = value.toUpperCase().slice(0, 25); // Uppercase, max 25
                break;
            case 'itemNo':
                transformedValue = value.replace(/\D/g, '').slice(0, 20); // Numeric only, max 20
                break;
            case 'itemName':
            case 'accountHolderName':
                transformedValue = value.slice(0, 35); // Max 35
                if (value.length > 0) {
                    transformedValue = value.charAt(0).toUpperCase() + value.slice(1); // First letter uppercase
                }
                break;
            default:
                break;
        }

        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : transformedValue,
        }));
    };

    const handleCompleteEdit = () => {
        handleSaveItem(formData); // Save the changes with updated form data
        setIsEditing(false); // Disable editing
    };

    const handleBack = () => {
        toggleView(); // Switch to the item list view
    };


    return (
        <div className="bg-blue-400 mt-44 p-8 min-h-screen">
            <div className="bg-slate-50 rounded-lg p-6">
                <header className="text-center bg-white py-2 border border-blue-300 rounded-full mb-5">
                    <h2 className="text-lg font-bold  text-blue-500">Bank view Page</h2>
                </header>


                {/* Buttons for Back, Edit, Save */}
                <div className="flex space-x-4 mb-5">
                    <button
                        onClick={onClose} // Call handleBack on click
                        className="px-3 border border-blue-500 h-10 bg-white rounded-md hover:bg-gray-100"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleEdit}
                        className="px-3 border border-green-500 h-10 bg-white rounded-md hover:bg-gray-100"
                        disabled={isEditing} // Disable if already in edit mode
                    >
                        Edit
                    </button>
                    <button
                        onClick={handleCompleteEdit}
                        className="px-3 border border-green-500 h-10 bg-white rounded-md hover:bg-gray-100"
                        disabled={!isEditing} // Disable if not in edit mode
                    >
                        Save
                    </button>
                </div>

                <div className="mt-10 space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="font-semibold text-blue-600">Bank Account No</label>
                            <input
                                type="text"
                                name="itemNo"
                                value={formData?.itemNo || ''}
                                className="border border-green-600 w-full p-2 rounded-lg"
                                disabled // Always disabled
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-blue-600">Bank Name</label>
                            <input
                                type="text"
                                name="itemName"
                                value={formData?.itemName || ''}
                                onChange={handleChange}
                                className="border border-green-600 w-full p-2 rounded-lg"
                                disabled={!isEditing} // Enable when editing
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-blue-600">Account holder  Name</label>
                            <input
                                name="accountHolderName"
                                placeholder="Enter Bank Name"
                                value={formData.accountHolderName}
                                onChange={handleChange}
                                className="border border-green-600 w-full p-2 rounded-lg"
                                disabled={!isEditing} // Enable when editing
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-blue-600">Currency</label>
                            <input
                                type="text"
                                name="currency"
                                value={formData?.currency || ''}
                                onChange={handleChange}
                                className="border border-green-600 w-full p-2 rounded-lg"
                                disabled={!isEditing} // Enable when editing

                            />
                        </div>
                        <div>
                            <label className="font-semibold text-blue-600">Account type</label>
                            <select
                                name="unit"
                                value={formData?.unit || ''}
                                onChange={handleChange}
                                className="border border-green-600 w-full p-2 rounded-lg"
                                disabled={!isEditing} // Enable when editing
                            >
                                {/* <option value="">Select unit (optional)</option> */}
                                <option value="MT-Megatons">Saving Account </option>
                                <option value="KG-Kilogram">Current Account </option>

                            </select>
                        </div>





                        <div>
                            <label className="font-semibold text-blue-600">IFSC code </label>
                            <input
                                type="text"
                                name="ifsc"
                                value={formData?.ifsc || ''}
                                onChange={handleChange}
                                className="border border-green-600 w-full p-2 rounded-lg"
                                disabled={!isEditing} // Enable when editing
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-blue-600">Active</label>
                            <Checkbox_with_words
                                name="active"
                                cls="m-1 text-blue-700"
                                checked={formData?.active || false}
                                onChange={(e) => {
                                    if (isEditing) { // Only allow change if in editing mode
                                        setFormData((prevData) => ({
                                            ...prevData,
                                            active: e.target.checked,
                                        }));
                                    }
                                }}
                                disabled={!isEditing} // Disable when not editing
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BankViewPage;
