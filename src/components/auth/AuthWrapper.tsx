
'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // This effect should only run on the client side.
    const loggedInId = localStorage.getItem('loggedInId');
    if (loggedInId) {
      setIsAuthenticated(true);
    } else {
      // If not authenticated, redirect to the login page.
      router.replace('/login');
    }
    // Once the check is complete, stop loading.
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    // While checking for authentication, show a loading spinner.
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // If not authenticated after the check, show a loading spinner while redirecting.
    // This prevents rendering the children for an unauthenticated user.
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If authenticated, render the children (the app layout).
  return <>{children}</>;
}
