
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";
import { VALID_LOGIN_IDS, getBranchInfo, type BranchLoginId } from "@/types";

const formSchema = z.object({
  loginId: z.string().min(1, { message: "Login ID is required." }),
});

// This is a simplified client-side check.
const isValidCredential = (loginId: BranchLoginId, email: string): boolean => {
    const info = getBranchInfo(loginId, email);
    return info.role !== 'unknown';
}

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loginId: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formattedLoginId = values.loginId.toUpperCase() as BranchLoginId;
    
    if (!VALID_LOGIN_IDS.includes(formattedLoginId)) {
       toast({
        variant: "destructive",
        title: "Invalid Login ID",
        description: `The ID "${values.loginId}" is not recognized. Please use a valid ID (e.g., PURLEY, LEATHERHEAD).`,
      });
      return;
    }
    
    // To maintain compatibility with the role system, we'll derive an email.
    // We check if the login ID maps to a manager role first.
    let derivedEmail = `user@${formattedLoginId.toLowerCase()}.example.com`; // default staff email
    if (formattedLoginId === 'LEATHERHEAD' || formattedLoginId === 'BRANCH_D') {
      derivedEmail = 'manager.leatherhead@example.com';
    } else if (formattedLoginId === 'PURLEY' || formattedLoginId === 'BRANCH_A') {
      // For Purley, we can check for a specific manager string if needed
      if (values.loginId.toUpperCase().includes('MANAGER')) {
        derivedEmail = 'manager.purley@example.com';
      } else {
        derivedEmail = 'staff.purley@example.com';
      }
    }


    if (isValidCredential(formattedLoginId, derivedEmail)) {
        // Store user info in localStorage for the session
        localStorage.setItem("loggedInUser", derivedEmail);
        localStorage.setItem("loggedInId", formattedLoginId);

        toast({
            title: "Login Successful",
            description: `Welcome. Redirecting to your dashboard...`,
        });
        router.push("/dashboard");
    } else {
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
              <FormLabel className="text-foreground">Login ID</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., PURLEY or LEATHERHEAD" 
                  {...field} 
                  className="text-base" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6">
          <ArrowRight className="mr-2 h-5 w-5" /> Sign In
        </Button>
      </form>
    </Form>
  );
}
