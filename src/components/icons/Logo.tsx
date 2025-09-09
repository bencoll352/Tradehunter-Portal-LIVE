import type { HTMLAttributes } from 'react';
import { cn } from "@/lib/utils";
import Image from 'next/image';

export function Logo(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cn("flex items-center justify-center", props.className)}>
      <Image 
        src="https://storage.googleapis.com/project-spark-335215.appspot.com/generated/mbbjw4urzzq4/4n2l5ksso80.png" 
        alt="TradeHunter Pro Logo" 
        width={150} 
        height={40}
        priority
        data-ai-hint="logo"
      />
    </div>
  );
}
