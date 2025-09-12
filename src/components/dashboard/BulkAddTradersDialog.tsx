
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

    const parseResults = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: header => header.trim(),
        quoteChar: '"',
        escapeChar: '"',
    });

    if (parseResults.errors.length) {
      const criticalError = parseResults.errors.find(e => e.code !== 'UndetectableDelimiter' && e.code !== 'TooManyFields' && e.code !== 'TooFewFields');
      if (criticalError) {
        toast({
            variant: "destructive",
            title: "CSV Parsing Error",
            description: `Problem on row ${criticalError.row + 2}: ${criticalError.message}. Please check your file for formatting issues like unclosed quotes.`,
            duration: 10000,
        });
        throw new Error(`Parsing error on row ${criticalError.row + 2}`);
      }
    }
    
    const getRowValue = (row: any, potentialHeaders: string[]): any => {
        const lowerCaseHeaders = potentialHeaders.map(h => h.toLowerCase());
        for (const key in row) {
            if (lowerCaseHeaders.includes(key.toLowerCase())) {
            const value = row[key];
            if (value !== null && value !== undefined && String(value).trim() !== '') {
                return value;
            }
            }
        }
        return undefined;
    };
    
    const tradersToProcess = (parseResults.data as any[])
      .map((row: any): ParsedTraderData | null => {
        const name = getRowValue(row, ["Name"])?.trim();
        if (!name) return null; // Skip rows without a name

        return {
          name,
          status: getRowValue(row, ["Status"]),
          lastActivity: getRowValue(row, ["Last Activity"]),
          description: getRowValue(row, ["Description"]),
          reviews: getRowValue(row, ["Reviews (tradesMade)", "Reviews"]),
          rating: getRowValue(row, ["Rating"]),
          website: getRowValue(row, ["Website"]),
          phone: String(getRowValue(row, ["Phone"]) || ''),
          ownerName: getRowValue(row, ["Owner Name", "Owner"]),
          mainCategory: getRowValue(row, ["Main Category", "Category"]),
          categories: getRowValue(row, ["Categories"]),
          workdayTiming: getRowValue(row, ["Workday Timing", "Workday Hours", "Working Hours", "Hours", "WorkdayTiming"]),
          address: getRowValue(row, ["Address"]),
          ownerProfileLink: getRowValue(row, ["Link (ownerProfileLink)", "Link", "Owner Profile"]),
          notes: getRowValue(row, ["Notes", "Review Keywords"]),
          totalAssets: getRowValue(row, ["Total Assets"]),
          estimatedAnnualRevenue: getRowValue(row, ["Est. Annual Revenue", "Estimated Annual Revenue"]),
          estimatedCompanyValue: getRowValue(row, ["Estimated Company Value", "Est. Company Value"]),
          employeeCount: getRowValue(row, ["Employee Count"]),
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
        
        const result = await onBulkAddTraders(validTraders);
        
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
             if (summaryMessages.length === 0) summaryMessages.push("No new traders were added. This may be because they all already exist.");

             toast({
                title: "Bulk Upload Processed",
                description: <div className="flex flex-col gap-1">{summaryMessages.map((msg, i) => <span key={i}>{msg}</span>)}</div>,
                duration: 10000,
            });
            setOpen(false);
            clearFile();
        }
    } catch (error: any) {
        console.error("Client-side error during bulk upload:", error);
        toast({
            variant: "destructive",
            title: "Client Error",
            description: `An unexpected error occurred during file processing: ${error.message}`,
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) clearFile(); }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UploadCloud className="mr-2 h-4 w-4" /> Bulk Add New Traders
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>To Bulk Add New Traders (CSV)</DialogTitle>
          <DialogDescription className="space-y-4 pt-2 text-foreground/90">
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
                    For 'Owner Name', 'Main Category', and 'Workday Timing', ensure headers are exact for successful mapping.
                </p>
            </div>
            <div className="flex items-start gap-2 text-amber-600 dark:text-amber-500 p-3 bg-amber-500/10 rounded-md border border-amber-500/20">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="text-xs font-medium">
                    Fields with commas (e.g., "123 Main St, Anytown") MUST be enclosed in double quotes for correct parsing.
                </p>
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

    