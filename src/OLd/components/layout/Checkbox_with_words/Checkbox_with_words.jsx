import React, { useState } from "react";
import "./Checkbox_with_words.css";

const CheckboxWithWords = ({ 
  cls, 
  text, 
  className, 
  disabled,
  onCheckboxChange, 
  label, 
  linkText, 
  linkUrl, 
  checked, 
  onChange, 
  name // Added name prop here
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCheckboxChange = (e) => {
    onCheckboxChange(e.target.checked); // Calling the passed function to handle checkbox change
  };

  const handleLinkClick = (e) => {
    e.preventDefault(); 
    setIsModalOpen(true); // Open modal when link is clicked
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close modal
  };

  return (
    <div className="flex">
      <div className="font-light flex items-center">
        <span>
          <input
            className="ml-1.5 text-white bg-black checkbox"
            type="checkbox"
            name={name} // Using the passed name prop
            checked={checked} // Controlled checkbox state
            onChange={onChange || handleCheckboxChange} 
            // disabled={!isEditing}
          />
        </span>
        
      </div>

      {/* Modal for Terms and Conditions */}
     
    </div>
  );
};

export default CheckboxWithWords;
