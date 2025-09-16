import { cn } from "@/lib/utils";
import type React from 'react';

// Changed props to reflect a div container instead of SVG
interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <div className="text-2xl font-bold tracking-tight">
        <span className="text-foreground">TradeHunter</span>
        <span className="text-accent">Pro</span>
      </div>
      <div className="text-xs font-bold text-foreground/80 tracking-widest">
        DOMINATE YOUR TERRITORY
      </div>
    </div>
  );
}
