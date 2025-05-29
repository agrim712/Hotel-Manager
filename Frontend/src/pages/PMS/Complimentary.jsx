import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";

const COUNTRY_API_URL = "https://api.countrystatecity.in/v1/countries";
const CITY_API_URL = (countryCode) =>
  `https://api.countrystatecity.in/v1/countries/${countryCode}/cities`;
const API_KEY = import.meta.env.VITE_API_KEY;
console.log("API_KEY", API_KEY); // This should print the actual API key


const ComplimentaryBookingForm = () => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [roomNumbers, setRoomNumbers] = useState([]);
  const [ratePlans, setRatePlans] = useState([]);

  const selectedCountry = watch("country");
  const selectedRoomType = watch("roomType");
  const selectedNumRooms = watch("numRooms");
  const checkIn = watch("checkIn");
  const checkOut = watch("checkOut");

  const ratePlanOptions = {
    Executive: ["EP", "CP", "MAP", "AP"],
    Deluxe: ["EP", "CP"],
    Suite: ["EP", "MAP", "AP"],
  };

  const availableRoomNumbers = {
    Executive: [101, 102, 103, 104],
    Deluxe: [201, 202],
    Suite: [301, 302, 303],
  };

  useEffect(() => {
    axios
      .get(COUNTRY_API_URL, {
        headers: { "X-CSCAPI-KEY": API_KEY },
      })
      .then((res) => setCountries(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      axios
        .get(CITY_API_URL(selectedCountry), {
          headers: { "X-CSCAPI-KEY": API_KEY },
        })
        .then((res) => setCities(res.data))
        .catch(console.error);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedRoomType) {
      setRatePlans(ratePlanOptions[selectedRoomType] || []);
      setRoomNumbers(availableRoomNumbers[selectedRoomType] || []);
    }
  }, [selectedRoomType]);

  useEffect(() => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diff = (end - start) / (1000 * 60 * 60 * 24);
      if (diff >= 0) {
        setValue("nights", diff);
      }
    }
  }, [checkIn, checkOut]);

  const onSubmit = (data) => {
    const formData = new FormData();
    for (let key in data) {
      if (key === "photoId") {
        formData.append(key, data[key][0]); // File input
      } else {
        formData.append(key, data[key]);
      }
    }

    console.log("Sending form data:");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    // axios.post("/api/booking", formData)
    //   .then(response => console.log("Submitted successfully"))
    //   .catch(err => console.error("Submission error", err));
  };

  const ErrorMsg = ({ error }) =>
    error && <p className="text-red-500 text-sm">{error.message || "This field is required"}</p>;

  // Tailwind input styles for reuse
  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Booking</h2>

      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block mb-1 font-semibold">Check-In Date</label>
          <input {...register("checkIn", { required: true })} type="date" className={inputClass} />
          <ErrorMsg error={errors.checkIn} />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Check-Out Date</label>
          <input {...register("checkOut", { required: true })} type="date" className={inputClass} />
          <ErrorMsg error={errors.checkOut} />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Nights</label>
          <input {...register("nights")} type="number" readOnly className={inputClass} />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Room Type</label>
          <select {...register("roomType", { required: true })} className={inputClass}>
            <option value="">Select Room Type</option>
            <option value="Executive">Executive</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Suite">Suite</option>
          </select>
          <ErrorMsg error={errors.roomType} />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Rate Plan</label>
          <select {...register("ratePlan", { required: true })} className={inputClass}>
            <option value="">Select Rate Plan</option>
            {ratePlans.map((plan) => (
              <option key={plan} value={plan}>
                {plan}
              </option>
            ))}
          </select>
          <ErrorMsg error={errors.ratePlan} />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Booked By</label>
          <input {...register("bookedBy", { required: true })} placeholder="Booked By" className={inputClass} />
          <ErrorMsg error={errors.bookedBy} />
        </div>
{/* Business Segment */}
<div>
  <label className="block mb-1 font-semibold">Business Segment</label>
  <select
    {...register("businessSegment", { required: true })}
    className={inputClass}
    defaultValue="Management Block"
    disabled
  >
    <option value="Management Block">Management Block</option>
  </select>
  <ErrorMsg error={errors.businessSegment} />
</div>

{/* Bill To */}
<div>
  <label className="block mb-1 font-semibold">Bill To</label>
  <input
    {...register("billTo", { required: true })}
    value="Guest"
    readOnly
    className={inputClass + " bg-gray-100 cursor-not-allowed"}
  />
  <ErrorMsg error={errors.billTo} />
</div>

{/* Payment Mode */}
<div>
  <label className="block mb-1 font-semibold">Payment Mode</label>
  <select
    {...register("paymentMode", { required: true })}
    className={inputClass}
    defaultValue="Cash"
    disabled
  >
    <option value="Cash">Cash</option>
  </select>
  <ErrorMsg error={errors.paymentMode} />
</div>

{/* Per Day Rate */}
<div>
  <label className="block mb-1 font-semibold">Per Day Rate</label>
  <input
    {...register("perDayRate", { required: true })}
    value={0}
    readOnly
    type="number"
    className={inputClass + " bg-gray-100 cursor-not-allowed"}
  />
  <ErrorMsg error={errors.perDayRate} />
</div>


        <div>
          <label className="block mb-1 font-semibold">Per Day Tax</label>
          <input
            {...register("perDayTax", { required: true })}
            placeholder="Per Day Tax"
            type="number"
            className={inputClass}
          />
          <ErrorMsg error={errors.perDayTax} />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Number of Guests</label>
          <input
            {...register("numGuests", { required: true })}
            placeholder="# Guests"
            type="number"
            className={inputClass}
          />
          <ErrorMsg error={errors.numGuests} />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Number of Rooms</label>
          <input
            {...register("numRooms", { required: true })}
            placeholder="# Rooms"
            type="number"
            className={inputClass}
          />
          <ErrorMsg error={errors.numRooms} />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Room Number</label>
          <select {...register("roomNo", { required: true })} className={inputClass}>
            <option value="">Select Room Number</option>
            {roomNumbers.slice(0, selectedNumRooms || 0).map((roomNo) => (
              <option key={roomNo} value={roomNo}>
                {roomNo}
              </option>
            ))}
          </select>
          <ErrorMsg error={errors.roomNo} />
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Guest Details</h2>

      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block mb-1 font-semibold">Name</label>
          <input {...register("name", { required: true })} placeholder="Name" className={inputClass} />
          <ErrorMsg error={errors.name} />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Email</label>
          <input
            {...register("email", { required: true })}
            placeholder="Email"
            type="email"
            className={inputClass}
          />
          <ErrorMsg error={errors.email} />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Mobile Number</label>
          <input
            {...register("mobile", { required: true })}
            placeholder="Mobile Number"
            type="tel"
            className={inputClass}
          />
          <ErrorMsg error={errors.mobile} />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Address</label>
          <input {...register("address", { required: true })} placeholder="Address" className={inputClass} />
          <ErrorMsg error={errors.address} />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Country</label>
          <select {...register("country", { required: true })} className={inputClass}>
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c.iso2} value={c.iso2}>
                {c.name}
              </option>
            ))}
          </select>
          <ErrorMsg error={errors.country} />
        </div>

        <div>
          <label className="block mb-1 font-semibold">City</label>
          <select {...register("city", { required: true })} className={inputClass}>
            <option value="">Select City</option>
            {cities.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <ErrorMsg error={errors.city} />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Gender</label>
          <select {...register("gender", { required: true })} className={inputClass}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <ErrorMsg error={errors.gender} />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Photo ID</label>
          <input
            {...register("photoId", { required: true })}
            type="file"
            accept="image/*"
            className={inputClass}
          />
          <ErrorMsg error={errors.photoId} />
        </div>
      </div>

      <button
        type="submit"
        className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Submit Booking
      </button>
    </form>
  );
};

export default ComplimentaryBookingForm;
