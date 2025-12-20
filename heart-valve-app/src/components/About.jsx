import React from 'react';

const About = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a2e35] mb-4">About Us</h2>
          <div className="w-20 h-1 bg-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Dedicated to revolutionizing cardiac care through the power of Artificial Intelligence.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1576091160550-217358c7be61?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Medical Team" 
              className="rounded-lg shadow-xl w-full object-cover h-[400px]"
            />
          </div>
          
          <div className="w-full md:w-1/2">
            <h3 className="text-2xl font-bold text-[#1a2e35] mb-6">Who We Are</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              At Heart Valve AI, we are a team of medical professionals, data scientists, and engineers united by a single mission: to make heart valve disease detection accessible, accurate, and early.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              Traditional methods of diagnosing heart valve disorders often require expensive equipment and specialized training. Our platform leverages state-of-the-art Machine Learning algorithms trained on thousands of heart sound recordings to provide instant, reliable screenings.
            </p>
            
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <span className="block text-3xl font-bold text-blue-600 mb-2">98%+</span>
                <span className="text-sm text-gray-600">Accuracy Rate</span>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <span className="block text-3xl font-bold text-blue-600 mb-2">24/7</span>
                <span className="text-sm text-gray-600">Available Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
