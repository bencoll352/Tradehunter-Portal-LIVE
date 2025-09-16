
import type { SVGProps } from 'react';
import { cn } from "@/lib/utils";

interface LogoProps extends SVGProps<SVGSVGElement> {
  variant?: 'default' | 'transparent';
}

export function Logo({ variant = 'default', ...props }: LogoProps) {
  const foregroundColor = variant === 'transparent' ? 'hsl(var(--sidebar-foreground))' : 'currentColor';
  const subtitleColor = variant === 'transparent' ? 'hsla(var(--sidebar-foreground), 0.7)' : 'currentColor';

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
      {/* Text Group */}
      <g transform="translate(0, 10)">
        <text x="0" y="15" fontFamily="'Arial Black', 'Helvetica Bold', sans-serif" fontSize="18" fontWeight="900">
            <tspan fill={foregroundColor}>TradeHunter</tspan>
            <tspan fill="hsl(var(--accent))" fontWeight="900">Pro</tspan>
        </text>
        <text x="0" y="32" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="bold" fill={subtitleColor} opacity="0.7" letterSpacing="0.05em">
            DOMINATE YOUR TERRITORY
        </text>
      </g>
    </svg>
  );
}
