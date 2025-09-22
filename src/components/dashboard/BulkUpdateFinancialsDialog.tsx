
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
import type { BaseBranchId, ParsedFinancialData } from "@/types";
import { UploadCloud, Loader2, FileText, XCircle, AlertTriangle, DollarSign } from "lucide-react";
import { Label } from "@/components/ui/label";
import Papa from "papaparse";

interface BulkUpdateFinancialsDialogProps {
  branchId: BaseBranchId;
  onBulkUpdate: (data: ParsedFinancialData[]) => Promise<{
    updatedCount: number;
    notFoundCount: number;
    error: string | null;
  }>;
}

const MAX_UPLOAD_LIMIT = 1000;

export function BulkUpdateFinancialsDialog({ branchId, onBulkUpdate }: BulkUpdateFinancialsDialogProps) {
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

  const parseFinancialData = async (file: File): Promise<ParsedFinancialData[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: header => header.trim(),
        complete: (results) => {
          if (results.errors.length) {
            const criticalError = results.errors.find(e => e.code !== 'UndetectableDelimiter');
            if (criticalError) {
              return reject(new Error(`Parsing error on row ${criticalError.row + 2}: ${criticalError.message}.`));
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

          const financialData = (results.data as any[])
            .map((row: any): ParsedFinancialData | null => {
              const name = getRowValue(row, ["Name", "Trader Name", "Company Name"]);
              if (!name) return null;

              return {
                name,
                totalAssets: getRowValue(row, ["Total Assets"]),
                estimatedAnnualRevenue: getRowValue(row, ["Est. Annual Revenue", "Estimated Annual Revenue"]),
                estimatedCompanyValue: getRowValue(row, ["Est. Company Value", "Estimated Company Value"]),
                employeeCount: getRowValue(row, ["Employee Count", "Employees"]),
              };
            })
            .filter((d): d is ParsedFinancialData => d !== null);
          
          resolve(financialData);
        },
        error: (err: any) => {
          reject(new Error("A critical error occurred during file parsing: " + (err?.message || String(err))));
        }
      });
    });
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({ variant: "destructive", title: "Error", description: "Please select a CSV file." });
      return;
    }
    setIsLoading(true);

    try {
      const financialData = await parseFinancialData(selectedFile);

      if (financialData.length === 0) {
        toast({
          variant: "destructive",
          title: "File Error",
          description: "No valid data found. Ensure the CSV has a 'Name' column and at least one financial data column.",
          duration: 8000,
        });
        setIsLoading(false);
        return;
      }

      if (financialData.length > MAX_UPLOAD_LIMIT) {
        toast({
          variant: "destructive",
          title: "Upload Limit Exceeded",
          description: `The limit is ${MAX_UPLOAD_LIMIT} records per upload. Please split the file.`,
          duration: 8000,
        });
        setIsLoading(false);
        return;
      }

      await onBulkUpdate(financialData);
      setOpen(false);
      resetState();
    } catch (error: any) {
      console.error("Client-side error during bulk financial update:", error);
      toast({
        variant: "destructive",
        title: "Bulk Update Failed",
        description: `An error occurred: ${error.message || String(error)}`,
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
          <DollarSign className="mr-2 h-4 w-4" /> 
          <span className="hidden sm:inline">Bulk Update</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Update Financial Info</DialogTitle>
          <DialogDescription asChild>
             <div className="space-y-4 pt-2 text-foreground/90">
                <p>
                  Upload a CSV to update financial information for existing traders. The system will match traders by the 'Name' column.
                </p>
                <div className="flex items-start gap-2 text-amber-600 dark:text-amber-500 p-3 bg-amber-500/10 rounded-md border border-amber-500/20">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium">
                        The CSV must contain a 'Name' column that exactly matches the trader names in the database. Include headers for the financial columns you want to update (e.g., 'Total Assets', 'Est. Annual Revenue', 'Employee Count').
                    </p>
                </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="csv-financial-upload" className="font-semibold">Upload CSV File</Label>
            <div className="relative">
              <Input
                id="csv-financial-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv,text/csv"
                className="w-full h-12 pl-3 pr-10 text-sm border-dashed"
                disabled={isLoading}
              />
               {!selectedFile && <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground text-sm">Choose file...</span>}
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <p className="flex items-center gap-1">
                    <FileText className="inline h-3 w-3" />
                    {selectedFile.name} ({ (selectedFile.size / 1024).toFixed(2) } KB)
                </p>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={resetState} aria-label="Clear file" disabled={isLoading}>
                  <XCircle className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isLoading || !selectedFile}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            Update Financials
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
