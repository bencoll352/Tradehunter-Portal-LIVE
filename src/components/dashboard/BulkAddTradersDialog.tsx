
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
  existingTraders: Trader[];
}

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
    return result;
};


const parseAndValidateData = (file: File): Promise<ParsedTraderData[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const text = event.target?.result as string;
                if (!text) {
                    throw new Error("File is empty or could not be read.");
                }

                const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
                if (lines.length < 2) {
                    throw new Error('CSV file must have a header row and at least one data row.');
                }

                const headerRow = parseCsvRow(lines[0]);
                
                const headerAliasMap: Record<string, keyof ParsedTraderData> = {
                    'name': 'name',
                    'status': 'status',
                    'last activity': 'lastActivity',
                    'description': 'description',
                    'descriptio': 'description',
                    'reviews': 'reviews',
                    'rating': 'rating',
                    'website': 'website',
                    'phone': 'phone',
                    'owner name': 'ownerName',
                    'owner': 'ownerName',
                    'owner nar': 'ownerName',
                    'main category': 'mainCategory',
                    'category': 'mainCategory',
                    'categories': 'categories',
                    'workday timing': 'workdayTiming',
                    'workday hours': 'workdayTiming',
                    'working hours': 'workdayTiming',
                    'hours': 'workdayTiming',
                    'temporarily closed on': 'temporarilyClosedOn',
                    'address': 'address',
                    'owner profile link': 'ownerProfileLink',
                    'link': 'ownerProfileLink',
                    'notes': 'notes',
                    'call back date': 'callBackDate',
                    'total assets': 'totalAssets',
                    'estimated annual revenue': 'estimatedAnnualRevenue',
                    'est. annual revenue': 'estimatedAnnualRevenue',
                    'estimated company value': 'estimatedCompanyValue',
                    'est. company value': 'estimatedCompanyValue',
                    'employee count': 'employeeCount',
                    'estimated': 'estimatedAnnualRevenue' // Fallback for ambiguous "Estimated"
                };

                const mappedHeaderIndices: { index: number; key: keyof ParsedTraderData }[] = [];
                const foundHeaders = new Set<string>();

                headerRow.forEach((header, index) => {
                    const trimmedHeader = header?.trim().toLowerCase() ?? '';
                    if(!trimmedHeader) return;
                    
                    let matchedKey: keyof ParsedTraderData | undefined;
                    for (const alias in headerAliasMap) {
                        if (trimmedHeader.startsWith(alias)) {
                            matchedKey = headerAliasMap[alias];
                            break;
                        }
                    }

                    if (matchedKey) {
                        if (matchedKey === 'estimatedAnnualRevenue' && (trimmedHeader.includes('value') || trimmedHeader.includes('company'))) {
                            matchedKey = 'estimatedCompanyValue';
                        }
                        if (!foundHeaders.has(matchedKey)) {
                            mappedHeaderIndices.push({ index: index, key: matchedKey });
                            foundHeaders.add(matchedKey);
                        }
                    }
                });
                
                if (!foundHeaders.has('name')) {
                    throw new Error('CSV file is missing the required "Name" header column.');
                }
                
                const validTraders: ParsedTraderData[] = [];
                for (let i = 1; i < lines.length; i++) {
                    const values = parseCsvRow(lines[i]);
                    if (values.every(v => v.trim() === '')) continue; // Skip empty rows

                    const rowData: Partial<ParsedTraderData> = {};
                    mappedHeaderIndices.forEach(({ index, key }) => {
                        const value = values[index] ?? '';
                        (rowData as any)[key] = value.trim();
                    });

                    if (rowData.name && String(rowData.name).trim()) {
                        validTraders.push(rowData as ParsedTraderData);
                    }
                }
                
                if (validTraders.length === 0) {
                    throw new Error("Could not parse any valid traders. Check if the 'Name' column has values and the file is correctly formatted.");
                }

                resolve(validTraders);
            } catch (e) {
                reject(e); // Propagate any error from the try block
            }
        };

        reader.onerror = () => {
            reader.abort();
            reject(new Error("Failed to read the selected file."));
        };

        reader.readAsText(file);
    });
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

    try {
      const tradersToCreate = await parseAndValidateData(selectedFile);
      await onBulkAddTraders(tradersToCreate);
      // Success toast is handled by the parent component
      setOpen(false);
      clearFile();
    } catch (error: any) {
      console.error("Client-side error during bulk upload processing:", error);
      toast({
          variant: "destructive",
          title: "Bulk Upload Failed",
          description: `An unexpected error occurred during file processing: ${String(error)}`,
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
          <DialogTitle>Bulk Add New Traders (CSV)</DialogTitle>
          <DialogDescription asChild>
             <div className="space-y-4 pt-2 text-foreground/90">
                <p>
                    For a successful upload, ensure your CSV file has a header row. The only required column is 'Name'. The uploader will automatically skip any traders whose phone number already exists.
                </p>
                <div className="flex items-start gap-2 text-amber-600 dark:text-amber-500 p-3 bg-amber-500/10 rounded-md border border-amber-500/20">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium">
                        Header names can be incomplete (e.g., 'Descriptio' for 'Description'). The system will attempt to map them automatically.
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
