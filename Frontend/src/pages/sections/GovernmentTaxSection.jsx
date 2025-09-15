import React from 'react';

const GovernmentTaxSection = ({ register, errors, loading }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
        <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">3</span>
        Government & Tax Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PAN Number - Mandatory */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number *</label>
          <input
            {...register("panNumber", {
              required: "PAN Number is required",
              pattern: {
                value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                message: "Invalid PAN format (e.g., ABCDE1234F)"
              }
            })}
            placeholder="Enter PAN number"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            disabled={loading}
          />
          {errors.panNumber && <span className="text-red-500 text-sm mt-1">{errors.panNumber.message}</span>}
        </div>

        {/* GSTIN - Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">GSTIN</label>
          <input
            {...register("gstin", {
              pattern: {
                value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                message: "Invalid GSTIN format (e.g., 22AAAAA0000A1Z5)"
              }
            })}
            placeholder="Enter GSTIN"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            disabled={loading}
          />
          {errors.gstin && <span className="text-red-500 text-sm mt-1">{errors.gstin.message}</span>}
        </div>

        {/* FSSAI License - Optional if no F&B */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">FSSAI License (for F&B)</label>
          <input
            {...register("fssaiLicense")}
            placeholder="Enter FSSAI license number"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            disabled={loading}
          />
        </div>

        {/* Fire Safety Certificate - Mandatory */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fire Safety Certificate </label>
          <input
            {...register("fireSafetyCert")}
            placeholder="Enter fire safety certificate number"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            disabled={loading}
          />
          {errors.fireSafetyCert && <span className="text-red-500 text-sm mt-1">{errors.fireSafetyCert.message}</span>}
        </div>

        {/* Trade License - Mandatory */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Trade License </label>
          <input
            {...register("tradeLicense")}
            placeholder="Enter trade license number"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            disabled={loading}
          />
          {errors.tradeLicense && <span className="text-red-500 text-sm mt-1">{errors.tradeLicense.message}</span>}
        </div>

        {/* Alcohol License - Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Alcohol License (if applicable)</label>
          <input
            {...register("alcoholLicense")}
            placeholder="Enter alcohol license number"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            disabled={loading}
          />
        </div>

        {/* Tourism Registration - Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tourism Registration Certificate</label>
          <input
            {...register("tourismRegistration")}
            placeholder="Enter tourism registration number"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            disabled={loading}
          />
        </div>

        {/* Company Registration - Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Registration (if Pvt Ltd/LLP)</label>
          <input
            {...register("companyRegistration")}
            placeholder="Enter company registration number"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default GovernmentTaxSection;