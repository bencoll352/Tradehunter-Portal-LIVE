
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { BranchId, ParsedTraderData, Trader } from "@/types";
import { UploadCloud, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

interface BulkAddTradersDialogProps {
  branchId: BranchId;
  onBulkAddTraders: (branchId: BranchId, traders: ParsedTraderData[]) => Promise<Trader[] | null>;
}

// Expected column indices for parsing (0-indexed)
const COLUMN_INDICES = {
  NAME: 0,
  DESCRIPTION: 1,
  REVIEWS: 3, // This will be 'tradesMade'
  RATING: 4,
  WEBSITE: 6,
  PHONE: 7,
  MAIN_CATEGORY: 11,
  ADDRESS: 16,
};
const EXPECTED_COLUMN_COUNT = 18; // Based on the user's header string

export function BulkAddTradersDialog({ branchId, onBulkAddTraders }: BulkAddTradersDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pastedData, setPastedData] = useState("");
  const { toast } = useToast();

  const parsePastedData = (): ParsedTraderData[] => {
    const traders: ParsedTraderData[] = [];
    const lines = pastedData.trim().split('\n');

    for (const line of lines) {
      if (line.trim() === "") continue;
      const values = line.split('\t');

      if (values.length < Math.max(...Object.values(COLUMN_INDICES)) + 1 && values.length !== EXPECTED_COLUMN_COUNT) {
        // Basic check, could be more sophisticated
        // For simplicity, we'll try to parse what we can if some optional trailing columns are missing,
        // but if core columns are missing, it might result in empty strings.
        console.warn(`Skipping line due to unexpected column count: "${line}" (expected around ${EXPECTED_COLUMN_COUNT}, got ${values.length})`);
      }

      const name = values[COLUMN_INDICES.NAME]?.trim() || "";
      if (!name) {
        console.warn(`Skipping line due to missing name: "${line}"`);
        continue; // Name is essential
      }

      const trader: ParsedTraderData = {
        name: name,
        description: values[COLUMN_INDICES.DESCRIPTION]?.trim() || undefined,
        tradesMade: parseInt(values[COLUMN_INDICES.REVIEWS]?.trim() || "0", 10) || 0, // from reviews
        rating: parseFloat(values[COLUMN_INDICES.RATING]?.trim() || "0") || undefined,
        website: values[COLUMN_INDICES.WEBSITE]?.trim() || undefined,
        phone: values[COLUMN_INDICES.PHONE]?.trim() || undefined,
        mainCategory: values[COLUMN_INDICES.MAIN_CATEGORY]?.trim() || undefined,
        address: values[COLUMN_INDICES.ADDRESS]?.trim() || undefined,
      };
      traders.push(trader);
    }
    return traders;
  };

  const handleSubmit = async () => {
    if (!pastedData.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Pasted data cannot be empty.",
      });
      return;
    }

    setIsLoading(true);
    const parsedTraders = parsePastedData();

    if (parsedTraders.length === 0) {
      toast({
        variant: "destructive",
        title: "Parsing Error",
        description: "No valid trader data found to upload. Please check format and ensure names are present.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await onBulkAddTraders(branchId, parsedTraders);
      if (result && result.length > 0) {
        toast({
          title: "Success",
          description: `${result.length} trader(s) added successfully.`,
        });
        setOpen(false);
        setPastedData(""); // Clear textarea
      } else if (result === null) {
         toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add traders. Server action returned null.",
        });
      } else {
         toast({
          variant: "destructive",
          title: "No Traders Added",
          description: "The bulk add process completed, but no new traders were added. This might be due to a server-side issue or if all parsed traders were invalid.",
        });
      }
    } catch (error) {
      console.error("Failed to bulk add traders:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UploadCloud className="mr-2 h-4 w-4" /> Bulk Add Traders
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Add New Traders</DialogTitle>
          <DialogDescription>
            Paste tab-separated data from your Google Maps scraping tool. Each line should represent one trader.
            The data should follow the expected column order: Name, Description, (ignored), Reviews (as trades made), Rating, (ignored), Website, Phone, (ignored), (ignored), (ignored), Main Category, (ignored), (ignored), (ignored), (ignored), Address, (ignored).
            Ensure 'Name' is always present.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="bulk-trader-data">Pasted Trader Data</Label>
            <Textarea
              id="bulk-trader-data"
              placeholder="Paste your data here..."
              value={pastedData}
              onChange={(e) => setPastedData(e.target.value)}
              rows={10}
              className="min-h-[200px]"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            Upload Traders
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
