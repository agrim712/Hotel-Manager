import React, { useEffect, useState } from "react";
import axios from "axios";

const RateTypeSelect = ({ roomType, rateType, value, onChange, token }) => {
  const [ratePlans, setRatePlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    console.log("🧪 roomType received in RateTypeSelect:", roomType);

    if (!roomType || !token) {
     
      return;
    }

    const fetchRatePlans = async () => {
      setLoading(true);
      setFetchError(null);

      try {
        const res = await axios.get("http://localhost:5000/api/hotel/rate-plans", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            roomType,
          },
        });

        console.log("✅ API response data:", res.data);

        if (Array.isArray(res.data)) {
          setRatePlans(res.data);
        } else {
          console.error("❌ Unexpected response format:", res.data);
          setFetchError("Invalid rate plan format from server.");
          setRatePlans([]);
        }
      } catch (error) {
        console.error("🚨 Error fetching rate plans:", error);
        setFetchError("Failed to load rate plans.");
        setRatePlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRatePlans();
  }, [roomType, token]);

  return (
    <div className="mb-4">
      <label htmlFor="rateType" className="block font-medium">
        Rate Plan
      </label>

      {loading ? (
        <p>Loading rate plans...</p>
      ) : fetchError ? (
        <p className="text-red-500 text-sm">{fetchError}</p>
      ) : (
        <select
          id="rateType"
          name="rateType"
          value={value}
          onChange={(e) => {
            console.log("📩 Selected rateType:", e.target.value);
            onChange(e.target.value);
          }}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Select Rate Plan</option>
          {ratePlans.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default RateTypeSelect;
