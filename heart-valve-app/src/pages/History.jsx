import React from 'react';

const History = () => {
  // Placeholder data for demonstration
  const historyData = [
    { id: 1, date: '2023-12-15', heartRate: 72, prediction: 'Normal' },
    { id: 2, date: '2023-11-20', heartRate: 75, prediction: 'Low Risk' },
    { id: 3, date: '2023-10-05', heartRate: 68, prediction: 'Normal' },
  ];

  return (
    <div className="pt-24 pb-12 px-4 md:px-12 max-w-7xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-[#1a2e35] mb-6">Patient History</h1>
      <div className="w-20 h-1 bg-blue-500 mb-8"></div>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Recent Prediction Records</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heart Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prediction Result</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {historyData.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.heartRate} bpm</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      record.prediction === 'Normal' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.prediction}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <p className="text-sm text-gray-500 text-center">
            Login to view your full patient history.
          </p>
        </div>
      </div>
    </div>
  );
};

export default History;
