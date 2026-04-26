import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';

const LABEL_DISPLAY = {
  lvef_lte_45_flag: 'Reduced LVEF (≤45%)',
  lvwt_gte_13_flag: 'Increased LV Wall Thickness (≥13mm)',
  aortic_stenosis_moderate_or_greater_flag: 'Aortic Stenosis (Moderate+)',
  aortic_regurgitation_moderate_or_greater_flag: 'Aortic Regurgitation (Moderate+)',
  mitral_regurgitation_moderate_or_greater_flag: 'Mitral Regurgitation (Moderate+)',
  tricuspid_regurgitation_moderate_or_greater_flag: 'Tricuspid Regurgitation (Moderate+)',
  pulmonary_regurgitation_moderate_or_greater_flag: 'Pulmonary Regurgitation (Moderate+)',
  rv_systolic_dysfunction_moderate_or_greater_flag: 'RV Systolic Dysfunction (Moderate+)',
  pericardial_effusion_moderate_large_flag: 'Pericardial Effusion (Moderate/Large)',
  pasp_gte_45_flag: 'PASP ≥45 mmHg',
  tr_max_gte_32_flag: 'TR Max ≥3.2 m/s',
  shd_moderate_or_greater_flag: 'Structural Heart Disease (Moderate+)',
};

const formatPercent = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return String(value || '');
  const pct = num > 1 ? num : num * 100;
  return `${pct.toFixed(1)}%`;
};

const History = () => {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

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
            result: item.result, // Add full result object
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
    // If result is missing (old records), create a fallback result object
    if (!record.result) {
      const fallbackResult = {
        condition: record.prediction,
        prediction: record.prediction,
        confidence: record.confidence,
        heartRate: record.heartRate,
        recommendation: record.prediction === 'Normal' 
          ? 'No strong abnormal indicators detected. Maintain a healthy lifestyle and regular checkups.'
          : 'Possible indicators detected. Please consult a cardiologist for further evaluation.',
        topLabels: [] // Old records don't have top labels
      };
      setSelectedRecord({ ...record, result: fallbackResult });
    } else {
      setSelectedRecord(record);
    }
  };

  const closeDetails = () => setSelectedRecord(null);

  const handleDownloadReport = (record) => {
     if (!record || !record.result) return;
     const { result } = record;
     
     const doc = new jsPDF();
     
     // Header
     doc.setFillColor(59, 130, 246); // Blue-600
     doc.rect(0, 0, 210, 40, 'F');
     
     doc.setTextColor(255, 255, 255);
     doc.setFontSize(22);
     doc.setFont('helvetica', 'bold');
     doc.text('HeartValve AI - Prediction Report', 20, 25);
     
     // Report Info
     doc.setTextColor(50, 50, 50);
     doc.setFontSize(10);
     doc.setFont('helvetica', 'normal');
     doc.text(`Report Date: ${record.date}`, 20, 50);
     
     // Main Result Box
     doc.setDrawColor(230, 230, 230);
     doc.setFillColor(249, 250, 251); // gray-50
     doc.roundedRect(20, 65, 170, 40, 3, 3, 'FD');
     
     doc.setFontSize(12);
     doc.setTextColor(100, 100, 100);
     doc.text('CONDITION RESULT', 30, 75);
     
     doc.setFontSize(24);
     if (result.condition === 'Normal') {
       doc.setTextColor(22, 163, 74); // green-600
     } else {
       doc.setTextColor(220, 38, 38); // red-600
     }
     doc.text(result.condition, 30, 90);
     
     doc.setTextColor(50, 50, 50);
     doc.setFontSize(10);
     doc.text('Confidence:', 130, 75);
     doc.setFontSize(14);
     doc.text(result.confidence, 130, 85);
     
     doc.setFontSize(10);
     doc.text('Heart Rate:', 130, 95);
     doc.setFontSize(14);
     doc.text(result.heartRate && result.heartRate !== 0 ? `${result.heartRate} bpm` : '—', 130, 105);
     
     // Recommendation
     doc.setFontSize(12);
     doc.setTextColor(30, 58, 138); // blue-900
     doc.setFont('helvetica', 'bold');
     doc.text('Professional Recommendation:', 20, 125);
     
     doc.setFontSize(11);
     doc.setTextColor(75, 85, 99); // gray-600
     doc.setFont('helvetica', 'normal');
     const splitRecommendation = doc.splitTextToSize(result.recommendation, 170);
     doc.text(splitRecommendation, 20, 135);
     
     // Detected Conditions
     if (Array.isArray(result.topLabels) && result.topLabels.length > 0) {
       let yPos = 160;
       doc.setFontSize(12);
       doc.setTextColor(31, 41, 55); // gray-800
       doc.setFont('helvetica', 'bold');
       doc.text('Detected Conditions:', 20, yPos);
       
       yPos += 10;
       doc.setFontSize(10);
       doc.setFont('helvetica', 'normal');
       
       result.topLabels.slice(0, 8).forEach((item) => {
         const name = item.name || LABEL_DISPLAY[item.label] || item.label;
         const conf = item.confidence || formatPercent(item.probability);
         const status =
           typeof item.isPositive === 'boolean' ? (item.isPositive ? 'Positive' : 'Negative') : '';
         doc.text(status ? `${name} (${status})` : name, 25, yPos);
         doc.text(conf, 160, yPos);
         yPos += 7;
       });
     }
     
     // Footer
     doc.setFontSize(8);
     doc.setTextColor(150, 150, 150);
     doc.text('Note: This is an AI-generated prediction and should not replace professional medical advice.', 105, 285, { align: 'center' });
     
     doc.save(`ecg-report-${record.date}.pdf`);
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.heartRate ? `${record.heartRate} bpm` : '—'}</td>
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
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-md text-sm font-bold transition-colors border border-blue-200"
                        >
                          Open Report
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

      {/* Modal for Detailed Report */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <div className="flex-grow text-center">
                <h2 className="text-2xl font-bold">Analysis Complete</h2>
              </div>
              <button onClick={closeDetails} className="text-white hover:text-blue-100 transition-colors absolute right-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8 border-b border-gray-100 pb-8">
                <div className="text-center md:text-left">
                  <p className="text-sm text-gray-500 uppercase font-semibold tracking-wider mb-1">Condition Result</p>
                  <h3 className={`text-4xl font-bold ${selectedRecord.result.condition === 'Normal' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedRecord.result.condition}
                  </h3>
                </div>
                
                <div className="flex gap-8">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 font-semibold mb-1">Confidence</p>
                    <p className="text-xl font-bold text-gray-800">{selectedRecord.result.confidence}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 font-semibold mb-1">Heart Rate</p>
                    <p className="text-xl font-bold text-gray-800">{selectedRecord.result.heartRate && selectedRecord.result.heartRate !== 0 ? `${selectedRecord.result.heartRate} bpm` : '—'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-100">
                <h4 className="font-bold text-blue-800 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Professional Recommendation
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {selectedRecord.result.recommendation}
                </p>
              </div>

              {Array.isArray(selectedRecord.result.topLabels) && selectedRecord.result.topLabels.length > 0 && (
                <div className="bg-white rounded-lg p-6 mb-8 border border-gray-100">
                  <h4 className="font-bold text-gray-800 mb-3">Detected Conditions</h4>
                  <div className="space-y-2">
                    {selectedRecord.result.topLabels.slice(0, 5).map((item) => (
                      <div key={item.label || item.name} className="flex items-center justify-between gap-4">
                        <div className="text-sm font-semibold text-gray-800">
                          {item.name || LABEL_DISPLAY[item.label] || item.label}
                        </div>
                        <div className="flex items-center gap-3">
                          {typeof item.isPositive === 'boolean' && (
                            <div
                              className={`text-xs font-bold px-2 py-1 rounded ${
                                item.isPositive ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {item.isPositive ? 'Positive' : 'Negative'}
                            </div>
                          )}
                          <div className="text-sm font-bold text-blue-700">
                            {item.confidence || formatPercent(item.probability)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={closeDetails}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-200 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadReport(selectedRecord)}
                  className="flex-1 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition shadow-lg"
                >
                  Download Report
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
              <p className="text-xs text-gray-500 italic">
                Note: Analysis for record dated {selectedRecord.date}. This is an AI-generated prediction.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
