import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Reusable Form Input Component
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

// Reusable Form Select Component
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

  // Initial form state
  const initialFormState = {
    checkInDate: null,
    checkOutDate: null,
    nights: 0,
    roomType: 'Executive',
    ratePlan: '',
    quiet: true,
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
    dob: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    specialRequest: '',
    identity: '',
    idDetail: '',
    photoId: null
  };

  const [formData, setFormData] = useState(initialFormState);

  // Calculate nights when check-in or check-out dates change
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      const diffTime = Math.abs(formData.checkOutDate - formData.checkInDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setFormData((prev) => ({
        ...prev,
        nights: diffDays
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        nights: 0
      }));
    }
  }, [formData.checkInDate, formData.checkOutDate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (date, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      photoId: e.target.files[0]
    }));
  };

  const toggleTaxInclusive = () => {
    setFormData((prev) => ({
      ...prev,
      taxInclusive: !prev.taxInclusive
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.checkInDate) newErrors.checkInDate = 'Check-in date is required';
    if (!formData.checkOutDate) newErrors.checkOutDate = 'Check-out date is required';
    if (!formData.guestName) newErrors.guestName = 'Guest name is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.paymentMode) newErrors.paymentMode = 'Payment mode is required';
    if (!formData.perDayRate || isNaN(formData.perDayRate)) newErrors.perDayRate = 'Valid rate is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalAmount = () => {
    const rate = parseFloat(formData.perDayRate) || 0;
    const tax = parseFloat(formData.perDayTax) || 0;
    const totalPerDay = formData.taxInclusive ? rate : rate + tax;
    return totalPerDay * formData.nights;
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      if (formData.photoId) {
        formDataToSend.append('photo', formData.photoId);
      }

      const reservationData = {
        check_in_date: formData.checkInDate.toISOString(),
        check_out_date: formData.checkOutDate.toISOString(),
        nights: formData.nights,
        room_type: formData.roomType,
        room_no: formData.roomNo,
        guest_name: formData.guestName,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}, ${formData.country}`,
        payment_mode: formData.paymentMode,
        amount: calculateTotalAmount(),
        status: 'Confirmed',
        business_segment: formData.businessSegment,
        special_request: formData.specialRequest
      };

      formDataToSend.append('data', JSON.stringify(reservationData));

      const response = await axios.post('/api/reservations', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Reservation created successfully!');
      resetForm();
      navigate('/pmss/reservation');
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error(error.response?.data?.message || 'Failed to create reservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roomTypeOptions = [
    { value: 'Super Deluxe', label: 'Super Deluxe' },
    { value: 'Executive', label: 'Executive' },
    { value: 'Suite', label: 'Suite' }
  ];

  const businessSegmentOptions = [
    { value: 'Walk-in', label: 'Walk-in' },
    { value: 'Corporate', label: 'Corporate' },
    { value: 'OTA', label: 'OTA' },
    { value: 'Travel Agent', label: 'Travel Agent' },
    { value: 'Sales Team', label: 'Sales Team' }
  ];

  const paymentModeOptions = [
    { value: 'Cash', label: 'Cash' },
    { value: 'Credit Card', label: 'Credit Card' },
    { value: 'Bill to Company', label: 'Bill to Company' },
    { value: 'Wallet', label: 'Wallet' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'Accounts Cash', label: 'Accounts Cash' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">New Reservation</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">Booking</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Check-in Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={formData.checkInDate}
                onChange={(date) => handleDateChange(date, 'checkInDate')}
                selectsStart
                startDate={formData.checkInDate}
                endDate={formData.checkOutDate}
                minDate={new Date()}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${
                  errors.checkInDate ? 'border-red-500' : ''
                }`}
                placeholderText="Select check-in date"
              />
              {errors.checkInDate && (
                <p className="mt-1 text-sm text-red-600">{errors.checkInDate}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Check-out Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={formData.checkOutDate}
                onChange={(date) => handleDateChange(date, 'checkOutDate')}
                selectsEnd
                startDate={formData.checkInDate}
                endDate={formData.checkOutDate}
                minDate={formData.checkInDate || new Date()}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${
                  errors.checkOutDate ? 'border-red-500' : ''
                }`}
                placeholderText="Select check-out date"
              />
              {errors.checkOutDate && (
                <p className="mt-1 text-sm text-red-600">{errors.checkOutDate}</p>
              )}
            </div>

            <FormInput
              label="Nights"
              name="nights"
              value={formData.nights}
              readOnly
              className="bg-gray-100"
            />

            <FormSelect
              label="Room Type"
              name="roomType"
              value={formData.roomType}
              onChange={handleChange}
              options={roomTypeOptions}
            />

            <FormInput
              label="Rate Plan"
              name="ratePlan"
              value={formData.ratePlan}
              onChange={handleChange}
            />

            <div className="space-y-1 flex items-center">
              <input
                type="checkbox"
                name="quiet"
                checked={formData.quiet}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 block text-sm text-gray-700">Quiet!</label>
            </div>

            <div className="space-y-1">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <FormInput
                    label="Guest"
                    name="bookedBy"
                    value={formData.bookedBy}
                    onChange={handleChange}
                  />
                </div>
                <div className="w-20">
                  <FormInput
                    label="# Rooms"
                    name="rooms"
                    type="number"
                    value={formData.rooms}
                    onChange={handleChange}
                    min="1"
                  />
                </div>
              </div>
            </div>

            <FormSelect
              label="Business Segment"
              name="businessSegment"
              value={formData.businessSegment}
              onChange={handleChange}
              options={businessSegmentOptions}
            />

            <FormInput
              label="Bill To"
              name="billTo"
              value={formData.billTo}
              onChange={handleChange}
            />

            <FormSelect
              label="Payment Mode"
              name="paymentMode"
              value={formData.paymentMode}
              onChange={handleChange}
              options={paymentModeOptions}
              error={errors.paymentMode}
              required
            />

            <FormInput
              label="Per day Rate"
              name="perDayRate"
              value={formData.perDayRate}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  handleChange(e);
                }
              }}
              error={errors.perDayRate}
              required
            />

            <FormInput
              label="Per day Tax"
              name="perDayTax"
              value={formData.perDayTax}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  handleChange(e);
                }
              }}
            />

            <div className="space-y-1 flex items-center">
              <button
                type="button"
                onClick={toggleTaxInclusive}
                className={`h-4 w-4 rounded border-gray-300 focus:ring-blue-500 flex items-center justify-center ${
                  formData.taxInclusive ? 'bg-blue-600 text-white' : 'bg-white border'
                }`}
              >
                {formData.taxInclusive && (
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
              <label className="ml-2 block text-sm text-gray-700">Tax Inclusive</label>
            </div>

            <FormInput
              label="Room No"
              name="roomNo"
              value={formData.roomNo}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">Guest Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Name"
              name="guestName"
              value={formData.guestName}
              onChange={handleChange}
              error={errors.guestName}
              required
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
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              pattern="[0-9]{10}"
              error={errors.phone}
              required
            />

            <FormInput
              label="Date of Birth"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
            />

            <FormInput
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            />

            <FormInput
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
              required
              className="md:col-span-2"
            />

            <FormInput
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />

            <FormInput
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
            />

            <FormInput
              label="Zip"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
            />

            <FormInput
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
            />

            <div className="space-y-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Special Request:</label>
              <textarea
                name="specialRequest"
                value={formData.specialRequest}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              />
            </div>

            <FormInput
              label="Identity"
              name="identity"
              value={formData.identity}
              onChange={handleChange}
            />

            <FormInput
              label="ID detail"
              name="idDetail"
              value={formData.idDetail}
              onChange={handleChange}
            />

            <div className="space-y-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Photo ID:</label>
              <input
                type="file"
                name="photoId"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {formData.photoId && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Selected: {formData.photoId.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateReservation;