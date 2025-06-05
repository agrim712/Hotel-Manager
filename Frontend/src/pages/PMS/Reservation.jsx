import React, { useState } from 'react';
import { FaDownload, FaUpload, FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { useReservationContext } from '../../context/ReservationContext';

const Reservation = () => {
  const navigate = useNavigate();
  const { 
    reservations, 
    loading, 
    error, 
    fetchReservations,
    deleteReservation 
  } = useReservationContext();

  // Initialize with current month range
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const [filters, setFilters] = useState({
    dateRange: {
      from: firstDayOfMonth,
      to: lastDayOfMonth
    },
    showCancelled: false,
    filterOption: 'Booking Date',
    searchText: ''
  });

  // Format date for display
  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Style function for status badges
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Checked in': return 'bg-green-100 text-green-800';
      case 'Unassigned': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const formatDisplayTime = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

  // Action button component
  const ActionButton = ({ icon, text, onClick, variant = 'default' }) => {
    const variants = {
      default: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
      primary: 'bg-blue-500 text-white hover:bg-blue-600',
      secondary: 'bg-green-500 text-white hover:bg-green-600',
      danger: 'bg-red-500 text-white hover:bg-red-600',
    };

    return (
      <button
        onClick={onClick}
        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${variants[variant]}`}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {text}
      </button>
    );
  };

  // Handle search with filters
const handleSearch = async () => {
  try {
    const params = {
      fromDate: filters.dateRange.from.toISOString(),
      toDate: filters.dateRange.to.toISOString(),
      searchText: filters.searchText,
      filterOption: filters.filterOption // For non-date searches
    };
    
    await fetchReservations(params);
  } catch (err) {
    console.error('Search failed:', err);
  }
};

  // Handle reservation deletion
  const handleDelete = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      try {
        await deleteReservation(bookingId);
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  // Handle navigation to edit page
  const handleEdit = (bookingId) => {
    navigate(`/pmss/reservation/edit/${bookingId}`);
  };

  // Handle create reservation navigation
  const handleCreateReservation = (type = 'regular') => {
    navigate(`/pmss/reservation/create/${type}`);
  };

  return (
    <div className="p-6">
      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Reservation Data</h2>
          <div className="flex space-x-2">
            <ActionButton
              icon={<FaPlus />}
              text="Create Reservation"
              onClick={() => handleCreateReservation()}
              variant="primary"
            />
            <ActionButton
              icon={<FaPlus />}
              text="Complimentary"
              onClick={() => handleCreateReservation('complimentary')}
              variant="secondary"
            />
            <ActionButton
              icon={<FaPlus />}
              text="Out of Order"
              onClick={() => handleCreateReservation('outoforder')}
              variant="danger"
            />
            <ActionButton
              icon={<FaPlus />}
              text="Groups"
              onClick={() => handleCreateReservation('group')}
              variant="primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
<div>
  <label className="block text-sm font-medium text-gray-700">From Date</label>
  <DatePicker
    selected={filters.dateRange.from}
    onChange={(date) => setFilters(prev => ({
      ...prev,
      dateRange: { ...prev.dateRange, from: date }
    }))}
    selectsStart
    startDate={filters.dateRange.from}
    endDate={filters.dateRange.to}
    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700">To Date</label>
  <DatePicker
    selected={filters.dateRange.to}
    onChange={(date) => setFilters(prev => ({
      ...prev,
      dateRange: { ...prev.dateRange, to: date }
    }))}
    selectsEnd
    startDate={filters.dateRange.from}
    endDate={filters.dateRange.to}
    minDate={filters.dateRange.from}
    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
  />
</div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Filter Options</label>
            <select
              value={filters.filterOption}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                filterOption: e.target.value
              }))}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              <option>Booking Date</option>
              <option>Booking ID</option>
              <option>Customer Name</option>
              <option>Phone Number</option>
              <option>Email</option>
            </select>
          </div>
          <div className="flex items-end">
            <ActionButton
              icon={<FaSearch />}
              text="Search"
              onClick={handleSearch}
              variant="primary"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {filters.filterOption !== 'Booking Date' && (
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder={`Search by ${filters.filterOption}`}
                  value={filters.searchText}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    searchText: e.target.value
                  }))}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                <button
                  onClick={handleSearch}
                  className="ml-2 px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  <FaSearch />
                </button>
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <ActionButton
              icon={<FaDownload />}
              text="Download"
              onClick={() => console.log('Download clicked')}
            />
            <ActionButton
              icon={<FaUpload />}
              text="Upload"
              onClick={() => console.log('Upload clicked')}
            />
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      {loading && (
        <div className="mb-4 p-4 bg-blue-50 text-blue-800 rounded-lg">
          Loading reservations...
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-lg">
          Error: {error}
        </div>
      )}

      {/* Reservations Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booked On</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-In Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-Out Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rooms</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
  {reservations.length === 0 && !loading ? (
    <tr>
      <td colSpan="12" className="px-6 py-4 text-center text-gray-500">
        No reservations found
      </td>
    </tr>
  ) : (
    reservations.map(reservation => {
      const checkInDate = new Date(reservation.checkIn);
      const checkOutDate = new Date(reservation.checkOut);
      
      return (
        <tr key={reservation.id}>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.id}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.guestName}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formatDisplayDate(new Date(reservation.createdAt))}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formatDisplayDate(checkInDate)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formatDisplayTime(checkInDate)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formatDisplayDate(checkOutDate)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formatDisplayTime(checkOutDate)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reservation.guests}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reservation.rooms}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {reservation.totalAmount?.toFixed(2) || 'N/A'}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(reservation.status || 'Confirmed')}`}>
              {reservation.status || 'Confirmed'}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button 
              onClick={() => handleEdit(reservation.id)} 
              className="text-indigo-600 hover:text-indigo-900 mr-2"
            >
              <FaEdit />
            </button>
            <button 
              onClick={() => handleDelete(reservation.id)} 
              className="text-red-600 hover:text-red-900"
            >
              <FaTrash />
            </button>
          </td>
        </tr>
      );
    })
  )}
</tbody>
        </table>
      </div>
    </div>
  );
};

export default Reservation;