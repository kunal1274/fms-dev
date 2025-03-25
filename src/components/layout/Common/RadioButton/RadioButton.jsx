// import React from 'react';

// const RadioButton = ({ label, value, name, checked, onChange }) => {
//   return (
//     <label className="inline-flex items-center ml-6">
//       <input
//         type="radio"
//         name={name}
//         value={value}
//         onChange={onChange}
//         checked={checked}
//         className="form-radio"
//       />
//       <span className="ml-2">{label}</span>
//     </label>
//   );
// };

// export default RadioButton;
import React from 'react';

const RadioButton = ({ label, value, name, checked, onChange }) => (
  <label className="inline-flex items-center ml-6">
    <input
      type="radio"
      name={name}
      value={value}
      onChange={onChange}
      checked={checked}
      className="form-radio"
    />
    <span className="ml-2">{label}</span>
  </label>
);

export default RadioButton;
