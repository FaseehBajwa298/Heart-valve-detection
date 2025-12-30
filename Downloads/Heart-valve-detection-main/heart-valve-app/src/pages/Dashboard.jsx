import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="container mx-auto px-4 md:px-12 py-12">
      <h1 className="text-3xl font-bold text-[#1a2e35] mb-8">Dashboard</h1>
      <p className="text-gray-600 mb-12">Welcome to your dashboard. Select a tool to proceed.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ECG Prediction Card */}
        <Link 
          to="/prediction"
          className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-blue-500 group flex flex-col h-full transform hover:-translate-y-1"
        >
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[#1a2e35] mb-4">ECG-Based Prediction</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            Upload and analyze ECG data to generate predictions related to heart valve conditions.
          </p>
          <div className="mt-auto">
            <span className="inline-block bg-blue-500 text-white px-6 py-2 rounded-full font-medium text-sm group-hover:bg-blue-600 transition-colors">
              Go to Prediction
            </span>
          </div>
        </Link>

        {/* Patient History Card */}
        <Link 
          to="/history"
          className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-blue-500 group flex flex-col h-full transform hover:-translate-y-1"
        >
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[#1a2e35] mb-4">Patient History</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            View stored records and review previous prediction results to track changes over time.
          </p>
          <div className="mt-auto">
            <span className="inline-block bg-blue-500 text-white px-6 py-2 rounded-full font-medium text-sm group-hover:bg-blue-600 transition-colors">
              View History
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
