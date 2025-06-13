
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { VALID_LOGIN_IDS, type BranchLoginId } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function AgentAccessPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  // isLoading is not strictly necessary here as the effect runs once and redirects.
  // The message state will provide user feedback.
  const [message, setMessage] = useState("Processing agent access...");

  useEffect(() => {
    // Ensure params.loginId is a string, as it can be string | string[]
    const loginIdFromParams = Array.isArray(params.loginId) ? params.loginId[0] : params.loginId;

    if (loginIdFromParams && typeof loginIdFromParams === 'string') {
      const targetLoginId = loginIdFromParams.toUpperCase() as BranchLoginId;

      if (VALID_LOGIN_IDS.includes(targetLoginId)) {
        localStorage.setItem('loggedInId', targetLoginId);
        setMessage(`Access granted as ${targetLoginId}. Redirecting to dashboard...`);
        // Add a small delay for the message to be visible if needed, then redirect.
        setTimeout(() => {
          router.replace('/dashboard');
        }, 1000); // 1 second delay
      } else {
        setMessage(`Invalid agent access ID: ${loginIdFromParams}. Redirecting to login page.`);
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: `The provided access ID "${loginIdFromParams}" is not valid.`,
        });
        setTimeout(() => {
          router.replace('/login');
        }, 2500); // Slightly longer delay for error toast
      }
    } else {
      // Handle case where loginId might not be in params as expected
      setMessage("Agent access ID missing or invalid in URL. Redirecting to login page.");
      toast({
        variant: "destructive",
        title: "Access Error",
        description: "Agent access ID was not provided or was invalid in the URL.",
      });
      setTimeout(() => {
          router.replace('/login');
      }, 2500);
    }
    // No need to set isLoading to false as the component will unmount on redirect.
  }, [params, router, toast]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background p-4 space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
