
import { cn } from "@/lib/utils";
import type React from 'react';

interface TrustLockLogoProps extends React.SVGProps<SVGSVGElement> {}

export function TrustLockLogo({ className, ...props }: TrustLockLogoProps) {
  return (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 260 80" 
        width="130" 
        height="40" 
        className={cn(className)} 
        {...props}
    >
      <defs>
        <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a6cff"/>
          <stop offset="100%" stopColor="#1d0ff3"/>
        </linearGradient>
      </defs>
      <rect x="10" y="30" width="30" height="30" rx="4" fill="url(#blueGrad)" />
      <path d="M20 30V22C20 15 30 12 35 18C37 21 37 25 37 30" 
            stroke="url(#blueGrad)" strokeWidth="6" fill="none" />
      <path d="M18 42 L25 50 L33 38" 
            stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="50" y="55" fontFamily="Arial, Helvetica, sans-serif" fontSize="32" fontWeight="bold" fill="#000">
        TrustLock
      </text>
    </svg>
  );
}
