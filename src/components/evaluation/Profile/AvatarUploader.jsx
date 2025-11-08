import React, { useState, useRef } from 'react';
import { FaUpload } from 'react-icons/fa';

/**
 * Component handles avatar image upload and preview logic
 * @param {string} props.defaultImageUrl - Original default image
 */
const AvatarUploader = ({ defaultImageUrl }) => {
  const [previewImage, setPreviewImage] = useState(defaultImageUrl || null);
  const fileInputRef = useRef(null);

  const handleUploadButtonClick = (e) => {
    e.preventDefault();
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-shrink-0 flex flex-col items-center">
      <input 
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {previewImage ? (
        <img 
          src={previewImage}
          alt="Profile preview"
          className="w-36 h-36 bg-gray-200 rounded-full mb-4 object-cover"
        />
      ) : (
        <div className="w-36 h-36 bg-gray-200 rounded-full mb-4 flex items-center justify-center text-gray-400 text-xs text-center p-2">
          (No Image)
        </div>
      )}
      
      <button 
        onClick={handleUploadButtonClick}
        className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800"
      >
        <FaUpload />
        Upload Image
      </button>
    </div>
  );
};

export default AvatarUploader;