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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Trader } from "@/types";

// Schema now includes all fields present in the TraderTable overview
export const traderFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  totalSales: z.coerce.number().min(0, { message: "Total sales must be a positive number." }),
  tradesMade: z.coerce.number().int().min(0, { message: "Trades made (Reviews) must be a positive integer." }),
  status: z.enum(["Active", "Inactive"]),
  description: z.string().optional(),
  rating: z.coerce.number().min(0).max(5).optional().nullable(), // Allow 0-5, and allow null for unrated
  website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')).nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  mainCategory: z.string().optional().nullable(),
  ownerName: z.string().optional().nullable(),
  ownerProfileLink: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')).nullable(),
  categories: z.string().optional().nullable(), // Storing as single string
  workdayTiming: z.string().optional().nullable(),
  // lastActivity is typically system-managed, not part of user form
  // closedOn and reviewKeywords are not in the table overview, so not added here for now
});

interface TraderFormProps {
  onSubmit: (values: z.infer<typeof traderFormSchema>) => void;
  defaultValues?: Partial<Trader>;
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
      rating: defaultValues?.rating ?? null, // Use null for empty optional number
      website: defaultValues?.website || "",
      phone: defaultValues?.phone || "",
      address: defaultValues?.address || "",
      mainCategory: defaultValues?.mainCategory || "",
      ownerName: defaultValues?.ownerName || "",
      ownerProfileLink: defaultValues?.ownerProfileLink || "",
      categories: defaultValues?.categories || "",
      workdayTiming: defaultValues?.workdayTiming || "",
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
                <FormLabel>Reviews (Trades Made)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Rating (0-5)</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="4.5" {...field} onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))} value={field.value ?? ''} step="0.1" min="0" max="5" />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Trader description..." {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                    <Input placeholder="https://example.com" {...field} value={field.value ?? ''}/>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                    <Input placeholder="01234 567890" {...field} value={field.value ?? ''}/>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                <Input placeholder="123 Main St, Anytown" {...field} value={field.value ?? ''}/>
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="ownerName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Owner Name</FormLabel>
                <FormControl>
                    <Input placeholder="Jane Doe" {...field} value={field.value ?? ''}/>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="ownerProfileLink"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Owner Profile Link</FormLabel>
                <FormControl>
                    <Input placeholder="https://linkedin.com/in/janedoe" {...field} value={field.value ?? ''}/>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="mainCategory"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Main Category</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Retail, Services" {...field} value={field.value ?? ''}/>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="categories"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Categories (comma-separated)</FormLabel>
                <FormControl>
                    <Input placeholder="Plumbing, Electrical, HVAC" {...field} value={field.value ?? ''}/>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        <FormField
            control={form.control}
            name="workdayTiming"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Workday Timing</FormLabel>
                <FormControl>
                <Input placeholder="Mon-Fri 9am-5pm" {...field} value={field.value ?? ''}/>
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />

        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
          {isLoading ? "Saving..." : submitButtonText}
        </Button>
      </form>
    </Form>
  );
}
