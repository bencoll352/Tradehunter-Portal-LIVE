
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
import type { BaseBranchId, ParsedTraderData, Trader } from "@/types"; // Changed BranchId to BaseBranchId
import { UploadCloud, Loader2, FileText, XCircle, AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";
import Papa from "papaparse";
import { normalizePhoneNumber } from "@/lib/utils";

interface BulkAddTradersDialogProps {
  branchId: BaseBranchId; // Changed BranchId to BaseBranchId
  existingTraders: Trader[];
  onBulkAddTraders: (traders: ParsedTraderData[]) => Promise<{ data: Trader[] | null; error: string | null; }>; // Changed BranchId to BaseBranchId
}

const MAX_UPLOAD_LIMIT = 1000;
const VALID_STATUSES_LOWER = ["active", "inactive", "call-back", "new lead"];

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

  const parseNumericValue = (rawValue: string | undefined, fieldName: string, traderNameForWarning: string): number | undefined => {
    if (rawValue === undefined || rawValue === null || String(rawValue).trim() === "" || String(rawValue).trim() === "-") {
      return undefined;
    }
    const cleanedValue = String(rawValue).replace(/[^0-9.-]+/g, "");
    if (cleanedValue === "" || cleanedValue === "." || cleanedValue === "-") {
        console.warn(`[CSV Parsing Debug] Trader "${traderNameForWarning}", field "${fieldName}": Original value "${rawValue}" cleaned to "${cleanedValue}", which is not a valid number. Field will be undefined.`);
        return undefined;
    }
    const parsed = parseFloat(cleanedValue);
    if (isNaN(parsed)) {
        console.warn(`[CSV Parsing Debug] Trader "${traderNameForWarning}", field "${fieldName}": Original value "${rawValue}" cleaned to "${cleanedValue}", which parsed to NaN. Field will be undefined.`);
        return undefined;
    }
    return parsed;
  };

  const parseIntValue = (rawValue: string | undefined, fieldName: string, traderNameForWarning: string): number | undefined => {
     if (rawValue === undefined || rawValue === null || String(rawValue).trim() === "" || String(rawValue).trim() === "-") {
      return undefined;
    }
    const cleanedValue = String(rawValue).replace(/[^0-9-]+/g, "");
    if (cleanedValue === "" || cleanedValue === "-") {
        console.warn(`[CSV Parsing Debug] Trader "${traderNameForWarning}", field "${fieldName}": Original value "${cleanedValue}" cleaned to "${cleanedValue}", which is not a valid integer. Field will be undefined.`);
        return undefined;
    }
    const parsed = parseInt(cleanedValue, 10);
    if (isNaN(parsed)) {
        console.warn(`[CSV Parsing Debug] Trader "${traderNameForWarning}", field "${fieldName}": Original value "${rawValue}" cleaned to "${cleanedValue}", which parsed to NaN for integer. Field will be undefined.`);
        return undefined;
    }
    return isNaN(parsed) ? undefined : parsed;
  };

  const parseDateString = (dateStr: string | undefined, traderNameForWarning: string): string | undefined => {
    if (!dateStr || String(dateStr).trim() === "" || String(dateStr).trim() === "-") {
      return undefined;
    }
    const val = String(dateStr).trim();
    let date: Date | null = null;

    const formatsToTry = [
      /^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/, // dd/MM/yyyy or dd-MM-yyyy or dd.MM.yyyy
      /^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2})$/, // dd/MM/yy or dd-MM-yy or dd.MM.yy
    ];

    for (const regex of formatsToTry) {
      const parts = val.match(regex);
      if (parts) {
        const day = parseInt(parts[1], 10);
        const month = parseInt(parts[2], 10) - 1; // Month is 0-indexed in JS Date
        let year = parseInt(parts[3], 10);
        if (year < 100) { // Handle yy format
          year += (year < 70 ? 2000 : 1900); // Arbitrary cutoff for 20th/21st century
        }
        // Basic validation of date parts
        if (year >= 1900 && year <= 2100 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
          const tempDate = new Date(Date.UTC(year, month, day));
          // Verify that creating the date didn't roll over (e.g., 31st Feb -> 3rd Mar)
          if (tempDate.getUTCFullYear() === year && tempDate.getUTCMonth() === month && tempDate.getUTCDate() === day) {
             date = tempDate;
             break;
          }
        }
      }
    }

    // Fallback attempt if primary formats fail
    if (!date) {
        try {
            const parsedFallback = new Date(val); // Attempt direct parsing
            if (!isNaN(parsedFallback.getTime())) { // Check if it's a valid date object
                // Add a sanity check for year, e.g., to avoid misinterpreting things like "1-2-3" as a valid date in 1903
                if (parsedFallback.getUTCFullYear() > 1900) {
                    date = parsedFallback;
                }
            }
        } catch (e) { /* ignore parsing errors for fallback */ }
    }

    if (date && !isNaN(date.getTime())) {
      return date.toISOString();
    } else {
      console.warn(`[CSV Parsing Debug] Invalid date format for Last Activity: "${val}" for trader "${traderNameForWarning}". System will default it or leave it undefined for the server to handle.`);
      return undefined; // Or handle as an error / default date if required
    }
  };

  const getRowValue = (row: any, headerVariations: string[]): string | undefined => {
    for (const variation of headerVariations) {
      const keys = Object.keys(row);
      // Find a key in the row that matches a variation (case-insensitive, space-trimmed)
      const foundKey = keys.find(key => key.trim().toLowerCase() === variation.trim().toLowerCase());
      if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
        return String(row[foundKey]); // Do not trim here, preserve original whitespace from cell
      }
    }
    return undefined;
  };

  const parseCsvData = (csvString: string | null): { validTraders: ParsedTraderData[], skippedCount: number, duplicatePhonesInCsv: Set<string>, rawParseResults?: Papa.ParseResult<any> } => {
    if (!csvString) return { validTraders: [], skippedCount: 0, duplicatePhonesInCsv: new Set() };

    let tradersToProcess: ParsedTraderData[] = [];

    const parseResults = Papa.parse(csvString, {
      header: true, // Automatically uses the first row as headers
      skipEmptyLines: 'greedy', // Skips lines that are empty or only contain whitespace
      transformHeader: header => header.trim(), // Trim whitespace from headers
    });

    console.log("[CSV Parsing Debug] Detected headers by PapaParse:", parseResults.meta.fields);

    if (parseResults.errors.length > 0) {
      parseResults.errors.forEach(err => console.warn("PapaParse Error:", err));
      toast({
        variant: "destructive",
        title: "CSV Parsing Error",
        description: (
            <div>
              <p>Problem parsing CSV: {parseResults.errors[0].message}.</p>
              <p className="text-xs mt-1">Ensure fields with commas are double-quoted (e.g., "123 Main St, Anytown"). Check console for more details.</p>
            </div>
          ),
        duration: 10000,
      });
      if (parseResults.errors.some(e => e.type === 'Quotes' || e.code === 'TooManyFields' || e.code === 'TooFewFields')) return { validTraders: [], skippedCount: 0, duplicatePhonesInCsv: new Set(), rawParseResults: parseResults };
    }

    const actualHeaders = parseResults.meta.fields;
    if (!actualHeaders || actualHeaders.length === 0) {
        console.warn("No headers found in CSV by PapaParse.");
        toast({
            variant: "destructive",
            title: "CSV Parsing Problem",
            description: "Could not detect any headers in the CSV file. Please ensure it's a valid CSV with a header row.",
            duration: 7000,
        });
        return { validTraders: [], skippedCount: 0, duplicatePhonesInCsv: new Set(), rawParseResults: parseResults };
    }

    const hasNameHeader = actualHeaders.some(h => h.trim().toLowerCase() === "name");
    if (!hasNameHeader) {
      toast({
        variant: "destructive",
        title: "Missing 'Name' Header",
        description: "The CSV file must contain a 'Name' header column (case-insensitive). This is the only mandatory header.",
        duration: 7000,
      });
      return { validTraders: [], skippedCount: 0, duplicatePhonesInCsv: new Set(), rawParseResults: parseResults };
    }

    const commonExpectedHeadersForHeuristicCheck = ["phone", "address", "owner name", "main category", "rating", "website", "notes", "est. annual revenue", "estimated company value", "employee count"];
    const foundCommonHeadersCount = actualHeaders.filter(h =>
        commonExpectedHeadersForHeuristicCheck.includes(h.trim().toLowerCase())
    ).length;

    if (foundCommonHeadersCount < 2 && actualHeaders.length > 1 && actualHeaders.some(h => h.trim().toLowerCase() === "name")) { 
        console.warn(`[CSV Parsing Debug] Few common headers found. Expected some of: ${commonExpectedHeadersForHeuristicCheck.join(', ')}. Detected headers: ${actualHeaders.join(', ')}`);
        toast({
            variant: "default", 
            title: "Unusual CSV Headers Detected",
            description: `The CSV has a 'Name' column, but is missing several other common headers (e.g., Phone, Address, Notes, Est. Annual Revenue, Estimated Company Value, Employee Count). Upload will proceed, but data might be incomplete. Detected headers: ${actualHeaders.slice(0,5).join(', ')}...`,
            duration: 10000,
        });
    }


    for (const row of parseResults.data as any[]) { 
      const name = getRowValue(row, ["Name"])?.trim();
      if (!name) {
        console.warn("[CSV Parsing Debug] Skipping row due to missing 'Name'. Row data:", row);
        continue;
      }

      const statusValueRaw = getRowValue(row, ["Status"])?.trim();
      let parsedStatus : ParsedTraderData['status'] = 'New Lead'; 
      if (statusValueRaw) {
        const statusValueLower = statusValueRaw.toLowerCase();
        if (VALID_STATUSES_LOWER.includes(statusValueLower)) {
            if (statusValueLower === 'active') parsedStatus = 'Active';
            else if (statusValueLower === 'inactive') parsedStatus = 'Inactive';
            else if (statusValueLower === 'call-back') parsedStatus = 'Call-Back';
            else if (statusValueLower === 'new lead') parsedStatus = 'New Lead';
        } else {
            console.warn(`[CSV Parsing Debug] Trader "${name}": Invalid status "${statusValueRaw}". Defaulting to 'New Lead'.`);
        }
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

        if (missingFields.length > 0) { 
            console.warn(
            `[CSV Parsing Debug] For trader "${name}": Could not find data for: [${missingFields.join('; ')}]. ` +
            `This could be due to missing headers or empty cells for these fields in your CSV. ` +
            `Ensure headers match expected variations (case-insensitive, space-trimmed) and that data is present in the cells. ` +
            `Detected headers for this row by the system: ${Object.keys(row).join(', ')}` 
            );
        }
      }

      const trader: ParsedTraderData = {
        name: name,
        status: parsedStatus,
        lastActivity: lastActivityValue,
        description: getRowValue(row, ["Description"]),
        reviews: parseIntValue(getRowValue(row, ["Reviews"]), "Reviews", name),
        rating: parseNumericValue(getRowValue(row, ["Rating"]), "Rating", name),
        website: getRowValue(row, ["🌐Website", "Website"]),
        phone: phoneValue,
        ownerName: ownerNameValue,
        mainCategory: mainCategoryValue,
        categories: getRowValue(row, ["Categories"]),
        workdayTiming: workdayTimingValue,
        address: getRowValue(row, ["Address"]),
        ownerProfileLink: getRowValue(row, ["Link", "Owner Profile"]),
        notes: getRowValue(row, ["Notes"]),
        totalAssets: parseNumericValue(getRowValue(row, ["Total Assets"]), "Total Assets", name),
        estimatedAnnualRevenue: parseNumericValue(getRowValue(row, ["Est. Annual Revenue", "Estimated Annual Revenue", "Annual Revenue"]), "Est. Annual Revenue", name),
        estimatedCompanyValue: parseNumericValue(getRowValue(row, ["Estimated Company Value", "Est. Company Value", "Company Value"]), "Estimated Company Value", name),
        employeeCount: parseIntValue(getRowValue(row, ["Employee Count"]), "Employee Count", name),
      };
      tradersToProcess.push(trader);
    }

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
           console.warn(`[CSV Parsing Debug] Trader "${trader.name}" with phone "${trader.phone}" already exists in the database (based on existing traders passed to dialogue). Skipping.`);
        } else if (processedPhoneNumbersInCsv.has(normalizedPhone)) {
          isDuplicate = true;
          duplicatePhonesInCsv.add(trader.phone || 'N/A'); 
          console.warn(`[CSV Parsing Debug] Trader "${trader.name}" with phone "${trader.phone}" is a duplicate within the CSV file itself. Skipping.`);
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
    return { validTraders, skippedCount, duplicatePhonesInCsv, rawParseResults: parseResults };
  };


  const handleSubmit = async () => {
    if (!selectedFile || !fileContent) {
      toast({ variant: "destructive", title: "Error", description: "Please select a CSV file." });
      return;
    }
    setIsLoading(true);

    const { validTraders, skippedCount, duplicatePhonesInCsv, rawParseResults } = parseCsvData(fileContent);

    if (validTraders.length === 0 && skippedCount === 0 && fileContent.trim() !== "") {
      console.warn(`[CSV Parsing Debug] No valid traders parsed from a non-empty file.
        Raw parsed data length (PapaParse): ${rawParseResults?.data?.length ?? 'N/A'}.
        This could mean rows were present but lacked a 'Name', or failed other validations.
        First few raw data rows (if any):`, rawParseResults?.data?.slice(0,3) ?? "N/A"); 
      toast({
        variant: "destructive",
        title: "No Traders Parsed",
        description: (
            <div>
              <p>No valid trader data could be parsed. Please check the CSV and instructions:</p>
              <ul className="list-disc list-inside text-xs mt-1 space-y-0.5">
                <li><strong>Mandatory 'Name' Header:</strong> Your CSV file MUST have a header row, and one of the headers MUST be 'Name' (case-insensitive). Each trader row must also have data in the 'Name' column.</li>
                <li><strong>Header-Based Parsing:</strong> The system uses header names to find data, not a strict column order or count.</li>
                <li><strong>Check Console:</strong> Open your browser's developer console (F12 then Console tab) for specific parsing warnings (e.g., invalid dates, numbers, detected headers).</li>
                <li><strong>Quoted Fields:</strong> Fields with commas (e.g., in Description, Address, Categories) must be enclosed in double quotes (e.g., "123 Main St, Anytown").</li>
              </ul>
            </div>
          ),
        duration: 20000, 
      });
      setIsLoading(false);
      return;
    }
    if (validTraders.length === 0 && skippedCount === 0 && fileContent.trim() === "") { 
      toast({ variant: "destructive", title: "Empty File", description: "The selected CSV file is empty." });
      setIsLoading(false);
      return;
    }

    if (validTraders.length > MAX_UPLOAD_LIMIT) {
      toast({
        variant: "destructive",
        title: "File Too Large for Single Upload",
        description: `Your CSV contains ${validTraders.length} traders to add, exceeding the recommended limit of ${MAX_UPLOAD_LIMIT} for a single operation. Please split your file into smaller chunks and upload them separately.`,
        duration: 10000,
      });
      setIsLoading(false);
      return;
    }

    let newTradersAddedCount = 0;
    if (validTraders.length > 0) {
      try {
        const result = await onBulkAddTraders(validTraders);

        if (result.error) {
          console.error("Server action failed during bulk add with error message from server:", result.error);
          let toastDescription: React.ReactNode;
          const errorMsgLower = result.error.toLowerCase();

          if (errorMsgLower.includes("permission_denied") || errorMsgLower.includes("could not refresh access token") || errorMsgLower.includes("server authentication error") || errorMsgLower.includes("default credentials") || errorMsgLower.includes("server configuration error")) {
             toastDescription = (
              <div className="text-sm">
                <p>
                 The server could not authenticate with Google's services to save the data. This is often a temporary issue or a problem with the server's permissions.
                </p>
                <p className="mt-2 text-xs font-semibold">
                  Action: Please try the upload again in a few moments. If the problem persists, an administrator may need to check the server's authentication credentials and IAM permissions in the Google Cloud console.
                </p>
              </div>
            );
            toast({
              variant: "destructive",
              title: "Server Authentication Error",
              description: toastDescription,
              duration: 20000,
            });
          } else {
             toast({
              variant: "destructive",
              title: "Bulk Upload Failed on Server",
              description: result.error,
              duration: 15000,
            });
          }
          setIsLoading(false);
          return;
        }

        if (result.data) {
          newTradersAddedCount = result.data.length;
        }
      } catch (error) {
        const clientErrorMessage = error instanceof Error ? error.message : "Unknown client error";
        console.error("Unexpected client error during bulk add traders operation:", error);
        toast({
          variant: "destructive",
          title: "Client Upload Error",
          description: `An unexpected client-side error occurred: ${clientErrorMessage}. Check console.`,
        });
        setIsLoading(false);
        return;
      }
    }

    let summaryMessages: string[] = [];
    if (newTradersAddedCount > 0) {
      summaryMessages.push(`${newTradersAddedCount} new trader(s) successfully added.`);
    } else if (validTraders.length > 0 && newTradersAddedCount === 0) {
      summaryMessages.push(`No new traders were added by the server. This could be due to all of them already existing (if server performs its own duplicate checks beyond what the client knows), or another server-side issue. Check server logs.`);
    }

    if (skippedCount > 0) {
      summaryMessages.push(`${skippedCount} trader(s) were skipped by the client as duplicates (already in current view or within CSV).`);
      if (duplicatePhonesInCsv.size > 0) {
         summaryMessages.push(`Duplicate phone(s) found within the CSV file: ${Array.from(duplicatePhonesInCsv).slice(0,3).join(', ')}${duplicatePhonesInCsv.size > 3 ? '...' : '' }.`);
      }
       summaryMessages.push("Check browser console for more details on client-skipped traders.");
    }

    if (summaryMessages.length > 0) {
        toast({
            title: newTradersAddedCount > 0 ? "Bulk Upload Processed" : "Bulk Upload Notice",
            description: (
            <div className="flex flex-col gap-1 text-sm">
                {summaryMessages.map((msg, idx) => <span key={idx}>{msg}</span>)}
            </div>
            ),
            duration: newTradersAddedCount > 0 && skippedCount === 0 ? 5000 : 10000,
        });
    } else if (validTraders.length === 0 && skippedCount === 0) {
        toast({
            title: "No Action Taken",
            description: "No new traders to add and no duplicates found to skip by the client. The file might have been empty or contained no processable data according to client-side parsing.",
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
          <DialogDescription className="space-y-2 pt-2">
            <p>
              Upload a CSV file. The system uses header names for data mapping so column order doesn&apos;t matter. The &apos;Name&apos; header is MANDATORY.
            </p>
            <p className="text-xs text-muted-foreground">
             Recommended headers: Name, Phone, Address, Owner Name, Main Category, Notes, Est. Annual Revenue, Estimated Company Value, Employee Count.
            </p>
            <div className="flex items-start gap-2 text-amber-600 dark:text-amber-500">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="text-xs">
                    Fields containing commas (e.g. &quot;123 Main St, Anytown&quot;) MUST be enclosed in double quotes.
                </p>
            </div>
             <div className="flex items-start gap-2 text-amber-600 dark:text-amber-500">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="text-xs">
                    Rows with a phone number that already exists in the database for this branch will be skipped.
                </p>
            </div>
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
          <Button onClick={handleSubmit} disabled={isLoading || !selectedFile}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            Upload Traders
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
