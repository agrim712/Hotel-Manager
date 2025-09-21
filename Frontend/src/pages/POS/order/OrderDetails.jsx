import React, { useState, useEffect } from 'react';
import { ChevronLeft, Users, CheckCircle, XCircle, AlertCircle, Clock, Trash2, Plus } from 'lucide-react';
import { getStatusIcon, getStatusColor, getTypeColor } from './utils.jsx';


const OrderDetails = ({ orderId, onBack }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
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
          setOrder(data.data);
        } else {
          console.error('Failed to fetch order');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
    const fetchMenu = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/pos/menu/items', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          setMenuItems(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching menu items:', err);
      }
    };
    fetchMenu();
  }, [orderId]);

  const handleStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/pos/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        const orderResponse = await fetch(`http://localhost:5000/api/pos/orders/${order.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (orderResponse.ok) {
          const data = await orderResponse.json();
          setOrder(data.data);
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/pos/orders/${order.id}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const orderResponse = await fetch(`http://localhost:5000/api/pos/orders/${order.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (orderResponse.ok) {
          const data = await orderResponse.json();
          setOrder(data.data);
        }
      }
    } catch (error) {
      console.error('Error removing order item:', error);
    }
  };

  const handleAddItem = async () => {
    if (!selectedItemId || selectedQty < 1) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/pos/orders/${order.id}/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemId: selectedItemId, quantity: selectedQty })
      });
      if (response.ok) {
        const orderResponse = await fetch(`http://localhost:5000/api/pos/orders/${order.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (orderResponse.ok) {
          const data = await orderResponse.json();
          setOrder(data.data);
          setSelectedItemId('');
          setSelectedQty(1);
        }
      } else {
        const errData = await response.json();
        alert(errData.message || 'Failed to add item');
      }
    } catch (error) {
      console.error('Error adding order item:', error);
    }
  };

  const isPaid = !!order?.payments?.some(p => p.status === 'SUCCESS');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold">Order not found.</h2>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:underline">
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="flex items-center text-gray-600 mb-2">
              <Users className="h-5 w-5 mr-2" />
              <span className="font-semibold">Customer:</span> {order.customer?.name || 'Walk-in'}
            </div>
            <div className="flex items-center text-gray-600 mb-2">
              <span className="font-semibold">Type:</span>
              <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(order.type)}`}>
                {order.type}
              </span>
            </div>
            <div className="flex items-center text-gray-600 mb-2">
              <span className="font-semibold">Status:</span>
              <span className={`ml-2 inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="ml-1">{order.status}</span>
              </span>
            </div>
            {order.table && (
              <div className="flex items-center text-gray-600 mb-2">
                <span className="font-semibold">Table:</span> <span className="ml-2">{order.table.number}</span>
              </div>
            )}
            <div className="flex items-center text-gray-600 mb-2">
              <span className="font-semibold">Total:</span> <span className="ml-2 font-bold text-lg">₹{order.total}</span>
            </div>
            {isPaid && (
              <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 inline-block">
                Payment processed. Order editing is disabled.
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Actions</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusChange('CONFIRMED')}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
                disabled={order.status !== 'PENDING'}
              >
                Confirm
              </button>
              <button
                onClick={() => handleStatusChange('READY')}
                className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                disabled={order.status !== 'PREPARING'}
              >
                Mark as Ready
              </button>
              <button
                onClick={() => handleStatusChange('COMPLETED')}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200"
                disabled={order.status !== 'READY' && order.status !== 'CONFIRMED'}
              >
                Complete
              </button>
              <button
                onClick={() => handleStatusChange('CANCELLED')}
                className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                disabled={order.status === 'COMPLETED' || order.status === 'CANCELLED'}
              >
                Cancel
              </button>
              <button
                onClick={() => console.log('Printing order:', order.id)}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200"
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>

        {!isPaid && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Add Items</h3>
            <div className="flex items-end gap-3 flex-wrap">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Menu Item</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="block w-64 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select item</option>
                  {menuItems.map(mi => (
                    <option key={mi.id} value={mi.id}>{mi.name} — ₹{mi.basePrice}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={selectedQty}
                  onChange={(e) => setSelectedQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 text-center rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleAddItem}
                className="h-10 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-6 flex items-center"
                disabled={!selectedItemId}
              >
                <Plus className="h-4 w-4 mr-2" /> Add
              </button>
            </div>
          </div>
        )}

        <h3 className="text-lg font-bold text-gray-800 mb-4">Order Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.orderItems.map(item => (
                <tr key={item.id}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.item?.name || 'Unknown Item'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.notes || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className={`text-red-600 hover:text-red-900 ${isPaid ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={isPaid ? 'Payment processed - editing disabled' : 'Remove Item'}
                      disabled={isPaid}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;