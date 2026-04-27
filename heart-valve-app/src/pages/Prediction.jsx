import React, { useState } from 'react';
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

const Prediction = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [tabularFile, setTabularFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setResult(null);
    setError('');
  };

  const handleTabularChange = (e) => {
    const file = e.target.files[0];
    setTabularFile(file);
    setResult(null);
    setError('');
  };

  const readSampleBase64 = async (file) => {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    let binary = '';
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select an ECG file to upload.");
      return;
    }
    if (!tabularFile) {
      alert("Please select a tabular .npy file to upload.");
      return;
    }

    setIsProcessing(true);
    setResult(null);
    setError('');

    try {
      if (!selectedFile.name.toLowerCase().endsWith('.npy')) {
        setError('Only .npy ECG files are supported for model prediction right now.');
        return;
      }
      if (!tabularFile.name.toLowerCase().endsWith('.npy')) {
        setError('Only .npy tabular files are supported for model prediction right now.');
        return;
      }
      const sampleBase64 = await readSampleBase64(selectedFile);
      const tabFileBase64 = await readSampleBase64(tabularFile);
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          sampleBase64,
          tabFileName: tabularFile.name,
          tabFileSize: tabularFile.size,
          tabFileBase64,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const message = data?.message || 'Prediction failed';
        const detail = data?.detail ? `: ${data.detail}` : '';
        setError(`${message}${detail}`);
        return;
      }
      setResult(data.result);
    } catch {
      setError('Prediction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadReport = () => {
    if (!result) return;
    
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleString();
    
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
    doc.text(`Report Date: ${dateStr}`, 20, 50);
    doc.text(`File Name: ${selectedFile?.name || 'N/A'}`, 20, 55);
    
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
    
    doc.save(`ecg-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="pt-24 pb-12 px-4 md:px-12 max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-[#1a2e35] mb-6">ECG-Based Prediction</h1>
      <div className="w-20 h-1 bg-blue-500 mb-8"></div>
      
      {!result ? (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <p className="text-gray-600 mb-8">
            Upload your ECG file below to assess the likelihood of heart valve disorders.
          </p>

          {error && (
            <div className="mb-6 p-3 rounded bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center transition-colors cursor-pointer relative ${
              isProcessing ? 'bg-gray-100 border-gray-200 pointer-events-none' : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
            }`}>
              <input
                type="file"
                id="ecgFile"
                name="ecgFile"
                accept=".npy,.mat,.hea"
                onChange={handleFileChange}
                disabled={isProcessing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-center">
                {isProcessing ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-lg font-medium text-blue-600">Processing ECG Data...</p>
                    <p className="text-sm text-gray-500 mt-1">Analyzing heart patterns</p>
                  </div>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {selectedFile ? (
                      <div>
                        <p className="text-lg font-medium text-gray-700">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500 mt-1">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-medium text-gray-700">Click to Upload ECG File</p>
                        <p className="text-sm text-gray-500 mt-1">Supported formats: .npy, .mat, .hea</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer relative ${
              isProcessing ? 'bg-gray-100 border-gray-200 pointer-events-none' : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
            }`}>
              <input
                type="file"
                id="tabularFile"
                name="tabularFile"
                accept=".npy"
                onChange={handleTabularChange}
                disabled={isProcessing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  {tabularFile ? tabularFile.name : 'Click to Upload Tabular .npy File'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {tabularFile ? `${(tabularFile.size / 1024).toFixed(2)} KB` : 'Required (7 tabular features)'}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing || !selectedFile || !tabularFile}
              className={`w-full font-bold py-3 px-6 rounded-lg transition duration-300 mt-6 ${
                isProcessing || !selectedFile || !tabularFile
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isProcessing ? 'Analyzing...' : 'Generate Prediction'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-fade-in">
          <div className="bg-blue-600 p-6 text-white text-center">
            <h2 className="text-2xl font-bold">Analysis Complete</h2>
          </div>
          
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8 border-b border-gray-100 pb-8">
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-500 uppercase font-semibold tracking-wider mb-1">Condition Result</p>
                <h3 className={`text-4xl font-bold ${result.condition === 'Normal' ? 'text-green-600' : 'text-red-600'}`}>
                  {result.condition}
                </h3>
              </div>
              
              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-sm text-gray-500 font-semibold mb-1">Confidence</p>
                  <p className="text-xl font-bold text-gray-800">{result.confidence}</p>
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
                {result.recommendation}
              </p>
            </div>

            {Array.isArray(result.topLabels) && result.topLabels.length > 0 && (
              <div className="bg-white rounded-lg p-6 mb-8 border border-gray-100">
                <h4 className="font-bold text-gray-800 mb-3">Detected Conditions</h4>
                <div className="space-y-2">
                  {result.topLabels.slice(0, 5).map((item) => (
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
                onClick={() => setResult(null)}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-200 transition"
              >
                Upload New File
              </button>
              <button
                onClick={handleDownloadReport}
                className="flex-1 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition shadow-lg"
              >
                Download Report
              </button>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
            <p className="text-xs text-gray-500 italic">
              Note: This is an AI-generated prediction and should not replace professional medical advice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prediction;
