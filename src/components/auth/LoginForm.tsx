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
import { VALID_BRANCH_IDS, type BranchId } from "@/types";
import { LogIn } from "lucide-react";

const formSchema = z.object({
  branchId: z.string().min(1, { message: "Branch ID is required." })
    .refine(val => VALID_BRANCH_IDS.includes(val as BranchId), {
      message: "Invalid Branch ID. Try PURLEY, BRANCH_B, BRANCH_C, or BRANCH_D.",
    }),
});

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      branchId: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Simulate authentication
    if (VALID_BRANCH_IDS.includes(values.branchId as BranchId)) {
      localStorage.setItem("branchId", values.branchId);
      toast({
        title: "Login Successful",
        description: `Welcome, ${values.branchId}! Redirecting to dashboard...`,
      });
      router.push("/dashboard");
    } else {
      // This case should ideally be caught by zod refinement, but as a fallback:
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid Branch ID.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="branchId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Branch ID</FormLabel>
              <FormControl>
                <Input placeholder="e.g., PURLEY" {...field} className="text-base" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6">
          <LogIn className="mr-2 h-5 w-5" /> Sign In
        </Button>
      </form>
    </Form>
  );
}
