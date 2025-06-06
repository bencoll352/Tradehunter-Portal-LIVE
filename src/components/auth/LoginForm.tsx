
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
import { VALID_LOGIN_IDS, type BranchLoginId } from "@/types";
import { LogIn } from "lucide-react";

const formSchema = z.object({
  branchId: z.string().min(1, { message: "Branch ID is required." })
    .refine(val => VALID_LOGIN_IDS.includes(val.toUpperCase() as BranchLoginId), {
      message: "Invalid Login ID. Example: PURLEY (team) or PURLEYMANAGER (manager).",
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
    const enteredId = values.branchId.toUpperCase() as BranchLoginId;
    if (VALID_LOGIN_IDS.includes(enteredId)) {
      localStorage.setItem("loggedInId", enteredId); // Store the entered ID
      toast({
        title: "Login Successful",
        description: `Welcome! Redirecting to dashboard...`,
      });
      router.push("/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid Login ID. Example: PURLEY (team) or PURLEYMANAGER (manager).",
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
              <FormLabel className="text-foreground">Login ID</FormLabel>
              <FormControl>
                <Input placeholder="e.g., PURLEY or PURLEYMANAGER" {...field} className="text-base" />
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
