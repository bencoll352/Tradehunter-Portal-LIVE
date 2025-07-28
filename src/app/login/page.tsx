
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';
import { DynamicLoginFormWrapper } from '@/components/auth/DynamicLoginFormWrapper';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Bot size={32} />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">ScenarioForge</CardTitle>
          <CardDescription className="text-muted-foreground">
            Log in to generate your sales scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DynamicLoginFormWrapper />
        </CardContent>
      </Card>
    </div>
  );
}
