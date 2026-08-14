/** Ikony – čisté siluety dle mockupu */

/** Baseballová pálka */
export function IconBat({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.78 2.87a2.25 2.25 0 0 0-3.18 0L5.4 14.07a.75.75 0 0 0-.18.3l-1.4 4.2a.75.75 0 0 0 .95.95l4.2-1.4a.75.75 0 0 0 .3-.18L20.47 6.74a2.25 2.25 0 0 0 0-3.18l-.69-.69Zm-2.12 1.06c.29-.3.77-.3 1.06 0l.69.69c.29.29.29.77 0 1.06L8.9 15.5l-2.12.71.71-2.12 10.17-10.16Z" />
      <path d="M4.06 18.56 3 21l2.44-1.06-1.38-1.38Z" />
    </svg>
  );
}

/** Běžící postavička – Material directions_run */
export function IconRunner({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2Zm-3.6 13.9 1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C15.26 9 17.25 10 19.5 10v-2c-1.86 0-3.47-.99-4.33-2.45l-1-1.59c-.4-.62-1.08-1-1.83-1-.23 0-.47.04-.69.12L6 8.28V13h2V9.58l1.89-.73z" />
    </svg>
  );
}

/** Baseballový míček */
export function IconHomeRun({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
      <path d="M7.5 5.8c.9 1.6 1.4 3.4 1.4 5.3s-.5 3.7-1.4 5.3l1.7.9c1.1-1.9 1.7-4 1.7-6.2s-.6-4.3-1.7-6.2l-1.7.9zM16.5 5.8l-1.7-.9C13.7 6.8 13.1 8.9 13.1 11.1s.6 4.3 1.7 6.2l1.7-.9c-.9-1.6-1.4-3.4-1.4-5.3s.5-3.7 1.4-5.3z" />
    </svg>
  );
}

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
