
import type { SVGProps } from 'react';
import { cn } from "@/lib/utils";

interface LogoProps extends SVGProps<SVGSVGElement> {
  variant?: 'white' | 'transparent';
}

export function Logo({ variant = 'white', ...props }: LogoProps) {
  
  const SvgContent = () => (
    <>
      <g transform="translate(5, 5)">
        {/* Hard Hat */}
        <path d="M46.6,26.4c-0.9-1.8-2-3.6-3.3-5.2C36.9,13.2,30.3,8,22.5,8C14.7,8,8.1,13.2,1.7,21.2 c-1.3,1.6-2.4,3.4-3.3,5.2C-2,27.2-2,28.2-1.7,29c0.4,0.8,1.1,1.4,2,1.7c2.1,0.6,4.3,0.9,6.5,1.1v4.8c0,1.9,1.6,3.5,3.5,3.5h23 c1.9,0,3.5-1.6,3.5-3.5v-4.8c2.2-0.2,4.4-0.5,6.5-1.1c0.9-0.3,1.6-0.9,2-1.7C48.6,28.2,48.6,27.2,46.6,26.4z" fill="hsl(var(--primary))"/>
        {/* Target */}
        <circle cx="22.5" cy="21.5" r="9" fill="none" stroke="#FFFFFF" strokeWidth="2.5"/>
        <line x1="22.5" y1="12.5" x2="22.5" y2="30.5" stroke="#FFFFFF" strokeWidth="2.5"/>
        <line x1="13.5" y1="21.5" x2="31.5" y2="21.5" stroke="#FFFFFF" strokeWidth="2.5"/>
        <circle cx="22.5" cy="21.5" r="2" fill="hsl(var(--destructive))" stroke="#FFFFFF" strokeWidth="1"/>
      </g>
      <text fill="hsl(var(--foreground))" style={{whiteSpace: "pre"}} fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" letterSpacing="0em">
        <tspan x="62" y="27.5">TradeHunter </tspan>
      </text>
      <text fill="hsl(var(--accent))" style={{whiteSpace: "pre"}} fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" letterSpacing="0em">
        <tspan x="190" y="27.5">Pro</tspan>
      </text>
      <text fill="hsl(var(--muted-foreground))" style={{whiteSpace: "pre"}} fontFamily="Arial, sans-serif" fontSize="10" fontWeight="bold" letterSpacing="0.05em">
        <tspan x="62" y="42">DOMINATE YOUR TERRITORY</tspan>
      </text>
    </>
  );

  const TransparentLogo = () => (
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
      <g clipPath="url(#clip0_102_2_transparent)">
        <SvgContent />
      </g>
      <defs>
        <clipPath id="clip0_102_2_transparent">
          <rect width="250" height="56" fill="transparent"/>
        </clipPath>
      </defs>
    </svg>
  );

  const WhiteBgLogo = () => (
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
      <g clipPath="url(#clip0_102_2_white)">
        <rect width="250" height="56" fill="white"/>
        <SvgContent />
      </g>
      <defs>
        <clipPath id="clip0_102_2_white">
          <rect width="250" height="56" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );

  if (variant === 'transparent') {
    return <TransparentLogo />;
  }
  return <WhiteBgLogo />;
}
