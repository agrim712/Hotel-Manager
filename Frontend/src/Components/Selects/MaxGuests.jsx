import React, { useEffect, useState } from "react";
import axios from "axios";

const MaxGuestsInput = ({ roomType, rateType, token, onChange }) => {
  const [maxGuests, setMaxGuests] = useState(null);
  const [numGuests, setNumGuests] = useState("");

  useEffect(() => {
    const fetchMaxGuests = async () => {
      if (!roomType || !rateType || !token) {
        console.warn("Missing props");
        return;
      }

      console.log("🌐 Fetching max guests for:", { roomType, rateType });

      try {
        const url = `http://localhost:5000/api/hotel/maxguests?roomType=${roomType}&rateType=${rateType}`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("✅ Response:", response.data);

        if (response.data && typeof response.data.maxGuests === "number") {
          setMaxGuests(response.data.maxGuests);
          setNumGuests(response.data.maxGuests); // Set default to max
          if (onChange) onChange(response.data.maxGuests);
        } else {
          setMaxGuests(null);
        }
      } catch (error) {
        console.error("🚨 Error fetching max guests:", error);
        setMaxGuests(null);
      }
    };

    fetchMaxGuests();
  }, [roomType, rateType, token]);

const handleInputChange = (e) => {
  const value = e.target.value;

  // Allow empty input (for user deletion)
  if (value === "") {
    setNumGuests("");
    if (onChange) onChange("");
    return;
  }

  const numberValue = parseInt(value);
  
  // Allow only numbers ≤ maxGuests
  if (!isNaN(numberValue)) {
    if (numberValue <= maxGuests) {
      setNumGuests(numberValue);
      if (onChange) onChange(numberValue);
    } else {
      alert(`Only ${maxGuests} guests allowed.`);
    }
  }
};


  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Number of Guests (Max {maxGuests ?? "?"})
      </label>
      <input
        type="text"
        min={1}
        max={maxGuests ?? ""}
        value={numGuests}
        onChange={handleInputChange}
        className="border border-gray-300 rounded px-3 py-2 w-full"
        placeholder={
          maxGuests !== null
            ? `Enter up to ${maxGuests} guests`
            : "Max guests will appear here"
        }
        disabled={!maxGuests}
      />
    </div>
  );
};

export default MaxGuestsInput;
