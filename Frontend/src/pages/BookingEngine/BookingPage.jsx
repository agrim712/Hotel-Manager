import React, { useState } from 'react';
import { FiArrowLeft, FiCreditCard, FiPrinter, FiMail, FiCalendar, FiCheck } from 'react-icons/fi';
import { FaPaypal, FaCcVisa, FaCcMastercard, FaCcAmex } from 'react-icons/fa';

const BookingPage = () => {
  const [step, setStep] = useState(1);
  const [guestInfo, setGuestInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    specialRequests: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGuestInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Process booking
    setStep(3);
  };

  const applyCoupon = () => {
    // Coupon application logic
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Booking Progress */}
        <div className="flex justify-center mb-12">
          <div className="w-full max-w-3xl">
            <div className="flex items-center">
              {[1, 2, 3].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= stepNumber ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {stepNumber}
                    </div>
                    <span className={`text-sm mt-2 ${step >= stepNumber ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
                      {stepNumber === 1 && 'Guest Info'}
                      {stepNumber === 2 && 'Payment'}
                      {stepNumber === 3 && 'Confirmation'}
                    </span>
                  </div>
                  {stepNumber < 3 && (
                    <div className={`flex-1 h-1 mx-2 ${step > stepNumber ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Booking Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h3 className="text-xl font-semibold mb-6">Your Booking</h3>
              
              <div className="flex mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1566669437685-bc1c3cac4223?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80" 
                  alt="Deluxe Room" 
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="ml-4">
                  <h4 className="font-semibold">Deluxe Room</h4>
                  <p className="text-sm text-gray-600">2 Adults</p>
                  <p className="text-sm text-gray-600">Oct 15 - 18, 2023</p>
                  <p className="text-sm text-gray-600">3 nights</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Room (3 nights)</span>
                  <span>$600</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span>$72</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-indigo-600">$672</span>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Cancellation Policy</h4>
                <p className="text-sm text-blue-700">Free cancellation until Oct 12, 2023</p>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:w-2/3">
            {step === 1 && (
              <form className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Guest Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={guestInfo.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={guestInfo.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={guestInfo.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={guestInfo.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                  <select
                    name="nationality"
                    value={guestInfo.nationality}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select Country</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    {/* More countries */}
                  </select>
                </div>
                
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests (Optional)</label>
                  <textarea
                    name="specialRequests"
                    value={guestInfo.specialRequests}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phone || !guestInfo.nationality}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Payment
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Payment Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition duration-300 ${paymentMethod === 'creditCard' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
                    onClick={() => setPaymentMethod('creditCard')}
                  >
                    <div className="flex items-center">
                      <FiCreditCard className={`text-xl mr-3 ${paymentMethod === 'creditCard' ? 'text-indigo-600' : 'text-gray-500'}`} />
                      <span className={`font-medium ${paymentMethod === 'creditCard' ? 'text-indigo-600' : 'text-gray-700'}`}>Credit Card</span>
                    </div>
                  </div>
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition duration-300 ${paymentMethod === 'paypal' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
                    onClick={() => setPaymentMethod('paypal')}
                  >
                    <div className="flex items-center">
                      <FaPaypal className={`text-xl mr-3 ${paymentMethod === 'paypal' ? 'text-indigo-600' : 'text-gray-500'}`} />
                      <span className={`font-medium ${paymentMethod === 'paypal' ? 'text-indigo-600' : 'text-gray-700'}`}>PayPal</span>
                    </div>
                  </div>
                </div>
                
                {paymentMethod === 'creditCard' && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                      <div className="flex mt-2 space-x-3">
                        <FaCcVisa className="text-gray-400 text-xl" />
                        <FaCcMastercard className="text-gray-400 text-xl" />
                        <FaCcAmex className="text-gray-400 text-xl" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="Name on card"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>
                )}
                
                {paymentMethod === 'paypal' && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <p className="text-blue-800">You will be redirected to PayPal to complete your payment.</p>
                  </div>
                )}
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Have a coupon code?</label>
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-r-lg transition duration-300"
                    >
                      Apply
                    </button>
                  </div>
                </div>
                
                <div className="flex items-start mb-8">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="h-4 w-4 mt-1 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    required
                  />
                  <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-700">
                    I agree to the <a href="#" className="text-indigo-600 hover:underline">Terms & Conditions</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
                  </label>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-medium transition duration-300"
                  >
                    <FiArrowLeft className="mr-2" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={!acceptTerms}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiCheck className="text-green-600 text-3xl" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Booking Confirmed!</h2>
                <div className="max-w-md mx-auto space-y-4 mb-8">
                  <p className="text-gray-700">Thank you for your booking, {guestInfo.firstName}!</p>
                  <p className="text-gray-700">Your reservation number is: <span className="font-semibold">HLX20231015</span></p>
                  <p className="text-gray-700">We've sent a confirmation email to <span className="font-semibold">{guestInfo.email}</span></p>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                  <button className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition duration-300">
                    <FiPrinter className="mr-2" /> Print Confirmation
                  </button>
                  <button className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition duration-300">
                    <FiMail className="mr-2" /> Resend Email
                  </button>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg mb-8 text-left">
                  <h3 className="font-semibold text-blue-800 mb-3">What's Next?</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <FiCalendar className="text-blue-600 mt-1 mr-2 flex-shrink-0" />
                      <span>Add your stay to your calendar</span>
                    </li>
                    <li className="flex items-start">
                      <FiCheck className="text-blue-600 mt-1 mr-2 flex-shrink-0" />
                      <span>Review your booking details</span>
                    </li>
                    <li className="flex items-start">
                      <FiMail className="text-blue-600 mt-1 mr-2 flex-shrink-0" />
                      <span>Contact us for any special requests</span>
                    </li>
                  </ul>
                </div>
                
                <button className="w-full max-w-xs bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition duration-300">
                  Continue to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;