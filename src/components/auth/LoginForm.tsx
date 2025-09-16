
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Logo } from '@/components/icons/Logo';
import { VALID_LOGIN_IDS, type BranchLoginId } from '@/types';
import { Loader2, BrainCircuit, LineChart, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TrustLockLogo } from '@/components/icons/TrustLockLogo';

const formSchema = z.object({
  loginId: z.custom<BranchLoginId>((val) => VALID_LOGIN_IDS.includes(val as BranchLoginId), {
    message: "Please select a valid branch or manager ID.",
  }),
});

type LoginFormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loginId: undefined,
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('loggedInId', values.loginId);

      toast({
        title: "Login Successful",
        description: `Welcome! Redirecting you to the dashboard for ${values.loginId}.`,
      });

      router.replace('/dashboard');
    }, 500);
  };

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
           <Logo className="h-20 w-auto" />
        </div>
        <CardTitle className="text-2xl">Welcome to TradeHunter Pro</CardTitle>
        <CardDescription>Select your Branch ID to access your portal.</CardDescription>
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
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your branch ID" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                       {VALID_LOGIN_IDS.map(id => (
                        <SelectItem key={id} value={id}>{id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select your assigned branch or 'MANAGER' if applicable.
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
      <CardFooter className="flex-col justify-center gap-4">
            <div className="flex justify-center gap-2">
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
            <div>
                <TrustLockLogo />
            </div>
      </CardFooter>
    </Card>
  );
}
