import React from 'react';

const Onboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        Onboarding Page
      </h1>
      
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Welcome to Our Onboarding Process
        </h2>
        <p className="text-gray-600 mb-4">
          We'll guide you through setting up your account step by step.
        </p>
        
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-lg">Step 1: Account Setup</h3>
            <p className="text-gray-500">Complete your profile information</p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-lg">Step 2: Verification</h3>
            <p className="text-gray-500">Verify your email address</p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-lg">Step 3: Initial Configuration</h3>
            <p className="text-gray-500">Set up your preferences</p>
          </div>
        </div>
        
        <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Onboard;