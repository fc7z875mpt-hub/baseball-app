export function DiamondLogo({ size = 148 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Silver diamond corner pieces – top */}
      <path
        d="M120 18 L168 66 L156 78 L120 42 L84 78 L72 66 Z"
        fill="#c5cdd6"
      />
      {/* Bottom */}
      <path
        d="M120 222 L168 174 L156 162 L120 198 L84 162 L72 174 Z"
        fill="#c5cdd6"
      />
      {/* Left */}
      <path
        d="M18 120 L66 72 L78 84 L42 120 L78 156 L66 168 Z"
        fill="#c5cdd6"
      />
      {/* Right */}
      <path
        d="M222 120 L174 72 L162 84 L198 120 L162 156 L174 168 Z"
        fill="#c5cdd6"
      />

      {/* Red stitch arcs – left side */}
      <path
        d="M70 70 Q55 120 70 170"
        stroke="#e11d2e"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      {/* Left stitch ticks */}
      <path d="M62 78 L74 72" stroke="#e11d2e" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M58 92 L72 88" stroke="#e11d2e" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M56 108 L71 106" stroke="#e11d2e" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M56 132 L71 134" stroke="#e11d2e" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M58 148 L72 152" stroke="#e11d2e" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M62 162 L74 168" stroke="#e11d2e" strokeWidth="3.2" strokeLinecap="round" />

      {/* Red stitch arcs – right side */}
      <path
        d="M170 70 Q185 120 170 170"
        stroke="#e11d2e"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      {/* Right stitch ticks */}
      <path d="M178 78 L166 72" stroke="#e11d2e" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M182 92 L168 88" stroke="#e11d2e" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M184 108 L169 106" stroke="#e11d2e" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M184 132 L169 134" stroke="#e11d2e" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M182 148 L168 152" stroke="#e11d2e" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M178 162 L166 168" stroke="#e11d2e" strokeWidth="3.2" strokeLinecap="round" />

      {/* Baseball */}
      <circle cx="120" cy="120" r="42" fill="#ffffff" />

      {/* Ball seams – classic curved */}
      <path
        d="M98 90 Q112 120 98 150"
        stroke="#e11d2e"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M142 90 Q128 120 142 150"
        stroke="#e11d2e"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Ball seam ticks left */}
      <path d="M96 96 L104 93" stroke="#e11d2e" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M95 108 L104 106" stroke="#e11d2e" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M95 132 L104 134" stroke="#e11d2e" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M96 144 L104 147" stroke="#e11d2e" strokeWidth="2.2" strokeLinecap="round" />

      {/* Ball seam ticks right */}
      <path d="M144 96 L136 93" stroke="#e11d2e" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M145 108 L136 106" stroke="#e11d2e" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M145 132 L136 134" stroke="#e11d2e" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M144 144 L136 147" stroke="#e11d2e" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
