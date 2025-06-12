// src/pages/RestaurantManagement.js
import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

const RestaurantManagement = () => {
  const navigate = useNavigate();

  const menuOptions = [
    { label: 'View Menu', path: '/restaurant/menu-categories' },
    { label: 'Edit Menu', path: '/restaurant/edit-menu' },
    { label: 'Orders', path: '/restaurant/orders' },
  ];

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-900 text-white p-4 space-y-3">
        <h2 className="text-xl font-bold mb-4">Restaurant Management</h2>
        {menuOptions.map((option) => (
          <button
            key={option.path}
            onClick={() => navigate(option.path)}
            className="w-full text-left px-3 py-2 rounded hover:bg-gray-700"
          >
            {option.label}
          </button>
        ))}
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default RestaurantManagement;