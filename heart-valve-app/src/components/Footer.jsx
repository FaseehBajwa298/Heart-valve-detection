import React from 'react';

const FooterLogo = () => {
  return (
    <div className="flex items-center gap-2">
      <svg viewBox="0 0 48 48" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="hv-footer-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#hv-footer-gradient)" />

        <polyline
          points="8,26 14,22 18,28 22,16 28,30 32,22 40,24"
          fill="none"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M16 15c-1.6-2.2 0.4-5 2.8-5 1.2 0 2.1 0.6 2.7 1.5 0.6-0.9 1.5-1.5 2.7-1.5 2.4 0 4.4 2.8 2.8 5
             -1.4 2-3.9 3.6-5.5 4.5 -1.6-0.9-4.1-2.5-5.5-4.5z"
          fill="white"
          opacity="0.9"
        />
      </svg>

      <span className="font-semibold text-xl tracking-tight">
        <span className="text-white">Heart</span>
        <span className="text-white">Valve</span>
        <span className="text-white"> AI</span>
      </span>
    </div>
  );
};

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <FooterLogo />
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              ECG-based prediction workflow for research and educational demonstrations.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 text-sm md:grid-cols-1">
            <div>
              <div className="font-bold text-white">Quick Links</div>
              <div className="mt-4 grid gap-3">
                <a href="/#home" className="text-slate-300 hover:text-white transition-colors">Home</a>
                <a href="/#services" className="text-slate-300 hover:text-white transition-colors">Services</a>
                <a href="/#about" className="text-slate-300 hover:text-white transition-colors">About</a>
                <a href="/#contact" className="text-slate-300 hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
          <div>© {year} HeartValve AI</div>
          <div>Built for academic use</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
