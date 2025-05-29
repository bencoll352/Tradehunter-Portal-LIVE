
"use client";

import { useState, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { BranchId, ParsedTraderData, Trader } from "@/types";
import { UploadCloud, Loader2, FileText, XCircle } from "lucide-react";
import { Label } from "@/components/ui/label";

interface BulkAddTradersDialogProps {
  branchId: BranchId;
  onBulkAddTraders: (branchId: BranchId, traders: ParsedTraderData[]) => Promise<Trader[] | null>;
}

// Expected column indices for parsing (0-indexed based on the 14 specific headers)
const COLUMN_INDICES = {
  NAME: 0,
  DESCRIPTION: 1,
  REVIEWS: 2,             // (maps to tradesMade)
  RATING: 3,
  WEBSITE: 4,
  PHONE: 5,
  OWNER_NAME: 6,
  OWNER_PROFILE_LINK: 7,
  MAIN_CATEGORY: 8,
  CATEGORIES: 9,
  WORKDAY_TIMING: 10,
  CLOSED_ON: 11,
  ADDRESS: 12,
  REVIEW_KEYWORDS: 13,
};
const EXPECTED_COLUMN_COUNT = 14;

export function BulkAddTradersDialog({ branchId, onBulkAddTraders }: BulkAddTradersDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setFileContent(e.target?.result as string);
        };
        reader.readAsText(file);
        toast({ title: "File Selected", description: `${file.name} is ready for processing.` });
      } else {
        toast({ variant: "destructive", title: "Invalid File Type", description: "Please upload a CSV file (.csv)." });
        if (fileInputRef.current) fileInputRef.current.value = "";
        setSelectedFile(null);
        setFileContent(null);
      }
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFileContent(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const parseCsvData = (csvString: string | null): ParsedTraderData[] => {
    if (!csvString) return [];
    const traders: ParsedTraderData[] = [];
    const lines = csvString.trim().split(/\r\n|\n/).filter(line => line.trim() !== ""); // Handles different line endings

    if (lines.length === 0) return [];

    // More robust header detection and data line extraction
    const firstLineValues = lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(val => {
      let cleaned = val.trim();
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.substring(1, cleaned.length - 1).replace(/""/g, '"');
      }
      return cleaned;
    });
    
    const potentialHeaderContent = firstLineValues[COLUMN_INDICES.NAME]?.trim().toLowerCase();
    const dataLines = (potentialHeaderContent === 'name') ? lines.slice(1) : lines;

    for (const line of dataLines) {
      // Regex to split by comma, but not if it's inside double quotes
      const rawValues = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      
      const values = rawValues.map(val => {
        let cleaned = val.trim();
        // Remove surrounding quotes (if any)
        if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
          cleaned = cleaned.substring(1, cleaned.length - 1);
        }
        // Replace escaped double quotes "" with a single double quote "
        cleaned = cleaned.replace(/""/g, '"');
        return cleaned;
      });

      if (values.length !== EXPECTED_COLUMN_COUNT) {
        console.warn(`Skipping line due to unexpected column count: "${line}" (expected ${EXPECTED_COLUMN_COUNT}, got ${values.length}). Parsed values:`, values);
        continue;
      }

      const name = values[COLUMN_INDICES.NAME]?.trim() || "";
      if (!name) {
        console.warn(`Skipping line due to missing name: "${line}"`);
        continue;
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
    if (!selectedFile || !fileContent) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a CSV file to upload.",
      });
      return;
    }

    setIsLoading(true);
    const parsedTraders = parseCsvData(fileContent);

    if (parsedTraders.length === 0 && fileContent.trim() !== "") { // check if fileContent was not empty
      toast({
        variant: "destructive",
        title: "Parsing Issue",
        description: "No valid trader data could be parsed. Please check the CSV format: ensure it has 14 columns, commas within fields are double-quoted, and 'Name' (column 1) is present. Header row is skipped if detected.",
      });
      setIsLoading(false);
      return;
    }
     if (parsedTraders.length === 0 && fileContent.trim() === "") {
      toast({
        variant: "destructive",
        title: "Empty File",
        description: "The selected CSV file appears to be empty.",
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
        clearFile();
      } else if (result === null) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add traders. Server action returned null.",
        });
      } else {
         toast({
          variant: "default", // Changed from "warning"
          title: "No New Traders Added",
          description: "The process completed, but no new traders were added. This might mean all parsed traders were invalid, duplicates, or the file contained no new data.",
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
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        clearFile(); // Clear file if dialog is closed
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UploadCloud className="mr-2 h-4 w-4" /> Bulk Add Traders (CSV)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Add New Traders via CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file. Each row should represent one trader and contain 14 columns in the following order:
            <br/>1. Name, 2. Description, 3. Reviews (trades made), 4. Rating, 5. Website, 6. Phone, 7. Owner Name, 8. Owner Profile Link, 9. Main Category, 10. Categories, 11. Workday Timing, 12. Closed On, 13. Address, 14. Review Keywords.
            <br/>Ensure 'Name' (column 1) is always present. Commas within fields (e.g., Address) must be enclosed in double quotes. The system will attempt to skip a header row if detected.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="csv-trader-upload">Upload CSV File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="csv-trader-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv,text/csv"
                className="flex-grow"
                disabled={isLoading}
              />
              {selectedFile && (
                <Button variant="ghost" size="icon" onClick={clearFile} aria-label="Clear file" disabled={isLoading}>
                  <XCircle className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                </Button>
              )}
            </div>
            {selectedFile && (
              <p className="text-xs text-muted-foreground mt-1">
                <FileText className="inline h-3 w-3 mr-1" />
                {selectedFile.name} ({ (selectedFile.size / 1024).toFixed(2) } KB) ready.
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isLoading || !selectedFile} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            Upload Traders
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
