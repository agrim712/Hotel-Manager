import React, { useState, useRef, useEffect } from 'react';
import { useOutlet } from '../../context/OutletContext';

const OutletSelector = ({ className = '' }) => {
  const { selectedOutlet, setSelectedOutlet, outlets, loading } = useOutlet();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOutletSelect = (outlet) => {
    setSelectedOutlet(outlet);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-500">Loading outlets...</span>
      </div>
    );
  }

  if (outlets.length === 0) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        No outlets available
      </div>
    );
  }

  if (outlets.length === 1) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="h-2 w-2 bg-green-400 rounded-full"></div>
        <span className="text-sm font-medium text-gray-900">{outlets[0].name}</span>
        <span className="text-xs text-gray-500">({outlets[0].outletType})</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className={`h-2 w-2 rounded-full ${
          selectedOutlet?.isActive ? 'bg-green-400' : 'bg-gray-400'
        }`}></div>
        <span className="truncate max-w-32">
          {selectedOutlet ? selectedOutlet.name : 'Select Outlet'}
        </span>
        <svg 
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-64 bg-white shadow-lg rounded-md border border-gray-200">
          <div className="py-1">
            {outlets.map((outlet) => (
              <button
                key={outlet.id}
                onClick={() => handleOutletSelect(outlet)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                  selectedOutlet?.id === outlet.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`h-2 w-2 rounded-full ${
                      outlet.isActive ? 'bg-green-400' : 'bg-gray-400'
                    }`}></div>
                    <div>
                      <div className="font-medium">{outlet.name}</div>
                      <div className="text-xs text-gray-500">{outlet.outletType}</div>
                    </div>
                  </div>
                  {selectedOutlet?.id === outlet.id && (
                    <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">{outlet.location}</div>
              </button>
            ))}
          </div>
          
          {outlets.length > 0 && (
            <div className="border-t border-gray-200 py-1">
              <div className="px-4 py-2 text-xs text-gray-500">
                {outlets.length} outlet{outlets.length > 1 ? 's' : ''} available
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OutletSelector;