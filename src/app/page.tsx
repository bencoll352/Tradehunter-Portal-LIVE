
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getBranchInfo } from '@/types'; 

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedInId = localStorage.getItem('loggedInId');
      const branchInfo = getBranchInfo(loggedInId); 

      if (branchInfo.baseBranchId && branchInfo.role !== 'unknown') {
        router.replace('/dashboard'); // Remains /dashboard for the new overview page
      } else {
        router.replace('/login');
      }
      // setLoading(false); 
    }
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
