export default function WaveformFlourish({ className = "" }: { className?: string }) {
  const wavePath =
    "M8 32 C18 32 20 28 28 28 S38 36 44 36 S54 25 60 25 S70 39 76 39 S86 21 92 21 S102 43 108 43 S118 16 124 16 S134 48 140 48 S150 8 156 8 S166 56 172 56 S182 17 188 17 S198 45 204 45 S214 22 220 22 S230 41 236 41 S246 26 252 26 S262 37 268 37 S278 29 284 29 S294 32 312 32";

  return (
    <svg
      viewBox="0 0 320 64"
      width="320"
      height="64"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="voice-wave-gradient" x1="8" y1="32" x2="312" y2="32">
          <stop offset="0" stopColor="#B98196" stopOpacity="0.28" />
          <stop offset="0.32" stopColor="#B98196" stopOpacity="0.8" />
          <stop offset="0.5" stopColor="#F891BB" />
          <stop offset="0.68" stopColor="#B98196" stopOpacity="0.8" />
          <stop offset="1" stopColor="#B98196" stopOpacity="0.28" />
        </linearGradient>
      </defs>

      <path
        d={wavePath}
        className="voice-wave-halo"
        stroke="#DAB9C6"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.16"
      />
      <path
        d={wavePath}
        className="voice-wave-line"
        stroke="url(#voice-wave-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={wavePath}
        className="voice-wave-pulse"
        pathLength="100"
        stroke="#F891BB"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
