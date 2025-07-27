import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  FaChartLine, FaDollarSign, FaCalendarAlt,
  FaHotel, FaChartBar, FaSearchDollar,
  FaInfoCircle, FaSync
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../../context/AuthContext';

const RevenueManagement = () => {
  const { hotel, user } = useAuth();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [forecastPeriod, setForecastPeriod] = useState('30');

  const [loading, setLoading] = useState(true);
  const [priceRecommendations, setPriceRecommendations] = useState([]);
  const [competitorData, setCompetitorData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [forecastData, setForecastData] = useState([]);

  // Fetch data simulation
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setPriceRecommendations([
        { roomType: 'Standard', currentRate: 160, recommendedRate: 170 },
        { roomType: 'Deluxe', currentRate: 200, recommendedRate: 210 },
        { roomType: 'Suite', currentRate: 300, recommendedRate: 320 },
      ]);
      setCompetitorData([
        { name: 'Competitor A', rate: 165, occupancy: 75 },
        { name: 'Competitor B', rate: 170, occupancy: 80 },
        { name: 'Competitor C', rate: 160, occupancy: 70 },
        { name: 'Competitor D', rate: 175, occupancy: 85 },
      ]);
      setForecastData([
        { date: '2023-02-01', predictedOccupancy: 70, recommendedRate: 160 },
        { date: '2023-02-02', predictedOccupancy: 75, recommendedRate: 165 },
        { date: '2023-02-03', predictedOccupancy: 80, recommendedRate: 170 },
        { date: '2023-02-04', predictedOccupancy: 85, recommendedRate: 175 },
        { date: '2023-02-05', predictedOccupancy: 90, recommendedRate: 185 },
        { date: '2023-02-06', predictedOccupancy: 85, recommendedRate: 180 },
        { date: '2023-02-07', predictedOccupancy: 80, recommendedRate: 175 },
      ]);
      setHistoricalData([
        { date: '2023-01-01', occupancy: 65, adr: 150, revenue: 9750 },
        { date: '2023-01-02', occupancy: 70, adr: 155, revenue: 10850 },
        { date: '2023-01-03', occupancy: 75, adr: 160, revenue: 12000 },
        { date: '2023-01-04', occupancy: 80, adr: 165, revenue: 13200 },
        { date: '2023-01-05', occupancy: 85, adr: 170, revenue: 14450 },
        { date: '2023-01-06', occupancy: 90, adr: 180, revenue: 16200 },
        { date: '2023-01-07', occupancy: 95, adr: 190, revenue: 18050 },
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  const handleApplyRecommendations = () => {
    alert('Rate recommendations applied to your system!');
  };

  const calculateDynamicPricing = () => {
    const updated = priceRecommendations.map(rec => {
      const newRate = Math.round(rec.recommendedRate * (1 + (Math.random() * 0.05 + 0.05)));
      return {
        ...rec,
        recommendedRate: newRate,
      };
    });
    setPriceRecommendations(updated);
  };

  const getRateChange = (rec) => {
    const diff = rec.recommendedRate - rec.currentRate;
    const percent = ((diff / rec.currentRate) * 100).toFixed(1);
    return (diff >= 0 ? '+' : '') + percent;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <FaChartLine className="mr-2" /> Revenue Management
        </h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <FaCalendarAlt className="mr-2 text-gray-600" />
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className="border rounded p-1 w-32"
            />
            <span className="mx-2">to</span>
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              className="border rounded p-1 w-32"
            />
          </div>
          <select
            value={forecastPeriod}
            onChange={(e) => setForecastPeriod(e.target.value)}
            className="border rounded p-1"
          >
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
            <option value="60">60 days</option>
          </select>
          <button
            onClick={calculateDynamicPricing}
            className="bg-blue-600 text-white px-4 py-1 rounded flex items-center"
          >
            <FaSync className="mr-2" /> Recalculate
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <KPI icon={<FaHotel />} label="Current Occupancy" value="78%" change="+5%" />
        <KPI icon={<FaDollarSign />} label="Average Daily Rate" value="$165" change="+$12" />
        <KPI icon={<FaChartBar />} label="RevPAR" value="$128.70" change="+8%" />
      </div>

      {/* Price Recommendations */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaSearchDollar className="mr-2" /> Price Recommendations
        </h2>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading recommendations...</div>
        ) : priceRecommendations.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No data available</div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Room Type", "Current", "Recommended", "Change", "Action"].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {priceRecommendations.map((rec, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 font-medium">{rec.roomType}</td>
                      <td className="px-6 py-4">${rec.currentRate}</td>
                      <td className="px-6 py-4 text-green-600 font-bold">${rec.recommendedRate}</td>
                      <td className={`px-6 py-4 ${getRateChange(rec).startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {getRateChange(rec)}%
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => alert(`Applied ${rec.roomType}`)} className="text-blue-600 hover:text-blue-800">
                          Apply
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleApplyRecommendations}
                className="bg-green-600 text-white px-4 py-2 rounded flex items-center"
              >
                Apply All Recommendations
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Occupancy & Rate Forecast">
          <AreaChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip />
            <Legend />
            <Area yAxisId="left" type="monotone" dataKey="predictedOccupancy" stroke="#8884d8" fill="#8884d8" name="Occupancy %" />
            <Line yAxisId="right" type="monotone" dataKey="recommendedRate" stroke="#82ca9d" name="Recommended Rate" />
          </AreaChart>
        </ChartCard>

        <ChartCard title="Competitor Rate Analysis">
          <BarChart data={competitorData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="rate" fill="#8884d8" name="Rate ($)" />
            <Bar dataKey="occupancy" fill="#82ca9d" name="Occupancy (%)" />
          </BarChart>
        </ChartCard>
      </div>

      {/* Historical Chart */}
      <ChartCard title="Historical Performance">
        <LineChart data={historicalData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="occupancy" stroke="#8884d8" name="Occupancy %" />
          <Line yAxisId="right" type="monotone" dataKey="adr" stroke="#82ca9d" name="ADR ($)" />
          <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#ffc658" name="Revenue ($)" />
        </LineChart>
      </ChartCard>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-start">
        <FaInfoCircle className="text-blue-500 mr-3 mt-1" />
        <div>
          <h3 className="font-semibold text-blue-800">Dynamic Pricing Insights</h3>
          <p className="text-sm text-gray-700">
            Our AI engine analyzes historical trends, local demand, and competitors to recommend pricing for maximizing occupancy and revenue.
          </p>
        </div>
      </div>
    </div>
  );
};

// Utility components
const KPI = ({ icon, label, value, change }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
      {icon}<span className="ml-2">{label}</span>
    </h3>
    <p className="text-3xl font-bold text-blue-600">{value}</p>
    <p className="text-sm text-gray-500">{change} from previous</p>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  </div>
);

export default RevenueManagement;
