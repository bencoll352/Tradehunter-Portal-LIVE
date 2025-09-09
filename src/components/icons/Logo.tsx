
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
      <g transform="translate(85, 8)">
        <path d="M38.8571 19.5707C41.7143 19.5707 44 17.3069 44 14.478C44 11.6492 41.7143 9.38538 38.8571 9.38538C36 9.38538 33.7143 11.6492 33.7143 14.478C33.7143 17.3069 36 19.5707 38.8571 19.5707Z" stroke="#1E63C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 40C22 35.8823 25.4286 32.5 29.5714 32.5H48.1429C52.2857 32.5 55.7143 35.8823 55.7143 40V40H22V40Z" stroke="#1E63C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.5 26C5.5 23.2386 7.73858 21 10.5 21H67.5C70.2614 21 72.5 23.2386 72.5 26V32.5H5.5V26Z" fill="#1E63C2" stroke="#1E63C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M38.8571 14.478V14.478" stroke="white" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="38.857" cy="14.478" r="3.5" stroke="white" strokeWidth="1.5"/>
        <circle cx="38.857" cy="14.478" r="1.5" fill="#E53935"/>
      </g>
    </svg>
  );
}
