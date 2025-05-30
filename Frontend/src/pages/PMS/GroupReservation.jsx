import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Pmss from "./Pmss"
const roomTypes = ["Super Deluxe", "Deluxe", "Executive", "Suite"];
const mealPlanOptions = [
  { value: "Room Only", label: "Room Only" },
  { value: "Bed & Breakfast", label: "Bed & Breakfast" },
  { value: "Half Board", label: "Half Board" },
  { value: "Full Board", label: "Full Board" },
  { value: "All Inclusive", label: "All Inclusive" },
];

const paymentModes = ["Cash", "Card", "Online"];

export default function GroupReservationForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      groupName: "",
      checkIn: "",
      checkOut: "",
      taxInclusive: false,
      rooms: {},
    },
  });

  const today = new Date().toISOString().split("T")[0];
  const checkInDate = watch("checkIn") || today;
  const checkOutDate = watch("checkOut") || "";

  const [roomData, setRoomData] = useState(
    roomTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {})
  );

  const addRoomEntry = (type) => {
    setRoomData((prev) => ({
      ...prev,
      [type]: [
        ...prev[type],
        {
          numRooms: 1,
          guestsPerRoom: 1,
          ratePlan: "Room Only",
          ratePerDay: 0,
        },
      ],
    }));
  };

  const removeRoomEntry = (type, index) => {
    setRoomData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, idx) => idx !== index),
    }));
  };

  const calculateNights = () => {
    const inDate = new Date(checkInDate);
    const outDate = new Date(checkOutDate);
    if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) return 0;
    const diff = (outDate - inDate) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 0;
  };

  const nights = calculateNights();

  const calculateTotal = () => {
    const taxInclusive = watch("taxInclusive");
    let total = 0;

    Object.keys(roomData).forEach((type) => {
      roomData[type].forEach((room) => {
        const base =
          room.numRooms * room.guestsPerRoom * room.ratePerDay * nights;
        total += taxInclusive ? base * 1.12 : base;
      });
    });

    return total.toFixed(2);
  };

  const onSubmit = (data) => {
    console.log("Group Reservation Submitted:", { ...data, roomData });
    alert("Group reservation submitted successfully!");
  };

  return (
        <>
        <div className="flex h-screen">
      {/* Sidebar */}
      <Pmss />

      {/* Form content with scroll */}
      <div className="flex-1 overflow-auto bg-white">
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-5xl mx-auto p-6 bg-white shadow rounded space-y-6"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Group Name *</label>
          <input
            {...register("groupName", { required: true })}
            className="w-full border border-gray-300 px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter group name"
          />
        </div>

        <div>
          <label>Check-in *</label>
          <input
            type="date"
            {...register("checkIn", { required: true })}
            min={today}
            className="w-full border border-gray-300 px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label>Check-out *</label>
          <input
            type="date"
            {...register("checkOut", { required: true })}
            min={checkInDate}
            className="w-full border border-gray-300 px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label>Nights</label>
          <input
            type="number"
            value={nights}
            readOnly
            className="w-full border border-gray-300 px-3 py-2 rounded bg-gray-100 text-gray-700"
          />
        </div>

        <div className="flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            {...register("taxInclusive")}
            className="w-4 h-4"
          />
          <label>Tax Inclusive</label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Room Details</h3>
        {roomTypes.map((type) => (
          <div
            key={type}
            className="border p-4 rounded mb-6 bg-gray-50 shadow-sm"
          >
            <div className="flex justify-between items-center mb-3">
              <input
                value={type}
                readOnly
                className="text-base font-semibold border border-gray-300 px-3 py-2 rounded w-full max-w-xs bg-gray-100"
              />
              <button
                type="button"
                onClick={() => addRoomEntry(type)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                + Add
              </button>
            </div>

            {roomData[type].length > 0 && (
              <div className="grid grid-cols-6 gap-4 mb-2 font-semibold text-sm text-gray-700">
                <div>Room Type</div>
                <div># Rooms</div>
                <div>Guests/Room</div>
                <div>Rate Plan</div>
                <div>Rate/Day (₹)</div>
                <div>Action</div>
              </div>
            )}

            {roomData[type].map((room, idx) => (
              <div
                key={idx}
                className="grid grid-cols-6 gap-4 mb-2 items-center"
              >
                <input
                  value={type}
                  readOnly
                  className="border border-gray-300 px-3 py-2 rounded w-full bg-gray-100"
                />
                <input
                  type="number"
                  min="1"
                  value={room.numRooms}
                  onChange={(e) => {
                    const updated = [...roomData[type]];
                    updated[idx].numRooms = +e.target.value;
                    setRoomData({ ...roomData, [type]: updated });
                  }}
                  className="border border-gray-300 px-3 py-2 rounded w-full"
                />
                <input
                  type="number"
                  min="1"
                  value={room.guestsPerRoom}
                  onChange={(e) => {
                    const updated = [...roomData[type]];
                    updated[idx].guestsPerRoom = +e.target.value;
                    setRoomData({ ...roomData, [type]: updated });
                  }}
                  className="border border-gray-300 px-3 py-2 rounded w-full"
                />
                <select
                    value={room.ratePlan}
                    onChange={(e) => {
                        const updated = [...roomData[type]];
                        updated[idx].ratePlan = e.target.value;
                        setRoomData({ ...roomData, [type]: updated });
                    }}
                    className="border border-gray-300 px-3 py-2 rounded w-full"
                    >
                    {mealPlanOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                        {option.label}
                        </option>
                    ))}
                    </select>
                <input
                  type="number"
                  min="0"
                  value={room.ratePerDay}
                  onChange={(e) => {
                    const updated = [...roomData[type]];
                    updated[idx].ratePerDay = +e.target.value;
                    setRoomData({ ...roomData, [type]: updated });
                  }}
                  className="border border-gray-300 px-3 py-2 rounded w-full"
                />
                <button
                  type="button"
                  onClick={() => removeRoomEntry(type, idx)}
                  className="text-red-500 font-bold text-xl hover:text-red-700"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        ))}
        <div className="text-right text-xl font-semibold">
          Total Amount: ₹{calculateTotal()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Payment Mode *</label>
          <select
            {...register("paymentMode", { required: true })}
            className="w-full border border-gray-300 px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select payment mode</option>
            {paymentModes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
          {errors.paymentMode && (
            <p className="text-red-500 text-sm mt-1">This field is required.</p>
          )}
        </div>
        <div>
          <label>Bill To *</label>
          <input
            {...register("billTo", { required: true })}
            className="w-full border border-gray-300 px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Company or individual name"
          />
          {errors.billTo && (
            <p className="text-red-500 text-sm mt-1">This field is required.</p>
          )}
        </div>
        <div>
          <label>Booked By *</label>
          <input
            {...register("bookedBy", { required: true })}
            className="w-full border border-gray-300 px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter name"
          />
          {errors.bookedBy && (
            <p className="text-red-500 text-sm mt-1">This field is required.</p>
          )}
        </div>
        <div>
          <label>Guest Name *</label>
          <input
            {...register("guestName", { required: true })}
            className="w-full border border-gray-300 px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter guest name"
          />
          {errors.guestName && (
            <p className="text-red-500 text-sm mt-1">This field is required.</p>
          )}
        </div>
        <div>
          <label>Email *</label>
          <input
            type="email"
            {...register("email", { required: true })}
            className="w-full border border-gray-300 px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter email"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">This field is required.</p>
          )}
        </div>
        <div>
          <label>Phone *</label>
          <input
            type="tel"
            {...register("phone", { required: true })}
            className="w-full border border-gray-300 px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter phone no."
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">This field is required.</p>
          )}
        </div>
        <div className="col-span-2">
          <label>Special Request</label>
          <input
            {...register("specialRequest")}
            className="w-full border border-gray-300 px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Ex: Need Extra Pillow or AC not working."
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
      >
        Submit
      </button>
    </form>
    </div>
    </div>
    </>
  );
}
