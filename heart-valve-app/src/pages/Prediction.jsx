import React, { useState } from 'react';

const Prediction = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select an ECG file to upload.");
      return;
    }
    alert(`File "${selectedFile.name}" ready for processing. Prediction functionality will be implemented here.`);
  };

  return (
    <div className="pt-24 pb-12 px-4 md:px-12 max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-[#1a2e35] mb-6">ECG-Based Prediction</h1>
      <div className="w-20 h-1 bg-blue-500 mb-8"></div>
      
      <div className="bg-white rounded-lg shadow-lg p-8">
        <p className="text-gray-600 mb-8">
          Upload your ECG file below to assess the likelihood of heart valve disorders.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
            <input
              type="file"
              id="ecgFile"
              name="ecgFile"
              accept=".npy,.mat,.hea"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-center">
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
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 mt-6"
          >
            Generate Prediction
          </button>
        </form>
      </div>
    </div>
  );
};

export default Prediction;
