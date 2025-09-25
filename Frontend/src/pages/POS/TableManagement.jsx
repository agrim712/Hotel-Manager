import React, { useState, useEffect } from 'react';
import POSLayout from '../../Components/POS/POSLayout';
import { 
  Plus, 
  Search, 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  X,
  Save,
  User
} from 'lucide-react';

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [areas, setAreas] = useState([]);
  const [waiters, setWaiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddTable, setShowAddTable] = useState(false);
  const [showAddArea, setShowAddArea] = useState(false);
  const [showEditTable, setShowEditTable] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [view, setView] = useState('grid'); // grid or list
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);

  useEffect(() => {
    fetchTables();
    fetchAreas();
    fetchWaiters();
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

  const fetchWaiters = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/pos/waiters', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWaiters(data.data);
      }
    } catch (error) {
      console.error('Error fetching waiters:', error);
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

  const handleEditTable = (table) => {
    setEditingTable(table);
    setShowEditTable(true);
  };

  const handleUpdateTable = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData(e.target);
      
      const body = {
        number: formData.get('number'),
        capacity: parseInt(formData.get('capacity')),
        areaId: formData.get('areaId') || null,
        waiterId: formData.get('waiterId') || null
      };

      const response = await fetch(`http://localhost:5000/api/pos/tables/${editingTable.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        fetchTables();
        setShowEditTable(false);
        setEditingTable(null);
        e.target.reset();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update table');
      }
    } catch (error) {
      console.error('Error updating table:', error);
      alert('Failed to update table');
    }
  };

  const handleDeleteTable = (table) => {
    setTableToDelete(table);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTable = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/pos/tables/${tableToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchTables();
        setShowDeleteConfirm(false);
        setTableToDelete(null);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete table');
      }
    } catch (error) {
      console.error('Error deleting table:', error);
      alert('Failed to delete table');
    }
  };

  if (loading) {
    return (
      <POSLayout title="Table Management">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </POSLayout>
    );
  }

  return (
    <POSLayout title="Table Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
            <p className="text-gray-600">Manage restaurant tables and seating areas</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddArea(true)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {areas.map(area => (
            <div key={area.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900">{area.name}</h3>
              <p className="text-sm text-gray-600">
                {area.availableTables} of {area.totalTables} tables available
              </p>
            </div>
          ))}
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTables.map(table => (
            <div
              key={table.id}
              className={`bg-white rounded-lg shadow-sm border-2 p-6 hover:shadow-md transition-shadow ${getStatusColor(table.status)}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getStatusIcon(table.status)}
                  <span className="ml-2 text-lg font-semibold">Table {table.number}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditTable(table)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Edit Table"
                  >
                    <Edit className="h-4 w-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDeleteTable(table)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Delete Table"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 text-gray-400 mr-2" />
                  <span>Capacity: {table.capacity}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-400 mr-2">📍</span>
                  <span>Area: {table.area?.name || 'No Area'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span>Waiter: {table.waiter?.name || 'No Waiter Assigned'}</span>
                </div>
              </div>
              <div className="mt-4">
                <select
                  value={table.status}
                  onChange={(e) => handleStatusChange(table.id, e.target.value)}
                  className={`w-full text-sm px-3 py-1 rounded border-0 ${getStatusColor(table.status)}`}
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* Add Table Modal */}
        {showAddTable && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Add New Table</h2>
                <button
                  onClick={() => setShowAddTable(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const token = localStorage.getItem("token");

                  const body = {
                    number: e.target.tableNumber.value,
                    capacity: e.target.capacity.value,
                    areaId: e.target.areaId.value || null,
                    waiterId: e.target.waiterId.value || null
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
                    e.target.reset();
                  }
                }}
              >
                <input
                  name="tableNumber"
                  type="text"
                  placeholder="Table Number"
                  required
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                />
                <input
                  name="capacity"
                  type="number"
                  placeholder="Capacity"
                  required
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                />
                <select
                  name="areaId"
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Area</option>
                  {areas.map(area => (
                    <option key={area.id} value={area.id}>{area.name}</option>
                  ))}
                </select>
                <select
                  name="waiterId"
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Waiter (Optional)</option>
                  {waiters.filter(waiter => waiter.isActive).map(waiter => (
                    <option key={waiter.id} value={waiter.id}>{waiter.name}</option>
                  ))}
                </select>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddTable(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Table
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Table Modal */}
        {showEditTable && editingTable && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Edit Table</h2>
                <button
                  onClick={() => {
                    setShowEditTable(false);
                    setEditingTable(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleUpdateTable} className="space-y-4">
                <input
                  name="number"
                  type="text"
                  placeholder="Table Number"
                  defaultValue={editingTable.number}
                  required
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                />
                <input
                  name="capacity"
                  type="number"
                  placeholder="Capacity"
                  defaultValue={editingTable.capacity}
                  required
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                />
                <select
                  name="areaId"
                  defaultValue={editingTable.areaId || ''}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Area</option>
                  {areas.map(area => (
                    <option key={area.id} value={area.id}>{area.name}</option>
                  ))}
                </select>
                <select
                  name="waiterId"
                  defaultValue={editingTable.waiterId || ''}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Waiter (Optional)</option>
                  {waiters.filter(waiter => waiter.isActive).map(waiter => (
                    <option key={waiter.id} value={waiter.id}>{waiter.name}</option>
                  ))}
                </select>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditTable(false);
                      setEditingTable(null);
                    }}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Update Table
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && tableToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-red-600">Delete Table</h2>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setTableToDelete(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  Are you sure you want to delete <strong>Table {tableToDelete.number}</strong>?
                </p>
                <p className="text-sm text-red-600">
                  This action cannot be undone. Any orders associated with this table will be affected.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setTableToDelete(null);
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteTable}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Table
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Area Modal */}
        {showAddArea && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Add New Area</h2>
                <button
                  onClick={() => setShowAddArea(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
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
                    e.target.reset();
                  }
                }}
              >
                <input
                  name="areaName"
                  type="text"
                  placeholder="Area Name"
                  required
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddArea(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add Area
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </POSLayout>
  );
};

export default TableManagement;
