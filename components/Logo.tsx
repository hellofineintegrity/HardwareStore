// components/Logo.tsx
// SVG logo for Shardul Enterprises — works at any size via className prop

interface LogoProps {
  /** Tailwind size classes, e.g. "h-9 w-9" */
  className?: string;
  /** Show just the icon mark, or the full lockup with text */
  variant?: 'icon' | 'full';
}

export default function Logo({ className = 'h-9 w-9', variant = 'icon' }: LogoProps) {
  const icon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-label="Shardul Enterprises logo"
    >
      {/* Background rounded square */}
      <rect width="48" height="48" rx="10" fill="#D97706" />

      {/* Building silhouette */}
      <rect x="10" y="20" width="28" height="18" rx="1" fill="white" fillOpacity="0.2" />
      <rect x="10" y="20" width="28" height="2" fill="white" fillOpacity="0.6" />

      {/* Left tower */}
      <rect x="10" y="12" width="10" height="26" rx="1" fill="white" fillOpacity="0.9" />

      {/* Right tower */}
      <rect x="28" y="16" width="10" height="22" rx="1" fill="white" fillOpacity="0.75" />

      {/* Center pillar */}
      <rect x="22" y="24" width="4" height="14" rx="1" fill="white" fillOpacity="0.5" />

      {/* Windows — left tower */}
      <rect x="13" y="15" width="4" height="3" rx="0.5" fill="#D97706" />
      <rect x="13" y="21" width="4" height="3" rx="0.5" fill="#D97706" />

      {/* Windows — right tower */}
      <rect x="31" y="19" width="4" height="3" rx="0.5" fill="#D97706" />
      <rect x="31" y="25" width="4" height="3" rx="0.5" fill="#D97706" />

      {/* Base line */}
      <rect x="8" y="36" width="32" height="2.5" rx="1" fill="white" fillOpacity="0.9" />

      {/* SE initials strip at bottom */}
      <rect x="8" y="39.5" width="32" height="1" rx="0.5" fill="white" fillOpacity="0.4" />
    </svg>
  );

  if (variant === 'icon') return icon;

  return (
    <div className="flex items-center gap-2.5">
      {icon}
      <div>
        <p className="text-sm font-bold leading-tight text-gray-900 sm:text-base">Shardul Enterprises</p>
        <p className="text-[10px] leading-none text-gray-500">Chiplun&apos;s Construction Hub</p>
      </div>
    </div>
  );
}
