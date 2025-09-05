
import type { SVGProps } from 'react';
import { cn } from "@/lib/utils";
import Image from 'next/image';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className={cn("flex items-center justify-center", props.className)}>
      <Image 
        src="https://storage.googleapis.com/project-spark-335215.appspot.com/generated/mbbjw4urzzq4/e41q2x7u4bb.png" 
        alt="TradeHunter Pro Logo" 
        width={200} 
        height={50}
        priority
        data-ai-hint="logo construction"
      />
    </div>
  );
}
