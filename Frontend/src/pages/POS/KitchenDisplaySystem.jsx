import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Users, 
  ChefHat, 
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  MoreVertical,
  Filter,
  RefreshCw,
  Settings,
  Timer,
  Bell,
  Printer
} from 'lucide-react';

const KitchenDisplaySystem = () => {
  const [kitchenOrders, setKitchenOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchKitchenOrders();
    
    if (autoRefresh) {
      const interval = setInterval(fetchKitchenOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, statusFilter, priorityFilter]);

  const fetchKitchenOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);

      const response = await fetch(`http://localhost:5000/api/pos/kitchen/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setKitchenOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/pos/kitchen/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchKitchenOrders(); // Refresh orders
        if (soundEnabled) {
          // Play notification sound
          const audio = new Audio('/notification.mp3');
          audio.play().catch(() => {}); // Ignore errors if audio fails
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const printReceipt = async (order) => {
    try {
      const token = localStorage.getItem('token');
      // Fetch latest order data for accuracy
      const response = await fetch(`http://localhost:5000/api/pos/orders/${order.order.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = response.ok ? await response.json() : { data: order.order };
      const ord = data.data || order.order;

      const printWindow = window.open('', '_blank');
      const hotelName = (ord.hotel && ord.hotel.name) || 'Hotel';
      const customerName = ord.customer?.name || 'Walk-in Customer';
      const tableText = ord.table?.number ? `Table ${ord.table.number}` : (ord.type === 'dine-in' ? 'Table N/A' : ord.type === 'takeaway' ? 'Takeaway' : 'Delivery');
      const itemsHtml = (ord.orderItems || []).map((item) => `
        <tr>
          <td>${item.quantity} x ${(item.item && item.item.name) || 'Item'}</td>
          <td style="text-align:right">₹${(item.price || 0).toFixed(2)}</td>
        </tr>
        ${item.notes ? `<tr><td colspan="2" style="font-size:12px;color:#555">Note: ${item.notes}</td></tr>` : ''}
      `).join('');

      const subtotal = (ord.orderItems || []).reduce((s, it) => s + (it.price || 0), 0);
      const taxes = ord.tax || 0;
      const service = ord.serviceCharge || 0;
      const discount = ord.discounts?.reduce((s, d) => s + (d.type === 'PERCENTAGE' ? subtotal * d.value / 100 : d.value), 0) || 0;
      const total = subtotal - discount + taxes + service;

      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt #${ord.orderNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; }
              .meta { margin: 10px 0; font-size: 14px; }
              table { width: 100%; border-collapse: collapse; }
              td { padding: 6px 0; border-bottom: 1px dashed #ccc; }
              .totals td { border-bottom: none; }
              .right { text-align: right; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>${hotelName}</h2>
              <div>Receipt</div>
            </div>
            <div class="meta">
              <div><strong>Order #:</strong> ${ord.orderNumber}</div>
              <div><strong>Customer:</strong> ${customerName}</div>
              <div><strong>${ord.type === 'dine-in' ? 'Table' : 'Type'}:</strong> ${tableText}</div>
              <div><strong>Date:</strong> ${new Date(ord.createdAt).toLocaleString()}</div>
            </div>
            <table>
              <tbody>
                ${itemsHtml || '<tr><td colspan="2">No items</td></tr>'}
                <tr class="totals"><td class="right"><strong>Subtotal</strong></td><td class="right">₹${subtotal.toFixed(2)}</td></tr>
                <tr class="totals"><td class="right"><strong>Discount</strong></td><td class="right">-₹${discount.toFixed(2)}</td></tr>
                <tr class="totals"><td class="right"><strong>Tax</strong></td><td class="right">₹${taxes.toFixed(2)}</td></tr>
                <tr class="totals"><td class="right"><strong>Service</strong></td><td class="right">₹${service.toFixed(2)}</td></tr>
                <tr class="totals"><td class="right"><strong>Total</strong></td><td class="right">₹${total.toFixed(2)}</td></tr>
              </tbody>
            </table>
            <div style="text-align:center;margin-top:16px;font-size:12px;">Thank you! Visit again.</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    } catch (e) {
      console.error('Error printing receipt:', e);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'PREPARING':
        return <ChefHat className="h-5 w-5 text-orange-500" />;
      case 'READY':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'SERVED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PREPARING':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'READY':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SERVED':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'NORMAL':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LOW':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getElapsedTime = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diff = Math.floor((now - created) / 1000 / 60); // minutes
    
    if (diff < 60) {
      return `${diff}m`;
    } else {
      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  const getEstimatedTimeRemaining = (order) => {
    if (!order.estimatedTime) return null;
    
    const elapsed = Math.floor((new Date() - new Date(order.createdAt)) / 1000 / 60);
    const remaining = order.estimatedTime - elapsed;
    
    if (remaining <= 0) {
      return 'Overdue';
    }
    
    return `${remaining}m`;
  };

  const groupedOrders = kitchenOrders.reduce((acc, order) => {
    const status = order.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(order);
    return acc;
  }, {});

  const statusOrder = ['PENDING', 'PREPARING', 'READY', 'SERVED'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kitchen Display System</h1>
              <p className="text-gray-600">Real-time order management for kitchen staff</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center px-3 py-2 rounded-lg ${
                  soundEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Bell className="h-4 w-4 mr-2" />
                Sound {soundEnabled ? 'On' : 'Off'}
              </button>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center px-3 py-2 rounded-lg ${
                  autoRefresh ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Auto Refresh {autoRefresh ? 'On' : 'Off'}
              </button>
              <button
                onClick={fetchKitchenOrders}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b p-6">
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PREPARING">Preparing</option>
            <option value="READY">Ready</option>
            <option value="SERVED">Served</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="NORMAL">Normal</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Kitchen Orders Display */}
      <div className="p-6">
        {statusOrder.map(status => {
          const orders = groupedOrders[status] || [];
          if (orders.length === 0) return null;

          return (
            <div key={status} className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  {getStatusIcon(status)}
                  <span className="ml-2">{status}</span>
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({orders.length} orders)
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {orders.map(order => (
                  <div
                    key={order.id}
                    className={`bg-white rounded-lg shadow-sm border-2 p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${getStatusColor(order.status)}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    {/* Order Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold">#{order.order.orderNumber}</h3>
                        <p className="text-sm text-gray-600">
                          {order.order.type === 'dine-in' ? 'Dine-in' : 
                           order.order.type === 'takeaway' ? 'Takeaway' : 'Delivery'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                          {order.priority}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {getElapsedTime(order.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-4">
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="font-medium">
                          {order.order.customer?.name || 'Walk-in Customer'}
                        </span>
                      </div>
                      {order.order.table && (
                        <div className="text-sm text-gray-600 mt-1">
                          Table {order.order.table.number}
                        </div>
                      )}
                    </div>

                    {/* Order Items */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Items:</h4>
                      <div className="space-y-1">
                        {order.order.orderItems?.slice(0, 3).map((item, index) => (
                          <div key={index} className="text-sm text-gray-700">
                            {item.quantity}x {item.item.name}
                            {item.notes && (
                              <div className="text-xs text-gray-500 italic">
                                Note: {item.notes}
                              </div>
                            )}
                          </div>
                        ))}
                        {order.order.orderItems?.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{order.order.orderItems.length - 3} more items
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Time Info */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Est. Time:</span>
                        <span className="font-medium">
                          {order.estimatedTime ? `${order.estimatedTime}m` : 'N/A'}
                        </span>
                      </div>
                      {order.estimatedTime && (
                        <div className="flex justify-between text-sm">
                          <span>Remaining:</span>
                          <span className={`font-medium ${
                            getEstimatedTimeRemaining(order) === 'Overdue' ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {getEstimatedTimeRemaining(order)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      {order.status === 'PENDING' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, 'PREPARING');
                          }}
                          className="flex-1 px-3 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
                        >
                          Start Preparing
                        </button>
                      )}
                      {order.status === 'PREPARING' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, 'READY');
                          }}
                          className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Mark Ready
                        </button>
                      )}
                      {order.status === 'READY' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, 'SERVED');
                          }}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Mark Served
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); printReceipt(order); }}
                        className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                        title="Print Receipt"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                        className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {kitchenOrders.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No kitchen orders</h3>
            <p className="mt-1 text-sm text-gray-500">
              New orders will appear here when customers place them.
            </p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Order #{selectedOrder.order.orderNumber}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Order Details */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Name</label>
                      <p className="text-gray-900">{selectedOrder.order.customer?.name || 'Walk-in Customer'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{selectedOrder.order.customer?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Order Type</label>
                      <p className="text-gray-900 capitalize">{selectedOrder.order.type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Table</label>
                      <p className="text-gray-900">{selectedOrder.order.table?.number || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.order.orderItems?.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.item.name}</h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          {item.notes && (
                            <p className="text-sm text-gray-500 italic mt-1">Note: {item.notes}</p>
                          )}
                          {item.modifiers && item.modifiers.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-700">Modifiers:</p>
                              <ul className="text-sm text-gray-600">
                                {item.modifiers.map((modifier, modIndex) => (
                                  <li key={modIndex}>• {modifier.modifier.name}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">₹{item.price.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Status */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Order Status</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Current Status</label>
                      <div className="flex items-center mt-1">
                        {getStatusIcon(selectedOrder.status)}
                        <span className="ml-2 font-medium">{selectedOrder.status}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Priority</label>
                      <p className="font-medium">{selectedOrder.priority}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Order Time</label>
                      <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Elapsed Time</label>
                      <p className="font-medium">{getElapsedTime(selectedOrder.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                {selectedOrder.status === 'PENDING' && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'PREPARING');
                      setSelectedOrder(null);
                    }}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    Start Preparing
                  </button>
                )}
                {selectedOrder.status === 'PREPARING' && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'READY');
                      setSelectedOrder(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Mark Ready
                  </button>
                )}
                {selectedOrder.status === 'READY' && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'SERVED');
                      setSelectedOrder(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Mark Served
                  </button>
                )}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenDisplaySystem;
