import React from 'react';

/**
 * A reusable Card component to display profile information.
 * It receives props to display data dynamically.
 *
 * @param {object} props
 * @param {string} props.name - The user's name (e.g., "John Doe")
 * @param {string} props.role - The user's role (e.g., "Student", "Tutor")
 * @param {string} props.id - The user's ID (e.g., "2012345")
 * @param {string} props.imageUrl - URL to the avatar image
 */
const ProfileCard = ({ name, role, id, imageUrl }) => {
  return (
    <div className="max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow">
      <img 
        className="w-24 h-24 mb-3 rounded-full shadow-lg mx-auto" 
        src={imageUrl || 'https://via.placeholder.com/150'} // Placeholder image
        alt={`${name} profile`} 
      />
      <h5 className="mb-1 text-xl font-medium text-gray-900 text-center">{name}</h5>
      <p className="text-sm text-gray-500 text-center">{role}</p>
      <p className="text-sm text-gray-500 text-center">{id}</p>
      <div className="flex mt-4 justify-center">
        <a 
          href="#" 
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800"
        >
          View Details
        </a>
      </div>
    </div>
  );
};

export default ProfileCard;