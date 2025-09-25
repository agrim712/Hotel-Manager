import React from 'react';

export default function Button({ name, children, onClick, className = '', type = 'button', disabled = false }) {
  const label = children ?? name ?? 'Button';
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-md transition-colors ${disabled ? 'bg-gray-300 text-gray-600' : 'bg-blue-600 hover:bg-blue-700 text-white'} ${className}`}
    >
      {label}
    </button>
  );
}
