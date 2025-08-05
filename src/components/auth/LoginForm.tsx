
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LogIn, AlertCircle } from "lucide-react";
import { VALID_LOGIN_IDS, getBranchInfo, type BranchLoginId } from "@/types";

const formSchema = z.object({
  loginId: z.string().min(1, { message: "Branch ID is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
});

// A simple client-side check for demonstration purposes.
// In a real app, this would be a server-side check.
const isValidCredential = (loginId: BranchLoginId, email: string): boolean => {
    const info = getBranchInfo(loginId, email);
    // For this demo, we consider any valid login ID with a formatted email as a successful login.
    // The role is determined by the types/index.ts logic.
    return info.role !== 'unknown';
}

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loginId: "",
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formattedLoginId = values.loginId.toUpperCase() as BranchLoginId;
    
    // Check if the provided loginId is one of the valid ones.
    if (!VALID_LOGIN_IDS.includes(formattedLoginId)) {
       toast({
        variant: "destructive",
        title: "Invalid Branch ID",
        description: `The branch ID "${values.loginId}" is not recognized. Please use a valid ID (e.g., PURLEY, LEATHERHEAD, BRANCH_B).`,
      });
      return;
    }

    if (isValidCredential(formattedLoginId, values.email)) {
        // Store user info in localStorage for the session
        localStorage.setItem("loggedInUser", values.email);
        localStorage.setItem("loggedInId", formattedLoginId);

        toast({
            title: "Login Successful",
            description: `Welcome, ${values.email}. Redirecting to your dashboard...`,
        });
        router.push("/dashboard");
    } else {
        // This else block might not be hit if every valid ID is accepted, but it's good practice.
         toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Invalid credentials provided. Please check and try again.",
        });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="loginId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Branch ID</FormLabel>
              <FormControl>
                <Input placeholder="e.g., LEATHERHEAD" {...field} className="text-base" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Email</FormLabel>
              <FormControl>
                <Input placeholder="e.g., your.name@example.com" {...field} className="text-base" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-start p-3 rounded-md bg-muted/50 border border-border">
          <AlertCircle className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
          <p className="text-xs text-muted-foreground">
              Valid example logins: <br/>
              - Branch ID: <code className="font-mono">LEATHERHEAD</code>, Email: <code className="font-mono">manager.leatherhead@example.com</code> (Manager access)<br/>
              - Branch ID: <code className="font-mono">PURLEY</code>, Email: <code className="font-mono">any@example.com</code> (Staff access)
          </p>
        </div>
        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6">
          <LogIn className="mr-2 h-5 w-5" /> Sign In
        </Button>
      </form>
    </Form>
  );
}
