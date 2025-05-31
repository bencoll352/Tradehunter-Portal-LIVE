import type { SVGProps } from 'react';
import Image from 'next/image';

export function Logo(props: SVGProps<SVGSVGElement> & { width?: number, height?: number }) {
  // The props like className might not be directly applicable to next/image in the same way as SVG
  // We'll use explicit width and height, or defaults.
  const { width = 200, height = 52, className, ...rest } = props; // Default aspect ratio based on typical logo

  return (
    <div className={className} {...rest} style={{ display: 'flex', alignItems: 'center' }}>
      <Image
        src="https://placehold.co/400x104.png?text=TradeHunter+Pro" // Placeholder reflecting a wide logo
        alt="TradeHunter Pro Logo"
        width={width}
        height={height}
        data-ai-hint="trade hunter pro logo"
        priority // If it's LCP (Largest Contentful Paint)
      />
    </div>
  );
}
