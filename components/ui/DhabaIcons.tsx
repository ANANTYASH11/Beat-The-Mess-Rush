import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export function ThaliOutlineIcon({ size = 24, className = '', ...props }: IconProps) {
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
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="8" strokeDasharray="2 2" opacity="0.6" />
      <circle cx="8" cy="8.5" r="2.2" />
      <circle cx="16" cy="8.5" r="2.2" />
      <circle cx="12" cy="15" r="2.2" />
    </svg>
  );
}

export function LadleIcon({ size = 24, className = '', ...props }: IconProps) {
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
      className={className}
      {...props}
    >
      <path d="M4 19a4 4 0 0 0 7 2.5L20 4" />
      <path d="M18 2l2 2-1 3" />
      <ellipse cx="7" cy="18" rx="4" ry="2.5" />
    </svg>
  );
}

export function SteelGlassIcon({ size = 24, className = '', ...props }: IconProps) {
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
      className={className}
      {...props}
    >
      <path d="M6 3h12l-2 17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2L6 3z" />
      <path d="M6.5 8h11" strokeDasharray="1 2" opacity="0.6" />
      <path d="M7 13h10" strokeDasharray="1 2" opacity="0.6" />
    </svg>
  );
}

export function TiffinIcon({ size = 24, className = '', ...props }: IconProps) {
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
      className={className}
      {...props}
    >
      <rect x="5" y="7" width="14" height="4" rx="1" />
      <rect x="5" y="12" width="14" height="4" rx="1" />
      <rect x="5" y="17" width="14" height="4" rx="1" />
      <path d="M12 7V3a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4" />
      <path d="M9 3h6" />
    </svg>
  );
}

export function TokenTicketIcon({ size = 24, className = '', ...props }: IconProps) {
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
      className={className}
      {...props}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <line x1="8" y1="5" x2="8" y2="19" strokeDasharray="2 2" />
      <circle cx="15" cy="12" r="2" />
    </svg>
  );
}

export function SteamWisps({ size = 24, className = '', ...props }: IconProps) {
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
      className={className}
      {...props}
    >
      <path d="M8 18c-1-2 0-4 1-6s0-4-1-6" />
      <path d="M12 19c-1-2 0-4 1-6s0-4-1-6" />
      <path d="M16 18c-1-2 0-4 1-6s0-4-1-6" />
    </svg>
  );
}
