/** Ikony – pálka, bota, míček, kalendář, nastavení */

/** Baseballová pálka – čistá silueta */
export function IconBat({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      {/* hlava + tělo pálky */}
      <path d="M21.07 2.93a2.5 2.5 0 0 0-3.54 0L6.4 14.06l-.9 3.04 3.04-.9L21.07 6.47a2.5 2.5 0 0 0 0-3.54z" />
      {/* rukojeť */}
      <path d="M5.2 15.3 3.5 20.5l5.2-1.7-3.5-3.5z" />
      {/* knoflík */}
      <circle cx="3.3" cy="20.7" r="1.4" />
    </svg>
  );
}

/** Bota / kopačka – doběhy */
export function IconRunner({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      {/* podrážka + tělo boty (boční pohled) */}
      <path d="M3 15.5c0-1 .5-1.9 1.3-2.4l3.8-2.3c.6-.35 1.3-.35 1.9 0l1.5.9c.25.15.55.15.8 0l1.3-.75c.5-.3 1.1-.3 1.6 0l5.5 3.2c1.2.7 1.2 2.4 0 3.1l-.8.45H4.8c-1 0-1.8-.85-1.8-1.9v-.3z" />
      {/* jazyk / nárt */}
      <path d="M9.2 11.2 11 8.8c.35-.45.95-.55 1.45-.25l1.1.7-2.8 2.5-1.55-.55z" opacity="0.9" />
      {/* podrážka dole */}
      <path d="M4 18.2h14.5c.7 0 1.3.6 1.3 1.3 0 .2-.15.4-.35.45H4.4c-.5 0-.9-.4-.9-.9 0-.45.35-.85.85-.85h-.35z" />
    </svg>
  );
}

/** Baseballový míček – HR (beze změny stylu) */
export function IconHomeRun({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
      <path d="M7.5 5.8c.9 1.6 1.4 3.4 1.4 5.3s-.5 3.7-1.4 5.3l1.7.9c1.1-1.9 1.7-4 1.7-6.2s-.6-4.3-1.7-6.2l-1.7.9zM16.5 5.8l-1.7-.9C13.7 6.8 13.1 8.9 13.1 11.1s.6 4.3 1.7 6.2l1.7-.9c-.9-1.6-1.4-3.4-1.4-5.3s.5-3.7 1.4-5.3z" />
    </svg>
  );
}

/** Kalendář – zápasy */
export function IconGames({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
    </svg>
  );
}

/** Ozubené kolo – Nastavení */
export function IconSettings({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" />
    </svg>
  );
}
