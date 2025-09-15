import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const productOptions = [
  {
    value: "Starter PMS",
    label: "Starter PMS",
    group: "core",
    features: "Dashboard, Stay View, Guests, Companies, Rooms View, Folio",
    monthly: {
      INR: { "0–10": "₹3,500", "11–30": "₹5,000", "31–50": "₹6,500", "50+": "₹8,000" },
      USD: { "0–10": "$42", "11–30": "$60", "31–50": "$78", "50+": "$96" },
    },
  },
  {
    value: "Pro PMS",
    label: "Pro PMS",
    group: "core",
    features: "Starter PMS + Reservation, Housekeeping, Reports, Expenses",
    monthly: {
      INR: { "0–10": "₹7,000", "11–30": "₹9,000", "31–50": "₹11,500", "50+": "₹14,000" },
      USD: { "0–10": "$84", "11–30": "$108", "31–50": "$138", "50+": "$169" },
    },
  },
  {
    value: "Enterprise PMS",
    label: "Enterprise PMS",
    group: "core",
    features: "Pro PMS + Rate Mgmt, Operations, Sales, HR, Accounting",
    monthly: {
      INR: { "0–10": "₹12,000", "11–30": "₹16,000", "31–50": "₹20,000", "50+": "₹25,000" },
      USD: { "0–10": "$145", "11–30": "$193", "31–50": "$241", "50+": "$301" },
    },
  },
  {
    value: "Revenue Suite",
    label: "Revenue Suite",
    group: "addons",
    features: "Revenue Manager + Reports + Rate Management",
    monthly: {
      INR: { "0–10": "₹4,500", "11–30": "₹6,000", "31–50": "₹8,000", "50+": "₹10,000" },
      USD: { "0–10": "$54", "11–30": "$72", "31–50": "$96", "50+": "$120" },
    },
  },
  {
    value: "Booking Engine Suite",
    label: "Booking Engine Suite",
    group: "addons",
    features: "Booking Engine + Folio + Guests + Reservation",
    monthly: {
      INR: { "0–10": "₹5,500", "11–30": "₹7,500", "31–50": "₹9,500", "50+": "₹12,000" },
      USD: { "0–10": "$66", "11–30": "$90", "31–50": "$115", "50+": "$145" },
    },
  },
  {
    value: "POS Suite",
    label: "POS Suite",
    group: "addons",
    features: "POS (Restaurant, Spa, Bar) + Bar Management",
    monthly: {
      INR: { "0–10": "₹3,500", "11–30": "₹5,000", "31–50": "₹6,500", "50+": "₹8,000" },
      USD: { "0–10": "$42", "11–30": "$60", "31–50": "$78", "50+": "$96" },
    },
  },
  {
    value: "All-in-One PMS",
    label: "All-in-One PMS",
    group: "allinone",
    features: "Full Suite: PMS, Revenue, Booking Engine, POS, Restaurant, Spa, Bar, HR, Finance",
    monthly: {
      INR: { "0–10": "₹20,000", "11–30": "₹28,000", "31–50": "₹36,000", "50+": "₹45,000" },
      USD: { "0–10": "$278", "11–30": "$383", "31–50": "$497", "50+": "$602" },
    },
  },
];

// 👉 Tier helper
const getTierPrice = (monthly, currency, noOfRooms) => {
  const tiers = monthly[currency];
  if (!tiers) return 0;
  if (noOfRooms <= 10) return tiers["0–10"];
  if (noOfRooms <= 30) return tiers["11–30"];
  if (noOfRooms <= 50) return tiers["31–50"];
  return tiers["50+"];
};

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { products = [], currency, noOfRooms } = location.state || {};

  const [billingCycle, setBillingCycle] = useState("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { totalMonthlyPrice, totalAnnualPrice } = useMemo(() => {
    let monthlyTotal = 0;
    products.forEach((p) => {
      const product = productOptions.find((opt) => opt.value === p.product);
      if (!product) return;
      const price = getTierPrice(product.monthly, currency, noOfRooms);
      const num = parseFloat(price.replace(/[^\d.]/g, ""));
      monthlyTotal += isNaN(num) ? 0 : num;
    });
    const annual = monthlyTotal * 12 * 0.8;
    return { totalMonthlyPrice: monthlyTotal, totalAnnualPrice: annual };
  }, [products, currency, noOfRooms]);

  const formatCurrency = (num) => {
    if (currency === "INR") return `₹${num.toLocaleString()}`;
    return `$${num}`;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setError("");
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setError("Payment gateway failed to load. Please try again.");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const amount =
        billingCycle === "monthly" ? totalMonthlyPrice : totalAnnualPrice;

      const orderResponse = await axios.post(
        `${API_BASE_URL}/payment/create-order`,
        { amount, currency, receipt: `rcpt_${Date.now()}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { orderId, amount: orderAmount, keyId, hotelInfo } =
        orderResponse.data;

      const options = {
        key: keyId,
        amount: orderAmount,
        currency,
        name: "Hotel Onboarding Fee",
        description: `Payment for selected products (${billingCycle})`,
        order_id: orderId,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(
              `${API_BASE_URL}/payment/verify-payment`,
              {
                razorpay_order_id: orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (verifyRes.data.success) {
              navigate("/dashboard");
            } else {
              setError("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            setError("Something went wrong during payment verification.");
          }
        },
        prefill: {
          name: hotelInfo?.contactPerson,
          email: hotelInfo?.email,
          contact: hotelInfo?.phoneNumber,
        },
        theme: { color: "#4f46e5" },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (err) {
      console.error("Payment initiation failed:", err);
      const errorDetails = err.response?.data?.details || "Please try again.";
      setError(`Unable to initiate payment: ${errorDetails}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-4xl w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Confirm Your Subscription
          </h2>
          <p className="text-gray-500 mt-2">
            Review your selected products and choose your billing cycle.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Selected Products
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((p, idx) => {
              const product = productOptions.find((opt) => opt.value === p.product);
              const monthlyPrice = product
                ? getTierPrice(product.monthly, currency, noOfRooms)
                : "-";
              return (
                <div
                  key={idx}
                  className="p-5 rounded-xl border shadow-sm bg-gray-50 hover:shadow-md transition"
                >
                  <h4 className="text-md font-semibold text-gray-900">
                    {product?.label || p.product}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {product?.features}
                  </p>
                  <p className="mt-3 text-sm font-medium text-gray-700">
                    Monthly Price ({currency}):{" "}
                    <span className="font-bold text-blue-600">
                      {monthlyPrice}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center space-x-4 pt-4">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              billingCycle === "monthly"
                ? "bg-indigo-600 text-white shadow"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Monthly – {formatCurrency(totalMonthlyPrice)}
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              billingCycle === "yearly"
                ? "bg-green-600 text-white shadow"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Yearly (20% off) – {formatCurrency(totalAnnualPrice)}
          </button>
        </div>

        {/* Pay Button */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full py-3 rounded-xl text-white font-medium transition bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {isLoading
            ? "Processing..."
            : `Pay ${
                billingCycle === "monthly"
                  ? formatCurrency(totalMonthlyPrice)
                  : formatCurrency(totalAnnualPrice)
              } (${billingCycle})`}
        </button>

        <button
          onClick={() =>
            navigate("/hoteladmin-dashboard", { state: { edit: true } })
          }
          className="w-full py-3 rounded-xl text-indigo-600 font-medium border border-indigo-600 transition hover:bg-indigo-50"
        >
          Edit Hotel Details
        </button>
      </div>
    </div>
  );
};

export default Payment;
