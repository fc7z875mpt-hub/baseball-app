/** Ikony dle grafického návrhu – vyplněné siluety */

/** Baseballová pálka (silueta) */
export function IconBat({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.2 3.1c-.9-.9-2.3-.9-3.2 0L5.8 14.3c-.3.3-.5.7-.5 1.1v1.2l-2.1 2.1c-.4.4-.4 1 0 1.4l1.4 1.4c.4.4 1 .4 1.4 0l2.1-2.1h1.2c.4 0 .8-.2 1.1-.5L20.2 6.3c.9-.9.9-2.3 0-3.2z" />
      <path d="M18.5 4.2c.3-.3.8-.3 1.1 0s.3.8 0 1.1L8.2 16.7c-.3.3-.8.3-1.1 0" opacity="0.35" />
    </svg>
  );
}

/** Běžící postavička (silueta) */
export function IconRunner({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      {/* hlava */}
      <circle cx="14.5" cy="4.8" r="2.3" />
      {/* tělo + nohy + ruce – jedna souvislá silueta */}
      <path d="M16.2 7.6c-1.1.2-2.3.5-3.1 1.3l-.9 1-2.3-.9c-.5-.2-1.1 0-1.3.5-.2.5 0 1.1.5 1.3l2.6 1 .2 1.1-2.6 3.4c-.3.4-.2 1.1.2 1.4.4.3 1.1.2 1.4-.2l2.4-3.1.9 1.4-1.5 3.6c-.2.5 0 1.1.5 1.3.5.2 1.1 0 1.3-.5l1.8-4.3c.1-.3.1-.6 0-.9l-1.2-2 .9-.9c.4-.4.9-.6 1.4-.7l2.1-.3c.6-.1 1-.6.9-1.1-.1-.6-.6-1-1.1-.9l-2.2.4z" />
      {/* zadní noha */}
      <path d="M10.2 12.4 6.5 17.8c-.3.4-.2 1.1.3 1.4.4.3 1.1.2 1.4-.3l3.3-4.9c-.5-.3-.9-.8-1.3-1.6z" />
    </svg>
  );
}

/** Baseballový míček (HR) */
export function IconHomeRun({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.12" />
      <circle cx="12" cy="12" r="9" />
      {/* švy míčku */}
      <path d="M8 5.5c1.5 2.2 1.5 4.5 0 6.7M8 12.3c1.5 2.2 1.5 4.5 0 6.7" />
      <path d="M16 5.5c-1.5 2.2-1.5 4.5 0 6.7M16 12.3c-1.5 2.2-1.5 4.5 0 6.7" />
    </svg>
  );
}

export function IconGames({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

/** Ozubené kolo – Nastavení */
export function IconSettings({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
