
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

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({ variant: "destructive", title: "Error", description: "Please select a CSV file." });
      return;
    }
    setIsLoading(true);

    Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        transformHeader: header => header.trim(),
        complete: async (results) => {
            try {
                if (results.errors.length) {
                    console.error("CSV Parsing Errors:", results.errors);
                    const firstError = results.errors[0];
                    throw new Error(`Error on row ${firstError.row}: ${firstError.message}`);
                }

                if (!results.meta.fields || !results.meta.fields.some(h => h.toLowerCase() === 'name')) {
                    throw new Error(`CSV is missing the required "Name" header.`);
                }

                if (results.data.length > MAX_UPLOAD_LIMIT) {
                    throw new Error(`The limit is ${MAX_UPLOAD_LIMIT} traders per upload. Please split the file.`);
                }

                const validTraders = (results.data as any[]).map((row, index) => {
                    if (!row.Name || !row.Name.trim()) {
                        console.warn(`[Bulk Upload] Skipping row ${index + 2} because 'Name' is missing or empty.`);
                        return null;
                    }

                    // Flexible header matching
                    const getVal = (aliases: string[]) => {
                        for (const alias of aliases) {
                            if (row[alias] !== undefined) return row[alias];
                        }
                        return undefined;
                    };
                    
                    return {
                      name: row.Name,
                      status: getVal(['Status']) as TraderStatus || undefined,
                      lastActivity: getVal(['Last Activity', 'lastActivity']),
                      description: getVal(['Description']),
                      reviews: safeParseInt(getVal(['Reviews'])),
                      rating: safeParseFloat(getVal(['Rating'])),
                      website: getVal(['Website']),
                      phone: String(getVal(['Phone']) || ''),
                      ownerName: getVal(['Owner Name', 'Owner']),
                      mainCategory: getVal(['Main Category', 'Category']),
                      categories: getVal(['Categories']),
                      workdayTiming: getVal(['Workday Timing', 'Workday Hours', 'Working Hours', 'Hours', 'WorkdayTiming']),
                      temporarilyClosedOn: getVal(['Temporarily Closed On', 'Closed On']),
                      address: getVal(['Address']),
                      ownerProfileLink: getVal(['Owner Profile Link', 'Owner Profile']),
                      notes: getVal(['Notes']),
                      totalAssets: safeParseFloat(getVal(['Total Assets'])),
                      estimatedAnnualRevenue: safeParseFloat(getVal(['Estimated Annual Revenue', 'Est. Annual Revenue'])),
                      estimatedCompanyValue: safeParseFloat(getVal(['Estimated Company Value', 'Est. Company Value'])),
                      employeeCount: safeParseInt(getVal(['Employee Count', 'Employees'])),
                      callBackDate: getVal(['Call Back Date', 'callBackDate']),
                    };
                }).filter(Boolean) as ParsedTraderData[];


                if (validTraders.length === 0) {
                  throw new Error("Could not parse any valid traders from the file. Please check the file format and ensure the 'Name' header is present and that data rows are not empty.");
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
        },
        error: (error: any) => {
            console.error("PapaParse file read error:", error);
            toast({ variant: 'destructive', title: 'File Read Error', description: `Failed to read the selected file: ${error.message}` });
            setIsLoading(false);
        }
    });
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

    