import React from 'react';

/**
 * Component Section wraps a group of form fields
 * @param {string} props.title - Title
 * @param {React.ReactNode} props.children - Content
 * @param {string} props.sectionClassName - Class for the <section> tag (outermost frame)
 * @param {string} props.contentClassName - Class for <div> content (white part)
 */
const ProfileSection = ({ title, children, sectionClassName, contentClassName }) => {
  return (
    // This <section> will always be HORIZONTAL (block)
    <section className={`mb-8 ${sectionClassName || ''}`}>
      
      {/* Green title bar (always full-width) */}
      <div className="bg-primary text-white p-3 rounded-t-md font-semibold">{title}</div>
      
      {/* Content section (white), this is where the grid is applied */}
      <div className={`border border-t-0 border-gray-200 p-6 rounded-b-md ${contentClassName || ''}`}>
        {children}
      </div>
    </section>
  );
};

export default ProfileSection;