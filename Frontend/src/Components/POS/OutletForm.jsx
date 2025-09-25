import React, { useState, useEffect } from 'react';
import { useOutlet } from '../../context/OutletContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../Button';

const OutletForm = ({ outlet, onClose, onSuccess }) => {
  const { createOutlet, updateOutlet, getAvailableManagers } = useOutlet();
  const { hotel, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState([]);
  const [createNewManager, setCreateNewManager] = useState(false);
  const [newManager, setNewManager] = useState({ name: '', email: '', password: '' });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    address: '',
    phone: '',
    email: '',
    outletType: 'RESTAURANT',
    managerId: null,
    isActive: true,
    operatingHours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '22:00', closed: false },
      saturday: { open: '09:00', close: '22:00', closed: false },
      sunday: { open: '09:00', close: '22:00', closed: false }
    }
  });

  const [errors, setErrors] = useState({});

  const outletTypes = [
    { value: 'RESTAURANT', label: 'Restaurant' },
    { value: 'BAR', label: 'Bar' },
    { value: 'CAFE', label: 'Cafe' },
    { value: 'FAST_FOOD', label: 'Fast Food' },
    { value: 'FINE_DINING', label: 'Fine Dining' },
    { value: 'BUFFET', label: 'Buffet' },
    { value: 'TAKEAWAY', label: 'Takeaway' }
  ];

  const weekDays = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  useEffect(() => {
    // Load available managers when form opens
    const loadManagers = async () => {
      const res = await getAvailableManagers();
      if (res?.success) {
        setManagers(res.data || []);
      }
    };
    loadManagers();
  }, [getAvailableManagers]);

  useEffect(() => {
    if (outlet) {
      let parsedHours = outlet.operatingHours;
      if (typeof parsedHours === 'string') {
        try {
          parsedHours = JSON.parse(parsedHours);
        } catch (e) {
          parsedHours = formData.operatingHours;
        }
      } else if (!parsedHours) {
        parsedHours = formData.operatingHours;
      }

      setFormData({
        name: outlet.name || '',
        description: outlet.description || '',
        location: outlet.location || '',
        address: outlet.address || '',
        phone: outlet.phone || '',
        email: outlet.email || '',
        outletType: outlet.outletType || 'RESTAURANT',
        managerId: outlet.manager?.id || null,
        isActive: outlet.isActive ?? true,
        operatingHours: parsedHours
      });
    }
  }, [outlet]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleOperatingHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: field === 'closed' ? value : value
        }
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Outlet name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        // Keep operatingHours as a string to maintain backend compatibility
        operatingHours: JSON.stringify(formData.operatingHours)
      };

      // If creating/updating with a new manager, create the staff user first
      if (createNewManager && newManager.name && newManager.email && newManager.password) {
        if (!token || !hotel?.id) {
          setErrors({ submit: 'Not authenticated or missing hotelId to create manager' });
          setLoading(false);
          return;
        }
        const base = (typeof window !== 'undefined' && window.API_BASE_URL)
          || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
          || 'http://localhost:5000';
        const url = `${base.replace(/\/$/, '')}/api/hotel/create-role-user`;
        const resp = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newManager.name,
            email: newManager.email,
            password: newManager.password,
            role: 'RESTAURANTMANAGER',
            hotelId: hotel.id,
          }),
        });
        if (!resp.ok) {
          const text = await resp.text();
          setErrors({ submit: `Failed to create manager (${resp.status}) ${text?.slice(0,200)}` });
          setLoading(false);
          return;
        }
        const data = await resp.json();
        const createdStaff = data.staff;
        if (!createdStaff?.id) {
          setErrors({ submit: 'Manager creation response missing id' });
          setLoading(false);
          return;
        }
        submitData.managerId = createdStaff.id;
      }

      let result;
      if (outlet) {
        result = await updateOutlet(outlet.id, submitData);
      } else {
        result = await createOutlet(submitData);
      }

      if (result.success) {
        onSuccess && onSuccess(result.data);
        onClose();
      } else {
        setErrors({ submit: result.message || 'Failed to save outlet' });
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    // Outer modal backdrop
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      {/* Modal content container */}
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {outlet ? 'Edit Outlet' : 'Create New Outlet'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-300 rounded-md p-4">
              <p className="text-red-800">{errors.submit}</p>
            </div>
          )}

          {/* Basic Information Grid Start */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            
            {/* Outlet Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Outlet Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter outlet name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Outlet Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Outlet Type
              </label>
              <select
                name="outletType"
                value={formData.outletType}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {outletTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Assign Manager */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Assign Manager (optional)
              </label>
              <select
                name="managerId"
                value={formData.managerId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, managerId: e.target.value || null }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={createNewManager}
              >
                <option value="">-- None --</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                ))}
              </select>
              <div className="mt-2 flex items-center space-x-2">
                <input
                  id="createNewManager"
                  type="checkbox"
                  checked={createNewManager}
                  onChange={(e) => setCreateNewManager(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="createNewManager" className="text-sm text-gray-700">Create new manager</label>
              </div>
            </div>
            
            {/* Active Checkbox (Only visible on edit) */}
            {outlet && (
              <div className="flex items-center space-x-2 sm:col-span-2"> {/* Span 2 for better layout */}
                <input
                  id="isActive"
                  type="checkbox"
                  name="isActive"
                  checked={!!formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
              </div>
            )}

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.location ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Ground Floor, Mall Food Court"
              />
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="outlet@restaurant.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

          </div> {/* Basic Information Grid End */}

          {/* Description (Full width) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of the outlet..."
            />
          </div>

          {/* Address (Full width) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={2}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Full address for delivery and directions..."
            />
          </div>

          {/* Operating Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Operating Hours
            </label>
            <div className="space-y-3">
              {weekDays.map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-4">
                  <div className="w-20">
                    <span className="text-sm text-gray-600">{label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.operatingHours[key].closed}
                      onChange={(e) => handleOperatingHoursChange(key, 'closed', e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Closed</span>
                  </div>
                  {!formData.operatingHours[key].closed && (
                    <>
                      <input
                        type="time"
                        value={formData.operatingHours[key].open}
                        onChange={(e) => handleOperatingHoursChange(key, 'open', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={formData.operatingHours[key].close}
                        onChange={(e) => handleOperatingHoursChange(key, 'close', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* New Manager Fields */}
          {createNewManager && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Manager Name</label>
                <input
                  type="text"
                  value={newManager.name}
                  onChange={(e) => setNewManager(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Manager Email</label>
                <input
                  type="email"
                  value={newManager.email}
                  onChange={(e) => setNewManager(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="manager@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Manager Password</label>
                <input
                  type="password"
                  value={newManager.password}
                  onChange={(e) => setNewManager(prev => ({ ...prev, password: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
              <div className="sm:col-span-3 text-xs text-gray-500">New manager will be created with role "RESTAURANTMANAGER" and assigned to this outlet.</div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : outlet ? 'Update Outlet' : 'Create Outlet'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OutletForm;