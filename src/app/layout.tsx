import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// Removed the incorrect function calls for GeistSans and GeistMono
// const geistSans = GeistSans({
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
// });

// const geistMono = GeistMono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

export const metadata: Metadata = {
  title: 'TradeHunter Pro Portal',
  description: 'Manage your branch trader data efficiently.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/*
        Use GeistSans.variable and GeistMono.variable directly.
        These properties provide the necessary CSS class names and/or CSS variables
        for the fonts to be applied. The globals.css file should already
        be set up to use --font-geist-sans and --font-geist-mono if needed.
      */}
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
