import React, { useState, useEffect } from 'react';
import POSLayout from '../../components/POS/POSLayout';
import { 
  Plus, 
  Search, 
  Users, 
  Edit,
  Trash2,
  MoreVertical,
  UserCheck,
  UserX
} from 'lucide-react';

const WaiterManagement = () => {
  const [waiters, setWaiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddWaiter, setShowAddWaiter] = useState(false);
  const [selectedWaiter, setSelectedWaiter] = useState(null);
  const [editingWaiter, setEditingWaiter] = useState(null);

  useEffect(() => {
    fetchWaiters();
  }, []);

  const fetchWaiters = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWaiter = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData(e.target);
      
      const body = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone') || null,
        employeeId: formData.get('employeeId') || null
      };

      const response = await fetch('http://localhost:5000/api/pos/waiters', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        fetchWaiters();
        setShowAddWaiter(false);
        e.target.reset();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create waiter');
      }
    } catch (error) {
      console.error('Error creating waiter:', error);
      alert('Failed to create waiter');
    }
  };

  const handleUpdateWaiter = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData(e.target);
      
      const body = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone') || null,
        employeeId: formData.get('employeeId') || null,
        isActive: formData.get('isActive') === 'true'
      };

      const response = await fetch(`http://localhost:5000/api/pos/waiters/${editingWaiter.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        fetchWaiters();
        setEditingWaiter(null);
        e.target.reset();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update waiter');
      }
    } catch (error) {
      console.error('Error updating waiter:', error);
      alert('Failed to update waiter');
    }
  };

  const handleDeleteWaiter = async (waiterId) => {
    if (!confirm('Are you sure you want to delete this waiter?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/pos/waiters/${waiterId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchWaiters();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete waiter');
      }
    } catch (error) {
      console.error('Error deleting waiter:', error);
      alert('Failed to delete waiter');
    }
  };

  const filteredWaiters = waiters.filter(waiter =>
    waiter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    waiter.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <POSLayout title="Waiter Management">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </POSLayout>
    );
  }

  return (
    <POSLayout title="Waiter Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Waiter Management</h1>
            <p className="text-gray-600">Manage restaurant waiters and their assignments</p>
          </div>
          <button
            onClick={() => setShowAddWaiter(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Waiter
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search waiters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
          </div>
        </div>

        {/* Waiters List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWaiters.map(waiter => (
            <div
              key={waiter.id}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {waiter.isActive ? (
                    <UserCheck className="h-5 w-5 text-green-500" />
                  ) : (
                    <UserX className="h-5 w-5 text-red-500" />
                  )}
                  <span className="ml-2 text-lg font-semibold">{waiter.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingWaiter(waiter)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Edit className="h-4 w-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDeleteWaiter(waiter.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Email: {waiter.email}</p>
              {waiter.phone && <p className="text-sm text-gray-600 mb-1">Phone: {waiter.phone}</p>}
              {waiter.employeeId && <p className="text-sm text-gray-600 mb-1">Employee ID: {waiter.employeeId}</p>}
              <p className="text-sm text-gray-600 mb-2">
                Assigned Tables: {waiter.tables?.length || 0}
              </p>
              <div className="flex items-center">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  waiter.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {waiter.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Add Waiter Modal */}
        {showAddWaiter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-4">Add New Waiter</h2>
            <form onSubmit={handleCreateWaiter} className="space-y-4">
              <input
                name="name"
                type="text"
                placeholder="Full Name"
                required
                className="w-full border p-2 rounded"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                required
                className="w-full border p-2 rounded"
              />
              <input
                name="phone"
                type="tel"
                placeholder="Phone (Optional)"
                className="w-full border p-2 rounded"
              />
              <input
                name="employeeId"
                type="text"
                placeholder="Employee ID (Optional)"
                className="w-full border p-2 rounded"
              />
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddWaiter(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Add Waiter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Waiter Modal */}
      {editingWaiter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-4">Edit Waiter</h2>
            <form onSubmit={handleUpdateWaiter} className="space-y-4">
              <input
                name="name"
                type="text"
                placeholder="Full Name"
                defaultValue={editingWaiter.name}
                required
                className="w-full border p-2 rounded"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                defaultValue={editingWaiter.email}
                required
                className="w-full border p-2 rounded"
              />
              <input
                name="phone"
                type="tel"
                placeholder="Phone (Optional)"
                defaultValue={editingWaiter.phone || ''}
                className="w-full border p-2 rounded"
              />
              <input
                name="employeeId"
                type="text"
                placeholder="Employee ID (Optional)"
                defaultValue={editingWaiter.employeeId || ''}
                className="w-full border p-2 rounded"
              />
              <select
                name="isActive"
                defaultValue={editingWaiter.isActive.toString()}
                className="w-full border p-2 rounded"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingWaiter(null)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Update Waiter
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

export default WaiterManagement;
