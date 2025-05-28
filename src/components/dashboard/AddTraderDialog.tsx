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
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { TraderForm, traderFormSchema } from "./TraderForm";
import type { z } from "zod";
import { PlusCircle } from "lucide-react";

interface AddTraderDialogProps {
  onAddTrader: (values: z.infer<typeof traderFormSchema>) => Promise<void>;
  branchId: string;
}

export function AddTraderDialog({ onAddTrader, branchId }: AddTraderDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: z.infer<typeof traderFormSchema>) => {
    setIsLoading(true);
    try {
      await onAddTrader(values);
      setOpen(false); // Close dialog on success
    } catch (error) {
      console.error("Failed to add trader:", error);
      // Toast notification for error can be added here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Trader
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New Trader</DialogTitle>
          <DialogDescription>
            Enter the details for the new trader in branch {branchId}.
          </DialogDescription>
        </DialogHeader>
        <TraderForm onSubmit={handleSubmit} isLoading={isLoading} submitButtonText="Add Trader" />
      </DialogContent>
    </Dialog>
  );
}
