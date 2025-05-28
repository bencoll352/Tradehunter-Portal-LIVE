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
import type { Trader } from "@/types";
import { Pencil } from "lucide-react";

interface EditTraderDialogProps {
  trader: Trader;
  onUpdateTrader: (traderId: string, values: z.infer<typeof traderFormSchema>) => Promise<void>;
}

export function EditTraderDialog({ trader, onUpdateTrader }: EditTraderDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: z.infer<typeof traderFormSchema>) => {
    setIsLoading(true);
    try {
      await onUpdateTrader(trader.id, values);
      setOpen(false); // Close dialog on success
    } catch (error) {
      console.error("Failed to update trader:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit Trader</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Trader: {trader.name}</DialogTitle>
          <DialogDescription>
            Update the details for this trader.
          </DialogDescription>
        </DialogHeader>
        <TraderForm 
          onSubmit={handleSubmit} 
          defaultValues={trader} 
          isLoading={isLoading}
          submitButtonText="Save Changes"
        />
      </DialogContent>
    </Dialog>
  );
}
