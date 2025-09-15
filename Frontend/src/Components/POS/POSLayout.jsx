import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, 
  Users, 
  ChefHat, 
  Package, 
  BarChart3, 
  Settings,
  Plus,
  Bell,
  Search,
  Menu,
  LogOut,
  User
} from 'lucide-react';

const POSLayout = ({ children, title = "POS Dashboard" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/pos/dashboard',
      icon: BarChart3,
      description: 'Overview and analytics'
    },
    {
      label: 'Orders',
      path: '/pos/orders',
      icon: ShoppingCart,
      description: 'Manage all orders'
    },
    {
      label: 'Tables',
      path: '/pos/tables',
      icon: Users,
      description: 'Table management'
    },
    {
      label: 'Kitchen',
      path: '/pos/kitchen',
      icon: ChefHat,
      description: 'Kitchen display system'
    },
    {
      label: 'Menu',
      path: '/pos/menu',
      icon: ChefHat,
      description: 'Menu management'
    },
    {
      label: 'Inventory',
      path: '/pos/inventory',
      icon: Package,
      description: 'Stock management'
    },
    {
      label: 'Settings',
      path: '/pos/settings',
      icon: Settings,
      description: 'System configuration'
    }
  ];

  const quickActions = [
    {
      title: 'New Order',
      icon: Plus,
      color: 'bg-blue-500',
      onClick: () => navigate('/pos/orders/new')
    },
    {
      title: 'Kitchen',
      icon: ChefHat,
      color: 'bg-orange-500',
      onClick: () => navigate('/pos/kitchen')
    },
    {
      title: 'Tables',
      icon: Users,
      color: 'bg-green-500',
      onClick: () => navigate('/pos/tables')
    },
    {
      title: 'Menu',
      icon: ChefHat,
      color: 'bg-indigo-500',
      onClick: () => navigate('/pos/menu')
    },
    {
      title: 'Inventory',
      icon: Package,
      color: 'bg-purple-500',
      onClick: () => navigate('/pos/inventory')
    }
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-80' : 'w-16'} bg-white shadow-lg border-r border-gray-200 transition-all duration-300`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Menu className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h2 className="text-xl font-bold text-gray-900">Restaurant POS</h2>
                <p className="text-sm text-gray-500">Management System</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {sidebarOpen && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`${action.color} text-white p-3 rounded-lg hover:opacity-90 transition-opacity`}
                    title={action.title}
                  >
                    <action.icon className="w-5 h-5 mb-1" />
                    <div className="text-xs font-medium">{action.title}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div>
            {sidebarOpen && (
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Navigation</h3>
            )}
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full text-left p-3 rounded-lg transition-colors group ${
                    isActiveRoute(item.path) 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={`w-5 h-5 ${
                      isActiveRoute(item.path) ? 'text-blue-700' : 'text-gray-500 group-hover:text-blue-600'
                    }`} />
                    {sidebarOpen && (
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* User Section */}
          {sidebarOpen && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Restaurant Staff</div>
                  <div className="text-xs text-gray-500">POS User</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-500">Restaurant Point of Sale System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders, items..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Notifications */}
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Staff User</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default POSLayout;
