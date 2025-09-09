
import type { SVGProps } from 'react';
import { cn } from "@/lib/utils";

interface LogoProps extends SVGProps<SVGSVGElement> {
  variant?: 'white' | 'transparent';
}

export function Logo({ variant = 'white', ...props }: LogoProps) {
  const TransparentLogo = () => (
     <svg 
      width="200" 
      height="56" 
      viewBox="0 0 200 56" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      aria-label="TradeHunter Pro Logo"
      {...props}
      className={cn(props.className)}
    >
      <g clipPath="url(#clip0_102_2_transparent)">
        <path d="M45.625 21.6562C45.625 16.0312 41.25 11.6562 35.625 11.6562C30 11.6562 25.625 16.0312 25.625 21.6562C25.625 26.5938 29.125 30.6875 34.0312 31.5L31.25 40.25H39.75L37.2188 31.4688C42.0625 30.5625 45.625 26.5625 45.625 21.6562ZM35.625 29.2812C31.2812 29.2812 27.8125 25.8438 27.8125 21.6562C27.8125 17.4375 31.2812 13.9375 35.625 13.9375C39.9375 13.9375 43.4375 17.4375 43.4375 21.6562C43.4375 25.8438 39.9375 29.2812 35.625 29.2812Z" fill="hsl(var(--primary))"/>
        <path d="M12.5 40.25H21.25V31.5H12.5V40.25Z" fill="hsl(var(--primary))"/>
        <path d="M50 40.25H58.75V31.5H50V40.25Z" fill="hsl(var(--primary))"/>
        <path d="M35.625 15.0625C31.9375 15.0625 29 18.0312 29 21.6562C29 25.2812 31.9375 28.25 35.625 28.25C39.3125 28.25 42.25 25.2812 42.25 21.6562C42.25 18.0312 39.3125 15.0625 35.625 15.0625ZM35.625 26.5C32.9062 26.5 30.75 24.3438 30.75 21.6562C30.75 18.9688 32.9062 16.8125 35.625 16.8125C38.3438 16.8125 40.5 18.9688 40.5 21.6562C40.5 24.3438 38.3438 26.5 35.625 26.5Z" fill="hsl(var(--primary))"/>
        <path d="M35.625 17.9062C33.5312 17.9062 31.8438 19.5938 31.8438 21.6562C31.8438 23.7188 33.5312 25.4062 35.625 25.4062C37.7188 25.4062 39.4062 23.7188 39.4062 21.6562C39.4062 19.5938 37.7188 17.9062 35.625 17.9062ZM35.625 23.6562C34.5 23.6562 33.5938 22.7812 33.5938 21.6562C33.5938 20.5312 34.5 19.6562 35.625 19.6562C36.75 19.6562 37.6562 20.5312 37.6562 21.6562C37.6562 22.7812 36.75 23.6562 35.625 23.6562Z" fill="hsl(var(--primary))"/>
        <path d="M35.625 12.75V19.875" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
        <path d="M35.625 23.4375V30.5625" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
        <path d="M42.75 21.6562L28.5 21.6562" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
        <circle cx="35.625" cy="21.6562" r="1.5" fill="hsl(var(--destructive))"/>
        <text fill="hsl(var(--foreground))" style={{whiteSpace: "pre"}} fontFamily="Arial" fontSize="16" fontWeight="bold" letterSpacing="0em">
          <tspan x="70" y="27.5">TradeHunter </tspan>
        </text>
        <text fill="hsl(var(--accent))" style={{whiteSpace: "pre"}} fontFamily="Arial" fontSize="16" fontWeight="bold" letterSpacing="0em">
          <tspan x="158" y="27.5">Pro</tspan>
        </text>
        <text fill="hsl(var(--muted-foreground))" style={{whiteSpace: "pre"}} fontFamily="Arial" fontSize="8" fontWeight="bold" letterSpacing="0.05em">
          <tspan x="70" y="38">DOMINATE YOUR TERRITORY</tspan>
        </text>
      </g>
      <defs>
        <clipPath id="clip0_102_2_transparent">
          <rect width="200" height="56" fill="transparent"/>
        </clipPath>
      </defs>
    </svg>
  );

  const WhiteBgLogo = () => (
    <svg 
      width="200" 
      height="56" 
      viewBox="0 0 200 56" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      aria-label="TradeHunter Pro Logo"
      {...props}
      className={cn(props.className)}
    >
      <g clipPath="url(#clip0_102_2_white)">
        <rect width="200" height="56" fill="white"/>
        <path d="M45.625 21.6562C45.625 16.0312 41.25 11.6562 35.625 11.6562C30 11.6562 25.625 16.0312 25.625 21.6562C25.625 26.5938 29.125 30.6875 34.0312 31.5L31.25 40.25H39.75L37.2188 31.4688C42.0625 30.5625 45.625 26.5625 45.625 21.6562ZM35.625 29.2812C31.2812 29.2812 27.8125 25.8438 27.8125 21.6562C27.8125 17.4375 31.2812 13.9375 35.625 13.9375C39.9375 13.9375 43.4375 17.4375 43.4375 21.6562C43.4375 25.8438 39.9375 29.2812 35.625 29.2812Z" fill="hsl(var(--primary))"/>
        <path d="M12.5 40.25H21.25V31.5H12.5V40.25Z" fill="hsl(var(--primary))"/>
        <path d="M50 40.25H58.75V31.5H50V40.25Z" fill="hsl(var(--primary))"/>
        <path d="M35.625 15.0625C31.9375 15.0625 29 18.0312 29 21.6562C29 25.2812 31.9375 28.25 35.625 28.25C39.3125 28.25 42.25 25.2812 42.25 21.6562C42.25 18.0312 39.3125 15.0625 35.625 15.0625ZM35.625 26.5C32.9062 26.5 30.75 24.3438 30.75 21.6562C30.75 18.9688 32.9062 16.8125 35.625 16.8125C38.3438 16.8125 40.5 18.9688 40.5 21.6562C40.5 24.3438 38.3438 26.5 35.625 26.5Z" fill="hsl(var(--primary))"/>
        <path d="M35.625 17.9062C33.5312 17.9062 31.8438 19.5938 31.8438 21.6562C31.8438 23.7188 33.5312 25.4062 35.625 25.4062C37.7188 25.4062 39.4062 23.7188 39.4062 21.6562C39.4062 19.5938 37.7188 17.9062 35.625 17.9062ZM35.625 23.6562C34.5 23.6562 33.5938 22.7812 33.5938 21.6562C33.5938 20.5312 34.5 19.6562 35.625 19.6562C36.75 19.6562 37.6562 20.5312 37.6562 21.6562C37.6562 22.7812 36.75 23.6562 35.625 23.6562Z" fill="hsl(var(--primary))"/>
        <path d="M35.625 12.75V19.875" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
        <path d="M35.625 23.4375V30.5625" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
        <path d="M42.75 21.6562L28.5 21.6562" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
        <circle cx="35.625" cy="21.6562" r="1.5" fill="hsl(var(--destructive))"/>
        <text fill="hsl(var(--foreground))" style={{whiteSpace: "pre"}} fontFamily="Arial" fontSize="16" fontWeight="bold" letterSpacing="0em">
          <tspan x="70" y="27.5">TradeHunter </tspan>
        </text>
        <text fill="hsl(var(--accent))" style={{whiteSpace: "pre"}} fontFamily="Arial" fontSize="16" fontWeight="bold" letterSpacing="0em">
          <tspan x="158" y="27.5">Pro</tspan>
        </text>
        <text fill="hsl(var(--muted-foreground))" style={{whiteSpace: "pre"}} fontFamily="Arial" fontSize="8" fontWeight="bold" letterSpacing="0.05em">
          <tspan x="70" y="38">DOMINATE YOUR TERRITORY</tspan>
        </text>
      </g>
      <defs>
        <clipPath id="clip0_102_2_white">
          <rect width="200" height="56" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );

  if (variant === 'transparent') {
    return <TransparentLogo />;
  }
  return <WhiteBgLogo />;
}
