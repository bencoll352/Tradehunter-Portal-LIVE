
"use client";

import { useState, useRef, useCallback } from "react";
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
import type { BaseBranchId, ParsedTraderData, Trader, TraderStatus } from "@/types";
import { UploadCloud, Loader2, FileText, XCircle, AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";

interface BulkAddTradersDialogProps {
  branchId: BaseBranchId;
  onBulkAdd: (traders: ParsedTraderData[]) => Promise<{ data: Trader[] | null; error: string | null; }>;
}

const MAX_UPLOAD_LIMIT = 1000;

// Header mapping based on the proven working example provided by the user.
const HEADER_MAP: Record<string, keyof Omit<Trader, 'id' | 'lastActivity' | 'status' | 'notes'>> = {
    'Name': 'name',
    'Description': 'description',
    'Reviews': 'reviews',
    'Rating': 'rating',
    'Website': 'website',
    'Phone': 'phone',
    'Owner Name': 'ownerName',
    'Main Category': 'mainCategory',
    'Categories': 'categories',
    'Address': 'address',
    'Estimated Company Value': 'estimatedCompanyValue',
    'Estimated Annual Revenue': 'estimatedAnnualRevenue',
    'Employee Count': 'employeeCount',
};

// Robust CSV row parser from the proven working example provided by the user.
const parseCsvRow = (row: string): string[] => {
    const result: string[] = [];
    let currentField = '';
    let inQuotedField = false;

    for (let i = 0; i < row.length; i++) {
        const char = row[i];

        if (char === '"') {
            if (inQuotedField && row[i + 1] === '"') {
                currentField += '"';
                i++; // Skip the second quote in a pair
            } else {
                inQuotedField = !inQuotedField;
            }
        } else if (char === ',' && !inQuotedField) {
            result.push(currentField);
            currentField = '';
        } else {
            currentField += char;
        }
    }
    result.push(currentField);
    return result.map(field => field.trim());
};


export function BulkAddTradersDialog({ branchId, onBulkAdd }: BulkAddTradersDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setIsLoading(false);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setSelectedFile(file);
      } else {
        toast({ variant: "destructive", title: "Invalid File Type", description: "Please upload a CSV file (.csv)." });
        resetState();
      }
    }
  };

  const parseAndValidateData = (fileContent: string): { validTraders: ParsedTraderData[], errors: string[] } => {
    const lines = fileContent.split(/\r\n|\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) {
        throw new Error('CSV file must have a header row and at least one data row.');
    }
    
    const headerRow = parseCsvRow(lines[0]);
    
    // Create a flexible header map that handles trimmed and lowercased headers
    const headerIndexMap: { [key in keyof ParsedTraderData]?: number } = {};
    const lowercasedHeaderRow = headerRow.map(h => h.toLowerCase().trim());
    
    Object.entries(HEADER_MAP).forEach(([csvHeader, traderKey]) => {
        const lowerCsvHeader = csvHeader.toLowerCase();
        const index = lowercasedHeaderRow.findIndex(h => h === lowerCsvHeader);
        if (index !== -1) {
            headerIndexMap[traderKey as keyof ParsedTraderData] = index;
        }
    });

    if (headerIndexMap.name === undefined) {
        throw new Error("CSV must contain a 'Name' column.");
    }
    
    const newTraders: ParsedTraderData[] = [];
    const currentErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCsvRow(lines[i]);
        if (values.every(v => v === '')) continue; // Skip empty rows

        const rowData: Partial<ParsedTraderData> = {};

        Object.entries(headerIndexMap).forEach(([key, index]) => {
            if (index !== undefined) {
                 (rowData as any)[key] = values[index] || undefined;
            }
        });

        if (!rowData.name) {
            currentErrors.push(`Row ${i + 1}: Missing required field 'Name'.`);
            continue;
        }
        
        // Coerce numbers, providing undefined if they fail to parse, which aligns with ParsedTraderData
        rowData.reviews = rowData.reviews ? parseInt(String(rowData.reviews), 10) : undefined;
        rowData.rating = rowData.rating ? parseFloat(String(rowData.rating)) : undefined;
        rowData.employeeCount = rowData.employeeCount ? parseInt(String(rowData.employeeCount), 10) : undefined;
        rowData.estimatedAnnualRevenue = rowData.estimatedAnnualRevenue ? parseFloat(String(rowData.estimatedAnnualRevenue)) : undefined;
        rowData.estimatedCompanyValue = rowData.estimatedCompanyValue ? parseFloat(String(rowData.estimatedCompanyValue)) : undefined;
        
        newTraders.push(rowData as ParsedTraderData);
    }
    return { validTraders: newTraders, errors: currentErrors };
  }


  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({ variant: "destructive", title: "Error", description: "Please select a CSV file." });
      return;
    }
    setIsLoading(true);

    try {
        const fileContent = await selectedFile.text();
        const { validTraders, errors } = parseAndValidateData(fileContent);

        if (errors.length > 0) {
            toast({
                variant: "destructive",
                title: "Validation Errors",
                description: `${errors.length} error(s) found. The first is: ${errors[0]}`,
                duration: 8000,
            });
        }
        
        if (validTraders.length === 0) {
          toast({
            variant: "destructive",
            title: "Bulk Upload Failed",
            description: "Could not parse any valid traders from the file. Please check the file format and ensure the 'Name' header is present.",
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
        
        const result = await onBulkAdd(validTraders);
        
        if (result.error) {
            toast({
                variant: "destructive",
                title: "Bulk Upload Failed",
                description: `${result.error}`,
                duration: 10000,
            });
        } else {
             const newCount = result.data?.length || 0;
             const skippedCount = validTraders.length - newCount;
             let summaryMessages = [];
             if (newCount > 0) summaryMessages.push(`${newCount} new trader(s) added successfully.`);
             if (skippedCount > 0) summaryMessages.push(`${skippedCount} trader(s) were skipped as duplicates (phone number already exists).`);
             if (errors.length > 0) summaryMessages.push(`${errors.length} row(s) in the file had errors and were skipped.`);
             if (summaryMessages.length === 0) summaryMessages.push("No new traders were added. This may be because they all already exist or had errors.");

             toast({
                title: "Bulk Upload Processed",
                description: <div className="flex flex-col gap-1">{summaryMessages.map((msg, i) => <span key={i}>{msg}</span>)}</div>,
                duration: 10000,
            });
            setOpen(false);
            resetState();
        }
    } catch (error: any) {
        console.error("Client-side error during bulk upload:", error);
        toast({
            variant: "destructive",
            title: "Bulk Upload Failed",
            description: `An unexpected error occurred: ${String(error.message || error)}`,
            duration: 10000,
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetState(); }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UploadCloud className="mr-2 h-4 w-4" /> 
          <span className="hidden sm:inline">Bulk Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Add New Traders (CSV)</DialogTitle>
          <DialogDescription asChild>
             <div className="space-y-4 pt-2 text-foreground/90">
                <p>
                    Upload a CSV file to add multiple traders. The only required column is 'Name'. The uploader will automatically skip any traders whose phone number already exists.
                </p>
                <div className="flex items-start gap-2 text-amber-600 dark:text-amber-500 p-3 bg-amber-500/10 rounded-md border border-amber-500/20">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium">
                        CSV headers must match the expected format (e.g., 'Name', 'Owner Name'). Header matching is case-insensitive.
                    </p>
                </div>
                 <div className="flex items-start gap-2 text-amber-600 dark:text-amber-500 p-3 bg-amber-500/10 rounded-md border border-amber-500/20">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium">
                        Fields containing commas (e.g., "123 Main St, Anytown") MUST be enclosed in double quotes for correct parsing.
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
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={resetState} aria-label="Clear file" disabled={isLoading}>
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

    