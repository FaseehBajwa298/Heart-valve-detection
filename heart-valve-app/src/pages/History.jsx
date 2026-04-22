import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const History = () => {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [historyData, setHistoryData] = useState(() => {
    const savedHistory = localStorage.getItem('patientHistory');
    return savedHistory ? JSON.parse(savedHistory) : [
      { id: 1, date: '2023-12-15', heartRate: 72, prediction: 'Normal', confidence: '98%' },
      { id: 2, date: '2023-11-20', heartRate: 75, prediction: 'Low Risk', confidence: '85%' },
      { id: 3, date: '2023-10-05', heartRate: 68, prediction: 'Normal', confidence: '99%' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('patientHistory', JSON.stringify(historyData));
  }, [historyData]);

  useEffect(() => {
    const loadFromApi = async () => {
      if (!token) return;
      setIsLoading(true);
      setError('');
      try {
        const res = await fetch('/api/history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data?.message || 'Failed to load history');
          return;
        }
        setHistoryData(
          (data.items || []).map((item) => ({
            id: item.id,
            date: item.date,
            heartRate: item.heartRate,
            prediction: item.prediction,
            confidence: item.confidence || '',
          }))
        );
      } catch {
        setError('Failed to load history');
      } finally {
        setIsLoading(false);
      }
    };
    loadFromApi();
  }, [token]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setHistoryData((prevData) => prevData.filter((item) => item.id !== id));
      if (token) {
        try {
          await fetch(`/api/history/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch {
          setError('Failed to delete record from database');
        }
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to clear all history? This action cannot be undone.")) {
      setHistoryData([]);
      if (token) {
        try {
          await fetch('/api/history', {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch {
          setError('Failed to clear history from database');
        }
      }
    }
  };

  const handleViewDetails = (record) => {
    window.alert(
      `Date: ${record.date}\nHeart Rate: ${record.heartRate} bpm\nPrediction: ${record.prediction}\nConfidence: ${record.confidence || 'N/A'}`
    );
  };

  return (
    <div className="pt-24 pb-12 px-4 md:px-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a2e35] mb-2">Patient History</h1>
          <div className="w-20 h-1 bg-blue-500"></div>
        </div>
        
        {historyData.length > 0 && !isLoading && (
          <button 
            onClick={handleClearAll}
            className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All History
          </button>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-semibold text-gray-800">Recent Prediction Records</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
            {historyData.length} Records
          </span>
        </div>

        {error && (
          <div className="p-4 border-b border-gray-100 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600">Loading history...</p>
          </div>
        ) : historyData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heart Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prediction</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historyData.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.heartRate} bpm</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.prediction === 'Normal' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.prediction}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.confidence}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleViewDetails(record)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => handleDelete(record.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Records Found</h3>
            <p className="text-gray-500 max-w-xs mx-auto">
              You haven't generated any ECG predictions yet. Start by uploading a file on the prediction page.
            </p>
          </div>
        )}
        
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <p className="text-sm text-gray-500 text-center italic">
            {token ? 'Records are stored in the database.' : 'Records are stored locally for your convenience.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default History;
