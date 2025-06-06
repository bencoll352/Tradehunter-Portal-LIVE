
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { Loader2 } from 'lucide-react';
import { getBranchInfo, type BranchInfo } from '@/types';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedInId = localStorage.getItem('loggedInId');
      const info = getBranchInfo(loggedInId);
      
      if (!info.baseBranchId || info.role === 'unknown') {
        router.replace('/login');
      } else {
        setBranchInfo(info);
        setIsLoading(false);
      }
    }
  }, [router]);

  if (isLoading || !branchInfo) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Pass branchInfo to children if they need it, or use a Context
  // For now, AppSidebar and DashboardClientPageContent will re-read from localStorage or be passed props
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <AppHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
