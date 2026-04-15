import React, { useState } from 'react';

const Prediction = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setResult(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select an ECG file to upload.");
      return;
    }
    
    setIsProcessing(true);
    setResult(null);
    
    // Simulate processing for 3 seconds
    setTimeout(() => {
      setIsProcessing(false);
      // Mock result
      setResult({
        condition: "Normal",
        confidence: "98.5%",
        heartRate: "72 bpm",
        recommendation: "Your ECG results appear within normal range. Maintain a healthy lifestyle and regular checkups."
      });
    }, 3000);
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

            <button
              type="submit"
              disabled={isProcessing || !selectedFile}
              className={`w-full font-bold py-3 px-6 rounded-lg transition duration-300 mt-6 ${
                isProcessing || !selectedFile 
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
                <div className="text-center">
                  <p className="text-sm text-gray-500 font-semibold mb-1">Heart Rate</p>
                  <p className="text-xl font-bold text-gray-800">{result.heartRate}</p>
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

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setResult(null)}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-200 transition"
              >
                Upload New File
              </button>
              <button
                className="flex-1 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition shadow-lg"
              >
                Download Report (PDF)
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
