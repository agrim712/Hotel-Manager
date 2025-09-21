import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Bell,
  Timer,
  Coffee,
  UtensilsCrossed,
  Zap
} from 'lucide-react';

const TableManager = ({ tables, onTableUpdate }) => {
  const [tableStatuses, setTableStatuses] = useState({});
  const [cleaningTimers, setCleaningTimers] = useState({});
  const [notifications, setNotifications] = useState([]);

  // Initialize table statuses
  useEffect(() => {
    const initialStatuses = {};
    tables.forEach(table => {
      initialStatuses[table.id] = {
        status: table.status,
        lastUpdated: new Date(),
        orderId: table.currentOrderId || null,
        cleaningStartTime: null
      };
    });
    setTableStatuses(initialStatuses);
  }, [tables]);

  // Auto-update table status based on order status
  const updateTableStatusFromOrder = useCallback(async (orderId, newOrderStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/pos/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const orderData = await response.json();
        const order = orderData.data;
        
        if (order.tableId) {
          const tableId = order.tableId;
          const currentTableStatus = tableStatuses[tableId];
          
          let newTableStatus = currentTableStatus.status;
          let cleaningStartTime = null;

          // Determine new table status based on order status
          switch (newOrderStatus) {
            case 'PENDING':
            case 'CONFIRMED':
            case 'PREPARING':
              newTableStatus = 'OCCUPIED';
              break;
            case 'READY':
              newTableStatus = 'OCCUPIED';
              break;
            case 'COMPLETED':
              newTableStatus = 'CLEANING';
              cleaningStartTime = new Date();
              // Start 10-minute cleaning timer
              startCleaningTimer(tableId);
              break;
            case 'CANCELLED':
              newTableStatus = 'AVAILABLE';
              break;
          }

          // Update table status
          setTableStatuses(prev => ({
            ...prev,
            [tableId]: {
              ...prev[tableId],
              status: newTableStatus,
              lastUpdated: new Date(),
              orderId: orderId,
              cleaningStartTime: cleaningStartTime
            }
          }));

          // Update backend
          await updateTableStatusInBackend(tableId, newTableStatus);

          // Add notification
          addNotification({
            type: 'table_status_change',
            message: `Table ${tables.find(t => t.id === tableId)?.number} status changed to ${newTableStatus}`,
            timestamp: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Error updating table status from order:', error);
    }
  }, [tableStatuses, tables]);

  // Start cleaning timer for 10 minutes
  const startCleaningTimer = useCallback((tableId) => {
    const timer = setTimeout(() => {
      // After 10 minutes, automatically set table to available
      setTableStatuses(prev => ({
        ...prev,
        [tableId]: {
          ...prev[tableId],
          status: 'AVAILABLE',
          lastUpdated: new Date(),
          orderId: null,
          cleaningStartTime: null
        }
      }));

      // Update backend
      updateTableStatusInBackend(tableId, 'AVAILABLE');

      // Add notification
      addNotification({
        type: 'table_cleaned',
        message: `Table ${tables.find(t => t.id === tableId)?.number} is now available after cleaning`,
        timestamp: new Date()
      });

      // Clear timer
      setCleaningTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[tableId];
        return newTimers;
      });
    }, 10 * 60 * 1000); // 10 minutes

    setCleaningTimers(prev => ({
      ...prev,
      [tableId]: timer
    }));
  }, [tables]);

  // Update table status in backend
  const updateTableStatusInBackend = async (tableId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/pos/tables/${tableId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        onTableUpdate?.();
      }
    } catch (error) {
      console.error('Error updating table status in backend:', error);
    }
  };

  // Add notification
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep only last 10 notifications
  }, []);

  // Get table status icon and color
  const getTableStatusDisplay = (status, tableId) => {
    const cleaningStartTime = tableStatuses[tableId]?.cleaningStartTime;
    const isCleaning = status === 'CLEANING' && cleaningStartTime;
    
    if (isCleaning) {
      const elapsed = Math.floor((new Date() - new Date(cleaningStartTime)) / 1000);
      const remaining = Math.max(0, 600 - elapsed); // 10 minutes = 600 seconds
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      
      return {
        icon: <Timer className="h-4 w-4 text-orange-500" />,
        color: 'bg-orange-100 text-orange-800',
        text: `Cleaning (${minutes}:${seconds.toString().padStart(2, '0')})`,
        isCleaning: true
      };
    }

    switch (status) {
      case 'AVAILABLE':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          color: 'bg-green-100 text-green-800',
          text: 'Available',
          isCleaning: false
        };
      case 'OCCUPIED':
        return {
          icon: <Users className="h-4 w-4 text-blue-500" />,
          color: 'bg-blue-100 text-blue-800',
          text: 'Occupied',
          isCleaning: false
        };
      case 'CLEANING':
        return {
          icon: <UtensilsCrossed className="h-4 w-4 text-orange-500" />,
          color: 'bg-orange-100 text-orange-800',
          text: 'Cleaning',
          isCleaning: false
        };
      case 'RESERVED':
        return {
          icon: <Clock className="h-4 w-4 text-purple-500" />,
          color: 'bg-purple-100 text-purple-800',
          text: 'Reserved',
          isCleaning: false
        };
      default:
        return {
          icon: <AlertCircle className="h-4 w-4 text-gray-500" />,
          color: 'bg-gray-100 text-gray-800',
          text: 'Unknown',
          isCleaning: false
        };
    }
  };

  // Manual table status update
  const handleManualStatusUpdate = async (tableId, newStatus) => {
    try {
      await updateTableStatusInBackend(tableId, newStatus);
      
      setTableStatuses(prev => ({
        ...prev,
        [tableId]: {
          ...prev[tableId],
          status: newStatus,
          lastUpdated: new Date(),
          cleaningStartTime: newStatus === 'CLEANING' ? new Date() : null
        }
      }));

      // If setting to cleaning, start timer
      if (newStatus === 'CLEANING') {
        startCleaningTimer(tableId);
      }

      // If setting to available, clear any existing timer
      if (newStatus === 'AVAILABLE') {
        setCleaningTimers(prev => {
          const newTimers = { ...prev };
          if (newTimers[tableId]) {
            clearTimeout(newTimers[tableId]);
            delete newTimers[tableId];
          }
          return newTimers;
        });
      }

      addNotification({
        type: 'manual_status_change',
        message: `Table ${tables.find(t => t.id === tableId)?.number} manually set to ${newStatus}`,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error manually updating table status:', error);
    }
  };

  // Refresh all table data
  const refreshTables = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/pos/tables', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const updatedTables = data.data;
        
        // Update local statuses
        const updatedStatuses = {};
        updatedTables.forEach(table => {
          updatedStatuses[table.id] = {
            status: table.status,
            lastUpdated: new Date(),
            orderId: table.currentOrderId || null,
            cleaningStartTime: tableStatuses[table.id]?.cleaningStartTime || null
          };
        });
        setTableStatuses(updatedStatuses);
        
        onTableUpdate?.();
      }
    } catch (error) {
      console.error('Error refreshing tables:', error);
    }
  }, [tableStatuses, onTableUpdate]);

  // Expose updateTableStatusFromOrder for external use
  useEffect(() => {
    window.updateTableStatusFromOrder = updateTableStatusFromOrder;
    return () => {
      delete window.updateTableStatusFromOrder;
    };
  }, [updateTableStatusFromOrder]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Table Management</h2>
          <p className="text-gray-600">Real-time table status monitoring</p>
        </div>
        <button
          onClick={refreshTables}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-blue-900">Recent Updates</h3>
            <Bell className="h-4 w-4 text-blue-600" />
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {notifications.slice(0, 5).map((notification, index) => (
              <div key={index} className="text-xs text-blue-800">
                <span className="font-medium">
                  {notification.timestamp.toLocaleTimeString()}
                </span>
                : {notification.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => {
          const statusDisplay = getTableStatusDisplay(
            tableStatuses[table.id]?.status || table.status, 
            table.id
          );
          
          return (
            <div
              key={table.id}
              className={`bg-white rounded-lg shadow-sm border-2 p-4 ${
                statusDisplay.isCleaning ? 'border-orange-300 bg-orange-50' : 
                tableStatuses[table.id]?.status === 'OCCUPIED' ? 'border-blue-300 bg-blue-50' :
                tableStatuses[table.id]?.status === 'AVAILABLE' ? 'border-green-300 bg-green-50' :
                'border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Table {table.number}</h3>
                <div className="flex items-center space-x-1">
                  {statusDisplay.icon}
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusDisplay.color}`}>
                    {statusDisplay.text}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Capacity:</span>
                  <span>{table.capacity} people</span>
                </div>
                <div className="flex justify-between">
                  <span>Area:</span>
                  <span>{table.area?.name || 'Main'}</span>
                </div>
                {tableStatuses[table.id]?.orderId && (
                  <div className="flex justify-between">
                    <span>Order:</span>
                    <span className="font-medium">#{tableStatuses[table.id].orderId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span className="text-xs">
                    {tableStatuses[table.id]?.lastUpdated?.toLocaleTimeString() || 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Manual Status Controls */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => handleManualStatusUpdate(table.id, 'AVAILABLE')}
                    className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                  >
                    Available
                  </button>
                  <button
                    onClick={() => handleManualStatusUpdate(table.id, 'OCCUPIED')}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    Occupied
                  </button>
                  <button
                    onClick={() => handleManualStatusUpdate(table.id, 'CLEANING')}
                    className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded hover:bg-orange-200"
                  >
                    Cleaning
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">Available</p>
              <p className="text-2xl font-bold text-green-900">
                {tables.filter(t => (tableStatuses[t.id]?.status || t.status) === 'AVAILABLE').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">Occupied</p>
              <p className="text-2xl font-bold text-blue-900">
                {tables.filter(t => (tableStatuses[t.id]?.status || t.status) === 'OCCUPIED').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <Timer className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-800">Cleaning</p>
              <p className="text-2xl font-bold text-orange-900">
                {tables.filter(t => (tableStatuses[t.id]?.status || t.status) === 'CLEANING').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-800">Reserved</p>
              <p className="text-2xl font-bold text-purple-900">
                {tables.filter(t => (tableStatuses[t.id]?.status || t.status) === 'RESERVED').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableManager;
