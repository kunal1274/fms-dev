// import React from 'react';

// const Label = ({ label,className }) => {
//   return (
//     <label className={className}>
//       {label}
//     </label>
//   );
// };

// export default Label;

// import React from 'react';

// const Label = ({ label, htmlFor, className = "" }) => (
//   <label className={`block text-gray-700 text-sm font-bold mb-2 ${className}`} htmlFor={htmlFor}>
//     {label} <span className="text-red-500">*</span>
//   </label>
// );

// export default Label;
import React from 'react';

const Label = ({ label, className }) => {
  return (
    <label className={`font-bold text-left ${className}`}>
      {label}
    </label>
  );
};

export default Label;
