
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
    const rawInput = values.loginId.toUpperCase().trim();
    const isManagerLogin = rawInput.includes("MANAGER");
    
    // Extract the core branch ID by removing "MANAGER" and trimming whitespace
    const formattedLoginId = (isManagerLogin ? rawInput.replace("MANAGER", "") : rawInput).trim() as BranchLoginId;

    if (!VALID_LOGIN_IDS.includes(formattedLoginId)) {
       toast({
        variant: "destructive",
        title: "Invalid Branch ID",
        description: `The Branch ID part "${formattedLoginId}" is not recognized. Please use a valid ID (e.g., PURLEY, LEATHERHEAD).`,
      });
      return;
    }
    
    const branchInfoForEmail = getBranchInfo(formattedLoginId, 'any@example.com'); // Get baseBranchId
    if (!branchInfoForEmail.baseBranchId) {
        toast({
            variant: "destructive",
            title: "Internal Error",
            description: "Could not resolve branch information. Please contact support.",
        });
        return;
    }

    // Derive the email based on whether "MANAGER" was included in the input
    const derivedEmail = isManagerLogin 
        ? `manager.${branchInfoForEmail.baseBranchId.toLowerCase()}@example.com` 
        : `staff.${branchInfoForEmail.baseBranchId.toLowerCase()}@example.com`;

    if (isValidCredential(formattedLoginId, derivedEmail)) {
        localStorage.setItem("loggedInUser", derivedEmail);
        localStorage.setItem("loggedInId", formattedLoginId);

        const info = getBranchInfo(formattedLoginId, derivedEmail);

        toast({
            title: "Login Successful",
            description: `Welcome ${info.role === 'manager' ? 'Manager' : 'Staff'}. Redirecting...`,
        });
        router.push("/dashboard");
    } else {
         toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Invalid credentials. Ensure the Branch ID is correct and 'MANAGER' is used appropriately.",
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
                  placeholder="e.g., PURLEY or LEATHERHEAD MANAGER" 
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
