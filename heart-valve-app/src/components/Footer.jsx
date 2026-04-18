<div className="flex items-center gap-2">
      <svg
        viewBox="0 0 48 48"
        className="w-10 h-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="hv-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        {/* Outer rounded card */}
        <rect
          x="4"
          y="4"
          width="40"
          height="40"
          rx="12"
          fill="url(#hv-gradient)"
        />

        {/* ECG line */}
        <polyline
          points="8,26 14,22 18,28 22,16 28,30 32,22 40,24"
          fill="none"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Small heart icon */}
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
