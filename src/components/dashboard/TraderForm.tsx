
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Trader } from "@/types";

export const traderFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  totalSales: z.coerce.number().min(0, { message: "Total sales must be a positive number." }),
  tradesMade: z.coerce.number().int().min(0, { message: "Trades made must be a positive integer." }),
  status: z.enum(["Active", "Inactive"]),
  // Optional fields from Trader that might be part of a more comprehensive form in future
  description: z.string().optional(),
  rating: z.coerce.number().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  mainCategory: z.string().optional(),
  ownerName: z.string().optional(),
  ownerProfileLink: z.string().optional(),
  categories: z.string().optional(),
  workdayTiming: z.string().optional(),
  closedOn: z.string().optional(),
  reviewKeywords: z.string().optional(),
});

interface TraderFormProps {
  onSubmit: (values: z.infer<typeof traderFormSchema>) => void;
  defaultValues?: Partial<Trader>; // Use Partial<Trader> for defaultValues
  isLoading?: boolean;
  submitButtonText?: string;
}

export function TraderForm({ onSubmit, defaultValues, isLoading, submitButtonText = "Save Trader" }: TraderFormProps) {
  const form = useForm<z.infer<typeof traderFormSchema>>({
    resolver: zodResolver(traderFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      totalSales: defaultValues?.totalSales || 0,
      tradesMade: defaultValues?.tradesMade || 0,
      status: defaultValues?.status || "Active",
      description: defaultValues?.description || "",
      rating: defaultValues?.rating || undefined,
      website: defaultValues?.website || "",
      phone: defaultValues?.phone || "",
      address: defaultValues?.address || "",
      mainCategory: defaultValues?.mainCategory || "",
      ownerName: defaultValues?.ownerName || "",
      ownerProfileLink: defaultValues?.ownerProfileLink || "",
      categories: defaultValues?.categories || "",
      workdayTiming: defaultValues?.workdayTiming || "",
      closedOn: defaultValues?.closedOn || "",
      reviewKeywords: defaultValues?.reviewKeywords || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trader Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe Ltd." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="totalSales"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Sales (£)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="50000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tradesMade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trades Made</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* 
          Optionally, more fields could be added here if the standard form needs to edit them.
          For now, they are primarily for bulk upload.
          Example:
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Trader description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        */}
        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
          {isLoading ? "Saving..." : submitButtonText}
        </Button>
      </form>
    </Form>
  );
}

