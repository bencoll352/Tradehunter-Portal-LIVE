
import type { HTMLAttributes } from 'react';
import { cn } from "@/lib/utils";
import { Crosshair } from 'lucide-react'; 

export function Logo(props: HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;

  return (
    <div className={cn("flex flex-col items-center justify-center gap-1", className)} {...rest}>
       <div className="flex items-center gap-2">
         <div className="p-1.5 rounded-md bg-sidebar-primary">
            <Crosshair className="h-6 w-6 text-sidebar-primary-foreground" />
         </div>
         <div className="flex flex-col text-left group-data-[collapsible=icon]:hidden">
            <span className="text-lg font-bold text-sidebar-primary-foreground leading-tight">
              TradeHunter
            </span>
            <span className="text-lg font-bold text-sidebar-primary leading-tight -mt-1">
              Pro
            </span>
         </div>
       </div>
    </div>
  );
}
