
"use client"; // LoginPage remains a client component

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import { DynamicLoginFormWrapper } from '@/components/auth/DynamicLoginFormWrapper'; // Import the new wrapper

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Building2 size={32} />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">TradeHunter Pro Portal</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to your branch account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DynamicLoginFormWrapper /> {/* Use the wrapper */}
        </CardContent>
      </Card>
    </div>
  );
}
