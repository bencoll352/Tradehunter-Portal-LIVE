
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { Logo } from '@/components/icons/Logo';
import { VALID_LOGIN_IDS, type BranchLoginId } from '@/types';
import { Loader2, BrainCircuit, LineChart, Target, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TrustLockLogo } from '@/components/icons/TrustLockLogo';
import { VerifiedBadge } from '../icons/VerifiedBadge';

const formSchema = z.object({
  loginId: z.string().toUpperCase().refine((val) => VALID_LOGIN_IDS.includes(val as BranchLoginId), {
    message: "Invalid Branch or Manager ID. Please enter a valid ID (e.g., PURLEY, MANAGER).",
  }),
});

type LoginFormValues = {
  loginId: string;
};

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loginId: "",
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const upperCaseId = values.loginId.toUpperCase() as BranchLoginId;
      localStorage.setItem('loggedInId', upperCaseId);

      toast({
        title: "Login Successful",
        description: `Welcome! Redirecting you to the dashboard for ${upperCaseId}.`,
      });

      router.replace('/dashboard');
    }, 500);
  };

  return (
    <Card className="w-full max-w-lg shadow-2xl">
      <CardHeader className="text-center items-center">
        <Logo className="h-auto w-full max-w-xs text-foreground mb-4" />
        <CardTitle className="text-2xl">Welcome to TradeHunter Pro</CardTitle>
        <CardDescription>Enter your Branch ID to access your portal.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="loginId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch / Login ID</FormLabel>
                   <FormControl>
                      <Input placeholder="Enter your branch ID (e.g., PURLEY)" {...field} />
                    </FormControl>
                  <FormDescription>
                    Enter your assigned branch or 'MANAGER' if applicable.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex-col justify-center items-center gap-6 pt-6 border-t">
            <div className="flex justify-center items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="gap-1.5 py-1 px-2">
                    <BrainCircuit className="h-3.5 w-3.5 text-primary" />
                    Sales Intelligence
                </Badge>
                <Badge variant="secondary" className="gap-1.5 py-1 px-2">
                    <LineChart className="h-3.5 w-3.5 text-primary" />
                    Data Analysis
                </Badge>
                <Badge variant="secondary" className="gap-1.5 py-1 px-2">
                    <Target className="h-3.5 w-3.5 text-primary" />
                    CRM
                </Badge>
            </div>
            <div className="flex items-center justify-center gap-8 w-full">
                <div className="flex flex-col items-center gap-1">
                    <TrustLockLogo className="text-foreground" />
                </div>
                <div className="flex flex-col items-center gap-1">
                     <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    </div>
                    <span className="text-xs text-muted-foreground font-semibold">5-Star Rated</span>
                </div>
                 <div className="flex flex-col items-center gap-1">
                    <VerifiedBadge className="h-10 w-10" />
                    <span className="text-xs text-muted-foreground font-semibold">Verified</span>
                </div>
            </div>
      </CardFooter>
    </Card>
  );
}
