import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Edit,
  Eye
} from 'lucide-react';

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddTable, setShowAddTable] = useState(false);
  const [showAddArea, setShowAddArea] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [view, setView] = useState('grid'); // grid or list

  useEffect(() => {
    fetchTables();
    fetchAreas();
  }, [areaFilter, statusFilter]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (areaFilter !== 'all') params.append('areaId', areaFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`http://localhost:5000/api/pos/tables?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTables(data.data);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAreas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/pos/areas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAreas(data.data);
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'OCCUPIED':
        return <Users className="h-5 w-5 text-red-500" />;
      case 'RESERVED':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'MAINTENANCE':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'OCCUPIED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'RESERVED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'MAINTENANCE':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredTables = tables.filter(table =>
    table.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (table.area?.name && table.area.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleTableAction = (tableId, action) => {
    console.log(`Action: ${action} on table:`, tableId);
    // Implement edit/view/more actions later
  };

  const handleStatusChange = async (tableId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/pos/tables/${tableId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchTables();
      }
    } catch (error) {
      console.error('Error updating table status:', error);
    }
  };

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
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
            <p className="text-gray-600">Manage restaurant tables and seating areas</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddArea(true)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Area
            </button>
            <button
              onClick={() => setShowAddTable(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Table
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b p-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Areas</option>
            {areas.map(area => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="RESERVED">Reserved</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Areas Summary */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {areas.map(area => (
            <div key={area.id} className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold">{area.name}</h3>
              <p className="text-sm text-gray-600">
                {area.availableTables} of {area.totalTables} tables available
              </p>
            </div>
          ))}
        </div>

        {/* Tables */}
        {view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTables.map(table => (
              <div
                key={table.id}
                className={`bg-white rounded-lg shadow-sm border-2 p-6 cursor-pointer hover:shadow-md ${getStatusColor(table.status)}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getStatusIcon(table.status)}
                    <span className="ml-2 text-lg font-semibold">Table {table.number}</span>
                  </div>
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </div>
                <p>Capacity: {table.capacity}</p>
                <p>Area: {table.area?.name || 'No Area'}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Add Table Modal */}
      {showAddTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-4">Add New Table</h2>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const token = localStorage.getItem("token");

                const body = {
                  number: e.target.tableNumber.value,
                  capacity: e.target.capacity.value,
                  areaId: e.target.areaId.value || null
                };

                const res = await fetch("http://localhost:5000/api/pos/tables", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                  },
                  body: JSON.stringify(body)
                });

                if (res.ok) {
                  fetchTables();
                  setShowAddTable(false);
                }
              }}
            >
              <input name="tableNumber" type="text" placeholder="Table Number" required className="w-full border p-2 rounded" />
              <input name="capacity" type="number" placeholder="Capacity" required className="w-full border p-2 rounded" />
              <select name="areaId" className="w-full border p-2 rounded">
                <option value="">Select Area</option>
                {areas.map(area => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </select>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowAddTable(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Add Table</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Area Modal */}
      {showAddArea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-4">Add New Area</h2>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const token = localStorage.getItem("token");
                const name = e.target.areaName.value;

                const res = await fetch("http://localhost:5000/api/pos/areas", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                  },
                  body: JSON.stringify({ name })
                });

                if (res.ok) {
                  fetchAreas();
                  setShowAddArea(false);
                }
              }}
            >
              <input name="areaName" type="text" placeholder="Area Name" required className="w-full border p-2 rounded" />
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowAddArea(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Add Area</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManagement;
