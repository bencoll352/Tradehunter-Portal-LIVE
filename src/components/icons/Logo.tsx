
import type { HTMLAttributes } from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils"; // Added this import

// Combine HTMLAttributes for a div with custom width and height props
export function Logo(props: HTMLAttributes<HTMLDivElement> & { width?: number, height?: number }) {
  // The props like className might not be directly applicable to next/image in the same way as SVG
  // We'll use explicit width and height, or defaults.
  const { width = 200, height = 52, className, ...rest } = props; // Default aspect ratio based on typical logo

  return (
    <div className={cn("flex flex-col items-center", className)} {...rest}>
      <Image
        src="https://placehold.co/400x104.png?text=TradeHunter+Pro" // Placeholder reflecting a wide logo
        alt="TradeHunter Pro Logo"
        width={width}
        height={height}
        data-ai-hint="trade hunter pro logo"
        priority // If it's LCP (Largest Contentful Paint)
      />
      <p className="text-xs text-sidebar-foreground/80 -mt-1 group-data-[collapsible=icon]:hidden">
        Dominate Your Territory
      </p>
    </div>
  );
}
