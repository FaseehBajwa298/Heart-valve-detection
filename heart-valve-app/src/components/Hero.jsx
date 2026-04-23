import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section id="home" className="relative w-full overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white py-14 md:py-20">
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-28 left-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl"></div>

      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-xs font-semibold tracking-wide text-blue-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-blue-600"></span>
              ECG-assisted screening · Research demo
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
              HeartValve AI
              <span className="block text-blue-700">Early insights from ECG patterns</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
              Upload an ECG file to get a fast, research-focused prediction and keep a clear history of results. Designed for education and academic demonstrations.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/prediction"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Try Prediction
              </Link>
              <a
                href="/#services"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Explore Features
              </a>
            </div>

            <div className="mt-4 text-xs leading-relaxed text-slate-500">
              Not a medical device. For education and research use only.
            </div>

            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">Prediction</div>
                <div className="mt-1 text-xs text-slate-600">ECG sample-based analysis</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">History</div>
                <div className="mt-1 text-xs text-slate-600">Track results over time</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">Authentication</div>
                <div className="mt-1 text-xs text-slate-600">Token-based protected routes</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-blue-200/60 to-cyan-200/40 blur-xl"></div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <img
                src="/home1.png"
                alt="HeartValve AI"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
