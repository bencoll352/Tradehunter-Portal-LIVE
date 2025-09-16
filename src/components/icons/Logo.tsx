import Image from 'next/image';
import { cn } from "@/lib/utils";
import type React from 'react';

// Using React.HTMLAttributes<HTMLDivElement> because we are rendering a div
interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <div
      className={cn("relative w-[170px] h-[40px]", className)}
      {...props}
    >
      <Image
        src="https://storage.googleapis.com/tradehunter-pro-assets/tradehunter-pro-logo.png"
        alt="TradeHunter Pro Logo"
        fill
        style={{ objectFit: 'contain' }}
        priority // The logo is important, so we prioritize its loading
      />
    </div>
  );
}
