import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="40"
      height="40"
      aria-label="TradeHunter Pro Logo"
      {...props} // props will include className="text-sidebar-primary"
    >
      {/* The 'currentColor' will be var(--sidebar-primary) due to the className passed to Logo */}
      <rect width="100" height="100" rx="15" fill="currentColor" />
      <text
        x="50%"
        y="52%" // Adjusted slightly for better visual centering with most sans-serifs
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="var(--font-geist-sans), Arial, sans-serif"
        fontSize="50"
        fontWeight="bold"
        fill="hsl(var(--sidebar-primary-foreground))" // Use the foreground color for sidebar primary elements
      >
        TH
      </text>
    </svg>
  );
}
