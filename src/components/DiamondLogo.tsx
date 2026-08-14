export function DiamondLogo({ size = 140 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Outer diamond ring */}
      <path
        d="M100 12 L188 100 L100 188 L12 100 Z"
        fill="#0b1a2e"
        stroke="#c8d0d8"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* Inner diamond */}
      <path
        d="M100 28 L172 100 L100 172 L28 100 Z"
        fill="#152a4a"
        stroke="#e8eef4"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Red corner stitches – left */}
      <path d="M42 78 L52 68" stroke="#e11d2e" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M38 88 L50 80" stroke="#e11d2e" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M38 112 L50 120" stroke="#e11d2e" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M42 122 L52 132" stroke="#e11d2e" strokeWidth="3.5" strokeLinecap="round" />

      {/* Red corner stitches – right */}
      <path d="M158 78 L148 68" stroke="#e11d2e" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M162 88 L150 80" stroke="#e11d2e" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M162 112 L150 120" stroke="#e11d2e" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M158 122 L148 132" stroke="#e11d2e" strokeWidth="3.5" strokeLinecap="round" />

      {/* Baseball */}
      <circle cx="100" cy="100" r="36" fill="#ffffff" />

      {/* Ball seams */}
      <path
        d="M78 78 Q90 100 78 122"
        stroke="#e11d2e"
        strokeWidth="2.8"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M122 78 Q110 100 122 122"
        stroke="#e11d2e"
        strokeWidth="2.8"
        fill="none"
        strokeLinecap="round"
      />

      {/* Seam ticks left */}
      <path d="M76 84 L82 81" stroke="#e11d2e" strokeWidth="2" strokeLinecap="round" />
      <path d="M75 94 L82 92" stroke="#e11d2e" strokeWidth="2" strokeLinecap="round" />
      <path d="M75 106 L82 108" stroke="#e11d2e" strokeWidth="2" strokeLinecap="round" />
      <path d="M76 116 L82 119" stroke="#e11d2e" strokeWidth="2" strokeLinecap="round" />

      {/* Seam ticks right */}
      <path d="M124 84 L118 81" stroke="#e11d2e" strokeWidth="2" strokeLinecap="round" />
      <path d="M125 94 L118 92" stroke="#e11d2e" strokeWidth="2" strokeLinecap="round" />
      <path d="M125 106 L118 108" stroke="#e11d2e" strokeWidth="2" strokeLinecap="round" />
      <path d="M124 116 L118 119" stroke="#e11d2e" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
