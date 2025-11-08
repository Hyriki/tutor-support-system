import React from 'react';

// Component input
const FormInput = (props) => (
  <input 
    {...props} 
    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
  />
);

export default FormInput;