import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import RoomTypeSelect from '../../Components/Selects/RoomTypeSelect';
import RateTypeSelect from '../../Components/Selects/RateTypeSelect';
import NumberOfRoomsDropdown from '../../Components/Selects/NoOfRoomTypeSelect';
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

const CreateReservation = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const COUNTRY_API_URL = 'https://api.countrystatecity.in/v1/countries';

  // Initial form state
  const initialFormState = {
    checkInDate: null,
    checkOutDate: null,
    nights: 0,
    roomType: '',
    ratePlan: '',
    numberOfGuests: '',
    rooms: 1,
    bookedBy: '',
    businessSegment: 'Walk-in',
    billTo: '',
    paymentMode: 'Cash',
    perDayRate: '',
    perDayTax: '',
    taxInclusive: true,
    roomNo: '',
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
          value: city.name,
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
    if (formData.checkInDate && formData.checkOutDate) {
      const diffTime = formData.checkOutDate.getTime() - formData.checkInDate.getTime();
      const diffDays = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
      setFormData((prev) => ({
        ...prev,
        nights: diffDays,
      }));
    } else {
      setFormData((prev) => ({ ...prev, nights: 0 }));
    }
  }, [formData.checkInDate, formData.checkOutDate]);

  // Handle generic input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
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

    if (!formData.checkInDate) newErrors.checkInDate = 'Check-in date is required';
    if (!formData.checkOutDate) newErrors.checkOutDate = 'Check-out date is required';
    if (
      formData.checkInDate &&
      formData.checkOutDate &&
      formData.checkOutDate <= formData.checkInDate
    )
      newErrors.checkOutDate = 'Check-out date must be after check-in date';

    if (!formData.guestName) newErrors.guestName = 'Guest name is required';

    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = 'Phone number must be 10 digits';

    if (!formData.address) newErrors.address = 'Address is required';

    if (!formData.country) newErrors.country = 'Country is required';

    if (!formData.city) newErrors.city = 'City is required';

    if (!formData.gender) newErrors.gender = 'Gender is required';

    if (!formData.paymentMode) newErrors.paymentMode = 'Payment mode is required';

    if (!formData.ratePlan) newErrors.ratePlan = 'Rate plan is required';

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
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      if (formData.photoId) {
        formDataToSend.append('photo', formData.photoId);
      }

      // Append all other fields
      for (const key in formData) {
        if (key === 'photoId') continue;
        const value = formData[key];

        if (value instanceof Date) {
          formDataToSend.append(key, value.toISOString());
        } else {
          formDataToSend.append(key, value);
        }
      }

      // Send request to backend API (replace URL with your actual endpoint)
      await axios.post('http://localhost:8080/api/reservation/create', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Reservation created successfully');
      resetForm();
      navigate('/reservationList');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create reservation');
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="grid grid-cols-4 gap-6">
<RoomTypeSelect
  formData={formData}
  handleChange={handleChange}
  errors={errors}
/>
<RateTypeSelect
  roomType={formData.roomType}
  formData={formData}
  handleChange={handleChange}
  errors={errors}
/>


<div className="mb-4">
  <label htmlFor="numberOfGuests" className="block text-sm font-medium text-gray-700 mb-1">
    Number of guests in each room
  </label>
  <input
    type="number"
    id="numberOfGuests"
    name="numberOfGuests"
    value={formData.numberOfGuests}
    onChange={handleChange}
    min={1}
    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter number of guests"
  />
</div>


<NumberOfRoomsDropdown
  roomType={formData.roomType}
  rateType={formData.rateType}
  token={localStorage.getItem("token")}
  onSelect={(value) => setFormData({ ...formData, numRooms: value })}
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
              { value: 'Walk-in', label: 'Walk-in' },
              { value: 'Corporate', label: 'Corporate' },
              { value: 'Online', label: 'Online' },
            ]}
          />

          <FormInput label="Bill To" name="billTo" value={formData.billTo} onChange={handleChange} />

          <FormSelect
            label="Payment Mode"
            name="paymentMode"
            value={formData.paymentMode}
            onChange={handleChange}
            options={[
              { value: 'Cash', label: 'Cash' },
              { value: 'Credit Card', label: 'Credit Card' },
              { value: 'Online', label: 'Online' },
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
          />

          <FormInput
            label="Per Day Tax"
            name="perDayTax"
            value={formData.perDayTax}
            onChange={handleChange}
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
          <FormInput label="Room No" name="roomNo" value={formData.roomNo} onChange={handleChange} />

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
    </div>
  );
};

export default CreateReservation;
