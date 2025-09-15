import React from 'react';
import { Controller } from 'react-hook-form';
import Select from 'react-select';

const ContactInfoSection = ({ register, control, errors, loading, phoneCodeOptions }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
        <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">2</span>
        Contact Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* --- PRIMARY CONTACT DETAILS --- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Contact Name *</label>
          <input
            {...register("contactPerson", { required: "Primary contact name is required" })}
            placeholder="Enter contact person name"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            disabled={loading}
          />
          {errors.contactPerson && <span className="text-red-500 text-sm mt-1">{errors.contactPerson.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Contact Number *</label>
          <div className="flex space-x-2">
            <Controller
              name="phoneCode"
              control={control}
              rules={{ required: "Code is required" }}
              render={({ field }) => (
                <Select
                  // FIX: Find the full object from options that matches the simple string value stored in the form
                  value={phoneCodeOptions.find(c => c.value === field.value)}
                  // FIX: On change, tell the form to store only the `.value` property of the selected option
                  onChange={val => field.onChange(val ? val.value : '')}
                  options={phoneCodeOptions}
                  placeholder="+91"
                  isClearable
                  isDisabled={loading}
                  className="react-select-container w-1/3"
                  classNamePrefix="react-select"
                />
              )}
            />
            <input
              {...register("phoneNumber", {
                required: "Phone Number is required",
                pattern: { value: /^\d+$/, message: "Invalid phone number" },
              })}
              type="tel"
              placeholder="Enter phone number"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              disabled={loading}
            />
          </div>
          {errors.phoneNumber && <span className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</span>}
          {errors.phoneCode && <span className="text-red-500 text-sm mt-1">{errors.phoneCode.message}</span>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary/Official Email *</label>
          <input
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" },
            })}
            type="email"
            placeholder="Enter official email"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            disabled={loading}
          />
          {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
          <input
            {...register("whatsappNumber", {
              pattern: { value: /^\d+$/, message: "Invalid WhatsApp number" },
            })}
            type="tel"
            placeholder="Enter WhatsApp number"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            disabled={loading}
          />
          {errors.whatsappNumber && <span className="text-red-500 text-sm mt-1">{errors.whatsappNumber.message}</span>}
        </div>
        
        <hr className="md:col-span-2 my-2 border-t border-gray-300"/>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Reservation Number</label>
          <input
            {...register("reservationNumber")}
            type="tel"
            placeholder="Enter reservation number"
            className="w-full p-3 border border-gray-300 rounded-lg"
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Reservation Email</label>
          <input
            {...register("reservationEmail", {
              pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" },
            })}
            type="email"
            placeholder="Enter reservation email"
            className="w-full p-3 border border-gray-300 rounded-lg"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Management Number</label>
          <input
            {...register("managementNumber")}
            type="tel"
            placeholder="Enter management number"
            className="w-full p-3 border border-gray-300 rounded-lg"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Management Email</label>
          <input
            {...register("managementEmail")}
            type="email"
            placeholder="Enter management email"
            className="w-full p-3 border border-gray-300 rounded-lg"
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default ContactInfoSection;
