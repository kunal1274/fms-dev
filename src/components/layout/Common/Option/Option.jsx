import React from 'react';

const Select = ({ name, options, onChange, className, required }) => {
  return (
    <select
      name={name}
      onChange={onChange}
      className={className}
      required={required}
    >
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
