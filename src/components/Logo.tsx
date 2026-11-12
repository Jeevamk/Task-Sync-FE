/** Task Sync mark: two arrows forming a loop. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--brand)" />
      <path d="M9 13a7 7 0 0 1 12.2-4.6" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M21.5 5.5v3.6h-3.6" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M23 19a7 7 0 0 1-12.2 4.6" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M10.5 26.5v-3.6h3.6" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="2.4" fill="#fff" />
    </svg>
  );
}
