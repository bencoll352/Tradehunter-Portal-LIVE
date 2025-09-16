import { cn } from "@/lib/utils";
import type React from 'react';

// Using React.SVGProps<SVGSVGElement> because we are rendering an svg
interface LogoProps extends React.SVGProps<SVGSVGElement> {}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 500 150" 
      className={cn(className)}
      {...props}
    >
      <path d="M60 120 C30 120, 20 100, 30 80 C40 60, 60 40, 90 40 C120 40, 140 60, 150 80 C160 100, 150 120, 120 120 Z"
            fill="#2E63B6"/>

      <circle cx="90" cy="80" r="20" fill="none" stroke="white" strokeWidth="4"/>
      <line x1="70" y1="80" x2="110" y2="80" stroke="white" strokeWidth="3"/>
      <line x1="90" y1="60" x2="90" y2="100" stroke="white" strokeWidth="3"/>
      <circle cx="90" cy="80" r="4" fill="red"/>

      <text x="170" y="85" fontFamily="Arial, Helvetica, sans-serif" fontSize="36" fontWeight="bold" fill="currentColor">
        TradeHunter
      </text>
      <text x="390" y="85" fontFamily="Arial, Helvetica, sans-serif" fontSize="36" fontWeight="bold" fill="#D85C1A">
        Pro
      </text>

      <text x="170" y="115" fontFamily="Arial, Helvetica, sans-serif" fontSize="20" fontWeight="bold" fill="currentColor">
        DOMINATE YOUR TERRITORY
      </text>
    </svg>
  );
}
