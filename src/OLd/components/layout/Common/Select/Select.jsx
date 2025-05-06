import React from 'react';

// const Select = ({ id, name, value, onChange, options, className = "" }) => (
//   <select
//     id={id}
//     name={name}
//     value={value}
//     onChange={onChange}
//     className={`form-select block w-full border border-gray-300 rounded-md p-3 ${className}`}
//   >
//     {options.map((option ) => (
//       <option key={option.value} value={option.value}>
//         {option.label}
//       </option>
//     ))}
//   </select>
// );


const Select = ({ id, name, value, onChange, options = [], className = "" }) => (
  <select
    id={id}
    name={name.trim()} // Trim any extra spaces
    value={value}
    onChange={onChange}
    className={`form-select block w-full border border-gray-300 rounded-md p-3 ${className}`}
    required
  >
    {options.length > 0 ? (
      options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))
    ) : (
      <option value="">No options available</option>
    )}
  </select>
);

export default Select;