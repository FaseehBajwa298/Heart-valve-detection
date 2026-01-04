import React from 'react';

const Hero = () => {
  return (
    <div id="home" className="relative bg-blue-50 min-h-[85vh] w-full flex items-center overflow-hidden py-12 md:py-0">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/90 to-white/60 z-0"></div>

      {/* Main Content Container */}
      <div className="container mx-auto px-4 md:px-12 z-10 flex flex-col md:flex-row items-center justify-between gap-12">
        
        {/* Left Side: Text Content */}
        <div className="w-full md:w-1/2 text-left relative">
          <h3 className="text-[#1a2e35] text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
            AI-Based Heart Valve Disorder Classification
          </h3>

          <div className="text-gray-700 text-sm md:text-base leading-relaxed mb-8 max-w-xl space-y-4">
            <p>
              Heart valve disorders occur when one or more valves of the heart do not open or close properly, affecting normal blood flow through the heart. This can lead to conditions such as valve narrowing (stenosis) or leakage (regurgitation), which may cause symptoms like shortness of breath, fatigue, chest pain, or irregular heartbeat.
            </p>
            <p>
              This system uses ECG to assist in identifying the likelihood of major heart valve disorders through an intelligent computational approach.
            </p>
          </div>
        </div>

        {/* Right Side: Image */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end relative">
          <img 
            src="/home1.png" 
            alt="Medical Professional" 
            className="max-w-full h-auto object-contain drop-shadow-xl rounded-lg"
          />
        </div>
      </div>
      
      {/* Background Image Layer (Optional, kept low opacity) */}
      <div className="absolute inset-0 -z-10 opacity-10 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center">
      </div>
    </div>
  );
};

export default Hero;
