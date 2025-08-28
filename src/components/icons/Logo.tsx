
import type { HTMLAttributes } from 'react';
import { cn } from "@/lib/utils";
import Image from 'next/image';

export function Logo(props: HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;

  return (
    <div className={cn("flex items-center justify-center gap-2", className)} {...rest}>
      {/* This is a placeholder for your logo image. 
          You can replace the `src` with the path to your actual logo file (e.g., "/logo.png") 
          once you add it to the `public` folder. */}
      <Image 
        src="https://placehold.co/400x100/2563eb/ffffff" 
        alt="TradeHunter Pro Logo" 
        width={160} 
        height={40}
        data-ai-hint="logo construction"
        className="group-data-[collapsible=icon]:hidden"
      />
       <Image 
        src="https://placehold.co/100x100/f97316/ffffff" 
        alt="TradeHunter Pro Icon" 
        width={32} 
        height={32}
        data-ai-hint="logo construction"
        className="hidden group-data-[collapsible=icon]:block"
      />
    </div>
  );
}
