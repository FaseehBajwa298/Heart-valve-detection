import React from 'react';

const About = () => {
  return (
    <section id="about" className="bg-slate-50 py-20 border-t border-slate-100">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">About</h2>
          <p className="mt-4 mx-auto max-w-2xl text-slate-600">
            A research-focused project that demonstrates how ECG patterns can support early insight into heart valve conditions.
          </p>
        </div>

        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-slate-200">
              <span className="h-2 w-2 rounded-full bg-blue-600"></span>
              Educational & research use
            </div>

            <h3 className="mt-6 text-2xl font-extrabold text-slate-900">What this system provides</h3>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Heart valve issues can impact blood flow and place additional strain on the heart. This project demonstrates a practical workflow: learn the clinical context, run an ECG-based prediction, and review results history.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 ring-1 ring-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Clear flow</div>
                  <div className="mt-1 text-sm text-slate-600">Overview → prediction → history, designed for easy demo.</div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 ring-1 ring-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Fast results</div>
                  <div className="mt-1 text-sm text-slate-600">Quick response for practice and presentation.</div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 ring-1 ring-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.657 1.343-3 3-3s3 1.343 3 3v2a3 3 0 01-6 0v-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13V9a3 3 0 016 0v4" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Account-based access</div>
                  <div className="mt-1 text-sm text-slate-600">Auth-protected endpoints for prediction and history.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <img
                src="https://as2.ftcdn.net/v2/jpg/18/45/76/29/1000_F_1845762966_yXYlDMV6vwgpZXgT30ZJkvpYnQp7EJoa.jpg"
                alt="Medical technology visualization"
                className="h-[420px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
