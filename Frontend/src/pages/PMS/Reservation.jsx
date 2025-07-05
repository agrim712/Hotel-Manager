import React, { useState } from 'react';
import { FaDownload, FaUpload, FaSearch, FaPlus, FaEdit, FaTrash,FaFileInvoice } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { useReservationContext } from '../../context/ReservationContext';
import { downloadInvoice } from './ReservationApi';
import { toast } from 'react-toastify';
const Reservation = () => {
  const navigate = useNavigate();
  const {
    reservations,
    loading,
    error,
    fetchReservations,
    deleteReservation
  } = useReservationContext();
  
  const [loadingInvoice, setLoadingInvoice] = useState(null);

  const handleGenerateInvoice = async (reservationId) => {
    const toastId = toast.loading('Generating invoice...');
    setLoadingInvoice(reservationId);
    
    try {
      await downloadInvoice(reservationId);
      toast.update(toastId, {
        render: 'Invoice downloaded successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });
    } catch (error) {
      toast.update(toastId, {
        render: 'Failed to generate invoice',
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
      console.error('Invoice generation error:', error);
    } finally {
      setLoadingInvoice(null);
    }
  };
  const [generatingBill, setGeneratingBill] = useState(null);

const handleGenerateBill = async (reservationId) => {
  console.log("Clicked")
  const toastId = toast.loading('Generating bill...');
  setGeneratingBill(reservationId);
  
  try {
    await generateBill(reservationId);
    toast.update(toastId, {
      render: 'Bill generated successfully!',
      type: 'success',
      isLoading: false,
      autoClose: 3000
    });
  } catch (error) {
    toast.update(toastId, {
      render: 'Failed to generate bill',
      type: 'error',
      isLoading: false,
      autoClose: 3000
    });
    console.error('Bill generation error:', error);
  } finally {
    setGeneratingBill(null);
  }
};

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

  const formatDisplayDate = (date) =>
    date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const formatDisplayTime = (date) =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Checked in': return 'bg-green-100 text-green-800';
      case 'Unassigned': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ActionButton = ({ icon, text, onClick, variant = 'default' }) => {
    const variants = {
      default: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
      primary: 'bg-blue-500 text-white hover:bg-blue-600',
      secondary: 'bg-green-500 text-white hover:bg-green-600',
      danger: 'bg-red-500 text-white hover:bg-red-600'
    };
    return (
      <button
        onClick={onClick}
        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition ${variants[variant]}`}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {text}
      </button>
    );
  };

  const handleSearch = async () => {
    try {
      const params = {
        fromDate: filters.dateRange.from.toISOString(),
        toDate: filters.dateRange.to.toISOString(),
        searchText: filters.searchText,
        filterOption: filters.filterOption
      };
      await fetchReservations(params);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleDelete = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      try {
        await deleteReservation(bookingId);
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const handleEdit = (bookingId) => {
    navigate(`/pmss/reservation/edit/${bookingId}`);
  };

  const handleCreateReservation = (type = 'regular') => {
    navigate(`/pmss/reservation/create/${type}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-200 p-6">
      <div className="bg-white/40 backdrop-blur-md shadow-lg rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-indigo-800 drop-shadow-lg uppercase tracking-wider border-b-4 border-indigo-300 pb-2">Reservation Dashboard</h1>
          <div className="flex flex-wrap gap-2">
            <ActionButton icon={<FaPlus />} text="Create" onClick={() => handleCreateReservation()} variant="primary" />
            <ActionButton icon={<FaPlus />} text="Complimentary" onClick={() => handleCreateReservation('complimentary')} variant="secondary" />
            <ActionButton icon={<FaPlus />} text="Out of Order" onClick={() => handleCreateReservation('outoforder')} variant="danger" />
            <ActionButton icon={<FaPlus />} text="Groups" onClick={() => handleCreateReservation('group')} variant="primary" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">From Date</label>
            <DatePicker
              selected={filters.dateRange.from}
              onChange={(date) =>
                setFilters((prev) => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, from: date }
                }))
              }
              selectsStart
              startDate={filters.dateRange.from}
              endDate={filters.dateRange.to}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">To Date</label>
            <DatePicker
              selected={filters.dateRange.to}
              onChange={(date) =>
                setFilters((prev) => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, to: date }
                }))
              }
              selectsEnd
              startDate={filters.dateRange.from}
              endDate={filters.dateRange.to}
              minDate={filters.dateRange.from}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Filter Option</label>
            <select
              value={filters.filterOption}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  filterOption: e.target.value
                }))
              }
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2"
            >
              <option>Booking Date</option>
              <option>Booking ID</option>
              <option>Customer Name</option>
              <option>Phone Number</option>
              <option>Email</option>
            </select>
          </div>
          <div className="flex items-end">
            <ActionButton icon={<FaSearch />} text="Search" onClick={handleSearch} variant="primary" />
          </div>
        </div>

        {filters.filterOption !== 'Booking Date' && (
          <div className="mt-4">
            <input
              type="text"
              placeholder={`Search by ${filters.filterOption}`}
              value={filters.searchText}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  searchText: e.target.value
                }))
              }
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        )}
      </div>

      <div className="bg-white/50 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-blue-700">Loading reservations...</div>
        ) : error ? (
          <div className="p-6 text-red-700">Error: {error}</div>
        ) : reservations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No reservations found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-indigo-100 text-indigo-800 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-3 text-left">Booking ID</th>
                  <th className="px-6 py-3 text-left">Customer</th>
                  <th className="px-6 py-3 text-left">Booked On</th>
                  <th className="px-6 py-3 text-left">Check-In</th>
                  <th className="px-6 py-3 text-left">Check-In Time</th>
                  <th className="px-6 py-3 text-left">Check-Out</th>
                  <th className="px-6 py-3 text-left">Check-Out Time</th>
                  <th className="px-6 py-3 text-left">Guests</th>
                  <th className="px-6 py-3 text-left">Rooms</th>
                  <th className="px-6 py-3 text-left">Amount</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservations.map((reservation) => {
                  const checkInDate = new Date(reservation.checkIn);
                  const checkOutDate = new Date(reservation.checkOut);
                  return (
                    <tr key={reservation.id}>
                      <td className="px-6 py-3">{reservation.id}</td>
                      <td className="px-6 py-3">{reservation.guestName}</td>
                      <td className="px-6 py-3">{formatDisplayDate(new Date(reservation.createdAt))}</td>
                      <td className="px-6 py-3">{formatDisplayDate(checkInDate)}</td>
                      <td className="px-6 py-3">{formatDisplayTime(checkInDate)}</td>
                      <td className="px-6 py-3">{formatDisplayDate(checkOutDate)}</td>
                      <td className="px-6 py-3">{formatDisplayTime(checkOutDate)}</td>
                      <td className="px-6 py-3">{reservation.guests}</td>
                      <td className="px-6 py-3">{reservation.rooms}</td>
                      <td className="px-6 py-3">{reservation.totalAmount?.toFixed(2) || 'N/A'}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(reservation.status || 'Confirmed')}`}>
                          {reservation.status || 'Confirmed'}
                        </span>
                      </td>
                      <td className="px-6 py-3 space-x-2">
                        <button onClick={() => handleEdit(reservation.id)} className="text-indigo-600 hover:text-indigo-800">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(reservation.id)} className="text-red-600 hover:text-red-800">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservation;
