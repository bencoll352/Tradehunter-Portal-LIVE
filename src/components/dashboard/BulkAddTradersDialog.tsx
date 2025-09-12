
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
import { normalizePhoneNumber } from "@/lib/utils";

interface BulkAddTradersDialogProps {
  branchId: BaseBranchId;
  existingTraders: Trader[];
  onBulkAddTraders: (traders: ParsedTraderData[]) => Promise<{ data: Trader[] | null; error: string | null; }>;
}

const MAX_UPLOAD_LIMIT = 1000;

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
        reader.onload = (e) => setFileContent(e.target?.result as string);
        reader.readAsText(file);
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

  const parseAndValidateData = (): { validTraders: ParsedTraderData[], skippedCount: number, duplicatePhonesInCsv: Set<string> } => {
    if (!fileContent) return { validTraders: [], skippedCount: 0, duplicatePhonesInCsv: new Set() };

    const parseResults = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: header => header.trim(),
        quoteChar: '"',
        escapeChar: '"',
        dynamicTyping: true,
    });

    if (parseResults.errors.length) {
      const criticalError = parseResults.errors.find(e => e.code !== 'UndetectableDelimiter');
      if (criticalError) {
        toast({
            variant: "destructive",
            title: "CSV Parsing Error",
            description: `Problem on row ${criticalError.row + 1}: ${criticalError.message}. Please check your file for formatting issues like unclosed quotes.`,
            duration: 10000,
        });
        throw new Error(`Parsing error on row ${criticalError.row + 1}`);
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
        if (!name) return null;

        return {
          name,
          status: getRowValue(row, ["Status"]),
          lastActivity: getRowValue(row, ["Last Activity"]),
          description: getRowValue(row, ["Description"]),
          reviews: getRowValue(row, ["Reviews"]),
          rating: getRowValue(row, ["Rating"]),
          website: getRowValue(row, ["Website"]),
          phone: String(getRowValue(row, ["Phone"]) || ''),
          ownerName: getRowValue(row, ["Owner Name", "Owner"]),
          mainCategory: getRowValue(row, ["Main Category", "Category"]),
          categories: getRowValue(row, ["Categories"]),
          workdayTiming: getRowValue(row, ["Workday Timing", "Workday Hours", "Working Hours", "Hours", "WorkdayTiming"]),
          address: getRowValue(row, ["Address"]),
          ownerProfileLink: getRowValue(row, ["Link", "Owner Profile"]),
          notes: getRowValue(row, ["Notes"]),
          totalAssets: getRowValue(row, ["Total Assets"]),
          estimatedAnnualRevenue: getRowValue(row, ["Est. Annual Revenue", "Estimated Annual Revenue"]),
          estimatedCompanyValue: getRowValue(row, ["Estimated Company Value", "Est. Company Value"]),
          employeeCount: getRowValue(row, ["Employee Count"]),
        };
      })
      .filter((t): t is ParsedTraderData => t !== null);

    const validTraders: ParsedTraderData[] = [];
    const processedPhoneNumbersInCsv = new Set<string>();
    const duplicatePhonesInCsv = new Set<string>();
    let skippedCount = 0;

    const existingNormalizedPhones = new Set(existingTraders.map(t => normalizePhoneNumber(t.phone)));

    for (const trader of tradersToProcess) {
      const normalizedPhone = normalizePhoneNumber(trader.phone);
      let isDuplicate = false;
      if (normalizedPhone) {
        if (existingNormalizedPhones.has(normalizedPhone) || processedPhoneNumbersInCsv.has(normalizedPhone)) {
          isDuplicate = true;
          if (processedPhoneNumbersInCsv.has(normalizedPhone)) {
            duplicatePhonesInCsv.add(trader.phone || 'N/A');
          }
        }
      }
      if (isDuplicate) {
        skippedCount++;
      } else {
        validTraders.push(trader);
        if (normalizedPhone) processedPhoneNumbersInCsv.add(normalizedPhone);
      }
    }
    return { validTraders, skippedCount, duplicatePhonesInCsv };
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({ variant: "destructive", title: "Error", description: "Please select a CSV file." });
      return;
    }
    setIsLoading(true);

    let parseResult;
    try {
        parseResult = parseAndValidateData();
    } catch (e: any) {
        console.error("Halting handleSubmit due to parsing error:", e.message);
        setIsLoading(false);
        return;
    }
    
    const { validTraders, skippedCount, duplicatePhonesInCsv } = parseResult;

    if (validTraders.length === 0 && skippedCount === 0) {
      toast({
        variant: "destructive",
        title: "Bulk Upload Failed",
        description: "Could not parse any traders from the file. Please check the file format and ensure the 'Name' header is present.",
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

    let newTradersAddedCount = 0;
    if (validTraders.length > 0) {
      try {
        const result = await onBulkAddTraders(validTraders);
        if (result.error) {
          toast({
            variant: "destructive",
            title: "Bulk Upload Failed",
            description: `${result.error}. Please try again later or contact support if the issue persists.`,
            duration: 10000,
          });
          setIsLoading(false);
          return;
        }
        if (result.data) {
          newTradersAddedCount = result.data.length;
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Client Error",
          description: `An unexpected client error occurred. Check console for details.`,
        });
        setIsLoading(false);
        return;
      }
    }

    let summaryMessages = [];
    if (newTradersAddedCount > 0) summaryMessages.push(`${newTradersAddedCount} new trader(s) added.`);
    if (skippedCount > 0) summaryMessages.push(`${skippedCount} trader(s) skipped as duplicates.`);
    if (duplicatePhonesInCsv.size > 0) summaryMessages.push(`Duplicate phones found within the CSV: ${Array.from(duplicatePhonesInCsv).slice(0, 3).join(', ')}${duplicatePhonesInCsv.size > 3 ? '...' : ''}.`);
    
    if (summaryMessages.length > 0) {
        toast({
            title: "Bulk Upload Processed",
            description: <div className="flex flex-col gap-1">{summaryMessages.map((msg, i) => <span key={i}>{msg}</span>)}</div>,
            duration: 10000,
        });
    }

    setOpen(false);
    clearFile();
    setIsLoading(false);
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
          <DialogTitle>Bulk Add New Traders via CSV</DialogTitle>
          <DialogDescription className="space-y-2 pt-2">
            <p>
             Upload a CSV file to add multiple traders at once. The system uses header names for data mapping, so column order doesn't matter. A 'Name' header is MANDATORY. Any traders with a duplicate phone number will be SKIPPED.
            </p>
             <p className="text-xs text-muted-foreground">
              Recommended headers: Name, Phone, Address, Owner Name, Main Category, Notes, Est. Annual Revenue, Estimated Company Value, Employee Count.
            </p>
            <div className="flex items-start gap-2 text-amber-600 dark:text-amber-500">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="text-xs">
                    Fields containing commas (e.g., "123 Main St, Anytown") MUST be enclosed in double quotes.
                </p>
            </div>
             <div className="flex items-start gap-2 text-amber-600 dark:text-amber-500">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="text-xs">
                    Rows with a phone number that already exists in the database or earlier in the same file will be skipped to prevent duplicates.
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
                {selectedFile.name} ({ (selectedFile.size / 1024).toFixed(2) } KB)
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
            Upload & Process
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
