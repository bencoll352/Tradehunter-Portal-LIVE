import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="40"
      height="40"
      aria-label="TradeHunter Pro Portal Logo"
      {...props}
    >
      <rect width="100" height="100" rx="20" fill="currentColor" />
      <path
        d="M30 70 L50 30 L70 70 Z M40 60 L60 60"
        stroke="hsl(var(--sidebar-background))"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="45" r="5" fill="hsl(var(--sidebar-background))" />
    </svg>
  );
}
