import React from 'react';
import { Link } from 'react-router-dom';

const Services = () => {
  const services = [
    {
      title: "Heart Valve Disorder Overview",
      description: "Provides basic information about heart valve disorders, explaining how valve problems can affect normal blood flow and overall heart function.",
      link: "/overview",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className=" bg-red h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      title: "ECG-Based Prediction",
      description: "Uses ECG to generate a prediction related to heart valve conditions.",
      link: "/dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      title: "Patient Historyfuc",
      description: "Allows storage and review of previous prediction records to help observe patterns or changes over time.",
      link: "/dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a2e35] mb-4">Our Services</h2>
          <div className="w-20 h-1 bg-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Key features designed to support the assessment of heart valve disorders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Link 
              key={index} 
              to={service.link}
              className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-blue-500 group flex flex-col h-full transform hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-[#1a2e35] mb-4">{service.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {service.description}
              </p>
              <div className="mt-auto">
                <span className="inline-block bg-blue-500 text-white px-6 py-2 rounded-full font-medium text-sm group-hover:bg-blue-600 transition-colors">
                  View
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
