import React, { useState, useEffect } from 'react';
import OrderManagementTable from './OrderManagementTable';
import NewOrderForm from './NewOrderForm';
import OrderDetails from './OrderDetails';
import RunningBilling from '../RunningBilling';
import Billing from '../Billing';
import TableManager from '../TableManager';
import KitchenDisplaySystem from '../KitchenDisplaySystem';
import { ChevronLeft, Plus, Users, ChefHat } from 'lucide-react';

const OrderManagementApp = () => {
  const [view, setView] = useState('list'); // 'list', 'newOrder', 'orderDetails', 'runningBilling', 'billing', 'tables', 'kitchen'
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);

  const handleNavigate = (newView, id = null) => {
    setSelectedOrderId(id);
    setView(newView);
  };

  const handleOrderCreated = () => {
    setView('list');
    fetchOrders(); // Refresh the order list
  };

  const handleOpenRunningBilling = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/pos/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedOrder(data.data);
        setView('runningBilling');
      }
    } catch (error) {
      console.error('Error fetching order for billing:', error);
    }
  };

  const handleOrderUpdate = () => {
    fetchOrders(); 
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/pos/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchTables = async () => {
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
        setTables(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchTables();
  }, []);

  switch (view) {
    case 'newOrder':
      return <NewOrderForm onOrderCreated={handleOrderCreated} onCancel={() => setView('list')} />;
    case 'orderDetails':
      return <OrderDetails orderId={selectedOrderId} onBack={() => setView('list')} />;
    case 'runningBilling':
      return (
        <RunningBilling
          order={selectedOrder}
          onUpdateOrder={handleOrderUpdate}
          onClose={() => setView('list')}
        />
      );
    case 'billing':
      return (
        <Billing
          orderId={selectedOrderId}
          onBack={() => setView('list')}
        />
      );
    case 'tables':
      return (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="mb-6">
            <button
              onClick={() => setView('list')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </button>
          </div>
          <TableManager
            tables={tables}
            onTableUpdate={fetchTables}
          />
        </div>
      );
    case 'kitchen':
      return (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="mb-6">
            <button
              onClick={() => setView('list')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </button>
          </div>
          <KitchenDisplaySystem />
        </div>
      );
    case 'list':
    default:
      return (
        <OrderManagementTable
          onNavigate={handleNavigate}
          onOpenRunningBilling={handleOpenRunningBilling}
          orders={orders}
          onOrdersUpdate={fetchOrders}
        />
      );
  }
};

export default OrderManagementApp;