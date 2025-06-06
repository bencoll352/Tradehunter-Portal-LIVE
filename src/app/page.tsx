
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getBranchInfo } from '@/types'; // Import getBranchInfo

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedInId = localStorage.getItem('loggedInId');
      const branchInfo = getBranchInfo(loggedInId); // Use getBranchInfo

      if (branchInfo.baseBranchId && branchInfo.role !== 'unknown') {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
      // setLoading(false); // Not strictly necessary if redirecting immediately
    }
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
