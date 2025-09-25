import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const OutletContext = createContext();

export const useOutlet = () => {
  const context = useContext(OutletContext);
  if (!context) {
    throw new Error('useOutlet must be used within an OutletProvider');
  }
  return context;
};

export const OutletProvider = ({ children }) => {
  const { hotel, token } = useAuth();
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch outlets for the current hotel
  const fetchOutlets = async () => {
    if (!token || !hotel?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const base = (typeof window !== 'undefined' && window.API_BASE_URL)
        || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
        || 'http://localhost:5000';
      const url = `${base.replace(/\/$/, '')}/api/pos/outlets`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(`Failed to fetch outlets (${response.status}) ${txt?.slice(0,200)}`);
      }

      const data = await response.json();
      if (data.success) {
        setOutlets(data.data);
        
        // Auto-select first outlet if none selected and outlets exist
        if (!selectedOutlet && data.data.length > 0) {
          setSelectedOutlet(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching outlets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create a new outlet
  const createOutlet = async (outletData) => {
    if (!token) return { success: false, message: 'No authentication token' };

    try {
      const base = (typeof window !== 'undefined' && window.API_BASE_URL)
        || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
        || 'http://localhost:5000';
      const url = `${base.replace(/\/$/, '')}/api/pos/outlets`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(outletData),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        const text = await response.text();
        return { success: false, message: `Create failed: ${response.status}`, details: contentType.includes('application/json') ? undefined : text?.slice(0,200) };
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchOutlets(); // Refresh outlets list
      }
      
      return data;
    } catch (err) {
      console.error('Error creating outlet:', err);
      return { success: false, message: err.message };
    }
  };

  // Update an outlet
  const updateOutlet = async (outletId, outletData) => {
    if (!token) return { success: false, message: 'No authentication token' };

    try {
      const base = (typeof window !== 'undefined' && window.API_BASE_URL)
        || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
        || 'http://localhost:5000';
      const url = `${base.replace(/\/$/, '')}/api/pos/outlets/${outletId}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(outletData),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        const text = await response.text();
        return { success: false, message: `Update failed: ${response.status}`, details: contentType.includes('application/json') ? undefined : text?.slice(0,200) };
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchOutlets(); // Refresh outlets list
        
        // Update selected outlet if it was the one being updated
        if (selectedOutlet && selectedOutlet.id === outletId) {
          setSelectedOutlet(data.data);
        }
      }
      
      return data;
    } catch (err) {
      console.error('Error updating outlet:', err);
      return { success: false, message: err.message };
    }
  };

  // Delete an outlet
  const deleteOutlet = async (outletId) => {
    if (!token) return { success: false, message: 'No authentication token' };

    try {
      const base = (typeof window !== 'undefined' && window.API_BASE_URL)
        || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
        || 'http://localhost:5000';
      const url = `${base.replace(/\/$/, '')}/api/pos/outlets/${outletId}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        const text = await response.text();
        return { success: false, message: `Delete failed: ${response.status}`, details: contentType.includes('application/json') ? undefined : text?.slice(0,200) };
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchOutlets(); // Refresh outlets list
        
        // Clear selected outlet if it was deleted
        if (selectedOutlet && selectedOutlet.id === outletId) {
          setSelectedOutlet(outlets.length > 1 ? outlets[0] : null);
        }
      }
      
      return data;
    } catch (err) {
      console.error('Error deleting outlet:', err);
      return { success: false, message: err.message };
    }
  };

  // Toggle outlet status
  const toggleOutletStatus = async (outletId) => {
    if (!token) return { success: false, message: 'No authentication token' };

    try {
      const base = (typeof window !== 'undefined' && window.API_BASE_URL)
        || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
        || 'http://localhost:5000';
      const url = `${base.replace(/\/$/, '')}/api/pos/outlets/${outletId}/toggle-status`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        const text = await response.text();
        return { success: false, message: `Toggle failed: ${response.status}`, details: contentType.includes('application/json') ? undefined : text?.slice(0,200) };
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchOutlets(); // Refresh outlets list
      }
      
      return data;
    } catch (err) {
      console.error('Error toggling outlet status:', err);
      return { success: false, message: err.message };
    }
  };

  // Get outlet statistics
  const getOutletStatistics = async (outletId) => {
    if (!token) return { success: false, message: 'No authentication token' };

    try {
      const base = (typeof window !== 'undefined' && window.API_BASE_URL)
        || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
        || 'http://localhost:5000';
      const url = `${base.replace(/\/$/, '')}/api/pos/outlets/${outletId}/statistics`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        const text = await response.text();
        return { success: false, message: `Stats failed: ${response.status}`, details: contentType.includes('application/json') ? undefined : text?.slice(0,200) };
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching outlet statistics:', err);
      return { success: false, message: err.message };
    }
  };

  // Get outlets dashboard
  const getOutletsDashboard = async () => {
    if (!token) return { success: false, message: 'No authentication token' };

    try {
      const base = (typeof window !== 'undefined' && window.API_BASE_URL)
        || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
        || 'http://localhost:5000';

      const url = `${base.replace(/\/$/, '')}/api/pos/outlets-dashboard`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        // Try to read text for better diagnostics
        const text = await response.text();
        return {
          success: false,
          message: `Request failed: ${response.status} ${response.statusText}`,
          details: contentType.includes('application/json') ? undefined : text?.slice(0, 500)
        };
      }

      if (!contentType.includes('application/json')) {
        const text = await response.text();
        return { success: false, message: 'Unexpected non-JSON response', details: text?.slice(0, 500) };
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching outlets dashboard:', err);
      return { success: false, message: err.message };
    }
  };

  // Get available managers
  const getAvailableManagers = async () => {
    if (!token) return { success: false, message: 'No authentication token' };

    try {
      const base = (typeof window !== 'undefined' && window.API_BASE_URL)
        || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
        || 'http://localhost:5000';
      const url = `${base.replace(/\/$/, '')}/api/pos/available-managers`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        const text = await response.text();
        return { success: false, message: `Managers failed: ${response.status}`, details: contentType.includes('application/json') ? undefined : text?.slice(0,200) };
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching available managers:', err);
      return { success: false, message: err.message };
    }
  };

  // Reset selected outlet when user changes
  useEffect(() => {
    if (!hotel) {
      setSelectedOutlet(null);
      setOutlets([]);
    } else if (hotel.id) {
      fetchOutlets();
    }
  }, [hotel, token]);

  const value = {
    selectedOutlet,
    setSelectedOutlet,
    outlets,
    loading,
    error,
    fetchOutlets,
    createOutlet,
    updateOutlet,
    deleteOutlet,
    toggleOutletStatus,
    getOutletStatistics,
    getOutletsDashboard,
    getAvailableManagers,
  };

  return (
    <OutletContext.Provider value={value}>
      {children}
    </OutletContext.Provider>
  );
};