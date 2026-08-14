/** Společné SVG ikony – baseball */

/** Baseballová pálka (šikmo, rukojeť + hlava) */
export function IconBat({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* rukojeť */}
      <path d="M4.5 20.5 11 12" strokeWidth="2.4" />
      {/* knoflík na konci */}
      <circle cx="4.2" cy="20.8" r="1.3" fill="currentColor" stroke="none" />
      {/* hlava pálky (silnější část) */}
      <path
        d="M10.5 12.5c1.2-1.6 4.2-5.2 6.8-7.2 1.4-1.1 3.2-.4 3.6 1.2.5 1.8-.6 3.4-2.2 4.6-2.4 1.8-6.2 3.2-8.2 1.4z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

/** Běžící postavička */
export function IconRunner({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* hlava */}
      <circle cx="14" cy="5" r="2.25" fill="currentColor" stroke="none" />
      {/* trup */}
      <path d="M13.5 7.5 11 13" />
      {/* přední noha */}
      <path d="M11 13 15 20" />
      {/* zadní noha */}
      <path d="M11 13 7 19" />
      {/* přední ruka */}
      <path d="M12.5 9.5 17 11.5" />
      {/* zadní ruka */}
      <path d="M12.5 9.5 8 8" />
    </svg>
  );
}

/** Baseballový míček = HR */
export function IconHomeRun({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3c2.2 3.2 2.2 6.2 0 9.2s-2.2 6 0 9" />
      <path d="M3.5 10.5c3 .8 6 .8 9.5 0s6.5-1 11 0" opacity="0.7" />
    </svg>
  );
}

export function IconGames({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

/** Klasické ozubené kolo (Nastavení) – beze změny stylu */
export function IconSettings({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
