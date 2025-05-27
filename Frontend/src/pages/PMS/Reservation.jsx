import React, { useState } from 'react';
import { FaDownload, FaUpload, FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom'; 
import { useReservationContext } from '../../context/ReservationContext';

const Reservation = () => {
  const navigate = useNavigate();

  // ✅ Use context inside the component
  const { reservations, setReservations } = useReservationContext();

  const handleCreateReservation2 = () => {
    navigate('/pmss/reservation/create');
  };

  const [dateRange, setDateRange] = useState({
    from: new Date(2024, 2, 23),
    to: new Date(2024, 2, 31),
  });
  const [showCancelled, setShowCancelled] = useState(false);
  const [filterOption, setFilterOption] = useState('Booking Date');
  const [searchText, setSearchText] = useState('');

  // Style function
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

  const handleDownload = () => {
    console.log('Download clicked');
  };

  const handleUpload = () => {
    console.log('Upload clicked');
  };

  const handleSearch = () => {
    console.log('Search clicked with filters:', { dateRange, showCancelled, filterOption, searchText });
  };

  const handleCreateReservation = (type) => {
    console.log(`Create ${type} reservation clicked`);
  };

  const handleEdit = (bookingId) => {
    console.log(`Edit clicked for booking ID: ${bookingId}`);
  };

  const handleDelete = (bookingId) => {
    console.log(`Delete clicked for booking ID: ${bookingId}`);
    setReservations(reservations.filter(reservation => reservation.bookingId !== bookingId));
  };

  const filteredReservations = reservations.filter(reservation => {
    const checkInDate = new Date(reservation.checkIn.replace(/(\w+) (\d+), (\d+)/, '$1 $2, 20$3'));
    const checkOutDate = new Date(reservation.checkOut.replace(/(\w+) (\d+), (\d+)/, '$1 $2, 20$3'));

    const isWithinDateRange = checkInDate >= dateRange.from && checkOutDate <= dateRange.to;
    const matchesCancelled = showCancelled || reservation.status !== 'Cancelled';

    const matchesSearch =
      filterOption === 'Booking ID' && reservation.bookingId.toLowerCase().includes(searchText.toLowerCase()) ||
      filterOption === 'Customer Name' && reservation.customerName.toLowerCase().includes(searchText.toLowerCase());

    if (searchText) {
      return isWithinDateRange && matchesCancelled && matchesSearch;
    }

    return isWithinDateRange && matchesCancelled;
  });

  return (
    <div className="p-6">
      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Reservation Data</h2>
          <div className="flex space-x-2">
                  <button
                   className="flex items-center px-4 py-2 rounded-md text-sm font-medium bg-blue-500 text-white hover:bg-blue-600"
                   onClick={handleCreateReservation2}
                  >
                  <FaPlus className="mr-2" />
                  Create Reservation
                  </button>
            <ActionButton
              icon={<FaPlus />}
              text="Complimentary"
              onClick={() => handleCreateReservation('complimentary')}
              variant="secondary"
            />
            <ActionButton
              icon={<FaPlus />}
              text="Out of Order"
              onClick={() => handleCreateReservation('out-of-order')}
              variant="danger"
            />
            <ActionButton
              icon={<FaPlus />}
              text="Groups"
              onClick={() => handleCreateReservation('groups')}
              variant="primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">From Date</label>
            <DatePicker
              selected={dateRange.from}
              onChange={(date) => setDateRange({ ...dateRange, from: date })}
              selectsStart
              startDate={dateRange.from}
              endDate={dateRange.to}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">To Date</label>
            <DatePicker
              selected={dateRange.to}
              onChange={(date) => setDateRange({ ...dateRange, to: date })}
              selectsEnd
              startDate={dateRange.from}
              endDate={dateRange.to}
              minDate={dateRange.from}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Filter Options</label>
            <select
              value={filterOption}
              onChange={(e) => setFilterOption(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              <option>Booking Date</option>
              <option>Booking ID</option>
              <option>Customer Name</option>
            </select>
          </div>
          <div className="flex items-end">
            <ActionButton
              text="Submit"
              onClick={handleSearch}
              variant="primary"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="cancelled"
                checked={showCancelled}
                onChange={() => setShowCancelled(!showCancelled)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="cancelled" className="ml-2 block text-sm text-gray-700">
                Cancelled bookings
              </label>
            </div>

            {filterOption !== 'Booking Date' && (
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder={`Search by ${filterOption}`}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
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
              onClick={handleDownload}
            />
            <ActionButton
              icon={<FaUpload />}
              text="Upload"
              onClick={handleUpload}
            />
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booked On</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CheckIn</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CheckOut</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rooms</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nights</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Mode</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meal Plan</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Action</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReservations.map(reservation => (
              <tr key={reservation.bookingId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.bookingId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.customerName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reservation.bookedOn}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reservation.checkIn}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reservation.checkOut}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reservation.source}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reservation.guests}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reservation.rooms}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reservation.nights}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reservation.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reservation.paymentMode}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reservation.mealPlan}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getStatusStyle(reservation.status)} rounded-full text-center`}>{reservation.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(reservation.bookingId)} className="text-indigo-600 hover:text-indigo-900 mr-2">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(reservation.bookingId)} className="text-red-600 hover:text-red-900">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reservation;