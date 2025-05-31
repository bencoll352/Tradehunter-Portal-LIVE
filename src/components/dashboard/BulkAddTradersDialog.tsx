
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
import Papa from "papaparse";

interface BulkAddTradersDialogProps {
  branchId: BranchId;
  onBulkAddTraders: (branchId: BranchId, traders: ParsedTraderData[]) => Promise<Trader[] | null>;
}

// Expected headers (case-insensitive matching will be attempted)
const EXPECTED_HEADERS = [
  "Name", "Total Sales", "Status", "Last Activity", "Description", 
  "Reviews", "Rating", "🌐Website", "📞 Phone", "Owner Name", 
  "Main Category", "Categories", "Workday Timing", "Address", "Link", "Actions"
];

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

  const parseNumericValue = (rawValue: string | undefined): number | undefined => {
    if (rawValue === undefined || rawValue === null || String(rawValue).trim() === "" || String(rawValue).trim() === "-") {
      return undefined;
    }
    const cleanedValue = String(rawValue).replace(/[^0-9.-]+/g, ""); // Allow negative sign and decimal
    if (cleanedValue === "") return undefined;
    const parsed = parseFloat(cleanedValue);
    return isNaN(parsed) ? undefined : parsed;
  };
  
  const parseIntValue = (rawValue: string | undefined): number | undefined => {
    if (rawValue === undefined || rawValue === null || String(rawValue).trim() === "" || String(rawValue).trim() === "-") {
      return undefined;
    }
    const cleanedValue = String(rawValue).replace(/[^0-9-]+/g, ""); // Allow negative sign
    if (cleanedValue === "") return undefined;
    const parsed = parseInt(cleanedValue, 10);
    return isNaN(parsed) ? undefined : parsed;
  };

  const parseDateString = (dateStr: string | undefined, traderNameForWarning: string): string | undefined => {
    if (!dateStr || String(dateStr).trim() === "" || String(dateStr).trim() === "-") {
      return undefined;
    }
    const val = String(dateStr).trim();
    let date: Date | null = null;

    const formatsToTry = [
      /^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/, // DD/MM/YYYY or DD.MM.YYYY or DD-MM-YYYY
      /^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2})$/,  // DD/MM/YY or DD.MM.YY or DD-MM-YY
    ];

    for (const regex of formatsToTry) {
      const parts = val.match(regex);
      if (parts) {
        const day = parseInt(parts[1], 10);
        const month = parseInt(parts[2], 10) - 1; // JS months are 0-indexed
        let year = parseInt(parts[3], 10);
        if (year < 100) { // Handle YY
          year += (year < 70 ? 2000 : 1900); // Pivoting around 1970/2070
        }
        if (year >= 1900 && year <= 2100 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
          const tempDate = new Date(year, month, day);
          // Check if date is valid (e.g. not Feb 30)
          if (tempDate.getFullYear() === year && tempDate.getMonth() === month && tempDate.getDate() === day) {
             date = tempDate;
             break;
          }
        }
      }
    }
    
    if (!date) { // Fallback to direct parsing if specific formats fail
        try {
            const parsedFallback = new Date(val);
            if (!isNaN(parsedFallback.getTime())) {
                date = parsedFallback;
            }
        } catch (e) { /* ignore */ }
    }

    if (date && !isNaN(date.getTime())) {
      return date.toISOString();
    } else {
      console.warn(`Invalid date format for Last Activity: "${val}" for trader "${traderNameForWarning}". System will default it.`);
      return undefined;
    }
  };

  // Helper to get value from parsed row, attempting case-insensitive and trimmed header matching
  const getRowValue = (row: any, headerVariations: string[]): string | undefined => {
    for (const variation of headerVariations) {
      const keys = Object.keys(row);
      const foundKey = keys.find(key => key.trim().toLowerCase() === variation.trim().toLowerCase());
      if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
        return String(row[foundKey]).trim();
      }
    }
    return undefined;
  };


  const parseCsvData = (csvString: string | null): ParsedTraderData[] => {
    if (!csvString) return [];
    
    const traders: ParsedTraderData[] = [];
    
    const parseResults = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: header => header.trim(), // Trim whitespace from headers
    });

    if (parseResults.errors.length > 0) {
      parseResults.errors.forEach(err => console.warn("PapaParse Error:", err));
      toast({
        variant: "destructive",
        title: "CSV Parsing Error",
        description: `Problem parsing CSV structure: ${parseResults.errors[0].message}. Please check file.`,
        duration: 7000,
      });
      // Return empty if structural errors occur, or try to process data if it's partial
      // For now, let's be strict on structural errors
      if (parseResults.errors.some(e => e.type === 'Quotes')) return []; 
    }
    
    const actualHeaders = parseResults.meta.fields;
    if (!actualHeaders || actualHeaders.length === 0) {
        console.warn("No headers found in CSV by PapaParse.");
        return [];
    }
    
    // Check for presence of at least 'Name' header
    const hasNameHeader = actualHeaders.some(h => h.trim().toLowerCase() === "name");
    if (!hasNameHeader) {
      toast({
        variant: "destructive",
        title: "Missing 'Name' Header",
        description: "The CSV file must contain a 'Name' header column.",
        duration: 7000,
      });
      return [];
    }

    for (const row of parseResults.data as any[]) {
      const name = getRowValue(row, ["Name"]);
      if (!name) {
        // console.warn(`Skipping row due to missing or empty name:`, row);
        continue; 
      }
      
      let statusValue = getRowValue(row, ["Status"])?.toLowerCase();
      let parsedStatus : 'Active' | 'Inactive' | undefined = undefined;
      if (statusValue === 'active') {
        parsedStatus = 'Active';
      } else if (statusValue === 'inactive') {
        parsedStatus = 'Inactive';
      } else if (statusValue) {
        console.warn(`Invalid status "${statusValue}" for trader "${name}". Defaulting to Active.`);
      }

      const lastActivityValue = parseDateString(getRowValue(row, ["Last Activity"]), name);

      const trader: ParsedTraderData = {
        name: name,
        totalSales: parseNumericValue(getRowValue(row, ["Total Sales"])),
        status: parsedStatus,
        lastActivity: lastActivityValue,
        description: getRowValue(row, ["Description"]) || undefined,
        tradesMade: parseIntValue(getRowValue(row, ["Reviews"])), // Mapped from "Reviews"
        rating: parseNumericValue(getRowValue(row, ["Rating"])),
        website: getRowValue(row, ["🌐Website", "Website"]) || undefined,
        phone: getRowValue(row, ["📞 Phone", "Phone"]) || undefined,
        ownerName: getRowValue(row, ["Owner Name"]) || undefined,
        mainCategory: getRowValue(row, ["Main Category"]) || undefined,
        categories: getRowValue(row, ["Categories"]) || undefined,
        workdayTiming: getRowValue(row, ["Workday Timing"]) || undefined,
        address: getRowValue(row, ["Address"]) || undefined,
        ownerProfileLink: getRowValue(row, ["Link"]) || undefined, // Mapped from "Link"
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
        title: "No Traders Parsed",
        description: `No valid trader data could be parsed. Please ensure your CSV file has the correct headers (e.g., "Name", "Total Sales", etc.) and that data rows contain a 'Name'. Check browser console (View > Developer > JavaScript Console) for more detailed warnings.`,
        duration: 10000, 
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
          description: `${result.length} trader(s) processed for addition.`,
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
          title: "Process Completed",
          description: "The process completed, but no new traders may have been added if all were invalid, duplicates, or the file contained no valid data.",
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
            Upload a CSV file. The first row should contain headers. Expected headers are:
            <br/><code>{EXPECTED_HEADERS.join(", ")}</code>.
            <br/>The 'Name' header is mandatory. 'Actions' column data will be ignored. The system will attempt to match headers case-insensitively.
            Data parsing is flexible, but ensure essential columns like 'Name' are present and correctly formatted. Check browser console for warnings on specific rows if issues occur.
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
