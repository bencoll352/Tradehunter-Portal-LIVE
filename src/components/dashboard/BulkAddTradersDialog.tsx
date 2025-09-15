
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
import type { BaseBranchId, ParsedTraderData, Trader, TraderStatus } from "@/types";
import { UploadCloud, Loader2, FileText, XCircle, AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";

interface BulkAddTradersDialogProps {
  branchId: BaseBranchId;
  onBulkAddTraders: (traders: ParsedTraderData[]) => Promise<{ data: Trader[] | null; error: string | null; }>;
}

const MAX_UPLOAD_LIMIT = 1000;

// A more robust CSV line parser that handles commas within quoted fields.
const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let currentVal = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            // If we're in quotes and the next char is also a quote, it's an escaped quote
            if (inQuotes && i < line.length - 1 && line[i + 1] === '"') {
                currentVal += '"';
                i++; // Skip the next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(currentVal.trim());
            currentVal = '';
        } else {
            currentVal += char;
        }
    }
    result.push(currentVal.trim());
    
    // Clean up surrounding quotes from non-quoted values that weren't part of a quoted field
    return result.map(val => {
        if (val.startsWith('"') && val.endsWith('"')) {
            // This handles cases where the whole value is quoted, e.g., "123, Main St"
            return val.slice(1, -1).replace(/""/g, '"');
        }
        return val;
    });
};


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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setSelectedFile(file);
      } else {
        toast({ variant: "destructive", title: "Invalid File Type", description: "Please upload a CSV file (.csv)." });
        if(fileInputRef.current) fileInputRef.current.value = "";
        setSelectedFile(null);
      }
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const parseAndValidateData = (csvText: string): ParsedTraderData[] => {
    const lines = csvText.trim().replace(/\r\n/g, '\n').split('\n');
    if (lines.length < 1) {
        throw new Error("CSV file is empty or invalid.");
    }
    
    const rawHeaders = parseCsvLine(lines[0]);
    const lowerCaseValidHeaders = rawHeaders.filter(Boolean).map(h => h.trim().toLowerCase());

    const headerMapping: { [key: string]: keyof ParsedTraderData } = {
        'name': 'name',
        'description': 'description',
        'reviews': 'reviews',
        'rating': 'rating',
        'website': 'website',
        'phone': 'phone',
        'owner name': 'ownerName',
        'owner profile': 'ownerProfileLink',
        'main category': 'mainCategory',
        'categories': 'categories',
        'workday timing': 'workdayTiming',
        'temporarily closed on': 'temporarilyClosedOn',
        'address': 'address',
        'total assets': 'totalAssets',
        'estimated annual revenue': 'estimatedAnnualRevenue',
        'estimated company value': 'estimatedCompanyValue',
        'employee count': 'employeeCount',
    };

    if (!lowerCaseValidHeaders.includes('name')) {
        throw new Error(`CSV is missing the required "Name" header.`);
    }

    const traders: ParsedTraderData[] = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue; // Skip empty lines

        const data = parseCsvLine(lines[i]);
        const rowObject: any = {};
        
        lowerCaseValidHeaders.forEach((header, index) => {
            const mappedKey = headerMapping[header];
            if (mappedKey) {
                rowObject[mappedKey] = data[index] ?? '';
            }
        });

        if (!rowObject.name) continue; // Skip rows without a name

        traders.push({
          name: rowObject.name,
          status: rowObject.status,
          lastActivity: rowObject.lastActivity,
          description: rowObject.description,
          reviews: safeParseInt(rowObject.reviews),
          rating: safeParseFloat(rowObject.rating),
          website: rowObject.website,
          phone: String(rowObject.phone || ''),
          ownerName: rowObject.ownerName,
          mainCategory: rowObject.mainCategory,
          categories: rowObject.categories,
          workdayTiming: rowObject.workdayTiming,
          temporarilyClosedOn: rowObject.temporarilyClosedOn,
          address: rowObject.address,
          ownerProfileLink: rowObject.ownerProfileLink,
          notes: rowObject.notes,
          totalAssets: safeParseFloat(rowObject.totalAssets),
          estimatedAnnualRevenue: safeParseFloat(rowObject.estimatedAnnualRevenue),
          estimatedCompanyValue: safeParseFloat(rowObject.estimatedCompanyValue),
          employeeCount: safeParseInt(rowObject.employeeCount),
        });
    }

    return traders;
  };


  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({ variant: "destructive", title: "Error", description: "Please select a CSV file." });
      return;
    }
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const csvText = e.target?.result as string;
            const validTraders = parseAndValidateData(csvText);

            if (validTraders.length === 0) {
              toast({
                variant: "destructive",
                title: "Bulk Upload Failed",
                description: "Could not parse any valid traders from the file. Please check the file format and ensure the 'Name' header is present and that rows are not empty.",
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
    reader.onerror = () => {
        toast({ variant: 'destructive', title: 'File Read Error', description: 'Failed to read the selected file.' });
        setIsLoading(false);
    };
    reader.readAsText(selectedFile);
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

    