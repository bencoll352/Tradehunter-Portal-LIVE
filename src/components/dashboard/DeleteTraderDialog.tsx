
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeleteTraderDialogProps {
  traderName: string;
  onDeleteTrader: () => Promise<boolean>; // Changed from Promise<void>
}

export function DeleteTraderDialog({ traderName, onDeleteTrader }: DeleteTraderDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const success = await onDeleteTrader();
      if (success) {
        // Success toast is handled by TraderTableClient (which calls onDelete from DashboardClientPageContent)
        setOpen(false);
      } else {
        // Error toast handled by DashboardClientPageContent, dialog might remain open or user retries.
        // No specific toast here to avoid duplicates if parent handles it.
      }
    } catch (error) {
      console.error("Unexpected error in DeleteTraderDialog handleDelete:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected client-side error occurred while deleting the trader.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete Trader</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete {traderName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the trader's data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
