
import type { HTMLAttributes } from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { Bot } from 'lucide-react'; // Using an icon for simplicity

export function Logo(props: HTMLAttributes<HTMLDivElement> & { width?: number, height?: number }) {
  const { className, ...rest } = props;

  return (
    <div className={cn("flex flex-col items-center justify-center gap-1", className)} {...rest}>
       <div className="flex items-center gap-2">
         <Bot className="h-7 w-7 text-sidebar-primary-foreground" />
         <span className="text-xl font-bold text-sidebar-primary-foreground group-data-[collapsible=icon]:hidden">
           ScenarioForge
         </span>
       </div>
    </div>
  );
}
