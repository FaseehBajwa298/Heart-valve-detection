import React from 'react';

const About = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a2e35] mb-4">About Us</h2>
          <div className="w-20 h-1 bg-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            An academic project focused on the application of computational techniques for cardiac health assessment.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2">
            <img 
              src="https://as2.ftcdn.net/v2/jpg/18/45/76/29/1000_F_1845762966_yXYlDMV6vwgpZXgT30ZJkvpYnQp7EJoa.jpg" 
              alt="Medical Technology Visualization" 
              className="rounded-lg shadow-xl w-full object-cover h-[400px]"
            />
          </div>
          
          <div className="w-full md:w-1/2">
            <h3 className="text-2xl font-bold text-[#1a2e35] mb-6">Who We Are</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              We are an academic research team working on the application of intelligent computational methods to support the assessment of heart valve disorders.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              Heart valve diseases occur when one or more valves of the heart fail to open or close properly, leading to abnormal blood flow and increased strain on the heart. Early identification of such conditions is important for timely medical evaluation.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              This project focuses on analyzing ECG-derived clinical parameters to assist in identifying patterns that may be associated with heart valve abnormalities. The system is designed for educational and research purposes, demonstrating how data-driven approaches can contribute to cardiac health assessment in a controlled academic setting.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
