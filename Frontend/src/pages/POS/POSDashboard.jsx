import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import POSLayout from '../../Components/POS/POSLayout';
import { 
  ShoppingCart, 
  Users, 
  Clock, 
  DollarSign, 
  Package, 
  ChefHat, 
  BarChart3,
  Settings,
  Bell,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const POSDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    today: {
      orders: 0,
      revenue: 0,
      activeTables: 0,
      pendingKitchenOrders: 0,
      queueLength: 0,
      lowStockItems: 0,
      activeWaiters: 0,
      totalWaiters: 0
    },
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/pos/reports/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'tables', label: 'Tables', icon: Users },
    { id: 'waiters', label: 'Waiters', icon: Users },
    { id: 'kitchen', label: 'Kitchen', icon: ChefHat },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const quickActions = [
    {
      title: 'New Order',
      description: 'Create a new order',
      icon: Plus,
      color: 'bg-blue-500',
      onClick: () => navigate('/pos/orders/new')
    },
    {
      title: 'Manage Tables',
      description: 'View and manage table status',
      icon: Users,
      color: 'bg-green-500',
      onClick: () => navigate('/pos/tables')
    },
    {
      title: 'Waiter Management',
      description: 'Manage waiters and assignments',
      icon: Users,
      color: 'bg-teal-500',
      onClick: () => navigate('/pos/waiters')
    },
    {
      title: 'Kitchen Orders',
      description: 'View kitchen display system',
      icon: ChefHat,
      color: 'bg-orange-500',
      onClick: () => navigate('/pos/kitchen')
    },
    {
      title: 'Menu Management',
      description: 'Create and manage menu items',
      icon: ChefHat,
      color: 'bg-indigo-500',
      onClick: () => navigate('/pos/menu')
    },
    {
      title: 'Inventory',
      description: 'Check stock levels',
      icon: Package,
      color: 'bg-purple-500',
      onClick: () => navigate('/pos/inventory')
    }
  ];

  const statsCards = [
    {
      title: 'Today\'s Orders',
      value: dashboardData.today.orders,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Today\'s Revenue',
      value: `₹${dashboardData.today.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Active Tables',
      value: dashboardData.today.activeTables,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Kitchen Orders',
      value: dashboardData.today.pendingKitchenOrders,
      icon: ChefHat,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Queue Length',
      value: dashboardData.today.queueLength,
      icon: Clock,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Low Stock Items',
      value: dashboardData.today.lowStockItems,
      icon: Package,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Active Waiters',
      value: dashboardData.today.activeWaiters,
      icon: Users,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
    {
      title: 'Total Waiters',
      value: dashboardData.today.totalWaiters,
      icon: Users,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    }
  ];

  if (loading) {
    return (
      <POSLayout title="POS Dashboard">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </POSLayout>
    );
  }

  return (
    <POSLayout title="POS Dashboard">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <button
                  onClick={() => navigate('/pos/orders')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.recentOrders.length > 0 ? (
                  dashboardData.recentOrders.map((order, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Order #{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">{order.type} • {order.customerName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{order.total}</p>
                        <p className="text-sm text-gray-500">{order.status}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No recent orders</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className="w-full flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{action.title}</p>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Performance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Order Value</span>
                <span className="font-semibold">₹450</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Orders per Hour</span>
                <span className="font-semibold">12.5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Kitchen Efficiency</span>
                <span className="font-semibold text-green-600">94%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">POS System</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Kitchen Display</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Payment Gateway</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Connected
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </POSLayout>
  );
};

export default POSDashboard;