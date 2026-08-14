/** Ikony – musí být čitelné i v 16–20 px */

/** Baseballová pálka – šikmá silueta s rukojetí */
export function IconBat({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <g fill="currentColor">
        {/* knoflík rukojeti */}
        <circle cx="5" cy="19" r="2" />
        {/* rukojeť + dřík (tlustá šikmá čára) */}
        <path d="M5.8 17.8 15.2 7.2c.4-.4 1-.4 1.4 0l1.2 1.2c.4.4.4 1 0 1.4L8.4 19.2c-.4.4-1 .4-1.4 0l-1.2-1.2c-.4-.4-.4-1 0-1.4z" />
        {/* hlava pálky (širší konec) */}
        <path d="M15.5 6.5c1.8-1.8 4.5-1.5 5.5.2 1 1.6.2 4-1.5 5.2l-2.2-2.2c.6-.6 1-1.5.8-2.2-.2-.6-.7-1-1.3-1.2l-.8.2-1.5-.2z" />
      </g>
    </svg>
  );
}

/** Bota – boční pohled, jednoduchá silueta */
export function IconRunner({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <g fill="currentColor">
        {/* tělo boty */}
        <path d="M3.5 14.2c0-.7.4-1.3 1-1.6l3.2-1.7c.4-.2.9-.2 1.3 0l1.6.9c.2.1.5.1.7 0l1.1-.6c.3-.2.7-.2 1 0l5.8 3.4c.9.5.9 1.8 0 2.4l-.5.3H5c-.8 0-1.5-.7-1.5-1.5v-1.6z" />
        {/* nártek nahoru */}
        <path d="M9 11.2 10.6 8.6c.3-.4.8-.5 1.2-.3l1.3.7-2.5 2.6-1.6-.4z" />
        {/* podrážka */}
        <path d="M4 17.8h14.8c.6 0 1.1.5 1.1 1.1 0 .2-.1.4-.3.5H4.3c-.4 0-.8-.4-.8-.8 0-.4.3-.8.7-.8h-.2z" />
      </g>
    </svg>
  );
}

/** Baseball – HR */
export function IconHomeRun({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 5.2c1.2 2 1.8 4.2 1.8 6.8S9.2 16.8 8 18.8" strokeLinecap="round" />
      <path d="M16 5.2c-1.2 2-1.8 4.2-1.8 6.8s.6 4.8 1.8 6.8" strokeLinecap="round" />
    </svg>
  );
}

/** Kalendář */
export function IconGames({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

/** Nastavení – ozubené kolo */
export function IconSettings({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" />
    </svg>
  );
}
