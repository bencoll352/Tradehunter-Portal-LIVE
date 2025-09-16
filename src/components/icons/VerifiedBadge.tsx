
import { cn } from "@/lib/utils";
import type React from 'react';

interface VerifiedBadgeProps extends React.SVGProps<SVGSVGElement> {}

export function VerifiedBadge({ className, ...props }: VerifiedBadgeProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 64 64" 
      width="64" 
      height="64" 
      className={cn("h-full w-full", className)}
      {...props}
    >
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a6e051"/>
          <stop offset="100%" stopColor="#3ab54a"/>
        </linearGradient>
      </defs>
      <path 
        d="M32 2C32 2 10 6 10 18V34C10 52 32 62 32 62C32 62 54 52 54 34V18C54 6 32 2 32 2Z"
        fill="url(#grad)" 
      />
      <rect x="22" y="26" width="20" height="16" rx="2" fill="#fff"/>
      <path 
        d="M26 26V22C26 18 30 16 32 16C34 16 38 18 38 22V26" 
        stroke="#fff" 
        strokeWidth="4" 
        fill="none" 
      />
      <path 
        d="M26 34 L30 38 L38 30" 
        stroke="#3ab54a" 
        strokeWidth="4" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}
