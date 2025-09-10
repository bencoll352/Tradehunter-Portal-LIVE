
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TraderForm, traderFormSchema } from "./TraderForm";
import type { z } from "zod";
import { PlusCircle } from "lucide-react";
import type { Trader } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { normalizePhoneNumber } from "@/lib/utils";

interface AddTraderDialogProps {
  onAddTrader: (values: z.infer<typeof traderFormSchema>) => Promise<boolean>; // Changed from Promise<void>
  branchId: string;
  existingTraders: Trader[];
}

export function AddTraderDialog({ onAddTrader, branchId, existingTraders }: AddTraderDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (values: z.infer<typeof traderFormSchema>) => {
    setIsLoading(true);
    const newPhoneNumber = normalizePhoneNumber(values.phone);

    if (newPhoneNumber) {
      const isDuplicate = existingTraders.some(
        (trader) => normalizePhoneNumber(trader.phone) === newPhoneNumber
      );
      if (isDuplicate) {
        toast({
          variant: "destructive",
          title: "Duplicate Trader",
          description: `A trader with phone number ${values.phone} already exists.`,
        });
        setIsLoading(false);
        return;
      }
    }

    try {
      const success = await onAddTrader(values);
      if (success) {
        // Success toast is handled by DashboardClientPageContent
        setOpen(false); 
      } else {
        // Error toast is handled by DashboardClientPageContent, dialog remains open
      }
    } catch (error) {
      // This catch block might not be strictly necessary if DashboardClientPageContent handles all errors
      // from onAddTrader, but kept for robustness.
      console.error("Unexpected error in AddTraderDialog submit:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected client-side error occurred while adding the trader.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Trader
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New Trader</DialogTitle>
          <DialogDescription>
            Enter the details for the new trader in branch {branchId}. Phone number is used for duplicate checking.
          </DialogDescription>
        </DialogHeader>
        <TraderForm onSubmit={handleSubmit} isLoading={isLoading} submitButtonText="Add Trader" />
      </DialogContent>
    </Dialog>
  );
}
