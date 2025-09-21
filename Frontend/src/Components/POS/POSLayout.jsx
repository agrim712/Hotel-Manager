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
  User,
  ChevronLeft,
  ChevronRight,
  DollarSign
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
      label: 'Waiters',
      path: '/pos/waiters',
      icon: Users,
      description: 'Waiter management'
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
      label: 'Billing',
      path: '/pos/billing',
      icon: DollarSign,
      description: 'Receipt templates & billing'
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
      title: 'Tables',
      icon: Users,
      color: 'bg-green-500',
      onClick: () => navigate('/pos/tables')
    },
    {
      title: 'Waiters',
      icon: Users,
      color: 'bg-teal-500',
      onClick: () => navigate('/pos/waiters')
    },
    {
      title: 'Kitchen',
      icon: ChefHat,
      color: 'bg-orange-500',
      onClick: () => navigate('/pos/kitchen')
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

  // Updated to handle sub-routes correctly
  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out...");
    navigate('/login'); // Redirect to login page
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Restaurant POS</h2>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors self-end"
            title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Quick Actions (now a separate section in the sidebar) */}
        {sidebarOpen && (
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`${action.color} text-white p-3 rounded-lg hover:opacity-90 transition-opacity flex flex-col items-center justify-center text-center`}
                >
                  <action.icon className="w-5 h-5 mb-1" />
                  <div className="text-xs font-medium">{action.title}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation - Added overflow-y-auto */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full text-left p-3 rounded-lg transition-colors group ${
                isActiveRoute(item.path) 
                  ? 'bg-blue-100 text-blue-800' // Darker highlight
                  : 'hover:bg-gray-100 text-gray-600'
              } flex items-center space-x-3`}
            >
              <item.icon className={`w-5 h-5 ${
                isActiveRoute(item.path) ? 'text-blue-800' : 'text-gray-500 group-hover:text-blue-600'
              }`} />
              {sidebarOpen && (
                <div className="flex flex-col">
                  <div className="font-medium text-sm">{item.label}</div>
                  {item.description && <div className="text-xs text-gray-500 truncate">{item.description}</div>}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* User and Logout Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">Staff User</div>
                  <div className="text-xs text-gray-500">POS User</div>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500 hidden md:block">Restaurant Point of Sale System</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Notifications */}
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
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