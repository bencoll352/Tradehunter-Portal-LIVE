
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
import type { BaseBranchId, ParsedTraderData, Trader } from "@/types";
import { UploadCloud, Loader2, FileText, XCircle, AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";
import Papa from "papaparse";

interface BulkAddTradersDialogProps {
  branchId: BaseBranchId;
  onBulkAddTraders: (traders: ParsedTraderData[]) => Promise<{ data: Trader[] | null; error: string | null; }>;
}

const MAX_UPLOAD_LIMIT = 1000;

const safeParseFloat = (val: any): number | null => {
    if (val === null || val === undefined || String(val).trim() === '') return null;
    const num = parseFloat(String(val).replace(/[£,]/g, ''));
    return isNaN(num) ? null : num;
};

const safeParseInt = (val: any): number | null => {
    if (val === null || val === undefined || String(val).trim() === '') return null;
    const num = parseInt(String(val).replace(/,/g, ''), 10);
    return isNaN(num) ? null : num;
};

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
        reader.onload = (e) => setFileContent(e.target?.result as string);
        reader.readAsText(file);
      } else {
        toast({ variant: "destructive", title: "Invalid File Type", description: "Please upload a CSV file (.csv)." });
        if(fileInputRef.current) fileInputRef.current.value = "";
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

  const parseAndValidateData = (): { validTraders: ParsedTraderData[] } => {
    if (!fileContent) return { validTraders: [] };
    
    // Robust header transformation to prevent crash on undefined/null headers.
    const transformHeader = (header: string | undefined | null): string => {
        return (header || "").trim().toLowerCase();
    };

    const parseResults = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: transformHeader,
        quoteChar: '"',
        escapeChar: '"',
    });

    if (parseResults.errors.length) {
      const criticalError = parseResults.errors.find(e => e.code !== 'UndetectableDelimiter' && e.code !== 'TooManyFields' && e.code !== 'TooFewFields');
      if (criticalError) {
        throw new Error(`Parsing error on row ${criticalError.row + 2}: ${criticalError.message}. Please check your file for formatting issues like unclosed quotes.`);
      }
    }
    
    const getRowValue = (row: any, potentialHeaders: string[]): any => {
        const lowerCasePotentialHeaders = potentialHeaders.map(h => (h || "").toLowerCase());
        for (const potentialHeader of lowerCasePotentialHeaders) {
            if (row && typeof row === 'object' && Object.prototype.hasOwnProperty.call(row, potentialHeader)) {
                const value = row[potentialHeader];
                 if (value !== null && value !== undefined && String(value).trim() !== '') {
                    return value;
                }
            }
        }
        return undefined;
    };
    
    const tradersToProcess = (parseResults.data as any[])
      .map((row: any, index: number): ParsedTraderData | null => {
        const rawName = getRowValue(row, ["Name"]);
        const name = rawName ? String(rawName).trim() : null;
        if (!name) return null;
        
        // For debugging: log headers if a specific field is not loading.
        const ownerName = getRowValue(row, ["Owner Name", "Owner"]);
        if (!ownerName && (getRowValue(row, ["Owner Name"]) || getRowValue(row, ["Owner"]))) {
            console.warn(`Row ${index + 2}: 'Owner Name' not found. Detected headers:`, Object.keys(row));
        }

        const mainCategory = getRowValue(row, ["Main Category", "Category"]);
         if (!mainCategory && (getRowValue(row, ["Main Category"]) || getRowValue(row, ["Category"]))) {
            console.warn(`Row ${index + 2}: 'Main Category' not found. Detected headers:`, Object.keys(row));
        }

        const workdayTiming = getRowValue(row, ["Workday Timing", "Workday Hours", "Working Hours", "Hours", "WorkdayTiming"]);
        if (!workdayTiming && (getRowValue(row, ["Workday Timing"]) || getRowValue(row, ["Workday Hours"]) || getRowValue(row, ["Working Hours"]) || getRowValue(row, ["Hours"]) || getRowValue(row, ["WorkdayTiming"]))) {
            console.warn(`Row ${index + 2}: 'Workday Timing' not found. Detected headers:`, Object.keys(row));
        }
        
        return {
          name,
          status: getRowValue(row, ["Status"]),
          lastActivity: getRowValue(row, ["Last Activity"]),
          description: getRowValue(row, ["Description"]),
          reviews: safeParseInt(getRowValue(row, ["Reviews (tradesMade)", "Reviews"])),
          rating: safeParseFloat(getRowValue(row, ["Rating"])),
          website: getRowValue(row, ["Website"]),
          phone: String(getRowValue(row, ["Phone"]) || ''),
          ownerName: ownerName,
          mainCategory: mainCategory,
          categories: getRowValue(row, ["Categories"]),
          workdayTiming: workdayTiming,
          address: getRowValue(row, ["Address"]),
          ownerProfileLink: getRowValue(row, ["Link (ownerProfileLink)", "Link", "Owner Profile"]),
          notes: getRowValue(row, ["Notes", "Review Keywords"]),
          totalAssets: safeParseFloat(getRowValue(row, ["Total Assets"])),
          estimatedAnnualRevenue: safeParseFloat(getRowValue(row, ["Est. Annual Revenue", "Estimated Annual Revenue"])),
          estimatedCompanyValue: safeParseFloat(getRowValue(row, ["Estimated Company Value", "Est. Company Value"])),
          employeeCount: safeParseInt(getRowValue(row, ["Employee Count"])),
        };
      })
      .filter((t): t is ParsedTraderData => t !== null);

    return { validTraders: tradersToProcess };
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({ variant: "destructive", title: "Error", description: "Please select a CSV file." });
      return;
    }
    setIsLoading(true);

    try {
        const { validTraders } = parseAndValidateData();

        if (validTraders.length === 0) {
          toast({
            variant: "destructive",
            title: "Bulk Upload Failed",
            description: "Could not parse any traders from the file. Please check the file format and ensure the 'Name' header is present and that rows are not empty.",
            duration: 8000,
          });
          setIsLoading(false);
          return;
        }

        if (validTraders.length > MAX_UPLOAD_LIMIT) {
          toast({
            variant: "destructive",
            title: "Upload Limit Exceeded",
            description: `The limit is ${MAX_UPLOAD_LIMIT} traders per upload. Please split the file.`,
            duration: 8000,
          });
          setIsLoading(false);
          return;
        }
        
        await onBulkAddTraders(validTraders);
        
        setOpen(false);
        clearFile();

    } catch (error: any) {
        console.error("Client-side error during bulk upload:", error);
        toast({
            variant: "destructive",
            title: "Bulk Upload Failed",
            description: `An unexpected error occurred during file processing: ${error.message}`,
            duration: 10000,
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) clearFile(); }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UploadCloud className="mr-2 h-4 w-4" /> 
          <span className="hidden sm:inline">Bulk Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>To Bulk Add New Traders (CSV)</DialogTitle>
          <DialogDescription asChild>
             <div className="space-y-4 pt-2 text-foreground/90">
                <p>
                    For a successful upload, please ensure the spreadsheet adheres to the specified format. The only required column is 'Name'. The uploader will automatically skip any traders whose phone number is already present in the database or within the same CSV file.
                </p>
                <div className="flex items-start gap-2 text-amber-600 dark:text-amber-500 p-3 bg-amber-500/10 rounded-md border border-amber-500/20">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium">
                        Rows without a 'Name' field will be skipped; this column is mandatory for a record to be valid.
                    </p>
                </div>
                <div className="flex items-start gap-2 text-amber-600 dark:text-amber-500 p-3 bg-amber-500/10 rounded-md border border-amber-500/20">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium">
                        For 'Owner Name', 'Main Category', and 'Workday Timing', ensure headers are exact for successful mapping. Check the 'How To Use' page for a list of valid header aliases.
                    </p>
                </div>
                <div className="flex items-start gap-2 text-amber-600 dark:text-amber-500 p-3 bg-amber-500/10 rounded-md border border-amber-500/20">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium">
                        Fields with commas (e.g., "123 Main St, Anytown") MUST be enclosed in double quotes for correct parsing.
                    </p>
                </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="csv-trader-upload" className="font-semibold">Upload CSV File</Label>
            <div className="relative">
              <Input
                id="csv-trader-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv,text/csv"
                className="w-full h-12 pl-3 pr-10 text-sm border-dashed"
                disabled={isLoading}
              />
               {!selectedFile && <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground text-sm">Choose file or drag it here</span>}
            </div>

            {selectedFile ? (
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <p className="flex items-center gap-1">
                    <FileText className="inline h-3 w-3" />
                    {selectedFile.name} ({ (selectedFile.size / 1024).toFixed(2) } KB)
                </p>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearFile} aria-label="Clear file" disabled={isLoading}>
                  <XCircle className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            ) : (
                 <p className="text-xs text-muted-foreground mt-1">Supported file format: .csv</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isLoading || !selectedFile}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            Upload & Process
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    