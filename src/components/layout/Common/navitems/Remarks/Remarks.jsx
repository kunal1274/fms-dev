// Remarks.jsx
import React, { useState } from 'react';

const Remarks = () => {
  const [remark, setRemark] = useState('');

  const handleRemarkChange = (event) => {
    setRemark(event.target.value);
  };

  const handleSave = () => {
    // Save the remark
    console.log('Remark saved:', remark);
  };

  const handleCancel = () => {
    // Reset the remark
    setRemark('');
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
          Remarks <span className="text-gray-500">(For Internal Use)</span>
        </label>
        <textarea
          id="remarks"
          name="remarks"
          rows="4"
          value={remark}
          onChange={handleRemarkChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      {/* <div className="flex space-x-2">
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Save
        </button>
        <button
          onClick={handleCancel}
          className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
        >
          Cancel
        </button>
      </div> */}
    </div>
  );
};

export default Remarks;
