
import type { SVGProps } from 'react';
import { cn } from "@/lib/utils";

interface LogoProps extends SVGProps<SVGSVGElement> {
  variant?: 'default' | 'transparent';
}

export function Logo({ variant = 'default', ...props }: LogoProps) {
  return (
    <svg 
      width="250" 
      height="70" 
      viewBox="0 0 250 70" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      aria-label="TradeHunter Pro Logo"
      {...props}
      className={cn(props.className)}
    >
      {variant === 'default' && <rect width="250" height="70" fill="white"/>}
      
      {/* Icon Group */}
      <g transform="translate(10, 5)">
        {/* Hard Hat Shape */}
        <path d="M43.76,21.92C40.69,11.3,30.38,4,18.88,4C7.38,4,0,11.3,0,21.92a2,2,0,0,0,2,2H50.75a2,2,0,0,0,2-2c0-5.4-2.1-10.37-5.81-14" fill="#1E63C2"/>
        <path d="M52.75,23.92H2a2,2,0,0,0-2,2V28.5a3.5,3.5,0,0,0,3.5,3.5H49.25a3.5,3.5,0,0,0,3.5-3.5V25.92A2,2,0,0,0,52.75,23.92Z" fill="#1E63C2"/>
        
        {/* Target inside hard hat */}
        <circle cx="26.38" cy="14.5" r="8" fill="white"/>
        <circle cx="26.38" cy="14.5" r="5" fill="#1E63C2"/>
        <circle cx="26.38" cy="14.5" r="2" fill="#E53935"/>
      </g>
      
      {/* Text Group */}
      <g transform="translate(80, 15)">
        <text x="0" y="18" fontFamily="'Arial Black', Gadget, sans-serif" fontSize="18" fontWeight="900" fill="#1E63C2">TradeHunter Pro</text>
        <text x="0" y="38" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="bold" fill="#F39C12">DOMINATE YOUR TERRITORY</text>
      </g>
    </svg>
  );
}
