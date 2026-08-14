/** Ikony dle referenčních siluet */

/** Baseballová pálka – plná silueta (jako reference) */
export function IconBat({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.3 2.4c-1.1-1-2.9-.9-3.9.2L5.2 14.4c-.2.2-.3.5-.4.8l-.9 3.1c-.15.5.2 1 .7 1.05l.15.02 3.1-.9c.3-.1.6-.2.8-.4L19.8 6.9c1.1-1.1 1.2-2.9.2-3.9l.3-.6zm-2.5 1.6c.4-.4 1-.4 1.3 0l.6.6c.4.4.4 1 0 1.3L8.2 17.4l-1.6.45.45-1.6L17.8 4zM4.2 19.1l-1.3 1.3c-.3.3-.3.8 0 1.1.3.3.8.3 1.1 0l1.3-1.3-.5-.5-.6-.6z" />
      {/* hladší klasická pálka */}
      <path d="M18.85 3.15c-.85-.85-2.2-.85-3.05 0L5.6 13.35l-1.05 3.55 3.55-1.05L18.85 6.2c.85-.85.85-2.2 0-3.05zm-1.4 1.05 1.05 1.05-9.6 9.6-1.05-.15.15-1.05 9.45-9.45zM3.9 18.4l1.2 1.2-1.5 1.5c-.35.35-.9.35-1.25 0s-.35-.9 0-1.25l1.55-1.45z" />
    </svg>
  );
}

/** Běžec se „speed lines“ – dle reference */
export function IconRunner({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      {/* hlava */}
      <circle cx="15.2" cy="4.2" r="2.1" />
      {/* tělo + nohy + ruce */}
      <path d="M14.2 6.6c-1.3.3-2.4 1.2-2.9 2.4l-.6 1.5-2.4-1.1c-.5-.25-1.15 0-1.35.55-.2.5 0 1.1.5 1.35l2.7 1.2.15 1.2-2.9 4.5c-.3.45-.15 1.1.35 1.35.45.25 1.05.1 1.35-.35l2.6-4 .9 1.5-1.35 3.7c-.2.55.05 1.15.6 1.35.55.2 1.15-.05 1.35-.6l1.6-4.4c.1-.3.1-.65 0-.95l-1.15-1.9.95-1.05c.35-.4.85-.6 1.35-.65l1.9-.25c.55-.05.95-.55.9-1.1-.05-.55-.55-.95-1.1-.9l-2 .25z" />
      {/* zadní noha */}
      <path d="M10.3 12.2 6.2 18.5c-.3.45-.15 1.1.35 1.35.5.3 1.1.1 1.35-.4l3.6-5.6c-.4-.4-.85-.9-1.2-1.65z" />
      {/* speed lines */}
      <path d="M2.5 11.5h4.2c.4 0 .4.6 0 .6H2.5c-.4 0-.4-.6 0-.6zM2 13.6h3.5c.35 0 .35.55 0 .55H2c-.35 0-.35-.55 0-.55zM2.5 15.7h3.2c.35 0 .35.55 0 .55H2.5c-.35 0-.35-.55 0-.55z" />
    </svg>
  );
}

/** Baseballový míček */
export function IconHomeRun({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 5c1.2 2.2 1.8 4.5 1.8 7s-.6 4.8-1.8 7" />
      <path d="M16 5c-1.2 2.2-1.8 4.5-1.8 7s.6 4.8 1.8 7" />
    </svg>
  );
}

/** Kalendář */
export function IconGames({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
