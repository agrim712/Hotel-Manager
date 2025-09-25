import React from 'react';
import POSLayout from '../../Components/POS/POSLayout';

const POSSettings = () => {
  return (
    <POSLayout title="POS Settings">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Configuration</h2>
          <p className="text-gray-600">POS settings and configuration options will be available here.</p>
          
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">Receipt Settings</h3>
              <p className="text-sm text-gray-500 mt-1">Configure receipt templates and printing options</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">Tax Configuration</h3>
              <p className="text-sm text-gray-500 mt-1">Setup tax rates and calculation methods</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">Payment Methods</h3>
              <p className="text-sm text-gray-500 mt-1">Configure accepted payment methods</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">System Preferences</h3>
              <p className="text-sm text-gray-500 mt-1">General system settings and preferences</p>
            </div>
          </div>
        </div>
      </div>
    </POSLayout>
  );
};

export default POSSettings;