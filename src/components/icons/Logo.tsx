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
      className={cn("font-sans", props.className)}
    >
      {variant === 'default' && <rect width="250" height="70" fill="white"/>}
      
      {/* Icon */}
      <g transform="translate(15, 10)">
        <path d="M45.62,11.83C42.1,4.2,32.8,0,22.5,0C12.2,0,2.9,4.2,0,11.83c-1.4,3.7-2,7.7-2,11.9H2c0.2-7.8,4-15,10.5-18.8c4.6-2.6,10-2.6,14.6,0C33.6,8.93,37.4,16.13,37.6,23.93H52.8C52.6,19.63,50.22,15.23,45.62,11.83Z" fill="#1E63C2"/>
        <path d="M52.8,25.93H0V31.43a5,5,0,0,0,5,5H47.8a5,5,0,0,0,5-5V25.93Z" fill="#1E63C2"/>
        <circle cx="26.4" cy="14" r="9" fill="white" stroke="#1E63C2" strokeWidth="0.5"/>
        <path d="M26.4 7 V21 M19.4 14 H33.4" stroke="#222222" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="26.4" cy="14" r="2.5" fill="#E53935"/>
      </g>
      
      {/* Text */}
      <g transform="translate(80, 20)">
        <text x="0" y="15" fontFamily="'Arial Black', 'Helvetica Bold', sans-serif" fontSize="18" fontWeight="900">
            <tspan fill="#333333">TradeHunter</tspan>
            <tspan fill="#F39C12" fontWeight="900">Pro</tspan>
        </text>
        <text x="0" y="32" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="bold" fill="#666666" letterSpacing="0.05em">
            DOMINATE YOUR TERRITORY
        </text>
      </g>
    </svg>
  );
}
