import React, { useState, useEffect } from 'react';
import { useOutlet } from '../../context/OutletContext';
import Button from '../Button';

const OutletList = ({ onCreateOutlet, onEditOutlet }) => {
  const { outlets, loading, error, deleteOutlet, toggleOutletStatus, getOutletStatistics } = useOutlet();
  const [statistics, setStatistics] = useState({});
  const [loadingStats, setLoadingStats] = useState({});

  // Fetch statistics for all outlets
  useEffect(() => {
    const fetchAllStatistics = async () => {
      for (const outlet of outlets) {
        setLoadingStats(prev => ({ ...prev, [outlet.id]: true }));
        const stats = await getOutletStatistics(outlet.id);
        if (stats.success) {
          setStatistics(prev => ({ ...prev, [outlet.id]: stats.data.statistics }));
        }
        setLoadingStats(prev => ({ ...prev, [outlet.id]: false }));
      }
    };

    if (outlets.length > 0) {
      fetchAllStatistics();
    }
  }, [outlets, getOutletStatistics]);

  const handleDeleteOutlet = async (outletId, outletName) => {
    if (window.confirm(`Are you sure you want to delete the outlet "${outletName}"?`)) {
      const result = await deleteOutlet(outletId);
      if (result.success) {
        alert('Outlet deleted successfully');
      } else {
        alert(result.message || 'Failed to delete outlet');
      }
    }
  };

  const handleToggleStatus = async (outletId, currentStatus) => {
    const result = await toggleOutletStatus(outletId);
    if (result.success) {
      alert(`Outlet ${currentStatus ? 'deactivated' : 'activated'} successfully`);
    } else {
      alert(result.message || 'Failed to update outlet status');
    }
  };

  const formatOperatingHours = (operatingHours) => {
    if (!operatingHours) return 'Not set';
    
    try {
      const hours = typeof operatingHours === 'string' ? JSON.parse(operatingHours) : operatingHours;
      const today = new Date().toLocaleLowerCase().slice(0, 3) + (new Date().toLocaleDateString('en', { weekday: 'long' }).slice(3));
      const todayHours = hours[today.toLowerCase()];
      
      if (todayHours && !todayHours.closed) {
        return `Today: ${todayHours.open} - ${todayHours.close}`;
      } else {
        return 'Closed today';
      }
    } catch (error) {
      return 'Not set';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading outlets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-300 rounded-md p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Restaurant Outlets</h2>
        <Button
          onClick={onCreateOutlet}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          + Create New Outlet
        </Button>
      </div>

      {outlets.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No outlets</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first outlet.</p>
          <div className="mt-6">
            <Button
              onClick={onCreateOutlet}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              + Create New Outlet
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {outlets.map((outlet) => (
            <div key={outlet.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        outlet.isActive ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <span className={`text-sm font-medium ${
                          outlet.isActive ? 'text-green-800' : 'text-gray-500'
                        }`}>
                          {outlet.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{outlet.name}</h3>
                      <p className="text-sm text-gray-500">{outlet.outletType}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    outlet.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {outlet.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-600">{outlet.description || 'No description'}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    <strong>Location:</strong> {outlet.location}
                  </p>
                  {outlet.phone && (
                    <p className="text-sm text-gray-500">
                      <strong>Phone:</strong> {outlet.phone}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    <strong>Hours:</strong> {formatOperatingHours(outlet.operatingHours)}
                  </p>
                </div>

                {/* Statistics */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {loadingStats[outlet.id] ? (
                    <div className="col-span-2 text-center">
                      <span className="text-sm text-gray-500">Loading stats...</span>
                    </div>
                  ) : statistics[outlet.id] ? (
                    <>
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-blue-600">{statistics[outlet.id].totalTables}</p>
                        <p className="text-xs text-gray-500">Tables</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-green-600">{statistics[outlet.id].todayOrders}</p>
                        <p className="text-xs text-gray-500">Today's Orders</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-yellow-600">{statistics[outlet.id].totalMenuItems}</p>
                        <p className="text-xs text-gray-500">Menu Items</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-purple-600">₹{statistics[outlet.id].totalRevenue.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">Today's Revenue</p>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-2 text-center">
                      <span className="text-sm text-gray-500">No stats available</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex space-x-2">
                  <Button
                    onClick={() => onEditOutlet(outlet)}
                    className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleToggleStatus(outlet.id, outlet.isActive)}
                    className={`flex-1 ${
                      outlet.isActive
                        ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
                        : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                    }`}
                  >
                    {outlet.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    onClick={() => handleDeleteOutlet(outlet.id, outlet.name)}
                    className="flex-1 bg-red-800 hover:bg-red-400 border border-red-200"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OutletList;