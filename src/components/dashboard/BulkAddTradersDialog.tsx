
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
import { UploadCloud, Loader2, FileText, XCircle, AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";
import Papa from "papaparse";
import { normalizePhoneNumber } from "@/lib/utils";

interface BulkAddTradersDialogProps {
  branchId: BranchId;
  existingTraders: Trader[]; // All traders in the current branch
  onBulkAddTraders: (branchId: BranchId, traders: ParsedTraderData[]) => Promise<Trader[] | null>;
}

const EXPECTED_HEADERS = [
  "Name", "Total Sales", "Status", "Last Activity", "Description", 
  "Reviews", "Rating", "🌐Website", "📞 Phone", "Owner Name", 
  "Main Category", "Categories", "Workday Timing", "Address", "Link", "Actions"
];

export function BulkAddTradersDialog({ branchId, existingTraders, onBulkAddTraders }: BulkAddTradersDialogProps) {
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
    const cleanedValue = String(rawValue).replace(/[^0-9.-]+/g, "");
    if (cleanedValue === "") return undefined;
    const parsed = parseFloat(cleanedValue);
    return isNaN(parsed) ? undefined : parsed;
  };
  
  const parseIntValue = (rawValue: string | undefined): number | undefined => {
     if (rawValue === undefined || rawValue === null || String(rawValue).trim() === "" || String(rawValue).trim() === "-") {
      return undefined;
    }
    const cleanedValue = String(rawValue).replace(/[^0-9-]+/g, "");
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
      /^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/, 
      /^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2})$/,  
    ];

    for (const regex of formatsToTry) {
      const parts = val.match(regex);
      if (parts) {
        const day = parseInt(parts[1], 10);
        const month = parseInt(parts[2], 10) - 1; 
        let year = parseInt(parts[3], 10);
        if (year < 100) { 
          year += (year < 70 ? 2000 : 1900); 
        }
        if (year >= 1900 && year <= 2100 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
          const tempDate = new Date(year, month, day);
          if (tempDate.getFullYear() === year && tempDate.getMonth() === month && tempDate.getDate() === day) {
             date = tempDate;
             break;
          }
        }
      }
    }
    
    if (!date) { 
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

  const parseCsvData = (csvString: string | null): { validTraders: ParsedTraderData[], skippedCount: number, duplicatePhonesInCsv: Set<string> } => {
    if (!csvString) return { validTraders: [], skippedCount: 0, duplicatePhonesInCsv: new Set() };
    
    let tradersToProcess: ParsedTraderData[] = [];
    
    const parseResults = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: header => header.trim(),
    });

    if (parseResults.errors.length > 0) {
      parseResults.errors.forEach(err => console.warn("PapaParse Error:", err));
      toast({
        variant: "destructive",
        title: "CSV Parsing Error",
        description: `Problem parsing CSV: ${parseResults.errors[0].message}. Please ensure fields with commas are double-quoted.`,
        duration: 10000,
      });
      if (parseResults.errors.some(e => e.type === 'Quotes' || e.code === 'TooManyFields' || e.code === 'TooFewFields')) return { validTraders: [], skippedCount: 0, duplicatePhonesInCsv: new Set() };
    }
    
    const actualHeaders = parseResults.meta.fields;
    if (!actualHeaders || actualHeaders.length === 0) {
        console.warn("No headers found in CSV by PapaParse.");
        return { validTraders: [], skippedCount: 0, duplicatePhonesInCsv: new Set() };
    }
    
    const hasNameHeader = actualHeaders.some(h => h.trim().toLowerCase() === "name");
    if (!hasNameHeader) {
      toast({
        variant: "destructive",
        title: "Missing 'Name' Header",
        description: "The CSV file must contain a 'Name' header column.",
        duration: 7000,
      });
      return { validTraders: [], skippedCount: 0, duplicatePhonesInCsv: new Set() };
    }

    for (const row of parseResults.data as any[]) {
      const name = getRowValue(row, ["Name"]);
      if (!name) {
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
      const phoneValue = getRowValue(row, ["📞 Phone", "Phone"]);
      
      const ownerNameValue = getRowValue(row, ["Owner Name", "Owner"]);
      const mainCategoryValue = getRowValue(row, ["Main Category", "Category"]);
      const workdayTimingValue = getRowValue(row, ["Workday Timing", "Workday Hours", "Working Hours", "Hours", "WorkdayTiming"]);

      if (!ownerNameValue && name || !mainCategoryValue && name || !workdayTimingValue && name) {
        const missingFields = [];
        if (!ownerNameValue) missingFields.push("Owner Name (expected 'Owner Name' or 'Owner')");
        if (!mainCategoryValue) missingFields.push("Main Category (expected 'Main Category' or 'Category')");
        if (!workdayTimingValue) missingFields.push("Workday Timing (expected 'Workday Timing', 'Workday Hours', 'Working Hours', 'Hours', or 'WorkdayTiming')");
        
        console.warn(
          `[CSV Parsing Debug] For trader "${name}": Could not find data for: [${missingFields.join('; ')}]. ` +
          `This could be due to missing headers or empty cells for these fields in your CSV. ` +
          `Ensure headers match expected variations (case-insensitive, space-trimmed) and that data is present in the cells. ` +
          `Detected headers for this row by the system: ${Object.keys(row).join(', ')}`
        );
      }

      const trader: ParsedTraderData = {
        name: name,
        totalSales: parseNumericValue(getRowValue(row, ["Total Sales"])),
        status: parsedStatus,
        lastActivity: lastActivityValue,
        description: getRowValue(row, ["Description"]) || undefined,
        tradesMade: parseIntValue(getRowValue(row, ["Reviews"])),
        rating: parseNumericValue(getRowValue(row, ["Rating"])),
        website: getRowValue(row, ["🌐Website", "Website"]) || undefined,
        phone: phoneValue || undefined,
        ownerName: ownerNameValue || undefined,
        mainCategory: mainCategoryValue || undefined,
        categories: getRowValue(row, ["Categories"]) || undefined,
        workdayTiming: workdayTimingValue || undefined,
        address: getRowValue(row, ["Address"]) || undefined,
        ownerProfileLink: getRowValue(row, ["Link"]) || undefined,
      };
      tradersToProcess.push(trader);
    }

    // Duplicate checking
    const validTraders: ParsedTraderData[] = [];
    const processedPhoneNumbersInCsv = new Set<string>();
    const duplicatePhonesInCsv = new Set<string>();
    let skippedCount = 0;

    const existingNormalizedPhones = new Set(
      existingTraders.map(t => normalizePhoneNumber(t.phone))
    );

    for (const trader of tradersToProcess) {
      const normalizedPhone = normalizePhoneNumber(trader.phone);
      let isDuplicate = false;

      if (normalizedPhone) {
        if (existingNormalizedPhones.has(normalizedPhone)) {
          isDuplicate = true; 
           console.warn(`Trader "${trader.name}" with phone "${trader.phone}" already exists in the database. Skipping.`);
        } else if (processedPhoneNumbersInCsv.has(normalizedPhone)) {
          isDuplicate = true; 
          duplicatePhonesInCsv.add(trader.phone || 'N/A');
          console.warn(`Trader "${trader.name}" with phone "${trader.phone}" is a duplicate within the CSV. Skipping.`);
        }
      }

      if (isDuplicate) {
        skippedCount++;
      } else {
        validTraders.push(trader);
        if (normalizedPhone) {
          processedPhoneNumbersInCsv.add(normalizedPhone);
        }
      }
    }
    return { validTraders, skippedCount, duplicatePhonesInCsv };
  };

  const handleSubmit = async () => {
    if (!selectedFile || !fileContent) {
      toast({ variant: "destructive", title: "Error", description: "Please select a CSV file." });
      return;
    }
    setIsLoading(true);

    const { validTraders, skippedCount, duplicatePhonesInCsv } = parseCsvData(fileContent);

    if (validTraders.length === 0 && skippedCount === 0 && fileContent.trim() !== "") { 
      toast({
        variant: "destructive",
        title: "No Traders Parsed",
        description: `No valid trader data found. Ensure CSV has correct headers (e.g., "Name") and data. Check browser console for warnings. Remember to double-quote fields containing commas (e.g., in "Description" or "Address" or "Categories").`,
        duration: 10000, 
      });
      setIsLoading(false);
      return;
    }
    if (validTraders.length === 0 && skippedCount === 0 && fileContent.trim() === "") {
      toast({ variant: "destructive", title: "Empty File", description: "The selected CSV file is empty." });
      setIsLoading(false);
      return;
    }

    let newTradersAddedCount = 0;
    if (validTraders.length > 0) {
      try {
        const result = await onBulkAddTraders(branchId, validTraders);
        if (result) {
          newTradersAddedCount = result.length;
        } else {
           throw new Error("Server action returned null for bulk add.");
        }
      } catch (error) {
        console.error("Failed to bulk add traders:", error);
        toast({
          variant: "destructive",
          title: "Upload Error",
          description: `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
        setIsLoading(false);
        return;
      }
    }
    
    let summaryMessages: string[] = [];
    if (newTradersAddedCount > 0) {
      summaryMessages.push(`${newTradersAddedCount} new trader(s) successfully added.`);
    }
    if (skippedCount > 0) {
      summaryMessages.push(`${skippedCount} trader(s) were skipped as duplicates (already in system or within CSV).`);
      if (duplicatePhonesInCsv.size > 0) {
         summaryMessages.push(`Duplicate phone(s) within CSV: ${Array.from(duplicatePhonesInCsv).slice(0,3).join(', ')}${duplicatePhonesInCsv.size > 3 ? '...' : '' }.`);
      }
       summaryMessages.push("Check console for more details on skipped traders.");
    }

    if (summaryMessages.length > 0) {
        toast({
            title: newTradersAddedCount > 0 ? "Bulk Upload Processed" : "Bulk Upload Notice",
            description: (
            <div className="flex flex-col gap-1">
                {summaryMessages.map((msg, idx) => <span key={idx}>{msg}</span>)}
            </div>
            ),
            duration: newTradersAddedCount > 0 && skippedCount === 0 ? 5000 : 10000, 
        });
    } else if (validTraders.length === 0 && skippedCount === 0) {
        toast({
            title: "No Action Taken",
            description: "No new traders to add and no duplicates found to skip. The file might have been empty or contained no processable data.",
            variant: "default"
        });
    }

    setOpen(false);
    clearFile();
    setIsLoading(false);
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
            Upload a CSV file. The first row should contain headers. Expected headers are approximately:
            <br/><code>{EXPECTED_HEADERS.join(", ")}</code>.
            <br/>The 'Name' header is mandatory. 'Actions' column data will be ignored.
            The system matches headers case-insensitively and ignores leading/trailing spaces. 
            <br/><AlertTriangle className="inline h-4 w-4 mr-1 text-amber-500" /> Fields containing commas (e.g., in Descriptions, Categories, or Addresses) MUST be enclosed in double quotes in your CSV file (e.g., "Main St, Suite 100").
            <br/><strong>If fields like 'Owner Name', 'Main Category', or 'Workday Timing' are not loading:</strong>
            <ol className="list-decimal list-inside pl-4 text-xs">
              <li>Double-check the exact spelling of these headers in your <strong>raw CSV file</strong> (not just how they appear in Excel or other spreadsheet software).</li>
              <li>After an upload attempt, open your browser's developer console (usually by right-clicking on the page, selecting 'Inspect' or 'Inspect Element', then finding the 'Console' tab). Look for messages starting with "[CSV Parsing Debug]". These messages will show the headers the system actually detected for problematic rows, which you can compare against your CSV.</li>
              <li>Ensure the data cells for these columns are not empty in your CSV.</li>
            </ol>
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

