import React from 'react';
import { Controller } from 'react-hook-form';
import Select from 'react-select';

const AccountingSection = ({ 
  register, 
  control, 
  errors, 
  loading, 
  bankAccountsFields, 
  appendBankAccount, 
  removeBankAccount 
}) => {
  const accountTypeOptions = [
    { value: 'Savings', label: 'Savings Account' },
    { value: 'Current', label: 'Current Account' },
    { value: 'CashCredit', label: 'Cash Credit' },
    { value: 'Overdraft', label: 'Overdraft Account' }
  ];

  const paymentModeOptions = [
    { value: 'Cash', label: 'Cash' },
    { value: 'CreditCard', label: 'Credit Card' },
    { value: 'DebitCard', label: 'Debit Card' },
    { value: 'UPI', label: 'UPI' },
    { value: 'BankTransfer', label: 'Bank Transfer' },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'OnlinePayment', label: 'Online Payment' }
  ];

  const invoiceFormatOptions = [
    { value: 'INV-{YYYY}-{NNNN}', label: 'INV-YYYY-NNNN' },
    { value: '{HOTEL}-INV-{DDMMYY}-{NNN}', label: 'HOTEL-INV-DDMMYY-NNN' },
    { value: 'INV-{MMYY}-{NNNN}', label: 'INV-MMYY-NNNN' },
    { value: 'Custom', label: 'Custom Format' }
  ];

  return (
    <div className="bg-gray-50 p-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
        <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">6</span>
        Accounting & Billing Setup
      </h2>
      
      <div className="space-y-8">
        {/* Bank Accounts Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-800">Bank Account Details</h3>
            <button
              type="button"
              onClick={() => appendBankAccount({
                accountHolderName: "",
                bankName: "",
                accountNumber: "",
                ifscCode: "",
                accountType: "",
                branch: "",
                isPrimary: false
              })}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              disabled={loading}
            >
              ➕ Add Bank Account
            </button>
          </div>

          <div className="space-y-6">
            {bankAccountsFields.map((account, index) => (
              <div key={account.id} className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-700">Bank Account {index + 1}</h4>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        {...register(`bankAccounts.${index}.isPrimary`)}
                        disabled={loading}
                        className="w-4 h-4 text-red-600 focus:ring-red-500 rounded"
                      />
                      <span className="text-sm text-gray-600">Primary Account</span>
                    </label>
                    {bankAccountsFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBankAccount(index)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                        disabled={loading}
                      >
                        ❌ Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Account Holder Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name *</label>
                    <input
                      {...register(`bankAccounts.${index}.accountHolderName`, {
                        required: "Account holder name is required"
                      })}
                      placeholder="Name as in bank account"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      disabled={loading}
                    />
                    {errors.bankAccounts?.[index]?.accountHolderName && (
                      <span className="text-red-500 text-xs mt-1">{errors.bankAccounts[index].accountHolderName.message}</span>
                    )}
                  </div>

                  {/* Bank Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
                    <input
                      {...register(`bankAccounts.${index}.bankName`, {
                        required: "Bank name is required"
                      })}
                      placeholder="Bank name"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      disabled={loading}
                    />
                    {errors.bankAccounts?.[index]?.bankName && (
                      <span className="text-red-500 text-xs mt-1">{errors.bankAccounts[index].bankName.message}</span>
                    )}
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
                    <input
                      {...register(`bankAccounts.${index}.accountNumber`, {
                        required: "Account number is required",
                        pattern: {
                          value: /^[0-9]{9,18}$/,
                          message: "Invalid account number (9-18 digits)"
                        }
                      })}
                      placeholder="Account number"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      disabled={loading}
                    />
                    {errors.bankAccounts?.[index]?.accountNumber && (
                      <span className="text-red-500 text-xs mt-1">{errors.bankAccounts[index].accountNumber.message}</span>
                    )}
                  </div>

                  {/* IFSC Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code *</label>
                    <input
                      {...register(`bankAccounts.${index}.ifscCode`, {
                        required: "IFSC code is required",
                        pattern: {
                          value: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                          message: "Invalid IFSC format (e.g., SBIN0001234)"
                        }
                      })}
                      placeholder="IFSC code"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      disabled={loading}
                    />
                    {errors.bankAccounts?.[index]?.ifscCode && (
                      <span className="text-red-500 text-xs mt-1">{errors.bankAccounts[index].ifscCode.message}</span>
                    )}
                  </div>

                   {/* Account Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Type *</label>
                        <Controller
                          name={`bankAccounts.${index}.accountType`}
                          control={control}
                          rules={{ required: "Account type is required" }}
                          render={({ field }) => (
                            <Select
                            // Find the full option object for display based on the string value from the form state
                              value={accountTypeOptions.find(option => option.value === field.value)}
                            // On change, pass only the string `value` (or an empty string if cleared) to the form state
                              onChange={option => field.onChange(option ? option.value : '')}
                              options={accountTypeOptions}
                              placeholder="Select account type"
                              isClearable
                              isDisabled={loading}
                              className="react-select-container"
                              classNamePrefix="react-select"
                            />
                          )}
                        />
                        {errors.bankAccounts?.[index]?.accountType && (
                          <span className="text-red-500 text-xs mt-1">{errors.bankAccounts[index].accountType.message}</span>
                        )}
                      </div>


                  {/* Branch */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
                    <input
                      {...register(`bankAccounts.${index}.branch`, {
                        required: "Branch is required"
                      })}
                      placeholder="Branch location"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      disabled={loading}
                    />
                    {errors.bankAccounts?.[index]?.branch && (
                      <span className="text-red-500 text-xs mt-1">{errors.bankAccounts[index].branch.message}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Modes Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Payment Modes</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paymentModeOptions.map(mode => (
              <label key={mode.value} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  {...register("paymentModes", { required: "At least one payment mode is required" })}
                  value={mode.value}
                  disabled={loading}
                  className="w-4 h-4 text-red-600 focus:ring-red-500 rounded"
                />
                <span className="text-gray-700">{mode.label}</span>
              </label>
            ))}
          </div>
          {errors.paymentModes && (
            <span className="text-red-500 text-sm mt-2 block">{errors.paymentModes.message}</span>
          )}
        </div>

        {/* Invoice Settings Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Invoice Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Invoice Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number Format</label>
              <Controller
                name="invoiceFormat"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={invoiceFormatOptions}
                    placeholder="Select invoice format"
                    isClearable
                    isDisabled={loading}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                )}
              />
            </div>

            {/* Custom Invoice Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Custom Invoice Format</label>
              <input
                {...register("customInvoiceFormat")}
                placeholder="e.g., INV-{YYYY}-{NNNN}"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Use placeholders: {"{YYYY}"} for year, {"{MM}"} for month, {"{DD}"} for day, {"{NNNN}"} for sequential number
              </p>
            </div>

            {/* Tax Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default GST Rate (%)</label>
              <input
                {...register("defaultGstRate", {
                  min: { value: 0, message: "Must be 0 or positive" },
                  max: { value: 28, message: "Must be 28 or less" }
                })}
                type="number"
                step="0.1"
                placeholder="e.g., 18.0"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                disabled={loading}
              />
              {errors.defaultGstRate && (
                <span className="text-red-500 text-xs mt-1">{errors.defaultGstRate.message}</span>
              )}
            </div>

            {/* Service Charge */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Charge (%)</label>
              <input
                {...register("serviceCharge", {
                  min: { value: 0, message: "Must be 0 or positive" },
                  max: { value: 20, message: "Must be 20 or less" }
                })}
                type="number"
                step="0.1"
                placeholder="e.g., 5.0"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                disabled={loading}
              />
              {errors.serviceCharge && (
                <span className="text-red-500 text-xs mt-1">{errors.serviceCharge.message}</span>
              )}
            </div>
          </div>
        </div>

        {/* Billing Policies Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Billing Policies</h3>
          
          <div className="space-y-4">
            {/* Credit Policy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Credit Policy</label>
              <textarea
                {...register("creditPolicy")}
                placeholder="e.g., Credit terms, payment deadlines, etc."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                disabled={loading}
                rows={3}
              />
            </div>

            {/* Advance Payment Policy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Advance Payment Policy</label>
              <textarea
                {...register("advancePaymentPolicy")}
                placeholder="e.g., Advance payment requirements for bookings"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                disabled={loading}
                rows={3}
              />
            </div>

            {/* Refund Policy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Refund Policy</label>
              <textarea
                {...register("refundPolicy")}
                placeholder="e.g., Refund processing time, conditions, etc."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                disabled={loading}
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountingSection;