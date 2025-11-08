import React from 'react';

// Component select
const FormSelect = ({ children, ...props }) => (
  <select 
    {...props} 
    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
  >
    {children}
  </select>
);

export default FormSelect;