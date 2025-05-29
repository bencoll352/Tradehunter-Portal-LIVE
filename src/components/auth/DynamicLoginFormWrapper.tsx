
"use client";

import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// This component will encapsulate the dynamic import
const ActualDynamicLoginForm = dynamic(
  () => import('@/components/auth/LoginForm').then(mod => mod.LoginForm),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
);

export function DynamicLoginFormWrapper() {
  return <ActualDynamicLoginForm />;
}
