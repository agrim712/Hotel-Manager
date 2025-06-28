import React, { useState, useEffect,useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AvailableRoomNumbers from '../../Components/Selects/RoomNumbers';
// import RoomAndRateSection from "../../Components/Selects/RoomAndRateSection";
import RateTypeSelect from '../../Components/Selects/RateTypeSelect';
import RoomTypeSelect from '../../Components/Selects/RoomTypeSelect';
import NumberOfRoomsDropdown from '../../Components/Selects/NoOfRoomTypeSelect';
import MaxGuestsInput from '../../Components/Selects/MaxGuests';
// Reusable Input Component
const FormInput = ({ label, name, value, onChange, type = 'text', error, required = false, ...props }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${
        error ? 'border-red-500' : ''
      }`}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

// Reusable Select Component
const FormSelect = ({ label, name, value, onChange, options, error, required = false }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${
        error ? 'border-red-500' : ''
      }`}
    >
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const ComplimentaryBookingForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRoomNumbers, setSelectedRoomNumbers] = useState([]);
  const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
  const COUNTRY_API_URL = 'https://api.countrystatecity.in/v1/countries';

  // Initial form state
  const initialFormState = {
    rateType: '',
    checkInDate: '',
    checkInTime: '14:00', // Default check-in time (2 PM)
    checkOutDate: '',
    checkOutTime: '12:00', // Default check-out time (12 PM)
    nights: 0,
    roomType: '',
    numberOfGuests: '',
    rooms: 1,
    bookedBy: '',
    businessSegment: 'Management Block',
    billTo: 'Guest',
    paymentMode: 'Cash',
    perDayRate: '0',
    perDayTax: '0',
    taxInclusive: true,
    guestName: '',
    email: '',
    phone: '',
    dob: null,
    gender: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    specialRequest: '',
    identity: '',
    idDetail: '',
    photoId: null,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [countryOptions, setCountryOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);

  // API key and headers for CountryStateCity API
  const API_KEY = import.meta.env.VITE_API_KEY;
  console.log("API_KEY", API_KEY); // This should print the actual API key

  const headers = {
    'X-CSCAPI-KEY': API_KEY,
  };

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await axios.get(COUNTRY_API_URL, { headers });
        const options = res.data.map((country) => ({
          value: country.iso2,
          label: country.name,
        }));
        setCountryOptions(options);
      } catch (err) {
        console.error('Error fetching countries:', err);
      }
    };
    fetchCountries();
  }, []);

  // Fetch cities when country changes
  useEffect(() => {
    if (!formData.country) {
      setCityOptions([]);
      setFormData((prev) => ({ ...prev, city: '' }));
      return;
    }

const fetchCities = async () => {
  try {
    const res = await axios.get(
      `https://api.countrystatecity.in/v1/countries/${formData.country}/cities`,
      { headers }
    );

    const options = res.data.map((city) => ({
      value: city.id,     // ✅ Use city.id here
      label: city.name,
    }));

    setCityOptions(options);
  } catch (err) {
    console.error('Error fetching cities:', err);
    setCityOptions([]);
  }
};



    fetchCities();
  }, [formData.country]);

  // Calculate nights whenever dates change
useEffect(() => {
  if (formData.checkInDate && formData.checkOutDate && formData.checkInTime && formData.checkOutTime) {
    const checkIn = combineDateAndTime(formData.checkInDate, formData.checkInTime);
    const checkOut = combineDateAndTime(formData.checkOutDate, formData.checkOutTime);
    
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
    
    setFormData((prev) => ({
      ...prev,
      nights: diffDays,
    }));
  } else {
    setFormData((prev) => ({ ...prev, nights: 0 }));
  }
}, [formData.checkInDate, formData.checkOutDate, formData.checkInTime, formData.checkOutTime]);

  // Handle generic input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log("👂 HandleChange:", name, value); 
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle date picker changes
  const handleDateChange = (date, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date,
    }));
  };

const handleRoomNumbersChange = useCallback((rooms) => {
  setSelectedRoomNumbers(rooms);
  setFormData(prev => ({ ...prev, roomNumbers: rooms }));
}, []);

  const handleRoomNumberChange = useCallback((numRooms) => {
    setFormData(prev => ({ ...prev, numRooms }));
  }, [])
  // Handle file input change
  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      photoId: e.target.files[0],
    }));
  };

  // Toggle tax inclusive checkbox
  const toggleTaxInclusive = () => {
    setFormData((prev) => ({
      ...prev,
      taxInclusive: !prev.taxInclusive,
    }));
  };

  // Form validation
  const validateForm = () => {
      const newErrors = {};

  // Existing date validations
  if (!formData.checkInDate) newErrors.checkInDate = 'Check-in date is required';
  if (!formData.checkOutDate) newErrors.checkOutDate = 'Check-out date is required';
  if (
    formData.checkInDate &&
    formData.checkOutDate &&
    formData.checkOutDate <= formData.checkInDate
  ) {
    // If dates are same, check times
    if (formData.checkOutDate.getTime() === formData.checkInDate.getTime()) {
      if (!formData.checkOutTime || !formData.checkInTime) {
        newErrors.checkOutTime = 'Check-out time must be after check-in time';
      } else if (formData.checkOutTime <= formData.checkInTime) {
        newErrors.checkOutTime = 'Check-out time must be after check-in time';
      }
    } else {
      newErrors.checkOutDate = 'Check-out date must be after check-in date';
    }
  }

  // New time validations
  if (!formData.checkInTime) newErrors.checkInTime = 'Check-in time is required';
  if (!formData.checkOutTime) newErrors.checkOutTime = 'Check-out time is required';

    if (!formData.guestName) newErrors.guestName = 'Guest name is required';

    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = 'Phone number must be 10 digits';

    if (!formData.address) newErrors.address = 'Address is required';

    if (!formData.country) newErrors.country = 'Country is required';

    if (!formData.city) newErrors.city = 'City is required';

    if (!formData.gender) newErrors.gender = 'Gender is required';

    if (!formData.paymentMode) newErrors.paymentMode = 'Payment mode is required';

    // if (!formData.ratePlan) newErrors.ratePlan = 'Rate plan is required';

    if (!formData.perDayRate) newErrors.perDayRate = 'Per day rate is required';
    else if (isNaN(formData.perDayRate))
      newErrors.perDayRate = 'Per day rate must be a number';

      setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
  };

  // Calculate total amount based on rate, tax, nights, rooms
  const calculateTotalAmount = () => {
    const rate = parseFloat(formData.perDayRate) || 0;
    const tax = parseFloat(formData.perDayTax) || 0;
    const rooms = parseInt(formData.rooms) || 1;
    const nights = formData.nights || 0;
    const totalPerDay = formData.taxInclusive ? rate : rate + tax;
    return totalPerDay * nights * rooms;
  };

  // Reset form after successful submission
  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
    setCityOptions([]);
  };

  // Submit handler
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) {
    console.log("🚫 Form validation failed, submission aborted.");
    return;
  }
  
  setIsSubmitting(true);
  setSuccessMessage(''); // clear previous messages

  try {
    const formDataToSend = new FormData();

    // Handle photo upload if exists
    if (formData.photoId) {
      formDataToSend.append('photo', formData.photoId);
    }

    // Combine date and time for check-in and check-out
    const checkInDateTime = combineDateAndTime(formData.checkInDate, formData.checkInTime);
    const checkOutDateTime = combineDateAndTime(formData.checkOutDate, formData.checkOutTime);

    // Add the combined DateTime objects to form data
    formDataToSend.append('checkInDate', checkInDateTime.toISOString());
    formDataToSend.append('checkOutDate', checkOutDateTime.toISOString());

    // Process all other form fields
    for (const key in formData) {
      // Skip photoId (already handled) and date/time fields (we're using combined versions)
      if (key === 'photoId' || key === 'checkInTime' || key === 'checkOutTime') continue;
      
      // Skip the original date fields (we're using combined versions)
      if (key === 'checkInDate' || key === 'checkOutDate') continue;
      
      const value = formData[key];
      
      if (value instanceof Date) {
        formDataToSend.append(key, value.toISOString());
      } else if (value !== null && value !== undefined) {
        formDataToSend.append(key, value);
      }
    }

    // Log form data for debugging
    for (let pair of formDataToSend.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    const token = localStorage.getItem('token');

    // Send the request
    await axios.post('http://localhost:5000/api/hotel/reservation/create', formDataToSend, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    // Show success messages
    toast.success('Reservation created successfully');
    setSuccessMessage('Reservation created successfully!');
    resetForm();
  } catch (error) {
    console.error('Reservation creation error:', error);
    toast.error(
      error.response?.data?.message || 
      'Failed to create reservation. Please try again.'
    );
  } finally {
    setIsSubmitting(false);
  }
};

// Helper function to combine date and time strings into a Date object
const combineDateAndTime = (date, timeStr) => {
  if (!date || !timeStr) return null;
  
  const [hours, minutes] = timeStr.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
};

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Create New Reservation</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dates and Nights */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check In Date <span className="text-red-500">*</span>
            </label>
            <DatePicker
              selected={formData.checkInDate}
              onChange={(date) => handleDateChange(date, 'checkInDate')}
              selectsStart
              startDate={formData.checkInDate}
              endDate={formData.checkOutDate}
              minDate={new Date()}
              className={`mt-1 block w-full rounded-md border p-2 ${
                errors.checkInDate ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholderText="Select Check-in Date"
            />
            {errors.checkInDate && <p className="text-red-600 text-sm mt-1">{errors.checkInDate}</p>}
          </div>
            <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Check In Time <span className="text-red-500">*</span>
    </label>
    <input
      type="time"
      name="checkInTime"
      value={formData.checkInTime}
      onChange={handleChange}
      className={`mt-1 block w-full rounded-md border p-2 ${
        errors.checkInTime ? 'border-red-500' : 'border-gray-300'
      }`}
    />
    {errors.checkInTime && <p className="text-red-600 text-sm mt-1">{errors.checkInTime}</p>}
  </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check Out Date <span className="text-red-500">*</span>
            </label>
            <DatePicker
              selected={formData.checkOutDate}
              onChange={(date) => handleDateChange(date, 'checkOutDate')}
              selectsEnd
              startDate={formData.checkInDate}
              endDate={formData.checkOutDate}
              minDate={formData.checkInDate || new Date()}
              className={`mt-1 block w-full rounded-md border p-2 ${
                errors.checkOutDate ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholderText="Select Check-out Date"
            />
            {errors.checkOutDate && (
              <p className="text-red-600 text-sm mt-1">{errors.checkOutDate}</p>
            )}
          </div>
            <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Check Out Time <span className="text-red-500">*</span>
    </label>
    <input
      type="time"
      name="checkOutTime"
      value={formData.checkOutTime}
      onChange={handleChange}
      className={`mt-1 block w-full rounded-md border p-2 ${
        errors.checkOutTime ? 'border-red-500' : 'border-gray-300'
      }`}
    />
    {errors.checkOutTime && <p className="text-red-600 text-sm mt-1">{errors.checkOutTime}</p>}
  </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nights</label>
            <input
              type="number"
              readOnly
              value={formData.nights}
              className="mt-1 block w-full rounded-md border-gray-300 p-2 bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Room Type, Rate Plan, Quiet, Rooms */}
        
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
      {/* Room Type */}
      <RoomTypeSelect
        value={formData.roomType}
        onChange={(val) =>
          setFormData((prev) => ({
            ...prev,
            roomType: val,
            rateType: "",
            numberOfGuests: "",
            numRooms: "",
            roomNumbers: [],
          }))
        }
        token={localStorage.getItem("token")}
      />

      {/* Rate Type */}
      <RateTypeSelect
        roomType={formData.roomType}
        value={formData.rateType}
        onChange={(val) =>
          setFormData((prev) => ({ ...prev, rateType: val }))
        }
        token={localStorage.getItem("token")}
      />

      {/* Max Guests */}
      <MaxGuestsInput
        roomType={formData.roomType}
        rateType={formData.rateType}
        token={localStorage.getItem("token")}
        onChange={(value) =>
          setFormData((prev) => ({ ...prev, numberOfGuests: value }))
        }
      />

      {/* Number of Rooms */}
      <NumberOfRoomsDropdown
        roomType={formData.roomType}
        rateType={formData.rateType}
        token={localStorage.getItem("token")}
        checkInDate={formData.checkInDate}
        checkInTime={formData.checkInTime}
        checkOutDate={formData.checkOutDate}
        checkOutTime={formData.checkOutTime}
              onSelect={handleRoomNumberChange}
      />
    </div>



      

        {/* Booked By, Business Segment, Bill To, Payment Mode */}
        <div className="grid grid-cols-4 gap-6">
          <FormInput
            label="Booked By"
            name="bookedBy"
            value={formData.bookedBy}
            onChange={handleChange}
          />

          <FormSelect
            label="Business Segment"
            name="businessSegment"
            value={formData.businessSegment}
            onChange={handleChange}
              options={[
    { value: 'Management Block', label: 'Management Block' }, // Only show this option
  ]}
            readOnly
          />

          <FormInput label="Bill To" name="billTo" value={formData.billTo} onChange={handleChange} readOnly/>

          <FormSelect
            label="Payment Mode"
            name="paymentMode"
            value={formData.paymentMode}
            onChange={handleChange}
            options={[
              { value: 'Cash', label: 'Cash' },
            ]}
            error={errors.paymentMode}
            required={true}
          />
        </div>

        {/* Per Day Rate, Per Day Tax, Tax Inclusive */}
        <div className="grid grid-cols-3 gap-6 items-center">
          <FormInput
            label="Per Day Rate"
            name="perDayRate"
            value={formData.perDayRate}
            onChange={handleChange}
            error={errors.perDayRate}
            required={true}
            type="number"
            readOnly
          />

          <FormInput
            label="Per Day Tax"
            name="perDayTax"
            value={formData.perDayTax}
            onChange={handleChange}
            type="number"
            readOnly
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="taxInclusive"
              checked={formData.taxInclusive}
              onChange={toggleTaxInclusive}
            />
            <label className="text-sm font-medium text-gray-700 cursor-pointer">
              Tax Inclusive
            </label>
          </div>
        </div>

        {/* Total Amount (calculated) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
          <input
            type="text"
            readOnly
            value={calculateTotalAmount().toFixed(2)}
            className="mt-1 block w-full rounded-md border-gray-300 p-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Room No, Guest Name, Email, Phone */}
        <div className="grid grid-cols-4 gap-6">

<AvailableRoomNumbers
  roomType={formData.roomType}
  rateType={formData.rateType}
  checkInDate={formData.checkInDate}
  checkOutDate={formData.checkOutDate}
  token={localStorage.getItem("token")}
  onChange={handleRoomNumbersChange}
  initialSelectedRooms={formData.roomNumbers || []}
/>


          <FormInput
            label="Guest Name"
            name="guestName"
            value={formData.guestName}
            onChange={handleChange}
            error={errors.guestName}
            required={true}
          />

          <FormInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />

          <FormInput
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            required={true}
          />
        </div>

        {/* DOB, Gender, Address, Country, City */}
        <div className="grid grid-cols-5 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">DOB</label>
            <DatePicker
              selected={formData.dob}
              onChange={(date) => handleDateChange(date, 'dob')}
              maxDate={new Date()}
              className="mt-1 block w-full rounded-md border-gray-300 p-2"
              placeholderText="Select DOB"
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
            />
          </div>

          <FormSelect
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' },
            ]}
            error={errors.gender}
            required={true}
          />

          <FormInput
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            error={errors.address}
            required={true}
          />

          <FormSelect
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            options={countryOptions}
            error={errors.country}
            required={true}
          />

          <FormSelect
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            options={cityOptions}
            error={errors.city}
            required={true}
          />
        </div>

        {/* State, Zip */}
        <div className="grid grid-cols-2 gap-6">
          <FormInput label="State" name="state" value={formData.state} onChange={handleChange} />
          <FormInput label="Zip" name="zip" value={formData.zip} onChange={handleChange} />
        </div>

        {/* Special Request, Identity, ID Detail, Photo Id */}
        <div className="grid grid-cols-4 gap-6">
          <FormInput
            label="Special Request"
            name="specialRequest"
            value={formData.specialRequest}
            onChange={handleChange}
          />

          <FormInput label="Identity" name="identity" value={formData.identity} onChange={handleChange} />

          <FormInput label="ID Detail" name="idDetail" value={formData.idDetail} onChange={handleChange} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo ID</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Create Reservation'}
          </button>
        </div>
      </form>
            {successMessage && (
        <div className="success-message" style={{ marginTop: '10px', color: 'green' }}>
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default ComplimentaryBookingForm;