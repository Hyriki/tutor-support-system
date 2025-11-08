import React from 'react';

/**
 * A reusable list component.
 *
 * @param {object} props
 * @param {Array<any>} props.items - The array of data (e.g., list of students)
 * @param {Function} props.renderItem - A function that takes an item and returns JSX to render it.
 */
const ItemsList = ({ items, renderItem }) => {
  // If there are no items, display a message
  if (!items || items.length === 0) {
    return <p className="text-gray-500">No items to display.</p>;
  }

  return (
    // Use Tailwind's grid layout to display the list
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item, index) => (
        // Use the renderItem function passed in via props
        <div key={index}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
};

export default ItemsList;