import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { 
  FaCalendarAlt, 
  FaLock, 
  FaLockOpen, 
  FaChartLine, 
  FaMoneyBillWave, 
  FaPercentage,
  FaInfoCircle,
  FaSync,
  FaDownload,
  FaUpload,
  FaExclamationTriangle,
  FaUsers,
  FaCalendarDay,
  FaStar,
  FaTree,
  FaUmbrellaBeach,
  FaHeart,
  FaSnowflake,
  FaSun,
  FaCog,
  FaEye,
  FaChartBar,
  FaBuilding,
  FaBed,
  FaArrowUp,
  FaArrowDown,
  FaBullseye,
  FaRobot,
  FaHistory,
  FaLightbulb,
  FaPlay,
  FaPause,
  FaStop
} from "react-icons/fa";
import { FaArrowTrendUp } from "react-icons/fa6";

import { Tooltip } from 'react-tooltip';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart
} from 'recharts';

// Chart colors for consistent styling
const CHART_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

// Analytics Dashboard Component
const AnalyticsDashboard = ({
  analytics,
  occupancyAnalysis,
  forecast,
  analyticsLoading,
  selectedTab,
  onTabChange,
  forecastDays,
  optimizationLevel,
  onForecastDaysChange,
  onOptimizationLevelChange,
  onRefresh
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'occupancy', label: 'Occupancy Analysis', icon: FaBed },
    { id: 'performance', label: 'Performance', icon: FaArrowTrendUp },
    { id: 'forecast', label: 'Forecast', icon: FaLightbulb }
  ];

  if (analyticsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <FaSync className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <div className="text-gray-600">Loading analytics data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaArrowTrendUp className="text-blue-500" />
            Revenue Analytics Dashboard
          </h2>
          <div className="flex gap-2">
            <button
              onClick={onRefresh}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <FaSync /> Refresh Data
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'bg-white text-blue-600 shadow'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <OverviewTab analytics={analytics} />
      )}
      
      {selectedTab === 'occupancy' && (
        <OccupancyTab occupancyAnalysis={occupancyAnalysis} />
      )}
      
      {selectedTab === 'performance' && (
        <PerformanceTab analytics={analytics} />
      )}
      
      {selectedTab === 'forecast' && (
        <ForecastTab 
          forecast={forecast}
          forecastDays={forecastDays}
          optimizationLevel={optimizationLevel}
          onForecastDaysChange={onForecastDaysChange}
          onOptimizationLevelChange={onOptimizationLevelChange}
        />
      )}
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ analytics }) => {
  if (!analytics) {
    return <div className="text-center py-8 text-gray-500">No analytics data available</div>;
  }

  const { coreMetrics, capacity, trends, insights } = analytics;

  return (
    <div className="grid gap-6">
      {/* Core Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="RevPAR"
          value={`$${coreMetrics?.RevPAR || 0}`}
          subtitle="Revenue per Available Room"
          trend={insights?.revenueGrowthPotential}
          icon={FaMoneyBillWave}
          color="blue"
        />
        <MetricCard
          title="ADR"
          value={`$${coreMetrics?.ADR || 0}`}
          subtitle="Average Daily Rate"
          icon={FaChartLine}
          color="green"
        />
        <MetricCard
          title="Occupancy Rate"
          value={`${coreMetrics?.occupancyRate || 0}%`}
          subtitle="Current Occupancy"
          icon={FaBed}
          color="purple"
        />
        <MetricCard
          title="Total Revenue"
          value={`$${coreMetrics?.totalRevenue?.toLocaleString() || 0}`}
          subtitle="Period Revenue"
          icon={FaArrowTrendUp}
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Occupancy Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaChartLine className="text-blue-500" />
            Daily Occupancy Trends
          </h3>
          {trends?.occupancyTrends && trends.occupancyTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trends.occupancyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis />
                <RechartsTooltip />
                <Area
                  type="monotone"
                  dataKey="occupancyPercentage"
                  stroke={CHART_COLORS[0]}
                  fill={CHART_COLORS[0]}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-500">
              No occupancy trend data available
            </div>
          )}
        </div>

        {/* Room Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaBuilding className="text-green-500" />
            Room Type Performance
          </h3>
          {trends?.roomPerformance && trends.roomPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trends.roomPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="roomType" fontSize={12} />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="totalRevenue" fill={CHART_COLORS[1]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-500">
              No room performance data available
            </div>
          )}
        </div>
      </div>

      {/* Insights Panel */}
      {insights && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaLightbulb className="text-yellow-500" />
            Key Insights
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {insights.bestPerformingRoomType && (
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Best Performing Room</div>
                <div className="font-semibold text-gray-800">{insights.bestPerformingRoomType}</div>
              </div>
            )}
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Average Daily Occupancy</div>
              <div className="font-semibold text-gray-800">{insights.averageDailyOccupancy}%</div>
            </div>
            {insights.revenueGrowthPotential && (
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Revenue Growth Potential</div>
                <div className={`font-semibold ${
                  insights.revenueGrowthPotential > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {insights.revenueGrowthPotential > 0 ? '+' : ''}{insights.revenueGrowthPotential.toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Occupancy Analysis Tab
const OccupancyTab = ({ occupancyAnalysis }) => {
  if (!occupancyAnalysis) {
    return <div className="text-center py-8 text-gray-500">No occupancy data available</div>;
  }

  const { dailyOccupancy, summary, hotelCapacity } = occupancyAnalysis;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <FaBed />
            <span className="font-semibold">Average Occupancy</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {summary?.averageOccupancy || 0}%
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <FaArrowUp />
            <span className="font-semibold">Peak Occupancy</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {summary?.maxOccupancy || 0}%
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <FaArrowDown />
            <span className="font-semibold">Low Occupancy</span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {summary?.minOccupancy || 0}%
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <FaBullseye />
            <span className="font-semibold">Prediction Accuracy</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {summary?.predictionAccuracy?.averageVariance ? 
              `±${summary.predictionAccuracy.averageVariance}%` : 'N/A'
            }
          </div>
        </div>
      </div>

      {/* Occupancy Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaChartBar className="text-blue-500" />
          Daily Occupancy vs Predictions
        </h3>
        {dailyOccupancy && dailyOccupancy.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={dailyOccupancy}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="actualOccupancyPercentage"
                fill={CHART_COLORS[0]}
                stroke={CHART_COLORS[0]}
                fillOpacity={0.3}
                name="Actual Occupancy %"
              />
              <Line
                type="monotone"
                dataKey="predictedOccupancyPercentage"
                stroke={CHART_COLORS[1]}
                strokeDasharray="5 5"
                name="Predicted Occupancy %"
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-96 flex items-center justify-center text-gray-500">
            No occupancy data available
          </div>
        )}
      </div>
    </div>
  );
};

// Performance Tab
const PerformanceTab = ({ analytics }) => {
  if (!analytics?.trends?.pricingAnalytics) {
    return <div className="text-center py-8 text-gray-500">No performance data available</div>;
  }

  const { daily_trends, room_performance } = analytics.trends.pricingAnalytics;

  return (
    <div className="space-y-6">
      {/* Performance Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaArrowTrendUp className="text-green-500" />
            Daily Performance Trends
          </h3>
          {daily_trends && daily_trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={daily_trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="average_multiplier"
                  stroke={CHART_COLORS[2]}
                  name="Avg Multiplier"
                />
                <Line
                  type="monotone"
                  dataKey="average_occupancy_factor"
                  stroke={CHART_COLORS[3]}
                  name="Occupancy Factor"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-500">
              No daily trends available
            </div>
          )}
        </div>

        {/* Room Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaBuilding className="text-blue-500" />
            Room Type Revenue Gains
          </h3>
          {room_performance && room_performance.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={room_performance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="room_type" fontSize={12} />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="average_revenue_gain" fill={CHART_COLORS[4]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-500">
              No room performance data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Forecast Tab
const ForecastTab = ({ 
  forecast, 
  forecastDays, 
  optimizationLevel, 
  onForecastDaysChange, 
  onOptimizationLevelChange 
}) => {
  if (!forecast) {
    return <div className="text-center py-8 text-gray-500">No forecast data available</div>;
  }

  const { overallSummary, forecast: forecastData } = forecast;

  return (
    <div className="space-y-6">
      {/* Forecast Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaCog className="text-gray-500" />
          Forecast Settings
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forecast Days
            </label>
            <input
              type="number"
              min="7"
              max="90"
              value={forecastDays}
              onChange={(e) => onForecastDaysChange(parseInt(e.target.value))}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Optimization Level
            </label>
            <select
              value={optimizationLevel}
              onChange={(e) => onOptimizationLevelChange(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Forecast Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <FaMoneyBillWave />
            <span className="font-semibold">Base Forecast</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            ${overallSummary?.totalBaseForecast?.toLocaleString() || 0}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <FaChartLine />
            <span className="font-semibold">Optimized Forecast</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            ${overallSummary?.totalOptimizedForecast?.toLocaleString() || 0}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <FaArrowUp />
            <span className="font-semibold">Revenue Gain</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            +${overallSummary?.totalRevenueGain?.toLocaleString() || 0}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <FaPercentage />
            <span className="font-semibold">Gain Percentage</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            +{overallSummary?.revenueGainPercentage?.toFixed(1) || 0}%
          </div>
        </div>
      </div>

      {/* Forecast Chart */}
      {forecastData && forecastData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaChartLine className="text-purple-500" />
            Revenue Forecast by Room Type
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="roomType" fontSize={12} />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="summary.totalBaseForecast" fill={CHART_COLORS[0]} name="Base Forecast" />
              <Bar dataKey="summary.totalOptimizedForecast" fill={CHART_COLORS[1]} name="Optimized Forecast" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, subtitle, trend, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    orange: 'text-orange-600 bg-orange-50 border-orange-200'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
        {trend !== null && trend !== undefined && (
          <div className={`text-sm font-medium ${
            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-800 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{subtitle}</div>
    </div>
  );
};

const RevenueManagement = () => {
  const { token, hotel } = useAuth();
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [columnLocks, setColumnLocks] = useState(() => {
    const initialLocks = {};
    for (let i = 0; i < 30; i++) initialLocks[i] = true;
    return initialLocks;
  });
  const [saveStatus, setSaveStatus] = useState({ type: '', message: '' });
  const [viewMode, setViewMode] = useState('dynamic'); // 'base', 'dynamic', 'comparison', 'factors', 'analytics'
  const [summary, setSummary] = useState(null);
  const [expandedFactors, setExpandedFactors] = useState({});
  
  // Analytics state
  const [analytics, setAnalytics] = useState(null);
  const [occupancyAnalysis, setOccupancyAnalysis] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [selectedAnalyticsTab, setSelectedAnalyticsTab] = useState('overview');
  const [forecastDays, setForecastDays] = useState(30);
  const [optimizationLevel, setOptimizationLevel] = useState('moderate');
  const [multiplierUpdates, setMultiplierUpdates] = useState({});
  const [isUpdatingMultipliers, setIsUpdatingMultipliers] = useState(false);

  // Next 30 days from startDate
  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  useEffect(() => {
    if (!token || !hotel) return;
    fetchRates();
    if (viewMode === 'analytics') {
      fetchAnalytics();
    }
  }, [token, hotel, startDate, viewMode]);

  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const year = startDate.getFullYear();
      const { data } = await axios.get(
        "http://localhost:5000/api/hotel/rates",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { year },
        }
      );
      
      const ratesData = data.data || data;
      setRates(ratesData);
      calculateSummary(ratesData);
      
      // Check if any rates have limited data and show notification
      const hasLimitedData = ratesData.some(rate => rate.isLimitedData);
      if (hasLimitedData) {
        setSaveStatus({ 
          type: 'info', 
          message: 'Showing limited data (30 days) for better performance. Full year data available on demand.' 
        });
      }
      
      // Initialize original prices for change tracking
      const ratesWithOriginal = ratesData.map(rate => ({
        ...rate,
        dynamicPrices: rate.dynamicPrices?.map(dayRate => ({
          ...dayRate,
          original_dynamic_rate: dayRate.dynamic_rate
        })) || []
      }));
      
      setRates(ratesWithOriginal);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to fetch rates");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!hotel?.id) return;
    
    setAnalyticsLoading(true);
    try {
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 29); // 30-day range
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Fetch comprehensive analytics
      const [analyticsRes, occupancyRes, forecastRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/revenue/analytics/${hotel.id}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { startDate: startDateStr, endDate: endDateStr }
        }),
        axios.get(`http://localhost:5000/api/revenue/occupancy/${hotel.id}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { startDate: startDateStr, endDate: endDateStr }
        }),
        axios.get(`http://localhost:5000/api/revenue/forecast/${hotel.id}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { forecastDays, optimizationLevel }
        })
      ]);

      setAnalytics(analyticsRes.data);
      setOccupancyAnalysis(occupancyRes.data);
      setForecast(forecastRes.data);

    } catch (err) {
      console.error('Analytics fetch error:', err);
      setSaveStatus({ 
        type: 'error', 
        message: 'Failed to fetch analytics data: ' + (err.response?.data?.error || err.message)
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const updateMultiplierDependencies = async (roomId, multipliers) => {
    if (!hotel?.id) return;
    
    setIsUpdatingMultipliers(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/revenue/multipliers/${hotel.id}/update-dependencies`,
        {
          multipliers,
          roomId,
          startDate: startDate.toISOString().split('T')[0],
          endDate: new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days
          propagateToAll: !roomId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSaveStatus({ 
        type: 'success', 
        message: `Dependencies updated for ${response.data.summary.rooms_updated} rooms` 
      });
      
      // Refresh data
      await fetchRates();
      if (viewMode === 'analytics') {
        await fetchAnalytics();
      }

    } catch (err) {
      console.error('Multiplier update error:', err);
      setSaveStatus({ 
        type: 'error', 
        message: 'Failed to update multiplier dependencies: ' + (err.response?.data?.error || err.message)
      });
    } finally {
      setIsUpdatingMultipliers(false);
    }
  };

  const calculateSummary = (ratesData) => {
    if (!ratesData || ratesData.length === 0) return;

    let totalBaseRevenue = 0;
    let totalDynamicRevenue = 0;
    let totalMultiplier = 0;
    let dayCount = 0;

    ratesData.forEach(roomRate => {
      if (roomRate.dynamicPrices) {
        roomRate.dynamicPrices.slice(0, 7).forEach(dayRate => {
          totalBaseRevenue += dayRate.base_rate || 0;
          totalDynamicRevenue += dayRate.dynamic_rate || 0;
          totalMultiplier += dayRate.multiplier || 1;
          dayCount++;
        });
      }
    });

    setSummary({
      totalBaseRevenue: Math.round(totalBaseRevenue),
      totalDynamicRevenue: Math.round(totalDynamicRevenue),
      averageMultiplier: dayCount > 0 ? totalMultiplier / dayCount : 1,
      revenueIncrease: totalBaseRevenue > 0 ? 
        ((totalDynamicRevenue - totalBaseRevenue) / totalBaseRevenue) * 100 : 0,
      dayCount
    });
  };

  const toggleColumn = (idx) => {
    setColumnLocks(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleFactors = (rateId) => {
    setExpandedFactors(prev => ({
      ...prev,
      [rateId]: !prev[rateId]
    }));
  };

  const handlePriceChange = (rateId, dayIndex, newPrice) => {
    setRates(prevRates => 
      prevRates.map(rate => {
        if (rate.id === rateId) {
          const updatedPrices = [...rate.dynamicPrices];
          const baseRate = updatedPrices[dayIndex].base_rate;
          const dynamicRate = parseFloat(newPrice) || baseRate;
          
          updatedPrices[dayIndex] = {
            ...updatedPrices[dayIndex],
            dynamic_rate: dynamicRate,
            multiplier: dynamicRate / baseRate,
            isModified: dynamicRate !== updatedPrices[dayIndex].original_dynamic_rate
          };
          return { ...rate, dynamicPrices: updatedPrices };
        }
        return rate;
      })
    );
  };

  const resetPrice = (rateId, dayIndex) => {
    setRates(prevRates => 
      prevRates.map(rate => {
        if (rate.id === rateId) {
          const updatedPrices = [...rate.dynamicPrices];
          updatedPrices[dayIndex] = {
            ...updatedPrices[dayIndex],
            dynamic_rate: updatedPrices[dayIndex].original_dynamic_rate,
            multiplier: updatedPrices[dayIndex].original_dynamic_rate / updatedPrices[dayIndex].base_rate,
            isModified: false
          };
          return { ...rate, dynamicPrices: updatedPrices };
        }
        return rate;
      })
    );
  };

  const savePriceChanges = async () => {
    try {
      setSaveStatus({ type: 'saving', message: 'Saving changes...' });
      
      // Extract changes
      const changes = [];
      rates.forEach(rate => {
        rate.dynamicPrices.slice(0, 7).forEach((dayRate, index) => {
          if (dayRate.isModified) {
            changes.push({
              roomId: rate.roomId,
              date: dayRate.date,
              newPrice: dayRate.dynamic_rate,
              roomType: rate.roomType,
              rateType: rate.rateType
            });
          }
        });
      });

      if (changes.length === 0) {
        setSaveStatus({ type: 'info', message: 'No changes to save' });
        return;
      }

      // Send to backend
      await axios.post(
        "http://localhost:5000/api/hotel/rates/update-prices",
        { changes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSaveStatus({ type: 'success', message: `${changes.length} price changes saved successfully!` });
      
      // Refresh data
      setTimeout(() => fetchRates(), 2000);
    } catch (err) {
      setSaveStatus({ type: 'error', message: 'Failed to save changes' });
    }
  };

  const downloadTemplate = async () => {
    try {
      const year = startDate.getFullYear();
      const response = await axios.get(
        "http://localhost:5000/api/hotel/rates/template",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { year },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rates_template_${year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const getOccasionIcon = (occasion) => {
    const iconMap = {
      'Weekend': FaCalendarDay,
      'Summer Peak': FaSun,
      'Winter Holiday': FaSnowflake,
      'Spring Break': FaUmbrellaBeach,
      'Wedding Season': FaHeart,
      'Christmas': FaTree,
      'Valentine\'s Day': FaHeart,
      'New Year': FaStar,
      'Default': FaCalendarDay
    };
    
    return iconMap[occasion] || iconMap['Default'];
  };

  const getFactorDetails = (dayRate) => {
    return {
      occupancy: {
        value: dayRate.occupancy_factor,
        impact: dayRate.occupancy_factor >= 1.3 ? 'high' : dayRate.occupancy_factor >= 1.1 ? 'medium' : 'low',
        description: `Occupancy: ${(dayRate.occupancy_factor * 100).toFixed(0)}% expected`
      },
      demand: {
        value: dayRate.demand_factor,
        impact: dayRate.demand_factor >= 1.5 ? 'high' : dayRate.demand_factor >= 1.2 ? 'medium' : 'low',
        description: `Demand: ${(dayRate.demand_factor * 100).toFixed(0)}% of normal`
      },
      occasions: {
        value: dayRate.occasions?.length || 0,
        impact: dayRate.occasions?.length > 2 ? 'high' : dayRate.occasions?.length > 0 ? 'medium' : 'low',
        description: `${dayRate.occasions?.length || 0} special occasions`
      },
      baseMultiplier: {
        value: dayRate.base_rate / 100, // Normalized
        impact: 'base',
        description: `Base rate: $${dayRate.base_rate}`
      }
    };
  };

  const getPriceClassName = (basePrice, dynamicPrice, isModified = false) => {
    if (isModified) return 'bg-yellow-50 border-yellow-300 font-semibold';
    if (dynamicPrice > basePrice * 1.2) return 'bg-green-50 border-green-300 text-green-700';
    if (dynamicPrice < basePrice * 0.8) return 'bg-red-50 border-red-300 text-red-700';
    return 'bg-gray-50 border-gray-200 text-gray-700';
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <FaSync className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
        <div className="text-gray-600">Loading dynamic pricing data...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center text-red-600">
        <FaExclamationTriangle className="text-4xl mx-auto mb-4" />
        <div className="text-xl font-semibold mb-2">Error Loading Rates</div>
        <div>{error}</div>
        <button 
          onClick={fetchRates}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    </div>
  );

  if (!rates || rates.length === 0) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center text-gray-600">
        <FaMoneyBillWave className="text-4xl mx-auto mb-4" />
        <div className="text-xl font-semibold mb-2">No Rates Found</div>
        <div className="space-x-4 mt-6">
          <button 
            onClick={downloadTemplate}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
          >
            <FaDownload /> Download Template
          </button>
          <button 
            onClick={fetchRates}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <FaSync /> Refresh
          </button>
        </div>
      </div>
    </div>
  );

  const modifiedCount = rates.reduce((count, rate) => 
    count + (rate.dynamicPrices?.filter(p => p.isModified)?.length || 0), 0
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Revenue Management Dashboard</h1>
          <p className="text-gray-600">Dynamic pricing optimization for maximum revenue</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow border">
            <FaCalendarAlt className="text-gray-500" />
            <input
              type="date"
              value={startDate.toISOString().split("T")[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="border-0 px-2 py-1 focus:outline-none focus:ring-0"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={downloadTemplate}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <FaDownload /> Template
            </button>
            <button
              onClick={fetchRates}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <FaSync /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <FaMoneyBillWave />
              <span className="font-semibold">Base Revenue</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              ${summary.totalBaseRevenue.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">{summary.dayCount} room-days</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <FaChartLine />
              <span className="font-semibold">Dynamic Revenue</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              ${summary.totalDynamicRevenue.toLocaleString()}
            </div>
            <div className="text-xs text-green-500">+${(summary.totalDynamicRevenue - summary.totalBaseRevenue).toLocaleString()}</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <FaPercentage />
              <span className="font-semibold">Average Multiplier</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {summary.averageMultiplier.toFixed(2)}x
            </div>
            <div className="text-xs text-blue-500">
              {summary.averageMultiplier > 1 ? '+' : ''}{(summary.averageMultiplier - 1).toFixed(2)}x avg
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <FaChartLine />
              <span className="font-semibold">Revenue Increase</span>
            </div>
            <div className={`text-2xl font-bold ${
              summary.revenueIncrease >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {summary.revenueIncrease >= 0 ? '+' : ''}{summary.revenueIncrease.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">vs base pricing</div>
          </div>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="flex gap-4 bg-white p-4 rounded-lg shadow flex-wrap">
        {[
          { mode: 'dynamic', label: 'Dynamic Pricing', icon: FaRobot },
          { mode: 'base', label: 'Base Rates', icon: FaMoneyBillWave },
          { mode: 'comparison', label: 'Comparison', icon: FaChartBar },
          { mode: 'factors', label: 'Pricing Factors', icon: FaCog },
          { mode: 'analytics', label: 'Analytics Dashboard', icon: FaArrowTrendUp }
        ].map(({ mode, label, icon: Icon }) => (
          <label key={mode} className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              value={mode}
              checked={viewMode === mode}
              onChange={(e) => setViewMode(e.target.value)}
              className="text-blue-500"
            />
            <Icon className="text-gray-600" />
            <span className="font-medium">{label}</span>
          </label>
        ))}
      </div>

      {/* Save Status and Modified Count */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
        <div className="text-sm text-gray-600">
          {Object.values(columnLocks).filter(lock => !lock).length} columns unlocked • 
          <span className={`ml-2 ${modifiedCount > 0 ? 'text-yellow-600 font-semibold' : 'text-gray-500'}`}>
            {modifiedCount} modified prices
          </span>
          {isUpdatingMultipliers && (
            <span className="ml-2 text-blue-600 font-semibold">
              • Updating dependencies...
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          {modifiedCount > 0 && (
            <>
              <button
                onClick={() => rates.forEach(rate => {
                  rate.dynamicPrices?.forEach((_, idx) => resetPrice(rate.id, idx));
                })}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2"
              >
                Reset All
              </button>
              <button
                onClick={() => {
                  // Extract multipliers from current prices
                  const extractedMultipliers = dates.map((_, dayIndex) => {
                    const avgMultiplier = rates.reduce((sum, rate) => {
                      const dayRate = rate.dynamicPrices?.[dayIndex];
                      return sum + (dayRate?.multiplier || 1.0);
                    }, 0) / rates.length;
                    return avgMultiplier;
                  });
                  
                  // Update dependencies with current multipliers
                  updateMultiplierDependencies(null, extractedMultipliers);
                }}
                disabled={isUpdatingMultipliers}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  isUpdatingMultipliers 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                <FaRobot /> Update Dependencies
              </button>
            </>
          )}
          <button
            onClick={savePriceChanges}
            disabled={modifiedCount === 0}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
              modifiedCount > 0 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <FaUpload /> Save Changes ({modifiedCount})
          </button>
        </div>
      </div>

      {saveStatus.message && (
        <div className={`p-4 rounded-lg ${
          saveStatus.type === 'success' ? 'bg-green-100 text-green-800' :
          saveStatus.type === 'error' ? 'bg-red-100 text-red-800' :
          saveStatus.type === 'saving' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {saveStatus.message}
        </div>
      )}

      {/* Conditional Rendering: Rates Table or Analytics Dashboard */}
      {viewMode === 'analytics' ? (
        <AnalyticsDashboard 
          analytics={analytics}
          occupancyAnalysis={occupancyAnalysis}
          forecast={forecast}
          analyticsLoading={analyticsLoading}
          selectedTab={selectedAnalyticsTab}
          onTabChange={setSelectedAnalyticsTab}
          forecastDays={forecastDays}
          optimizationLevel={optimizationLevel}
          onForecastDaysChange={setForecastDays}
          onOptimizationLevelChange={setOptimizationLevel}
          onRefresh={fetchAnalytics}
        />
      ) : (
        // Existing Rates Table
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="border px-6 py-4 text-left text-gray-700 font-semibold min-w-64">
                    <div className="flex items-center gap-2">
                      Room Type / Rate Type
                      <FaInfoCircle 
                        data-tooltip-id="room-tooltip"
                        className="text-gray-400 cursor-help"
                      />
                    </div>
                  </th>
                {dates.map((date, idx) => (
                  <th key={idx} className="border px-4 py-3 text-center min-w-40">
                    <div className="flex flex-col items-center space-y-2">
                      <div>
                        <div className="text-sm font-semibold text-gray-600">
                          {date.toLocaleDateString("en-US", { weekday: "short" })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => toggleColumn(idx)}
                        className={`p-2 rounded-full transition-colors ${
                          columnLocks[idx] 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        data-tooltip-id="lock-tooltip"
                        data-tooltip-content={columnLocks[idx] ? 'Click to unlock editing' : 'Click to lock editing'}
                      >
                        {columnLocks[idx] ? <FaLock size={14} /> : <FaLockOpen size={14} />}
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rates.map((rate) => (
                <React.Fragment key={rate.id}>
                  {/* Main Pricing Row */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="border px-6 py-4 font-semibold text-gray-800 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-lg">{rate.roomType}</div>
                          <div className="text-sm text-gray-600">{rate.rateType}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Base: ${rate.basePrices?.[0]?.toFixed(2) || '0.00'}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleFactors(rate.id)}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          {expandedFactors[rate.id] ? 'Hide Factors' : 'Show Factors'}
                        </button>
                      </div>
                    </td>
                    
                    {dates.map((date, idx) => {
                      if (!rate.dynamicPrices || !rate.dynamicPrices[idx]) {
                        return (
                          <td key={idx} className="border px-4 py-3 text-center text-gray-400">
                            -
                          </td>
                        );
                      }
                      
                      const dayRate = rate.dynamicPrices[idx];
                      const isEditable = !columnLocks[idx] && viewMode !== 'base';
                      const factors = getFactorDetails(dayRate);
                      
                      return (
                        <td key={idx} className="border px-4 py-3 text-center">
                          <div className="space-y-2">
                            {/* Price Display */}
                            {viewMode === 'comparison' ? (
                              <div className="text-sm space-y-1">
                                <div className="text-gray-500 line-through text-xs">${dayRate.base_rate}</div>
                                <div className={getPriceClassName(dayRate.base_rate, dayRate.dynamic_rate, dayRate.isModified)}>
                                  ${dayRate.dynamic_rate}
                                </div>
                              </div>
                            ) : viewMode === 'factors' ? (
                              <div className="text-xs space-y-1">
                                <div className="font-semibold">${dayRate.dynamic_rate}</div>
                                <div className="grid grid-cols-2 gap-1">
                                  <span className="text-green-600">O: {dayRate.occupancy_factor}x</span>
                                  <span className="text-blue-600">D: {dayRate.demand_factor}x</span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <input
                                  type="number"
                                  value={viewMode === 'base' ? dayRate.base_rate : dayRate.dynamic_rate}
                                  readOnly={viewMode === 'base' || !isEditable}
                                  onChange={(e) => handlePriceChange(rate.id, idx, e.target.value)}
                                  className={`w-full text-center border rounded px-2 py-1 focus:outline-none transition text-sm ${
                                    getPriceClassName(dayRate.base_rate, dayRate.dynamic_rate, dayRate.isModified)
                                  } ${isEditable ? 'focus:ring-2 focus:ring-blue-400' : 'cursor-not-allowed'}`}
                                  min="0"
                                  step="0.01"
                                />
                                {dayRate.isModified && (
                                  <button
                                    onClick={() => resetPrice(rate.id, idx)}
                                    className="text-xs text-red-500 hover:text-red-700"
                                  >
                                    Reset
                                  </button>
                                )}
                              </div>
                            )}
                            
                            {/* Multiplier */}
                            {viewMode !== 'base' && (
                              <div className={`text-xs font-semibold ${
                                dayRate.multiplier > 1 ? 'text-green-600' : 
                                dayRate.multiplier < 1 ? 'text-red-600' : 'text-gray-500'
                              }`}>
                                {dayRate.multiplier.toFixed(2)}x
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  
                  {/* Factors Breakdown Row */}
                  {expandedFactors[rate.id] && (
                    <tr className="bg-blue-25 border-t">
                      <td className="border px-6 py-3 text-xs text-gray-600 font-semibold">
                        Pricing Factors
                      </td>
                      {dates.map((date, idx) => {
                        const dayRate = rate.dynamicPrices?.[idx];
                        if (!dayRate) return <td key={idx} className="border"></td>;
                        
                        const factors = getFactorDetails(dayRate);
                        
                        return (
                          <td key={idx} className="border px-2 py-2">
                            <div className="text-xs space-y-1">
                              {/* Occupancy Factor */}
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Occupancy:</span>
                                <span className={`font-semibold ${
                                  factors.occupancy.impact === 'high' ? 'text-green-600' :
                                  factors.occupancy.impact === 'medium' ? 'text-yellow-600' : 'text-gray-600'
                                }`}>
                                  {factors.occupancy.value}x
                                </span>
                              </div>
                              
                              {/* Demand Factor */}
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Demand:</span>
                                <span className={`font-semibold ${
                                  factors.demand.impact === 'high' ? 'text-green-600' :
                                  factors.demand.impact === 'medium' ? 'text-yellow-600' : 'text-gray-600'
                                }`}>
                                  {factors.demand.value}x
                                </span>
                              </div>
                              
                              {/* Occasions */}
                              {factors.occasions.value > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Occasions:</span>
                                  <span className="text-purple-600 font-semibold">
                                    {factors.occasions.value}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  )}
                  
                  {/* Occasions Row */}
                  <tr className="bg-gray-25 border-t">
                    <td className="border px-6 py-2 text-xs text-gray-500 font-semibold">
                      Special Events
                    </td>
                    {dates.map((date, idx) => {
                      const dayRate = rate.dynamicPrices?.[idx];
                      return (
                        <td key={idx} className="border px-2 py-2">
                          <div className="text-xs space-y-1">
                            {dayRate?.occasions?.map((occasion, occIdx) => {
                              const IconComponent = getOccasionIcon(occasion);
                              return (
                                <div key={occIdx} className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                  <IconComponent size={10} />
                                  <span>{occasion}</span>
                                </div>
                              );
                            })}
                            {(!dayRate?.occasions || dayRate.occasions.length === 0) && (
                              <div className="text-gray-400 text-center">-</div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Tooltips */}
      <Tooltip id="room-tooltip" place="top">
        Room types and their meal plans (EP: Room Only, CP: Breakfast, MAP: Half Board, AP: Full Board, AI: All Inclusive)
      </Tooltip>
      
      <Tooltip id="lock-tooltip" place="top" />
    </div>
  );
};

export default RevenueManagement;