import React from 'react';

const OTASection = ({ register, loading }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
        <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">8</span>
        OTA & Integration Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connected OTAs - Optional */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Connected OTAs (Online Travel Agencies)</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["MakeMyTrip", "Goibibo", "Booking.com", "Agoda", "Expedia", "Airbnb", "OYO", "Others"].map(ota => (
              <label key={ota} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register("otas")}
                  value={ota}
                  disabled={loading}
                  className="w-4 h-4 text-red-600 focus:ring-red-500 rounded"
                />
                <span className="text-gray-700">{ota}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Channel Manager - Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Channel Manager (if any)</label>
          <input
            {...register("channelManager")}
            placeholder="e.g., SiteMinder, RateGain"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            disabled={loading}
          />
        </div>

        {/* Booking Engine - Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Booking Engine URL (if any)</label>
          <input
            {...register("bookingEngine")}
            placeholder="Enter booking engine URL"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default OTASection;