// // TextInput.js
// import React from 'react';

// const TextInput = ({
//   type = 'text',
//   name,
//   placeholder,
//   onChange,
//   value,
//   className,
//   required = false,
// }) => {
//   return (
//     <input
//       type={type}
//       name={name}
//       placeholder={placeholder}
//       onChange={onChange}
//       value={value}
//       className={className}
//       required={required}
//     />
//   );
// };

// export default TextInput;
// import React from 'react';

// const Input = ({ id, name, type = "text", placeholder, value, onChange, className = "", required = false }) => (
//   <input
//     id={id}
//     name={name}
//     type={type}
//     placeholder={placeholder}
//     value={value}
//     onChange={onChange}
//     required={required}
//     className={`form-input block w-full border border-gray-300 rounded-md p-3 ${className}`}
//   />
// );


import React from 'react';

const TextInput = ({
  type = 'text',
  name,
  placeholder,
  onChange,
  value,
  className,
  required = false,
}) => {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      onChange={onChange}
      value={value}
      className={`border p-2 rounded ${className}`}
      required={required}
    />
  );
};

export default TextInput;
