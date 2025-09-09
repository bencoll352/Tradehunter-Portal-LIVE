
import type { SVGProps } from 'react';
import { cn } from "@/lib/utils";

interface LogoProps extends SVGProps<SVGSVGElement> {
  // Variant prop is no longer needed as the logo now has a fixed design
}

export function Logo({ ...props }: LogoProps) {
  return (
    <svg 
      width="250" 
      height="56" 
      viewBox="0 0 250 56" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      aria-label="TradeHunter Pro Logo"
      {...props}
      className={cn(props.className)}
    >
      <rect width="250" height="56" fill="white"/>
      <rect width="60" height="56" fill="#1E63C2"/>
      <g transform="translate(5, 5)">
        <path d="M129.6 26.4c-0.9-1.8-2-3.6-3.3-5.2C119.9 13.2 113.3 8 105.5 8c-7.8 0-14.4 5.2-20.8 13.2 -1.3 1.6-2.4 3.4-3.3 5.2 -1.4 0.8-1.4 1.8-1.1 2.6 0.4 0.8 1.1 1.4 2 1.7 2.1 0.6 4.3 0.9 6.5 1.1v4.8c0 1.9 1.6 3.5 3.5 3.5h23c1.9 0 3.5-1.6 3.5-3.5v-4.8c2.2-0.2 4.4-0.5 6.5-1.1 0.9-0.3 1.6-0.9 2-1.7C131.6 28.2 131.6 27.2 129.6 26.4z" fill="#1E63C2"/>
        <circle cx="105.5" cy="21.5" r="9" fill="none" stroke="#FFFFFF" strokeWidth="2.5"/>
        <line x1="105.5" y1="12.5" x2="105.5" y2="30.5" stroke="#FFFFFF" strokeWidth="2.5"/>
        <line x1="96.5" y1="21.5" x2="114.5" y2="21.5" stroke="#FFFFFF" strokeWidth="2.5"/>
        <circle cx="105.5" cy="21.5" r="2" fill="#E53935" stroke="#FFFFFF" strokeWidth="1"/>
      </g>
    </svg>
  );
}
