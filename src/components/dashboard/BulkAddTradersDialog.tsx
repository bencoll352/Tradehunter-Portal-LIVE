
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

const HEADER_MAP: Record<string, keyof Omit<Trader, 'id'>> = {
    'Name': 'name',
    'Status': 'status',
    'Last Activity': 'lastActivity',
    'Description': 'description',
    'Reviews': 'reviews',
    'Rating': 'rating',
    'Website': 'website',
    'Phone': 'phone',
    'Owner Name': 'ownerName',
    'Main Category': 'mainCategory',
    'Categories': 'categories',
    'Workday Timing': 'workdayTiming',
    'Temporarily Closed On': 'temporarilyClosedOn',
    'Address': 'address',
    'Owner Profile Link': 'ownerProfileLink',
    'Notes': 'notes',
    'Call Back Date': 'callBackDate',
    'Total Assets': 'totalAssets',
    'Estimated Annual Revenue': 'estimatedAnnualRevenue',
    'Estimated Company Value': 'estimatedCompanyValue',
    'Employee Count': 'employeeCount',
};

const parseCsvRow = (row: string): string[] => {
    const result: string[] = [];
    let currentField = '';
    let inQuotedField = false;

    for (let i = 0; i < row.length; i++) {
        const char = row[i];

        if (char === '"') {
            if (inQuotedField && row[i + 1] === '"') {
                currentField += '"';
                i++;
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
    return result.map(f => f.trim());
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
  
    const parseAndValidateData = (file: File): Promise<ParsedTraderData[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;
                if (!text) {
                    return reject(new Error("File is empty or could not be read."));
                }
                const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');

                if (lines.length < 2) {
                    return reject(new Error('CSV file must have a header row and at least one data row.'));
                }
                
                const headerRow = parseCsvRow(lines[0]);
                
                const lowerCaseHeaderMap: Record<string, keyof Omit<Trader, 'id'>> = {};
                Object.keys(HEADER_MAP).forEach(key => {
                    lowerCaseHeaderMap[key.toLowerCase()] = HEADER_MAP[key as keyof typeof HEADER_MAP];
                });
                
                const mappedHeaderIndices: { index: number; key: keyof ParsedTraderData }[] = [];
                let nameColumnFound = false;

                headerRow.forEach((header, index) => {
                    const trimmedHeader = header.trim().toLowerCase();
                    const matchedKey = Object.keys(lowerCaseHeaderMap).find(mapKey => mapKey.startsWith(trimmedHeader));
                    if (matchedKey) {
                        const traderKey = lowerCaseHeaderMap[matchedKey];
                        mappedHeaderIndices.push({ index: index, key: traderKey });
                        if (traderKey === 'name') {
                            nameColumnFound = true;
                        }
                    }
                });

                if (!nameColumnFound) {
                    return reject(new Error('CSV is missing the required "Name" header column.'));
                }

                if (lines.length -1 > MAX_UPLOAD_LIMIT) {
                    return reject(new Error(`The limit is ${MAX_UPLOAD_LIMIT} traders per upload. Please split the file.`));
                }

                const validTraders: ParsedTraderData[] = [];

                for (let i = 1; i < lines.length; i++) {
                    const values = parseCsvRow(lines[i]);
                    const rowData: Partial<ParsedTraderData> = {};

                    mappedHeaderIndices.forEach(({ index, key }) => {
                        const value = values[index] ?? '';
                        (rowData as any)[key] = value;
                    });
                    
                    if (rowData.name) {
                        validTraders.push(rowData as ParsedTraderData);
                    }
                }
                
                if (validTraders.length === 0) {
                  return reject(new Error("Could not parse any valid traders from the file. Please check the file format and ensure the 'Name' header is present and that data rows are not empty."));
                }
                
                resolve(validTraders);
            };
            reader.onerror = () => {
                reject(new Error("Failed to read the selected file."));
            };
            reader.readAsText(file);
        });
  };


  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({ variant: "destructive", title: "Error", description: "Please select a CSV file." });
      return;
    }
    setIsLoading(true);

    try {
      const tradersToCreate = await parseAndValidateData(selectedFile);
      await onBulkAddTraders(tradersToCreate);
      setOpen(false);
      clearFile();
    } catch (error: any) {
      console.error("Client-side error during bulk upload processing:", error);
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
                        Header names are flexible and can be truncated (e.g., 'Descriptio' for 'Description'). The system will attempt to map them automatically.
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

    