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

const toPdfSafeText = (text) =>
  String(text ?? '')
    .replaceAll('≤', '<=')
    .replaceAll('≥', '>=');

const Prediction = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [ecgDataFile, setEcgDataFile] = useState(null);
  const [tabularFile, setTabularFile] = useState(null);
  const [tabularMode, setTabularMode] = useState('file');
  const [tabularValues, setTabularValues] = useState({
    ageAtEcg: '',
    sex: 'male',
    ventricularRate: '',
    atrialRate: '',
    prInterval: '',
    qrsDuration: '',
    qtCorrected: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const getEcgExt = () => {
    const name = String(selectedFile?.name || '').toLowerCase();
    if (name.endsWith('.npy')) return 'npy';
    if (name.endsWith('.mat')) return 'mat';
    if (name.endsWith('.hea')) return 'hea';
    return '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setEcgDataFile(null);
    setResult(null);
    setError('');
  };

  const handleEcgDataChange = (e) => {
    const file = e.target.files[0];
    setEcgDataFile(file);
    setResult(null);
    setError('');
  };

  const handleTabularChange = (e) => {
    const file = e.target.files[0];
    setTabularFile(file);
    setTabularMode('file');
    setResult(null);
    setError('');
  };

  const handleTabularModeChange = (mode) => {
    setTabularMode(mode);
    if (mode !== 'file') {
      setTabularFile(null);
    }
    setResult(null);
    setError('');
  };

  const handleTabularValueChange = (key, value) => {
    setTabularValues((prev) => ({ ...prev, [key]: value }));
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
    if (!token) {
      setError('Please login to generate a prediction.');
      return;
    }

    setIsProcessing(true);
    setResult(null);
    setError('');

    try {
      const ecgExt = getEcgExt();
      if (!ecgExt) {
        setError('Only .npy, .mat, or .hea ECG files are supported for model prediction right now.');
        return;
      }
      if (ecgExt === 'hea') {
        if (!ecgDataFile) {
          alert('Please upload the matching .dat file for the selected .hea header.');
          return;
        }
        if (!String(ecgDataFile.name || '').toLowerCase().endsWith('.dat')) {
          setError('For .hea uploads, the ECG data file must be a .dat file.');
          return;
        }
      }
      const sampleBase64 = await readSampleBase64(selectedFile);
      const payload = {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        sampleBase64,
      };
      if (ecgExt === 'hea') {
        const ecgDataFileBase64 = await readSampleBase64(ecgDataFile);
        payload.ecgDataFileName = ecgDataFile.name;
        payload.ecgDataFileSize = ecgDataFile.size;
        payload.ecgDataFileBase64 = ecgDataFileBase64;
      }

      if (tabularMode === 'file') {
        if (!tabularFile) {
          alert("Please select a tabular .npy file to upload (or switch to manual input).");
          return;
        }
        if (!tabularFile.name.toLowerCase().endsWith('.npy')) {
          setError('Only .npy tabular files are supported for model prediction right now.');
          return;
        }
        const tabFileBase64 = await readSampleBase64(tabularFile);
        payload.tabFileName = tabularFile.name;
        payload.tabFileSize = tabularFile.size;
        payload.tabFileBase64 = tabFileBase64;
      } else {
        const toNumber = (v) => {
          const n = Number(String(v ?? '').trim());
          return Number.isFinite(n) ? n : null;
        };
        const age = toNumber(tabularValues.ageAtEcg);
        const ventricularRate = toNumber(tabularValues.ventricularRate);
        const atrialRate = toNumber(tabularValues.atrialRate);
        const prInterval = toNumber(tabularValues.prInterval);
        const qrsDuration = toNumber(tabularValues.qrsDuration);
        const qtCorrected = toNumber(tabularValues.qtCorrected);
        const sex = String(tabularValues.sex || '').toLowerCase() === 'female' ? 1 : 0;

        const vals = [age, sex, ventricularRate, atrialRate, prInterval, qrsDuration, qtCorrected];
        if (vals.some((v) => v == null)) {
          setError('Please enter all 7 tabular values (valid numbers).');
          return;
        }
        payload.tab = vals;
      }
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
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
    doc.text(toPdfSafeText(result.condition), 30, 90);
    
    doc.setTextColor(50, 50, 50);
    
    // Recommendation
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138); // blue-900
    doc.setFont('helvetica', 'bold');
    doc.text('Professional Recommendation:', 20, 125);
    
    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99); // gray-600
    doc.setFont('helvetica', 'normal');
    const splitRecommendation = doc.splitTextToSize(toPdfSafeText(result.recommendation), 170);
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
        const name = toPdfSafeText(item.name || LABEL_DISPLAY[item.label] || item.label);
        const status =
          typeof item.isPositive === 'boolean' ? (item.isPositive ? 'Positive' : 'Negative') : '';
        doc.text(status ? `${name} (${status})` : name, 25, yPos);
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

            {getEcgExt() === 'hea' && (
              <div
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer relative ${
                  isProcessing
                    ? 'bg-gray-100 border-gray-200 pointer-events-none'
                    : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                }`}
              >
                <input
                  type="file"
                  id="ecgDataFile"
                  name="ecgDataFile"
                  accept=".dat"
                  onChange={handleEcgDataChange}
                  disabled={isProcessing}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">
                    {ecgDataFile ? ecgDataFile.name : 'Click to Upload ECG .dat File (required for .hea)'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {ecgDataFile ? `${(ecgDataFile.size / 1024).toFixed(2)} KB` : 'Required when ECG is .hea'}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg border border-gray-100 p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="text-sm font-bold text-gray-800">Tabular Data (7 features)</div>
                  <div className="text-xs text-gray-500">Required for prediction</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTabularModeChange('file')}
                    disabled={isProcessing}
                    className={`px-3 py-1.5 text-xs font-bold rounded ${
                      tabularMode === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                    } ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    Upload .npy
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabularModeChange('manual')}
                    disabled={isProcessing}
                    className={`px-3 py-1.5 text-xs font-bold rounded ${
                      tabularMode === 'manual' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                    } ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    Enter Manually
                  </button>
                </div>
              </div>

              {tabularMode === 'file' ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer relative ${
                    isProcessing
                      ? 'bg-gray-100 border-gray-200 pointer-events-none'
                      : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                  }`}
                >
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
                      {tabularFile ? `${(tabularFile.size / 1024).toFixed(2)} KB` : 'Required (7 values)'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Age</label>
                    <input
                      type="number"
                      value={tabularValues.ageAtEcg}
                      onChange={(e) => handleTabularValueChange('ageAtEcg', e.target.value)}
                      disabled={isProcessing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="e.g. 45"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Sex</label>
                    <select
                      value={tabularValues.sex}
                      onChange={(e) => handleTabularValueChange('sex', e.target.value)}
                      disabled={isProcessing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Ventricular Rate</label>
                    <input
                      type="number"
                      value={tabularValues.ventricularRate}
                      onChange={(e) => handleTabularValueChange('ventricularRate', e.target.value)}
                      disabled={isProcessing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="e.g. 75"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Atrial Rate</label>
                    <input
                      type="number"
                      value={tabularValues.atrialRate}
                      onChange={(e) => handleTabularValueChange('atrialRate', e.target.value)}
                      disabled={isProcessing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="e.g. 75"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">PR Interval</label>
                    <input
                      type="number"
                      value={tabularValues.prInterval}
                      onChange={(e) => handleTabularValueChange('prInterval', e.target.value)}
                      disabled={isProcessing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="e.g. 160"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">QRS Duration</label>
                    <input
                      type="number"
                      value={tabularValues.qrsDuration}
                      onChange={(e) => handleTabularValueChange('qrsDuration', e.target.value)}
                      disabled={isProcessing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="e.g. 90"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">QT Corrected</label>
                    <input
                      type="number"
                      value={tabularValues.qtCorrected}
                      onChange={(e) => handleTabularValueChange('qtCorrected', e.target.value)}
                      disabled={isProcessing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="e.g. 410"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={
                isProcessing ||
                !selectedFile ||
                (getEcgExt() === 'hea' && !ecgDataFile) ||
                (tabularMode === 'file' && !tabularFile)
              }
              className={`w-full font-bold py-3 px-6 rounded-lg transition duration-300 mt-6 ${
                isProcessing ||
                !selectedFile ||
                (getEcgExt() === 'hea' && !ecgDataFile) ||
                (tabularMode === 'file' && !tabularFile)
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
              
              <div />
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
                  {result.topLabels.map((item) => (
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
