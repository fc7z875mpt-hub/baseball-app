/** Siluety dle referenčních obrázků */

/** Baseballová pálka – jedna plná silueta */
export function IconBat({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.6 2.9c-1.15-1.05-2.95-1-4 .15L5.35 13.7l-1.35 4.55 4.55-1.35L19.75 6.9c1.15-1.05 1.2-2.85.15-4zm-1.2 1.35c.4-.4 1.05-.4 1.45 0l.4.4c.4.4.4 1.05 0 1.45L8.7 17.05l-2.05.6.6-2.05 11.15-10.7zM3.55 19.35l1.4 1.4-1.65 1.65c-.4.4-1.05.4-1.45 0-.4-.4-.4-1.05 0-1.45l1.7-1.6z" />
    </svg>
  );
}

/** Běžící postavička se speed lines */
export function IconRunner({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="15" cy="4.2" r="2.15" />
      <path d="M13.8 6.7c-1.25.25-2.35 1.15-2.85 2.3l-.7 1.7-2.35-1.05a.95.95 0 0 0-1.3.5.95.95 0 0 0 .5 1.3l2.65 1.2.25 1.35-2.95 4.55a.95.95 0 0 0 1.55 1.1l2.7-4.15.95 1.55-1.45 3.9a.95.95 0 1 0 1.8.7l1.7-4.55a1.2 1.2 0 0 0-.05-.95l-1.2-1.95 1-1.1c.4-.45.95-.7 1.5-.75l1.85-.2a.95.95 0 1 0-.2-1.9l-1.9.2z" />
      <path d="M9.9 12.35 5.7 18.8a.95.95 0 0 0 1.55 1.1l3.85-5.9c-.45-.4-.9-1-1.2-1.65z" />
      {/* speed lines vlevo */}
      <rect x="1.8" y="11.2" width="4" height="1.15" rx="0.55" />
      <rect x="1.4" y="13.35" width="3.4" height="1.1" rx="0.55" />
      <rect x="1.8" y="15.45" width="3" height="1.1" rx="0.55" />
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
