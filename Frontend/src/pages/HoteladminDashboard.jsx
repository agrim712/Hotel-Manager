import React, { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import Select from "react-select";
import axios from "axios";

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/hotel/onboard";
const COUNTRY_API_URL = "https://api.countrystatecity.in/v1/countries";
const CITY_API_URL = "https://api.countrystatecity.in/v1/countries/[ciso]/cities";
const PHONE_CODE_API_URL = "https://restcountries.com/v3.1/all";
const API_KEY = import.meta.env.VITE_API_KEY;

const currencyOptions = [
  { value: "USD", label: "💵 USD - US Dollar" },
  { value: "INR", label: "🇮🇳 INR - Indian Rupee" },
  { value: "EUR", label: "💶 EUR - Euro" },
  { value: "GBP", label: "💷 GBP - British Pound" },
  { value: "JPY", label: "💴 JPY - Japanese Yen" },
];

const mealPlanOptions = [
  { value: "EP", label: "Room Only (EP - European Plan)" },
  { value: "CP", label: "Bed & Breakfast (CP - Continental Plan)" },
  { value: "MAP", label: "Half Board (MAP - Modified American Plan)" },
  { value: "AP", label: "Full Board (AP - American Plan)" },
  { value: "AI", label: "All Inclusive (AI)" },
  { value: "UAI", label: "Ultra All Inclusive (UAI)" },
];

const PropertyForm = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, control, reset, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      rooms: [{ name: "", numOfRooms: "", maxGuests: "", rateType: null, rate: "", extraAdultRate: "", roomNumbers: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rooms",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [countryOptions, setCountryOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [phoneCodeOptions, setPhoneCodeOptions] = useState([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(COUNTRY_API_URL, {
          headers: { "X-CSCAPI-KEY": API_KEY },
        });
        setCountryOptions(
          response.data.map((country) => ({
            value: country.iso2,
            label: country.name,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      }
    };

    const fetchPhoneCodes = async () => {
      try {
        const response = await axios.get(PHONE_CODE_API_URL);
        const phoneCodes = response.data.map((country) => ({
          value: country.idd?.root + (country.idd?.suffixes?.[0] || ""),
          label: `${country.flag} ${country.idd?.root}${country.idd?.suffixes?.[0] || ""}`,
        }));
        setPhoneCodeOptions(phoneCodes);
      } catch (error) {
        console.error("Failed to fetch phone codes:", error);
      }
    };

    fetchCountries();
    fetchPhoneCodes();
  }, []);

  const fetchCities = async (countryCode) => {
    try {
      const response = await axios.get(CITY_API_URL.replace("[ciso]", countryCode), {
        headers: { "X-CSCAPI-KEY": API_KEY },
      });
      setCityOptions(
        response.data.map((city) => ({
          value: city.name,
          label: city.name,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch cities:", error);
    }
  };

  const selectedCountry = watch("country");
  useEffect(() => {
    if (selectedCountry) {
      fetchCities(selectedCountry.value);
    }
  }, [selectedCountry]);

  const products = watch("products") || [];

  const handleCheckboxChange = (value) => {
    const updatedProducts = products.includes(value)
      ? products.filter((item) => item !== value)
      : [...products, value];
    setValue("products", updatedProducts);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");
  
    try {
      const formattedData = {
        name: data.propertyName,
        address: data.address,
        country: data.country?.label || "",
        city: data.city?.label || "",
        contactPerson: data.yourName,
        phoneCode: data.phoneCode?.value || "",
        phoneNumber: data.phoneNumber,
        whatsappNumber: data.whatsappNumber,
        totalRooms: parseInt(data.totalRooms, 10),
        email: data.email,
        propertyType: data.propertyType,
        currency: data.currency?.value || "",
        products: Array.isArray(data.products) ? data.products : [],
        rooms: data.rooms.map((room) => ({
          name: room.name,
          numOfRooms: parseInt(room.numOfRooms, 10),
          maxGuests: parseInt(room.maxGuests, 10),
          rateType: room.rateType?.value || room.rateType || "",
          rate: parseFloat(room.rate),
          extraAdultRate: parseFloat(room.extraAdultRate),
          roomNumbers: Array.isArray(room.roomNumbers) 
            ? room.roomNumbers 
            : room.roomNumbers.split(",").map(num => num.trim())
        }))
      };
      console.log("📤 Sending Data:", JSON.stringify(formattedData, null, 2));
  
      const token = localStorage.getItem('token');
      console.log("Token from localStorage:", token);
  
      if (!token) {
        setMessage("❌ Please log in to continue.");
        setLoading(false);
        return;
      }
  
      setMessage("✅ Property onboarded successfully!");
      reset();
      navigate('/payment', { state: formattedData });
    } catch (error) {
      if (error.response?.status === 401) {
        setMessage("❌ Session expired. Please log in again.");
        localStorage.removeItem("token");
        setTimeout(() => window.location.href = '/login', 2000);
      } else {
        setMessage(error.response?.data?.error || "❌ Failed to onboard property");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
            <h1 className="text-3xl font-bold text-center">🏨 Onboard Your Property</h1>
            <p className="text-center text-red-100 mt-2">Join our platform and grow your business</p>
          </div>

          <div className="p-8">
            {/* Message Display */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg font-medium text-center ${
                message.includes("✅") 
                  ? "bg-green-50 text-green-800 border border-green-200" 
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information Section */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">1</span>
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Name *</label>
                    <input 
                      {...register("propertyName", { required: "Property Name is required" })} 
                      placeholder="Enter your property name" 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                      disabled={loading} 
                    />
                    {errors.propertyName && <span className="text-red-500 text-sm mt-1">{errors.propertyName.message}</span>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <input 
                      {...register("address", { required: "Address is required" })} 
                      placeholder="Enter complete address" 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                      disabled={loading} 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                    <Controller
                      name="country"
                      control={control}
                      rules={{ required: "Country is required" }}
                      render={({ field }) => (
                        <Select 
                          {...field} 
                          options={countryOptions} 
                          placeholder="Select country" 
                          isClearable 
                          isDisabled={loading}
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <Controller
                      name="city"
                      control={control}
                      rules={{ required: "City is required" }}
                      render={({ field }) => (
                        <Select 
                          {...field} 
                          options={cityOptions} 
                          placeholder="Select city" 
                          isClearable 
                          isDisabled={loading}
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">2</span>
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                    <input 
                      {...register("yourName", { required: "Your Name is required" })} 
                      placeholder="Enter your full name" 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                      disabled={loading} 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <div className="flex space-x-2">
                      <input 
                        value="+91" 
                        readOnly 
                        className="w-16 p-3 border border-gray-300 rounded-lg bg-gray-100 text-center font-medium" 
                      />
                      <input
                        {...register("phoneNumber", {
                          required: "Phone Number is required",
                          pattern: { value: /^\d+$/, message: "Invalid phone number" },
                        })}
                        type="tel"
                        placeholder="Enter phone number"
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                    <input
                      {...register("whatsappNumber", {
                        pattern: { value: /^\d+$/, message: "Invalid WhatsApp number" },
                      })}
                      type="tel"
                      placeholder="Enter WhatsApp number"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      {...register("email", {
                        required: "Email is required",
                        pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" },
                      })}
                      type="email"
                      placeholder="Enter email address"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Property Details Section */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">3</span>
                  Property Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Rooms *</label>
                    <input
                      {...register("totalRooms", { required: "Total rooms is required" })}
                      type="number"
                      placeholder="Enter total number of rooms"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      disabled={loading}
                    />
                    {errors.totalRooms && <span className="text-red-500 text-sm mt-1">{errors.totalRooms.message}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency *</label>
                    <Controller
                      name="currency"
                      control={control}
                      rules={{ required: "Currency is required" }}
                      render={({ field }) => (
                        <Select 
                          {...field} 
                          options={currencyOptions} 
                          placeholder="Select currency" 
                          isClearable 
                          isDisabled={loading}
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Property Type *</label>
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        {...register("propertyType", { required: "Property Type is required" })} 
                        type="radio" 
                        value="Hotel" 
                        disabled={loading}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-gray-700">🏨 Hotel</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        {...register("propertyType", { required: "Property Type is required" })} 
                        type="radio" 
                        value="Vacation Rental" 
                        disabled={loading}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-gray-700">🏠 Vacation Rental</span>
                    </label>
                  </div>
                  {errors.propertyType && <span className="text-red-500 text-sm mt-1">{errors.propertyType.message}</span>}
                </div>
              </div>

              {/* Products Section */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">4</span>
                  Select Products *
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "PMS",
                    "Channel Manager",
                    "RMS",
                    "Spa & Wellness Management",
                    "Bar & Beverage Management",
                    "Restaurant & Dining Management",
                    "All in One"
                  ].map((product) => (
                    <label key={product} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-white transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={products.includes(product)}
                        onChange={() => handleCheckboxChange(product)}
                        disabled={loading}
                        className="w-4 h-4 text-red-600 focus:ring-red-500 rounded"
                      />
                      <span className="text-gray-700 font-medium">{product}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Room Details Section */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">5</span>
                  Room Details
                </h2>
                <div className="space-y-6">
                  {fields.map((room, index) => (
                    <div key={room.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-gray-800">Room {index + 1}</h3>
                        {fields.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => remove(index)} 
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition-colors" 
                            disabled={loading}
                          >
                            ❌ Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Room Name *</label>
                          <input 
                            {...register(`rooms.${index}.name`, { required: "Room Name is required" })} 
                            placeholder="e.g., Deluxe Suite" 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                            disabled={loading} 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">No. of Rooms *</label>
                          <input 
                            {...register(`rooms.${index}.numOfRooms`, { required: "Number of Rooms is required" })} 
                            type="number" 
                            placeholder="e.g., 5" 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                            disabled={loading} 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Max Guests *</label>
                          <input 
                            {...register(`rooms.${index}.maxGuests`, { required: "Max Guests is required" })} 
                            type="number" 
                            placeholder="e.g., 2" 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                            disabled={loading} 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Rate Type *</label>
                          <Controller
                            name={`rooms.${index}.rateType`}
                            control={control}
                            rules={{ required: "Rate Type is required" }}
                            render={({ field }) => (
                              <Select 
                                {...field} 
                                options={mealPlanOptions} 
                                placeholder="Select rate type" 
                                isClearable 
                                isDisabled={loading}
                                className="react-select-container"
                                classNamePrefix="react-select"
                              />
                            )}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Rate *</label>
                          <input 
                            {...register(`rooms.${index}.rate`, { required: "Rate is required" })} 
                            type="number" 
                            placeholder="e.g., 1500" 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                            disabled={loading} 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Extra Adult Rate</label>
                          <input 
                            {...register(`rooms.${index}.extraAdultRate`)} 
                            type="number" 
                            placeholder="e.g., 500" 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                            disabled={loading} 
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Room Numbers</label>
                          <input
                            {...register(`rooms.${index}.roomNumbers`, {
                              validate: (value) => !value || value.split(",").every((num) => /^\d+$/.test(num.trim())) || "Invalid room numbers",
                            })}
                            type="text"
                            placeholder="e.g., 101, 102, 103"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  type="button" 
                  onClick={() => append({ name: "", numOfRooms: "", maxGuests: "", rateType: null, rate: "", extraAdultRate: "", roomNumbers: "" })} 
                  className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors" 
                  disabled={loading}
                >
                  ➕ Add Another Room
                </button>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-12 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg" 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "🚀 Submit & Continue"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;