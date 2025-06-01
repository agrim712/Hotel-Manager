import React, { useEffect, useState } from "react";
import axios from "axios";

const RateTypeSelect = ({ roomType, formData, handleChange, errors }) => {
  const [ratePlans, setRatePlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    console.log("🧪 roomType received in RateTypeSelect:", roomType);

    if (!roomType) {
      console.warn("❗ No roomType provided, skipping fetch.");
      return;
    }

    const fetchRatePlans = async () => {
      setLoading(true);
      setFetchError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setFetchError("User not authenticated.");
          setLoading(false);
          return;
        }

        const res = await axios.get("http://localhost:5000/api/hotel/rate-plans", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            roomType, // 👈 using correct param name
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
  }, [roomType]);

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
          value={formData.rateType}
          onChange={(e) => {
            console.log("📩 Selected rateType:", e.target.value);
            handleChange(e);
          }}
          className={`w-full border p-2 rounded ${
            errors.rateType ? "border-red-500" : ""
          }`}
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

      {errors.rateType && (
        <p className="text-red-500 text-sm mt-1">{errors.rateType}</p>
      )}
    </div>
  );
};

export default RateTypeSelect;
