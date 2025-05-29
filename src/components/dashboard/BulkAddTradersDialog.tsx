
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

// Expected column indices for parsing (0-indexed based on the 14 specific headers)
// Name (1) Description (2) reviews (3) rating (4) Website (5) Phone (6) Owner_name (7) Owner_profile_link (8) Main_category (9) Categories (10) workday_timing (11) closed_on (12) Address (13) review_keywords (14)
const COLUMN_INDICES = {
  NAME: 0,                // Column 1
  DESCRIPTION: 1,         // Column 2
  REVIEWS: 2,             // Column 3 (maps to tradesMade)
  RATING: 3,              // Column 4
  WEBSITE: 4,             // Column 5
  PHONE: 5,               // Column 6
  OWNER_NAME: 6,          // Column 7
  OWNER_PROFILE_LINK: 7,  // Column 8
  MAIN_CATEGORY: 8,       // Column 9
  CATEGORIES: 9,          // Column 10
  WORKDAY_TIMING: 10,     // Column 11
  CLOSED_ON: 11,          // Column 12
  ADDRESS: 12,            // Column 13
  REVIEW_KEYWORDS: 13,    // Column 14
};
const EXPECTED_COLUMN_COUNT = 14;

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

      if (values.length !== EXPECTED_COLUMN_COUNT) {
         console.warn(`Skipping line due to unexpected column count: "${line}" (expected ${EXPECTED_COLUMN_COUNT}, got ${values.length})`);
         continue;
      }

      const name = values[COLUMN_INDICES.NAME]?.trim() || "";
      if (!name) {
        console.warn(`Skipping line due to missing name: "${line}"`);
        continue; // Name is essential
      }

      const trader: ParsedTraderData = {
        name: name,
        description: values[COLUMN_INDICES.DESCRIPTION]?.trim() || undefined,
        tradesMade: parseInt(values[COLUMN_INDICES.REVIEWS]?.trim() || "0", 10) || 0,
        rating: parseFloat(values[COLUMN_INDICES.RATING]?.trim() || "0") || undefined,
        website: values[COLUMN_INDICES.WEBSITE]?.trim() || undefined,
        phone: values[COLUMN_INDICES.PHONE]?.trim() || undefined,
        ownerName: values[COLUMN_INDICES.OWNER_NAME]?.trim() || undefined,
        ownerProfileLink: values[COLUMN_INDICES.OWNER_PROFILE_LINK]?.trim() || undefined,
        mainCategory: values[COLUMN_INDICES.MAIN_CATEGORY]?.trim() || undefined,
        categories: values[COLUMN_INDICES.CATEGORIES]?.trim() || undefined,
        workdayTiming: values[COLUMN_INDICES.WORKDAY_TIMING]?.trim() || undefined,
        closedOn: values[COLUMN_INDICES.CLOSED_ON]?.trim() || undefined,
        address: values[COLUMN_INDICES.ADDRESS]?.trim() || undefined,
        reviewKeywords: values[COLUMN_INDICES.REVIEW_KEYWORDS]?.trim() || undefined,
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
        description: "No valid trader data found. Please check format, ensure names are present, and each line has 14 tab-separated values.",
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
          variant: "warning",
          title: "No New Traders Added",
          description: "The process completed, but no new traders were added. This might be due to a server-side issue or if all parsed traders were invalid/duplicates.",
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Add New Traders</DialogTitle>
          <DialogDescription>
            Paste tab-separated data from your Google Maps scraping tool. Each line should represent one trader and contain 14 columns in the following order:
            <br/>1. Name, 2. Description, 3. Reviews (trades made), 4. Rating, 5. Website, 6. Phone, 7. Owner Name, 8. Owner Profile Link, 9. Main Category, 10. Categories, 11. Workday Timing, 12. Closed On, 13. Address, 14. Review Keywords.
            <br/>Ensure 'Name' (column 1) is always present.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="bulk-trader-data">Pasted Trader Data (Tab-Separated)</Label>
            <Textarea
              id="bulk-trader-data"
              placeholder="Paste your data here..."
              value={pastedData}
              onChange={(e) => setPastedData(e.target.value)}
              rows={10}
              className="min-h-[200px] text-xs"
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
