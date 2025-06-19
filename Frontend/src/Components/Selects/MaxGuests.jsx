import React, { useEffect, useState } from "react";
import axios from "axios";

const MaxGuestsInput = ({ roomType, rateType, token, onChange }) => {
  const [maxGuests, setMaxGuests] = useState(null);
  const [numGuests, setNumGuests] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset on change of type/plan
  useEffect(() => {
    setNumGuests("");
    setMaxGuests(null);
    setError(null);
  }, [roomType, rateType]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchMaxGuests = async () => {
      if (!roomType || !rateType || !token) return;

      setIsLoading(true);
      setError(null);

      try {
        const API_BASE =
          import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || "http://localhost:5000";

        const url = `${API_BASE}/api/hotel/maxguests?roomType=${roomType}&rateType=${rateType}`;

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        const guests = response.data?.maxGuests;

        if (guests !== undefined) {
          setMaxGuests(guests);
          setNumGuests(String(guests));
          onChange?.(guests);
        } else {
          throw new Error("Invalid response");
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("Error fetching max guests:", err);
          setError("Failed to fetch guest limit");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaxGuests();

    return () => controller.abort();
  }, [roomType, rateType, token]);

  const handleInputChange = (e) => {
    const value = e.target.value.trim();

    if (value === "") {
      setNumGuests("");
      onChange?.("");
      return;
    }

    if (!/^\d+$/.test(value)) return;

    const number = parseInt(value, 10);

    if (number > maxGuests) {
      setError(`Maximum ${maxGuests} guests allowed`);
    } else {
      setError(null);
      onChange?.(number);
    }

    setNumGuests(value);
  };

  const handleBlur = () => {
    if (!numGuests || isNaN(parseInt(numGuests, 10))) {
      setNumGuests(maxGuests?.toString() || "");
      onChange?.(maxGuests || 0);
    }
  };

  if (!roomType || !rateType) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Number of Guests
        </label>
        <input
          type="text"
          className="border border-gray-300 rounded px-3 py-2 w-full bg-gray-100 text-gray-500"
          disabled
          placeholder="Select room type & rate plan"
        />
      </div>
    );
  }
  

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Number of Guests {maxGuests !== null && `(Max ${maxGuests})`}
      </label>

      {isLoading ? (
        <div className="animate-pulse h-10 bg-gray-200 rounded" />
      ) : (
        <>
          {error && <p className="text-red-500 text-xs mb-1">{error}</p>}
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={numGuests}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`border ${error ? "border-red-500" : "border-gray-300"} rounded px-3 py-2 w-full`}
            placeholder={maxGuests ? `Enter 1-${maxGuests} guests` : "Loading guest limit..."}
            disabled={maxGuests === null || isLoading}
            aria-invalid={!!error}
          />
        </>
      )}
    </div>
  );
};

export default MaxGuestsInput;
