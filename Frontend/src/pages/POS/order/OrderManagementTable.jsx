import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Users, ChefHat, Eye, DollarSign, Printer, MoreVertical, ShoppingCart, Pencil } from 'lucide-react';
import { getStatusIcon, getStatusColor, getTypeColor } from './utils.jsx';

const OrderManagementTable = ({ onNavigate, onOpenRunningBilling, orders: propOrders, onOrdersUpdate }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState(propOrders || []);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (propOrders) {
      setOrders(propOrders);
    }
  }, [propOrders]);

  const getOrderTotal = (order) => {
    const billedAmount = order?.bills?.[0]?.finalAmount;
    if (billedAmount !== undefined && billedAmount !== null && !isNaN(Number(billedAmount))) {
      return Number(billedAmount);
    }
    if (typeof order?.total === 'number' && !isNaN(order.total) && order.total > 0) {
      return order.total;
    }
    const items = order?.orderItems || [];
    const computed = items.reduce((sum, item) => {
      const price = Number(item?.basePrice ?? item?.price ?? item?.item?.basePrice ?? 0);
      const qty = Number(item?.quantity ?? 1);
      return sum + price * qty;
    }, 0);
    return computed;
  };

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
  }, [currentPage, statusFilter, typeFilter, onOrdersUpdate]);

  const filteredOrders = orders.filter(order =>
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
                onClick={() => onNavigate('tables')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Users className="h-4 w-4 mr-2" />
                Tables
              </button>
              <button
                onClick={() => onNavigate('kitchen')}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <ChefHat className="h-4 w-4 mr-2" />
                Kitchen
              </button>
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
                      ₹{getOrderTotal(order).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-3">
                        {/* View Button */}
                        <button
                          onClick={() => onNavigate('orderDetails', order.id)}
                          className="flex items-center px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors font-medium text-sm"
                          title="View Order Details"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                        
                        {/* Edit Button */}
                        <button
                          onClick={() => onNavigate('orderDetails', order.id)}
                          className={`flex items-center px-3 py-2 rounded-lg transition-colors font-medium text-sm ${
                            order.payments?.some(p => p.status === 'SUCCESS')
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-700'
                          }`}
                          title={order.payments?.some(p => p.status === 'SUCCESS') ? 'Payment processed - editing disabled' : 'Edit Order'}
                          disabled={order.payments?.some(p => p.status === 'SUCCESS')}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        
                        {/* Payment/Billing Button - Only active if not fully paid */}
                            <button
                              onClick={() => {
                                if (!order.payments?.some(p => p.status === 'SUCCESS')) {
                                  onOpenRunningBilling(order.id);
                                }
                              }}
                              className={`flex items-center px-3 py-2 rounded-lg transition-colors font-medium text-sm ${
                                order.payments?.some(p => p.status === 'SUCCESS')
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-green-100 hover:bg-green-200 text-green-700'
                              }`}
                              title={
                                order.payments?.some(p => p.status === 'SUCCESS')
                                  ? 'Payment already completed'
                                  : 'Payment & Billing'
                              }
                              disabled={order.payments?.some(p => p.status === 'SUCCESS')}
                            >
                              <DollarSign className="h-4 w-4 mr-1" />
                              Payment
                            </button>

                        
                        {/* Print Receipt Button - Only active if payment is done */}
                        <button
                          onClick={() => {
                            if (order.payments?.some(p => p.status === 'SUCCESS')) {
                              navigate(`/pos/billing/${order.id}`);
                            }
                          }}
                          className={`flex items-center px-3 py-2 rounded-lg transition-colors font-medium text-sm ${
                            order.payments?.some(p => p.status === 'SUCCESS')
                              ? 'bg-purple-100 hover:bg-purple-200 text-purple-700 cursor-pointer'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                          title={order.payments?.some(p => p.status === 'SUCCESS') ? 'Print Receipt' : 'Payment required to print receipt'}
                          disabled={!order.payments?.some(p => p.status === 'SUCCESS')}
                        >
                          <Printer className="h-4 w-4 mr-1" />
                          Receipt
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

export default OrderManagementTable;