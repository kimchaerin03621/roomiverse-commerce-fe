/** A small screen-printed CD: the site's track marker beside each scene title. */
export default function Disc({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="15.5" fill="#111111" />
      <circle cx="16" cy="16" r="11" fill="#f71d64" />
      <path d="M16 5a11 11 0 0 1 11 11h-4.5A6.5 6.5 0 0 0 16 9.5z" fill="#c14ed4" />
      <circle cx="16" cy="16" r="4.2" fill="#f0f0f0" />
      <circle cx="16" cy="16" r="1.6" fill="#111111" />
    </svg>
  );
}
