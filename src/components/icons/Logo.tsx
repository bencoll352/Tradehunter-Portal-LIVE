
import type { SVGProps } from 'react';
import { cn } from "@/lib/utils";

interface LogoProps extends SVGProps<SVGSVGElement> {
  variant?: 'default' | 'transparent';
}

export function Logo({ variant = 'default', ...props }: LogoProps) {
  return (
    <svg 
      width="170" 
      height="40" 
      viewBox="0 0 170 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      aria-label="TradeHunter Pro Logo"
      {...props}
      className={cn("font-sans", props.className)}
    >
      {variant === 'default' && <rect width="170" height="40" fill="white"/>}
      
      {/* Text Group */}
      <g transform="translate(0, 10)">
        <text x="0" y="15" fontFamily="'Arial Black', 'Helvetica Bold', sans-serif" fontSize="18" fontWeight="900">
            <tspan className="fill-current text-sidebar-foreground" fill="currentColor">TradeHunter</tspan>
            <tspan className="fill-current text-accent" fill="currentColor" fontWeight="900">Pro</tspan>
        </text>
        <text x="0" y="32" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="bold" className="fill-current text-sidebar-foreground/70" fill="currentColor" letterSpacing="0.05em">
            DOMINATE YOUR TERRITORY
        </text>
      </g>
    </svg>
  );
}
