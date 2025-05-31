
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

// Expected column indices for parsing (0-indexed based on the 16 specific headers)
const COLUMN_INDICES = {
  NAME: 0,
  TOTAL_SALES: 1,
  STATUS: 2,
  LAST_ACTIVITY: 3,
  DESCRIPTION: 4,
  REVIEWS: 5,         // (maps to tradesMade)
  RATING: 6,
  WEBSITE: 7,
  PHONE: 8,
  OWNER_NAME: 9,
  MAIN_CATEGORY: 10,
  CATEGORIES: 11,
  WORKDAY_TIMING: 12,
  ADDRESS: 13,
  OWNER_PROFILE_LINK: 14, // Mapped from 'Link' header
  ACTIONS_COLUMN: 15, // This column's data will be ignored
};
const EXPECTED_COLUMN_COUNT = 16;

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
    const allLines = csvString.trim().split(/\r\n|\n/);
    const lines = allLines.filter(line => line.trim() !== "");


    if (lines.length === 0) return [];
    
    let dataLines = lines; // Initialize with all lines
    const firstLineValuesForHeaderCheck = lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(val => {
      let cleaned = val.trim();
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.substring(1, cleaned.length - 1).replace(/""/g, '"');
      }
      return cleaned;
    });

    // Check if the first column of the first line exists and if it's 'name' (case-insensitive)
    if (firstLineValuesForHeaderCheck.length > COLUMN_INDICES.NAME) {
      const firstCellContent = firstLineValuesForHeaderCheck[COLUMN_INDICES.NAME];
      if (firstCellContent && firstCellContent.trim().toLowerCase() === 'name') {
        dataLines = lines.slice(1); // Skip header row
      }
    }


    for (const line of dataLines) {
      const rawValues = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      
      const values = rawValues.map(val => {
        let cleaned = val.trim();
        if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
          cleaned = cleaned.substring(1, cleaned.length - 1);
        }
        cleaned = cleaned.replace(/""/g, '"');
        return cleaned;
      });

      if (values.length !== EXPECTED_COLUMN_COUNT) {
        console.warn(`Skipping line due to unexpected column count (${values.length} instead of ${EXPECTED_COLUMN_COUNT}): "${line}". Parsed values:`, values);
        continue; 
      }

      const name = values[COLUMN_INDICES.NAME]?.trim() || "";
      if (!name) {
        console.warn(`Skipping line due to missing name: "${line}"`);
        continue; 
      }
      
      let statusValue = values[COLUMN_INDICES.STATUS]?.trim().toLowerCase();
      let parsedStatus : 'Active' | 'Inactive' | undefined = undefined;
      if (statusValue === 'active') {
        parsedStatus = 'Active';
      } else if (statusValue === 'inactive') {
        parsedStatus = 'Inactive';
      }
      // If undefined, it will be defaulted later by addTrader or bulkAddTraders logic

      const lastActivityString = values[COLUMN_INDICES.LAST_ACTIVITY]?.trim();
      let lastActivityValue: string | undefined = undefined;
      if (lastActivityString) {
        const date = new Date(lastActivityString);
        if (!isNaN(date.getTime())) {
          lastActivityValue = date.toISOString();
        } else {
            // If date is invalid, let it be undefined so system can default it
            console.warn(`Invalid date format for Last Activity: "${lastActivityString}" for trader "${name}". System will default it.`);
        }
      }


      const trader: ParsedTraderData = {
        name: name,
        totalSales: parseFloat(values[COLUMN_INDICES.TOTAL_SALES]?.trim() || "0") || undefined,
        status: parsedStatus,
        lastActivity: lastActivityValue,
        description: values[COLUMN_INDICES.DESCRIPTION]?.trim() || undefined,
        tradesMade: parseInt(values[COLUMN_INDICES.REVIEWS]?.trim() || "0", 10) || 0,
        rating: parseFloat(values[COLUMN_INDICES.RATING]?.trim() || "0") || undefined,
        website: values[COLUMN_INDICES.WEBSITE]?.trim() || undefined,
        phone: values[COLUMN_INDICES.PHONE]?.trim() || undefined,
        ownerName: values[COLUMN_INDICES.OWNER_NAME]?.trim() || undefined,
        mainCategory: values[COLUMN_INDICES.MAIN_CATEGORY]?.trim() || undefined,
        categories: values[COLUMN_INDICES.CATEGORIES]?.trim() || undefined,
        workdayTiming: values[COLUMN_INDICES.WORKDAY_TIMING]?.trim() || undefined,
        address: values[COLUMN_INDICES.ADDRESS]?.trim() || undefined,
        ownerProfileLink: values[COLUMN_INDICES.OWNER_PROFILE_LINK]?.trim() || undefined,
        // ACTIONS_COLUMN at index 15 is intentionally ignored
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

    if (parsedTraders.length === 0 && fileContent.trim() !== "") { 
      toast({
        variant: "destructive",
        title: "Parsing Issue",
        description: `No valid trader data could be parsed. Please check the CSV format: ensure it has ${EXPECTED_COLUMN_COUNT} columns in the specified order (comma-separated), commas within fields are double-quoted (e.g., "123, Main St"), and 'Name' (column 1) is present. A header row is skipped if "Name" (case-insensitive) is detected in the first cell.`,
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
          variant: "default", 
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
        clearFile(); 
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
            Upload a CSV file. Each row should represent one trader and contain {EXPECTED_COLUMN_COUNT} columns in the following order:
            <br/>1. Name, 2. Total Sales, 3. Status, 4. Last Activity (e.g., yyyy-MM-dd or MM/dd/yyyy), 5. Description, 6. Reviews (trades made), 7. Rating, 8. Website, 9. Phone, 10. Owner Name, 11. Main Category, 12. Categories, 13. Workday Timing, 14. Address, 15. Link (Owner Profile Link), 16. Actions (this column's data will be ignored).
            <br/>Ensure the file is comma-separated. 'Name' (column 1) must be present in data rows. Commas within fields must be enclosed in double quotes (e.g., "123, Main St"). The system will attempt to skip a header row if "Name" (case-insensitive) is detected in the first cell of the first line. Invalid dates for 'Last Activity' will be defaulted to the current date by the system.
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

