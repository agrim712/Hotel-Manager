import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const Payment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const formData = location.state; // form data passed from the previous page

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");

    if (!formData) {
      alert("Missing form data. Please go back and fill the form.");
      setIsLoading(false);
      return;
    }

    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      alert("Razorpay SDK failed to load. Are you online?");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/payment/create-order",
        {
          amount: 1000,
          receipt: `receipt_${Date.now()}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { orderId, amount } = response.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: 'INR',
        order_id: orderId,
        handler: async function (response) {
          try {
            // 1. First create the hotel and get the ID
            const hotelCreationResponse = await axios.post(
              "http://localhost:5000/api/hotel/onboard",
              formData,
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              }
            );
        
            const hotelId = hotelCreationResponse.data.hotel?.id;
            if (!hotelId) {
              alert("Hotel creation failed: No ID returned.");
              return;
            }
        
            // 2. Now verify the payment using the hotelId
            const verificationResponse = await axios.post(
              "http://localhost:5000/api/payment/verify-payment",
              {
                razorpay_order_id: orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                hotelId, // ✅ use the actual hotel ID
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              }
            );
        
            if (verificationResponse.data.success) {
              localStorage.setItem("paymentStatus", JSON.stringify(true));
              navigate("/pmss");
            } else {
              alert("Payment verification failed.");
            }
          } catch (err) {
            console.error("Error during payment verification or hotel submission:", err);
            alert("Something went wrong during payment processing.");
          }
        },
        
        prefill: {
          name: formData.name,
          email: formData.email,
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert("Unable to initiate payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Confirm Your Payment</h2>
        <p className="text-gray-600">Pay ₹10 to complete your hotel registration.</p>

        <div className="border-t border-gray-200 pt-4 space-y-2 text-left text-sm text-gray-600">
          <p><strong>Hotel:</strong> {formData?.name || '—'}</p>
          <p><strong>Email:</strong> {formData?.email || '—'}</p>
        </div>

        <button
          onClick={handlePayment}
          disabled={isLoading}
          className={`w-full py-3 rounded-xl text-white font-medium transition-all duration-300 ${
            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span>Processing Payment...</span>
            </span>
          ) : (
            'Pay ₹10 Now'
          )}
        </button>
      </div>
    </div>
  );
};

export default Payment;
