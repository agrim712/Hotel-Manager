import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiTool,
  FiDroplet,
  FiZap
} from 'react-icons/fi';

const API_BASE_URL = 'http://localhost:5000/api/hotel';
const token = localStorage.getItem('token');

const OperationsDashboard = () => {
  const [activeTab, setActiveTab] = useState('maintenance');
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    room: '',
    issueType: 'electrical',
    priority: 'medium',
    description: ''
  });
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);

  const energyConsumption = {
    electricity: { current: 1250, previous: 1400 },
    water: { current: 320, previous: 350 },
    gas: { current: 480, previous: 520 }
  };

  // Fetch tickets from backend
  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaintenanceRequests(res.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Create ticket in backend
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE_URL}/tickets`,
        newTicket,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchTickets(); // Refresh list
      setShowCreateTicket(false);
      setNewTicket({
        title: '',
        room: '',
        issueType: 'electrical',
        priority: 'medium',
        description: ''
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">Operations Dashboard</h2>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowCreateTicket(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <FiTool className="mr-2" />
                Create Maintenance Ticket
              </button>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Open Tickets</p>
                  <h3 className="text-2xl font-bold">
                    {maintenanceRequests.filter(t => t.status === 'open').length}
                  </h3>
                </div>
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <FiAlertCircle size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">In Progress</p>
                  <h3 className="text-2xl font-bold">
                    {maintenanceRequests.filter(t => t.status === 'in-progress').length}
                  </h3>
                </div>
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <FiClock size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Completed Today</p>
                  <h3 className="text-2xl font-bold">
                    {maintenanceRequests.filter(t => t.status === 'completed').length}
                  </h3>
                </div>
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <FiCheckCircle size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('maintenance')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'maintenance' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Maintenance Tickets
              </button>
              <button
                onClick={() => setActiveTab('preventive')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'preventive' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Preventive Maintenance
              </button>
              <button
                onClick={() => setActiveTab('energy')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'energy' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Energy Consumption
              </button>
            </nav>
          </div>

          {/* Maintenance Tickets */}
          {activeTab === 'maintenance' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room/Area</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {maintenanceRequests.map(ticket => (
                      <tr key={ticket.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{ticket.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{ticket.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.room}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{ticket.issueType}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${ticket.priority === 'high' ? 'bg-red-100 text-red-800' : ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${ticket.status === 'open' ? 'bg-purple-100 text-purple-800' : ticket.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.assignedTo || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(ticket.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Energy Consumption */}
          {activeTab === 'energy' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(energyConsumption).map(([key, val]) => (
                <div key={key} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
                    <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                      {key === 'electricity' && <FiZap size={20} />}
                      {key === 'water' && <FiDroplet size={20} />}
                      {key === 'gas' && <FiTool size={20} />}
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold">{val.current}</p>
                      <p className="text-sm text-gray-500">Current Month</p>
                    </div>
                    <div className="text-right">
                      <p className={`flex items-center ${val.current < val.previous ? 'text-green-600' : 'text-red-600'}`}>
                        <FiTrendingUp className="mr-1" />
                        {Math.abs(((val.current - val.previous) / val.previous * 100)).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-500">vs last month</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create Ticket Modal */}
      {showCreateTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create Maintenance Ticket</h3>
                <button onClick={() => setShowCreateTicket(false)} className="text-gray-400 hover:text-gray-500">
                  ✕
                </button>
              </div>
              <form onSubmit={handleCreateTicket}>
                <div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
  <input
    type="text"
    className="w-full border p-2"
    value={newTicket.title}
    onChange={e => setNewTicket({ ...newTicket, title: e.target.value })}
    required
  />
</div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room/Area</label>
                  <input type="text" className="w-full border p-2" value={newTicket.room} onChange={e => setNewTicket({...newTicket, room: e.target.value})} required />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
                  <select className="w-full border p-2" value={newTicket.issueType} onChange={e => setNewTicket({...newTicket, issueType: e.target.value})}>
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="hvac">HVAC</option>
                    <option value="furniture">Furniture</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select className="w-full border p-2" value={newTicket.priority} onChange={e => setNewTicket({...newTicket, priority: e.target.value})}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea className="w-full border p-2" rows="3" value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})} required></textarea>
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowCreateTicket(false)} className="px-4 py-2 border rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Create Ticket</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationsDashboard;
