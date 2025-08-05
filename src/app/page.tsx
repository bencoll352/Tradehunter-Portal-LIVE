
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // The presence of a "logged in" user is now the gate to the dashboard.
    // If not present, the user should be directed to the login page.
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  // Provide feedback to the user while the redirect logic runs.
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
