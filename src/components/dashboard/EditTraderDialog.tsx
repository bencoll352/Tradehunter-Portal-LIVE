
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
import { useToast } from "@/hooks/use-toast";

interface EditTraderDialogProps {
  trader: Trader;
  onUpdateTrader: (traderId: string, values: z.infer<typeof traderFormSchema>) => Promise<boolean>; // Changed from Promise<void>
}

export function EditTraderDialog({ trader, onUpdateTrader }: EditTraderDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (values: z.infer<typeof traderFormSchema>) => {
    setIsLoading(true);
    try {
      const success = await onUpdateTrader(trader.id, values);
      if (success) {
        // Success toast is handled by DashboardClientPageContent
        setOpen(false); 
      } else {
        // Error toast is handled by DashboardClientPageContent, dialog remains open
      }
    } catch (error) {
      console.error("Unexpected error in EditTraderDialog submit:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected client-side error occurred while updating the trader.",
      });
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
