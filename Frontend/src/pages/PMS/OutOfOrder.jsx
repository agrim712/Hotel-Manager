import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Pmss from "./Pmss"
const COUNTRY_API_URL = "https://api.countrystatecity.in/v1/countries";
const CITY_API_URL = (countryCode) =>
  `https://api.countrystatecity.in/v1/countries/${countryCode}/cities`;
const API_KEY = import.meta.env.VITE_API_KEY;

const OutOfOrderRoomForm = () => {
  const {
    register,
    handleSubmit,
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
        formData.append(key, data[key][0]);
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

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600";

  return (
    <>
        <div className="flex h-screen">
      {/* Sidebar */}
      <Pmss />

      {/* Form content with scroll */}
      <div className="flex-1 overflow-auto bg-white">
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Out of Order Room</h2>

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
          <select {...register("roomType")} className={inputClass} disabled>
            <option value="">Select Room Type</option>
            <option value="Executive">Executive</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Suite">Suite</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Rate Plan</label>
          <select {...register("ratePlan")} className={inputClass} disabled>
            <option value="">Select Rate Plan</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Booked By</label>
          <input {...register("bookedBy")} placeholder="Booked By" className={inputClass} disabled />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Business Segment</label>
          <input
            {...register("businessSegment")}
            value="Out of Order"
            readOnly
            className={inputClass + " bg-gray-100 cursor-not-allowed"}
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Bill To</label>
          <input
            {...register("billTo")}
            value="Guest"
            readOnly
            className={inputClass + " bg-gray-100 cursor-not-allowed"}
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Payment Mode</label>
          <input
            {...register("paymentMode")}
            value="Cash"
            readOnly
            className={inputClass + " bg-gray-100 cursor-not-allowed"}
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Per Day Rate</label>
          <input
            {...register("perDayRate")}
            value={0}
            readOnly
            type="number"
            className={inputClass + " bg-gray-100 cursor-not-allowed"}
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Per Day Tax</label>
          <input
            {...register("perDayTax")}
            placeholder="Per Day Tax"
            type="number"
            className={inputClass}
          />
          <ErrorMsg error={errors.perDayTax} />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Number of Guests</label>
          <input
            {...register("numGuests")}
            type="number"
            placeholder="# Guests"
            className={inputClass}
            disabled
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Number of Rooms</label>
          <input
            {...register("numRooms")}
            type="number"
            placeholder="# Rooms"
            className={inputClass}
            disabled
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Room Number</label>
          <select {...register("roomNo")} className={inputClass} disabled>
            <option value="">Select Room Number</option>
          </select>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Guest Details</h2>
      <div>
  <label className="block mb-1 font-semibold">Remarks / Issue Description</label>
  <textarea
    {...register("issueRemarks", { required: "Please describe the issue" })}
    placeholder="E.g. AC not working, plumbing issue, etc."
    rows={4}
    className={inputClass}
  ></textarea>
  <ErrorMsg error={errors.issueRemarks} />
</div>


      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block mb-1 font-semibold">Name</label>
          <input {...register("name")} placeholder="Name" className={inputClass} disabled />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Email</label>
          <input {...register("email")} type="email" placeholder="Email" className={inputClass} disabled />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Mobile Number</label>
          <input {...register("mobile")} type="tel" placeholder="Mobile Number" className={inputClass} disabled />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Address</label>
          <input {...register("address")} placeholder="Address" className={inputClass} disabled />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Country</label>
          <select {...register("country")} className={inputClass} disabled>
            <option value="">Select Country</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">City</label>
          <select {...register("city")} className={inputClass} disabled>
            <option value="">Select City</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Gender</label>
          <select {...register("gender")} className={inputClass} disabled>
            <option value="">Select Gender</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Photo ID</label>
          <input
            {...register("photoId")}
            type="file"
            accept="image/*"
            className={inputClass}
            disabled
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Submit Out of Order Booking
      </button>
    </form>
    </div>
    </div>
    </>
  );
};

export default OutOfOrderRoomForm;
