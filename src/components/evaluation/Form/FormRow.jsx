import React from 'react';

// This component is responsible for wrapping the <label> and <input>
const FormRow = ({ label, children }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    {children}
  </div>
);

export default FormRow;