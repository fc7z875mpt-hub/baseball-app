/** Jednoduché stroke ikony – čitelné v malé velikosti */

/** Baseballová pálka */
export function IconBat({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* dřík */}
      <line x1="5" y1="19" x2="16.5" y2="6.5" />
      {/* hlava pálky */}
      <path d="M15.5 5.5c1.8-1.5 4.2-.8 4.8 1.2.6 2-.8 3.8-2.6 4.5" />
      {/* knoflík */}
      <circle cx="4.5" cy="19.5" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Bota (boční pohled) */
export function IconRunner({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* tvar boty */}
      <path d="M3 15.5h1.5l2.5-3h3.5l1.5-2h3l6 4v2.5H4.5C3.7 17 3 16.3 3 15.5z" />
      {/* podrážka */}
      <path d="M3.5 17.5h15.5" />
      {/* tkanička / nárt */}
      <path d="M10 10.5 11.5 8.5" />
    </svg>
  );
}

/** Baseballový míček */
export function IconHomeRun({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8 5c1.2 2.2 1.8 4.5 1.8 7s-.6 4.8-1.8 7" />
      <path d="M16 5c-1.2 2.2-1.8 4.5-1.8 7s.6 4.8 1.8 7" />
    </svg>
  );
}

/** Kalendář */
export function IconGames({ size = 20 }: { size?: number }) {
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
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

/** Ozubené kolo */
export function IconSettings({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" />
    </svg>
  );
}
