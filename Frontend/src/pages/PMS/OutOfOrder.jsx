import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Pmss from "./Pmss";
import RoomTypeSelect from "../../Components/Selects/RoomTypeSelect";
import RoomUnits from "../../Components/Selects/RoomUnitsSelect";
import RateTypeSelect from "../../Components/Selects/RateTypeSelect";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const OutOfOrderRoomForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      roomType: "",
      rateType: "",
      roomUnitId: "",
      checkIn: "",
      checkOut: "",
      nights: 0,
      issueRemarks: ""
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [error, setError] = useState(null);

  const selectedRoomType = watch("roomType");
  const selectedRateType = watch("rateType");
  const checkIn = watch("checkIn");
  const checkOut = watch("checkOut");

  useEffect(() => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      
      // Validate that end date is after start date
      if (end <= start) {
        setError("End date must be after start date");
        setValue("nights", 0);
        return;
      }
      
      setError(null);
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      setValue("nights", diff);
    }
  }, [checkIn, checkOut, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Authentication required");
      }
      
      if (!data.roomUnitId) {
        throw new Error("Please select a room unit");
      }
      
      if (!data.checkIn || !data.checkOut) {
        throw new Error("Please select both dates");
      }
      
      if (new Date(data.checkOut) <= new Date(data.checkIn)) {
        throw new Error("End date must be after start date");
      }

      const response = await axios.post(
        "http://localhost:5000/api/hotel/maintenance",
        {
          roomUnitId: data.roomUnitId,
          rateType: data.rateType,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          notes: data.issueRemarks
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccessMessage(response.data.message || "Room successfully marked for maintenance!");
      
      // Reset form after successful submission
      reset();
      setStartDate(null);
      setEndDate(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ErrorMsg = ({ error }) => (
    error && <p className="text-red-500 text-sm mt-1">{error}</p>
  );

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600";
  const labelClass = "block mb-1 font-semibold";

  return (
    <div className="flex h-screen">
      <Pmss />
      <div className="flex-1 overflow-auto bg-white">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Room Maintenance</h2>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Room Type *</label>
              <RoomTypeSelect
                value={watch("roomType")}
                onChange={(val) => {
                  setValue("roomType", val);
                  setValue("rateType", "");
                  setValue("roomUnitId", "");
                }}
                token={localStorage.getItem("token")}
              />
              <ErrorMsg error={errors.roomType} />
            </div>

            <div>
              <label className={labelClass}>Rate Plan *</label>
              <RateTypeSelect
                value={watch("rateType")}
                onChange={(val) => setValue("rateType", val)}
                roomType={selectedRoomType}
                token={localStorage.getItem("token")}
              />
              <ErrorMsg error={errors.rateType} />
            </div>

            <div>
              <label className={labelClass}>Room Unit *</label>
              <RoomUnits
                value={watch("roomUnitId")}
                onChange={(val) => setValue("roomUnitId", val)}
                roomType={selectedRoomType}
                rateType={selectedRateType}
                token={localStorage.getItem("token")}
              />
              <ErrorMsg error={errors.roomUnitId} />
            </div>

            <div>
              <label className={labelClass}>Nights</label>
              <input
                {...register("nights")}
                type="number"
                readOnly
                className={`${inputClass} bg-gray-100 cursor-not-allowed`}
              />
            </div>

            <div>
              <label className={labelClass}>Check-In Date & Time *</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => {
                  setStartDate(date);
                  setValue("checkIn", date.toISOString());
                  // Reset end date if it's before the new start date
                  if (endDate && date > endDate) {
                    setEndDate(null);
                    setValue("checkOut", "");
                  }
                }}
                minDate={new Date()}
                className={inputClass}
                placeholderText="Select check-in date and time"
                dateFormat="yyyy-MM-dd h:mm aa"
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="Time"
                required
                selectsStart
                startDate={startDate}
                endDate={endDate}
              />
              <ErrorMsg error={errors.checkIn} />
            </div>

            <div>
              <label className={labelClass}>Check-Out Date & Time *</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => {
                  setEndDate(date);
                  setValue("checkOut", date.toISOString());
                }}
                minDate={startDate || new Date()}
                className={inputClass}
                placeholderText="Select check-out date and time"
                dateFormat="yyyy-MM-dd h:mm aa"
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="Time"
                required
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                disabled={!startDate}
              />
              <ErrorMsg error={errors.checkOut} />
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Maintenance Details</h3>
            <div>
              <label className={labelClass}>Issue Description *</label>
              <textarea
                {...register("issueRemarks", { required: "Please describe the issue" })}
                placeholder="Describe the maintenance issue (e.g., AC not working, plumbing issue)"
                rows={4}
                className={inputClass}
              />
              <ErrorMsg error={errors.issueRemarks} />
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : "Mark Room for Maintenance"}
            </button>
          </div>

          {successMessage && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
              {successMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default OutOfOrderRoomForm;