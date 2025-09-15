import React from 'react';

const OperationsSection = ({ register, errors, loading }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
        <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">5</span>
        Operations Setup
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Check-In Time - Mandatory */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Standard Check-In Time *</label>
          <input
            {...register("checkInTime", { required: "Check-in time is required" })}
            type="time"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            disabled={loading}
          />
          {errors.checkInTime && <span className="text-red-500 text-sm mt-1">{errors.checkInTime.message}</span>}
        </div>

        {/* Check-Out Time - Mandatory */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Standard Check-Out Time *</label>
          <input
            {...register("checkOutTime", { required: "Check-out time is required" })}
            type="time"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            disabled={loading}
          />
          {errors.checkOutTime && <span className="text-red-500 text-sm mt-1">{errors.checkOutTime.message}</span>}
        </div>

        {/* Early Check-In Policy - Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Early Check-In Policy</label>
          <textarea
            {...register("earlyCheckInPolicy")}
            placeholder="e.g., 50% of room rate if before 8 AM"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            disabled={loading}
            rows={3}
          />
        </div>

        {/* Late Check-Out Policy - Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Late Check-Out Policy</label>
          <textarea
            {...register("lateCheckOutPolicy")}
            placeholder="e.g., 50% of room rate if after 2 PM"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            disabled={loading}
            rows={3}
          />
        </div>

        {/* Cancellation Policy - Mandatory */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Policy *</label>
          <textarea
            {...register("cancellationPolicy", { required: "Cancellation policy is required" })}
            placeholder="e.g., Free cancellation until 24 hours before check-in"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            disabled={loading}
            rows={3}
          />
          {errors.cancellationPolicy && <span className="text-red-500 text-sm mt-1">{errors.cancellationPolicy.message}</span>}
        </div>

        {/* No-Show Policy - Optional */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">No-Show Policy</label>
          <textarea
            {...register("noShowPolicy")}
            placeholder="e.g., Full night charge for no-shows"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            disabled={loading}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

export default OperationsSection;