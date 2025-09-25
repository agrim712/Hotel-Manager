import React, { useEffect, useState } from 'react';
import POSLayout from '../../Components/POS/POSLayout';
import { useOutlet } from '../../context/OutletContext';
import { BarChart3, Store, Users, DollarSign, ShoppingCart, Clock } from 'lucide-react';

const Currency = ({ value }) => (
  <span>₹{Number(value || 0).toLocaleString()}</span>
);

const MetricCard = ({ title, value, icon: Icon, color = 'text-blue-600', bg = 'bg-blue-50' }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${bg}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </div>
);

// Content that relies on OutletContext. This will be rendered inside POSLayout,
// which provides OutletProvider context.
const OutletsDashboardContent = () => {
  const { getOutletsDashboard } = useOutlet();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const res = await getOutletsDashboard();
      if (res?.success) {
        setData(res.data);
      } else {
        setError({ message: res?.message || 'Failed to load outlets dashboard', details: res?.details });
      }
      setLoading(false);
    };
    load();
  }, [getOutletsDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading outlets dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-12">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md space-y-2">
          <div className="font-medium">{typeof error === 'string' ? error : error.message}</div>
          {typeof error === 'object' && error?.details && (
            <pre className="text-xs text-red-700 whitespace-pre-wrap break-words max-h-48 overflow-auto bg-red-100 p-2 rounded">{error.details}</pre>
          )}
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const outlets = data?.outlets || [];
  const recentOrders = data?.recentOrders || [];
  const dailyTrends = data?.dailyTrends || [];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <MetricCard title="Total Outlets" value={summary.totalOutlets} icon={Store} color="text-indigo-600" bg="bg-indigo-50" />
        <MetricCard title="Active Outlets" value={summary.activeOutlets} icon={Users} color="text-green-600" bg="bg-green-50" />
        <MetricCard title="Today’s Orders" value={summary.todayOrders} icon={ShoppingCart} color="text-blue-600" bg="bg-blue-50" />
        <MetricCard title="Today’s Revenue" value={<Currency value={summary.todayRevenue} />} icon={DollarSign} color="text-emerald-600" bg="bg-emerald-50" />
        <MetricCard title="Monthly Revenue" value={<Currency value={summary.monthlyRevenue} />} icon={BarChart3} color="text-purple-600" bg="bg-purple-50" />
        <MetricCard title="Customers" value={summary.totalCustomers} icon={Users} color="text-cyan-600" bg="bg-cyan-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Outlets */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Outlet Performance (This Month)</h3>
          </div>
          <div className="p-6">
            {outlets.length === 0 ? (
              <div className="text-center text-gray-500">No outlets found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outlet</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Today Orders</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Revenue</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {outlets.map((o) => (
                      <tr key={o.id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className={`h-2 w-2 rounded-full ${o.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            <div>
                              <div className="font-medium text-gray-900">{o.name}</div>
                              <div className="text-xs text-gray-500">{o.outletType}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">{o.todayOrders || 0}</td>
                        <td className="px-4 py-3 text-right"><Currency value={o.monthlyRevenue} /></td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${o.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {o.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Daily Trends (7 days) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Last 7 Days</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {dailyTrends.map((d) => (
                <div key={d.date} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{d.date}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-900">Orders: {d.orders}</div>
                    <div className="text-xs text-gray-500">Revenue: <Currency value={d.revenue} /></div>
                  </div>
                </div>
              ))}
              {dailyTrends.length === 0 && (
                <div className="text-sm text-gray-500">No data</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        </div>
        <div className="p-6">
          {recentOrders.length === 0 ? (
            <div className="text-center text-gray-500">No recent orders</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outlet</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="px-4 py-3">{o.orderNumber}</td>
                      <td className="px-4 py-3">{o.outlet?.name || '-'}</td>
                      <td className="px-4 py-3">{o.customer?.name || '-'}</td>
                      <td className="px-4 py-3 text-right"><Currency value={o.bills?.reduce?.((s,b) => s + (b.finalAmount||0), 0) || o.total} /></td>
                      <td className="px-4 py-3">{o.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OutletsDashboard = () => {
  return (
    <POSLayout title="Outlets Dashboard">
      <OutletsDashboardContent />
    </POSLayout>
  );
};

export default OutletsDashboard;
