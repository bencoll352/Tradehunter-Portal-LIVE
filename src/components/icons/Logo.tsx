
import type { HTMLAttributes } from 'react';
import { cn } from "@/lib/utils";
import { Target } from 'lucide-react'; 

export function Logo(props: HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;

  return (
    <div className={cn("flex flex-col items-center justify-center gap-1", className)} {...rest}>
       <div className="flex items-center gap-2">
         <Target className="h-7 w-7 text-sidebar-primary-foreground" />
         <span className="text-xl font-bold text-sidebar-primary-foreground group-data-[collapsible=icon]:hidden">
           TradeHunter Pro
         </span>
       </div>
    </div>
  );
}
