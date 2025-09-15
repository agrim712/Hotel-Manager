import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Clock, 
  Users, 
  ShoppingCart,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Download,
  Printer,
  ChevronLeft
} from 'lucide-react';

// Mock data and API functions to make the app runnable in a single file
// In a real application, these would be real API calls to your backend.
let mockOrders = [
  {
    id: '1', orderNumber: 'ORD202509150001', type: 'dine-in', status: 'CONFIRMED', total: 1500,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    customer: { name: 'Alice Smith' },
    table: { number: 'T4' },
    orderItems: [{ id: 'item1', name: 'Pizza', quantity: 1, price: 500, notes: 'No olives' }]
  },
  {
    id: '2', orderNumber: 'ORD202509150002', type: 'takeaway', status: 'PENDING', total: 750,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    customer: { name: 'Bob Johnson' },
    table: null,
    orderItems: [{ id: 'item2', name: 'Burger', quantity: 1, price: 300 }, { id: 'item3', name: 'Fries', quantity: 1, price: 150 }]
  },
  {
    id: '3', orderNumber: 'ORD202509150003', type: 'delivery', status: 'PREPARING', total: 1200,
    createdAt: new Date(Date.now() - 600000).toISOString(),
    customer: { name: 'Charlie Brown' },
    table: null,
    orderItems: [{ id: 'item4', name: 'Pasta', quantity: 1, price: 600 }]
  },
  {
    id: '4', orderNumber: 'ORD202509150004', type: 'dine-in', status: 'READY', total: 950,
    createdAt: new Date(Date.now() - 120000).toISOString(),
    customer: { name: 'Diana Prince' },
    table: { number: 'T1' },
    orderItems: [{ id: 'item5', name: 'Salad', quantity: 1, price: 400 }]
  },
  {
    id: '5', orderNumber: 'ORD202509150005', type: 'takeaway', status: 'COMPLETED', total: 2000,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    customer: { name: 'Bruce Wayne' },
    table: null,
    orderItems: [{ id: 'item6', name: 'Steak', quantity: 1, price: 1500 }]
  },
];

const mockMenu = [
  { id: '1', name: 'Margherita Pizza', price: 500, modifiers: [{ id: '1', name: 'Extra Cheese', price: 50 }, { id: '2', name: 'Pepperoni', price: 100 }] },
  { id: '2', name: 'Classic Burger', price: 300, modifiers: [{ id: '3', name: 'Extra Patty', price: 150 }] },
  { id: '3', name: 'Fries', price: 150, modifiers: [] },
  { id: '4', name: 'Caesar Salad', price: 400, modifiers: [{ id: '4', name: 'Chicken', price: 150 }] },
  { id: '5', name: 'Spaghetti Bolognese', price: 600, modifiers: [] },
];

const mockCustomers = [{ id: 'c1', name: 'Alice Smith' }, { id: 'c2', name: 'Bob Johnson' }];
const mockTables = [{ id: 't1', number: 'T1' }, { id: 't4', number: 'T4' }];

const api = {
  fetchOrders: async () => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    return mockOrders;
  },
  fetchOrderById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockOrders.find(order => order.id === id);
  },
  createOrder: async (newOrderData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newOrder = {
      id: (mockOrders.length + 1).toString(),
      orderNumber: `ORD${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      ...newOrderData,
      total: newOrderData.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
    };
    mockOrders = [newOrder, ...mockOrders];
    return newOrder;
  },
  updateOrderStatus: async (id, status) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    mockOrders = mockOrders.map(order => 
      order.id === id ? { ...order, status } : order
    );
  },
  addOrderItem: async (orderId, item) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    mockOrders = mockOrders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          orderItems: [...order.orderItems, { ...item, id: Math.random().toString(36).substring(7) }],
          total: order.total + item.price * item.quantity,
        };
      }
      return order;
    });
  },
  removeOrderItem: async (orderId, itemId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    mockOrders = mockOrders.map(order => {
      if (order.id === orderId) {
        const itemToRemove = order.orderItems.find(item => item.id === itemId);
        return {
          ...order,
          orderItems: order.orderItems.filter(item => item.id !== itemId),
          total: order.total - (itemToRemove?.price * itemToRemove?.quantity || 0),
        };
      }
      return order;
    });
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'PENDING':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'CONFIRMED':
      return <CheckCircle className="h-4 w-4 text-blue-500" />;
    case 'PREPARING':
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    case 'READY':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'COMPLETED':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'CANCELLED':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800';
    case 'PREPARING':
      return 'bg-orange-100 text-orange-800';
    case 'READY':
      return 'bg-green-100 text-green-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getTypeColor = (type) => {
  switch (type) {
    case 'dine-in':
      return 'bg-blue-100 text-blue-800';
    case 'takeaway':
      return 'bg-green-100 text-green-800';
    case 'delivery':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};


const NewOrderForm = ({ onOrderCreated, onCancel }) => {
  const [orderType, setOrderType] = useState('dine-in');
  const [customer, setCustomer] = useState(null);
  const [table, setTable] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleAddItem = (menuItem) => {
    const existingItem = selectedItems.find(item => item.id === menuItem.id);
    if (existingItem) {
      setSelectedItems(selectedItems.map(item =>
        item.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setSelectedItems([...selectedItems, { ...menuItem, quantity: 1, total: menuItem.price }]);
    }
  };

  const handleRemoveItem = (itemId) => {
    setSelectedItems(selectedItems.filter(item => item.id !== itemId));
  };
  
  const handleQuantityChange = (itemId, newQuantity) => {
    setSelectedItems(selectedItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newOrderData = {
      type: orderType,
      customerId: customer?.id,
      tableId: table?.id,
      orderItems: selectedItems.map(item => ({
        itemId: item.id,
        quantity: item.quantity,
        price: item.price,
      }))
    };
    
    // Replace mock API call with real fetch request
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/pos/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newOrderData),
      });

      if (response.ok) {
        console.log('Order created successfully!');
        onOrderCreated();
      } else {
        const errorData = await response.json();
        console.error('Failed to create order:', errorData.message);
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const totalAmount = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">New Order</h2>
          <button
            onClick={onCancel}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700">Order Type</label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="dine-in">Dine-in</option>
                <option value="takeaway">Takeaway</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700">Customer</label>
              <select
                value={customer?.id || ''}
                onChange={(e) => setCustomer(mockCustomers.find(c => c.id === e.target.value))}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Walk-in</option>
                {mockCustomers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              {orderType === 'dine-in' && (
                <>
                  <label className="block text-sm font-medium text-gray-700">Table</label>
                  <select
                    value={table?.id || ''}
                    onChange={(e) => setTable(mockTables.find(t => t.id === e.target.value))}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Table</option>
                    {mockTables.map(t => (
                      <option key={t.id} value={t.id}>{t.number}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Menu</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {mockMenu.map(item => (
                <div 
                  key={item.id}
                  onClick={() => handleAddItem(item)}
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <ShoppingCart className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-center">{item.name}</span>
                  <span className="text-xs text-gray-500">₹{item.price}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Selected Items List */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h3>
            {selectedItems.length === 0 ? (
              <p className="text-center text-gray-500">Add items to the order from the menu above.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedItems.map(item => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">₹{item.price}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                            min="1"
                            className="w-16 text-center border-gray-300 rounded-lg"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{item.price * item.quantity}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Remove Item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="flex justify-end items-center space-x-4">
            <span className="text-lg font-bold text-gray-900">Total: ₹{totalAmount}</span>
            <button
              type="submit"
              disabled={selectedItems.length === 0}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Order
              <Plus className="h-4 w-4 ml-2" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const OrderDetails = ({ orderId, onBack }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      const fetchedOrder = await api.fetchOrderById(orderId);
      setOrder(fetchedOrder);
      setLoading(false);
    };
    fetchOrder();
  }, [orderId]);

  const handleStatusChange = async (newStatus) => {
    await api.updateOrderStatus(order.id, newStatus);
    const updatedOrder = await api.fetchOrderById(order.id);
    setOrder(updatedOrder);
  };
  
  const handleRemoveItem = async (itemId) => {
    await api.removeOrderItem(order.id, itemId);
    const updatedOrder = await api.fetchOrderById(order.id);
    setOrder(updatedOrder);
  };

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
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.notes || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Remove Item"
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


const OrderManagementApp = () => {
  const [view, setView] = useState('list'); // 'list', 'newOrder', 'orderDetails'
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const handleNavigate = (newView, id = null) => {
    setSelectedOrderId(id);
    setView(newView);
  };
  
  const handleOrderCreated = () => {
    setView('list');
  };

  switch (view) {
    case 'newOrder':
      return <NewOrderForm onOrderCreated={handleOrderCreated} onCancel={() => setView('list')} />;
    case 'orderDetails':
      return <OrderDetails orderId={selectedOrderId} onBack={() => setView('list')} />;
    case 'list':
    default:
      return <OrderManagementTable onNavigate={handleNavigate} />;
  }
};

const OrderManagementTable = ({ onNavigate }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter })
      });

      const response = await fetch(`http://localhost:5000/api/pos/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, typeFilter]);

  const filteredOrders = orders.filter(order =>
    (statusFilter === 'all' || order.status === statusFilter.toUpperCase()) &&
    (typeFilter === 'all' || order.type === typeFilter.toLowerCase()) &&
    (order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.customer?.name && order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.table?.number && order.table.number.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action} on orders:`, selectedOrders);
    // Implement bulk actions
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b rounded-b-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
              <p className="text-gray-600">Manage all restaurant orders</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate('newOrder')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b p-6 rounded-b-lg mt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
          
          {selectedOrders.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedOrders.length} selected
              </span>
              <button
                onClick={() => handleBulkAction('complete')}
                className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
              >
                Complete
              </button>
              <button
                onClick={() => handleBulkAction('cancel')}
                className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {showFilters && (
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY">Ready</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="dine-in">Dine-in</option>
              <option value="takeaway">Takeaway</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Table
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customer?.name || 'Walk-in'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(order.type)}`}>
                        {order.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.table?.number || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.orderItems?.length || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{order.bills?.[0]?.finalAmount?.toLocaleString() || order.total || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onNavigate('orderDetails', order.id)}
                          className="text-blue-600 hover:text-blue-700"
                          title="View Order"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => console.log('Editing order:', order.id)}
                          className="text-gray-600 hover:text-gray-700"
                          title="Edit Order"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => console.log('Printing receipt for order:', order.id)}
                          className="text-gray-600 hover:text-gray-700"
                          title="Print Receipt"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => console.log('More actions for order:', order.id)}
                          className="text-gray-600 hover:text-gray-700"
                          title="More Actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating a new order.'}
              </p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagementApp;
