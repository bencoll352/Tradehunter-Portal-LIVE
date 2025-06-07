
"use client";

import * as React from "react"; 
import type { Trader, BaseBranchId, ParsedTraderData, BulkDeleteTradersResult } from "@/types"; // Corrected BranchId to BaseBranchId
import { useState, useMemo, useEffect } from "react";
import type { z } from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditTraderDialog } from "./EditTraderDialog";
import { DeleteTraderDialog } from "./DeleteTraderDialog";
import { AddTraderDialog } from "./AddTraderDialog";
import { BulkAddTradersDialog } from "./BulkAddTradersDialog";
import { ArrowUpDown, Search, FileWarning, ExternalLink, Filter, FileText as NotesIcon, Trash2, Loader2, Download, CalendarClock } from "lucide-react"; 
import { format, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import type { traderFormSchema } from "./TraderForm";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import Papa from "papaparse"; // For CSV export

const ITEMS_PER_PAGE = 50; 

type SortKey = keyof Pick<Trader, 'name' | 'totalSales' | 'tradesMade' | 'status' | 'lastActivity' | 'description' | 'rating' | 'ownerName' | 'mainCategory' | 'address' | 'notes' | 'callBackDate'>;

interface TraderTableClientProps {
  initialTraders: Trader[];
  branchId: BaseBranchId; // Ensure this uses BaseBranchId
  allBranchTraders: Trader[]; 
  onAdd: (values: z.infer<typeof traderFormSchema>) => Promise<boolean>;
  onUpdate: (traderId: string, values: z.infer<typeof traderFormSchema>) => Promise<boolean>;
  onDelete: (traderId: string) => Promise<boolean>;
  onBulkAdd: (traders: ParsedTraderData[]) => Promise<{ data: Trader[] | null; error: string | null; }>;
  onBulkDelete: (traderIds: string[]) => Promise<BulkDeleteTradersResult>;
}

export function TraderTableClient({ 
  initialTraders, 
  branchId: propBranchId, 
  allBranchTraders, 
  onAdd, 
  onUpdate, 
  onDelete, 
  onBulkAdd,
  onBulkDelete 
}: TraderTableClientProps) {
  const [traders, setTraders] = useState<Trader[]>(initialTraders);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("All Categories"); 
  const [selectedTraderIds, setSelectedTraderIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkDeleteAlertOpen, setIsBulkDeleteAlertOpen] = useState(false);
  const { toast } = useToast();
  const branchId = propBranchId; // This is now correctly typed as BaseBranchId

  useEffect(() => {
    setTraders(initialTraders);
    setSelectedTraderIds(new Set()); 
    setCurrentPage(1); 
  }, [initialTraders]);

  const dynamicCategoryOptions = useMemo(() => {
    const categoriesSet = new Set<string>();
    allBranchTraders.forEach(trader => {
      if (trader.mainCategory && trader.mainCategory.trim()) {
        categoriesSet.add(trader.mainCategory.trim());
      }
      if (trader.categories) {
        trader.categories.split(',').forEach(cat => {
          const trimmedCat = cat.trim();
          if (trimmedCat) {
            categoriesSet.add(trimmedCat);
          }
        });
      }
    });
    const sortedCategories = Array.from(categoriesSet).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    return ["All Categories", ...sortedCategories];
  }, [allBranchTraders]);

  const filteredTraders = useMemo(() => {
    let searchableTraders = [...traders];
    
    if (activeCategoryFilter && activeCategoryFilter !== "All Categories") {
      const filterLower = activeCategoryFilter.toLowerCase();
      searchableTraders = searchableTraders.filter(trader => {
        const mainCatLower = trader.mainCategory?.trim().toLowerCase() || '';
        const categoriesArray = trader.categories?.split(',').map(c => c.trim().toLowerCase()) || [];
        return mainCatLower === filterLower || categoriesArray.includes(filterLower);
      });
    }

    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      searchableTraders = searchableTraders.filter(trader =>
        trader.name.toLowerCase().includes(searchTermLower) ||
        (trader.description && trader.description.toLowerCase().includes(searchTermLower)) ||
        (trader.mainCategory && trader.mainCategory.toLowerCase().includes(searchTermLower)) ||
        (trader.address && trader.address.toLowerCase().includes(searchTermLower)) ||
        (trader.categories && trader.categories.toLowerCase().includes(searchTermLower)) ||
        (trader.ownerName && trader.ownerName.toLowerCase().includes(searchTermLower)) ||
        (trader.notes && trader.notes.toLowerCase().includes(searchTermLower)) ||
        (trader.callBackDate && format(parseISO(trader.callBackDate), 'dd/MM/yyyy').includes(searchTermLower))
      );
    }

    if (sortConfig !== null) {
      searchableTraders.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        if (valA === undefined && valB === undefined) return 0;
        if (valA === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valB === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
        
        if (valA === null && valB === null) return 0;
        if (valA === null) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valB === null) return sortConfig.direction === 'ascending' ? 1 : -1;

        if (typeof valA === 'string' && typeof valB === 'string') {
          if (sortConfig.key === 'lastActivity' || sortConfig.key === 'callBackDate') {
            try {
                const dateA = parseISO(valA as string).getTime();
                const dateB = parseISO(valB as string).getTime();
                 if (isNaN(dateA) && isNaN(dateB)) return 0;
                 if (isNaN(dateA)) return sortConfig.direction === 'ascending' ? -1 : 1; // nulls/invalid dates first when ascending
                 if (isNaN(dateB)) return sortConfig.direction === 'ascending' ? 1 : -1; // nulls/invalid dates last when descending
                return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
            } catch (e) { return 0;}
          }
          return sortConfig.direction === 'ascending' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
        }
        
        const stringA = String(valA);
        const stringB = String(valB);
        if (stringA < stringB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (stringA > stringB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return searchableTraders;
  }, [traders, searchTerm, sortConfig, activeCategoryFilter]);

  const totalPages = Math.ceil(filteredTraders.length / ITEMS_PER_PAGE);
  const paginatedTraders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTraders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTraders, currentPage]);

  const handleSelectTrader = (traderId: string) => {
    setSelectedTraderIds(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(traderId)) {
        newSelected.delete(traderId);
      } else {
        newSelected.add(traderId);
      }
      return newSelected;
    });
  };

  const handleSelectAllPaginatedTraders = () => {
    const paginatedIds = paginatedTraders.map(t => t.id);
    const allPaginatedSelected = paginatedIds.length > 0 && paginatedIds.every(id => selectedTraderIds.has(id));

    setSelectedTraderIds(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (allPaginatedSelected) {
        paginatedIds.forEach(id => newSelected.delete(id));
      } else {
        paginatedIds.forEach(id => newSelected.add(id));
      }
      return newSelected;
    });
  };

  const isAllPaginatedSelected = useMemo(() => {
    if (paginatedTraders.length === 0) return false;
    return paginatedTraders.every(trader => selectedTraderIds.has(trader.id));
  }, [paginatedTraders, selectedTraderIds]);


  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const handleCategoryFilterChange = (categoryValue: string) => {
    setActiveCategoryFilter(categoryValue);
    setCurrentPage(1);
  };
  
  const handleAddTrader = async (values: z.infer<typeof traderFormSchema>): Promise<boolean> => {
    return await onAdd(values);
  };

  const handleUpdateTrader = async (traderId: string, values: z.infer<typeof traderFormSchema>): Promise<boolean> => {
    return await onUpdate(traderId, values);
  };

  const handleStatusToggle = async (trader: Trader) => {
    let newStatus: Trader['status'];
    switch (trader.status) {
      case 'Active': newStatus = 'Inactive'; break;
      case 'Inactive': newStatus = 'Active'; break;
      case 'Call-Back': newStatus = 'Active'; break;
      case 'New Lead': newStatus = 'Active'; break;
      default: newStatus = 'Active'; 
    }

    const formValues: z.infer<typeof traderFormSchema> = {
      name: trader.name, totalSales: trader.totalSales, tradesMade: trader.tradesMade, status: newStatus,
      description: trader.description || undefined, rating: trader.rating, website: trader.website || undefined,
      phone: trader.phone || undefined, address: trader.address || undefined, mainCategory: trader.mainCategory || undefined,
      ownerName: trader.ownerName || undefined, ownerProfileLink: trader.ownerProfileLink || undefined,
      categories: trader.categories || undefined, workdayTiming: trader.workdayTiming || undefined, notes: trader.notes || undefined,
      callBackDate: trader.callBackDate || undefined,
    };
    await onUpdate(trader.id, formValues);
  };

  const handleDeleteTrader = async (traderId: string): Promise<boolean> => {
    const success = await onDelete(traderId);
    if (success) {
      toast({ title: "Success", description: "Trader deleted successfully." });
      setSelectedTraderIds(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(traderId);
        return newSelected;
      });
    }
    return success; 
  };

  const handleBulkAddTraders = async (tradersToCreate: ParsedTraderData[]): Promise<{ data: Trader[] | null; error: string | null; }> => {
    const result = await onBulkAdd(tradersToCreate);
    return result;
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedTraderIds.size === 0) return;
    setIsBulkDeleting(true);
    const idsToDelete = Array.from(selectedTraderIds);
    const result = await onBulkDelete(idsToDelete);
    
    if (result.error) {
      toast({ variant: "destructive", title: "Bulk Delete Failed", description: result.error });
    } else {
      if (result.successCount > 0) {
        toast({ title: "Bulk Delete Successful", description: `${result.successCount} trader(s) deleted.` });
      }
      if (result.failureCount > 0) {
        toast({ variant: "destructive", title: "Partial Bulk Delete", description: `${result.failureCount} trader(s) could not be deleted.` });
      }
      if (result.successCount === 0 && result.failureCount === 0){
         toast({ title: "Bulk Delete", description: "No traders were deleted." });
      }
    }
    
    setSelectedTraderIds(new Set());
    setIsBulkDeleting(false);
    setIsBulkDeleteAlertOpen(false);
  };

  const downloadCsv = () => {
    if (filteredTraders.length === 0) {
      toast({
        title: "No Data to Export",
        description: "There are no traders in the current view to export.",
      });
      return;
    }

    const csvData = filteredTraders.map(trader => ({
      "ID": trader.id,
      "Name": trader.name,
      "Branch ID": trader.branchId,
      "Total Sales (£)": trader.totalSales,
      "Reviews (Trades Made)": trader.tradesMade,
      "Status": trader.status,
      "Last Activity": trader.lastActivity ? format(parseISO(trader.lastActivity), 'dd/MM/yyyy HH:mm:ss') : '',
      "Call-Back Date": trader.callBackDate ? format(parseISO(trader.callBackDate), 'dd/MM/yyyy') : '',
      "Description": trader.description || '',
      "Rating": trader.rating,
      "Website": trader.website || '',
      "Phone": trader.phone || '',
      "Address": trader.address || '',
      "Main Category": trader.mainCategory || '',
      "Owner Name": trader.ownerName || '',
      "Owner Profile Link": trader.ownerProfileLink || '',
      "Categories": trader.categories || '',
      "Workday Timing": trader.workdayTiming || '',
      "Closed On": trader.closedOn || '',
      "Review Keywords": trader.reviewKeywords || '',
      "Notes": trader.notes || '',
    }));

    try {
        const csvString = Papa.unparse(csvData, { header: true });
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) { 
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `traders_export_${branchId}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast({ title: "Export Successful", description: "Trader data CSV downloaded." });
        } else {
            toast({ variant: "destructive", title: "Export Failed", description: "Browser does not support CSV download." });
        }
    } catch (error) {
        console.error("Error generating CSV:", error);
        toast({ variant: "destructive", title: "Export Error", description: "Could not generate CSV file." });
    }
  };

  const SortableHeader = ({ sortKey, label, icon: Icon }: { sortKey: SortKey, label: string, icon?: React.ElementType }) => (
    <TableHead onClick={() => requestSort(sortKey)} className="cursor-pointer hover:bg-muted/50 whitespace-nowrap">
      <div className="flex items-center gap-1">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
        {sortConfig?.key === sortKey ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : <ArrowUpDown className="h-3 w-3 opacity-50" />}
      </div>
    </TableHead>
  );

  const renderCellContent = (content: string | number | undefined | null, maxChars = 30, isNote = false) => {
    const stringContent = String(content || '');
    if (stringContent.length > maxChars) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 truncate" style={{ maxWidth: `${maxChars + (isNote ? 2 : 0)}ch` }}>
                {isNote && <NotesIcon className="h-3 w-3 shrink-0 text-muted-foreground" />}
                <span className="truncate">{stringContent.substring(0, maxChars)}...</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-md break-words bg-background border text-foreground p-2 rounded-md shadow-lg z-50">
              <p>{stringContent}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
     if (isNote && stringContent) {
      return (
         <div className="flex items-center gap-1">
            <NotesIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span>{stringContent}</span>
        </div>
      );
    }
    return stringContent || <span className="text-muted-foreground/50">-</span>;
  };

  const getStatusBadgeClass = (status: Trader['status']) => {
    switch (status) {
      case 'Active': return 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30';
      case 'Inactive': return 'bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/30';
      case 'Call-Back': return 'bg-amber-500/20 text-amber-700 border-amber-500/30 hover:bg-amber-500/30';
      case 'New Lead': return 'bg-blue-500/20 text-blue-700 border-blue-500/30 hover:bg-blue-500/30';
      default: return 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
    }
  };


  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search traders..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1);}}
                className="pl-10"
            />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                <Select value={activeCategoryFilter} onValueChange={handleCategoryFilterChange}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by category..." />
                    </SelectTrigger>
                    <SelectContent>
                    {dynamicCategoryOptions.map(category => (
                        <SelectItem key={category} value={category}>
                        {category}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="flex gap-2 flex-wrap justify-start sm:justify-end w-full sm:w-auto mt-2 sm:mt-0">
          {selectedTraderIds.size > 0 && (
             <AlertDialog open={isBulkDeleteAlertOpen} onOpenChange={setIsBulkDeleteAlertOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isBulkDeleting}>
                  {isBulkDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Delete ({selectedTraderIds.size})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {selectedTraderIds.size} selected trader(s). This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isBulkDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmBulkDelete} disabled={isBulkDeleting} className="bg-destructive hover:bg-destructive/90">
                    {isBulkDeleting ? "Deleting..." : "Confirm Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
           <Button variant="outline" onClick={downloadCsv}>
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
          <BulkAddTradersDialog 
            branchId={branchId} 
            existingTraders={allBranchTraders}
            onBulkAddTraders={(currentBranchIdIgnore, traders) => handleBulkAddTraders(traders)} 
          />
          <AddTraderDialog 
            branchId={branchId} 
            existingTraders={allBranchTraders}
            onAddTrader={handleAddTrader} 
          />
        </div>
      </div>
      
      {paginatedTraders.length === 0 && filteredTraders.length === 0 && searchTerm === "" && activeCategoryFilter === "All Categories" ? (
         <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg">
          <FileWarning className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-muted-foreground">No Traders Found</h3>
          <p className="text-muted-foreground">
            There are no traders for this branch yet. Add a new trader or use bulk upload to get started.
          </p>
        </div>
      ) : paginatedTraders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg">
          <FileWarning className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-muted-foreground">No Traders Match Filter</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or category filter.
          </p>
        </div>
      ) : (
      <div className="rounded-md border shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={isAllPaginatedSelected}
                  onCheckedChange={handleSelectAllPaginatedTraders}
                  aria-label="Select all traders on this page"
                  disabled={paginatedTraders.length === 0}
                />
              </TableHead>
              <SortableHeader sortKey="name" label="Name" />
              <SortableHeader sortKey="totalSales" label="Total Sales" />
              <SortableHeader sortKey="status" label="Status" />
              <SortableHeader sortKey="lastActivity" label="Last Activity" />
              <SortableHeader sortKey="callBackDate" label="Call-Back" icon={CalendarClock} />
              <SortableHeader sortKey="description" label="Description" />
              <TableHead>Notes</TableHead>
              <SortableHeader sortKey="tradesMade" label="Reviews" />
              <SortableHeader sortKey="rating" label="Rating" />
              <TableHead className="whitespace-nowrap">🌐Website</TableHead>
              <TableHead className="whitespace-nowrap">📞 Phone</TableHead>
              <SortableHeader sortKey="ownerName" label="Owner Name" />
              <SortableHeader sortKey="mainCategory" label="Main Category" />
              <TableHead>Categories</TableHead>
              <TableHead>Workday Timing</TableHead>
              <SortableHeader sortKey="address" label="Address" />
              <TableHead>Link</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTraders.map((trader) => (
              <TableRow 
                key={trader.id} 
                data-state={selectedTraderIds.has(trader.id) ? "selected" : ""}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedTraderIds.has(trader.id)}
                    onCheckedChange={() => handleSelectTrader(trader.id)}
                    aria-label={`Select trader ${trader.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium whitespace-nowrap">{renderCellContent(trader.name, 20)}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {typeof trader.totalSales === 'number' ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(trader.totalSales) : <span className="text-muted-foreground/50">-</span>}
                </TableCell>
                <TableCell>
                   <Button
                      variant="ghost" size="sm"
                      className={`p-1 h-auto hover:opacity-80 ${getStatusBadgeClass(trader.status).split(' ').find(c => c.startsWith('hover:bg-'))}`}
                      onClick={() => handleStatusToggle(trader)}
                    >
                    <Badge variant={'outline'} className={`${getStatusBadgeClass(trader.status)} cursor-pointer`}>
                      {trader.status}
                    </Badge>
                  </Button>
                </TableCell>
                <TableCell className="whitespace-nowrap">{trader.lastActivity ? format(parseISO(trader.lastActivity), 'dd/MM/yyyy') : <span className="text-muted-foreground/50">-</span>}</TableCell>
                <TableCell className="whitespace-nowrap">{trader.callBackDate ? format(parseISO(trader.callBackDate), 'dd/MM/yyyy') : <span className="text-muted-foreground/50">-</span>}</TableCell>
                <TableCell>{renderCellContent(trader.description)}</TableCell>
                <TableCell>{renderCellContent(trader.notes, 25, true)}</TableCell>
                <TableCell className="whitespace-nowrap text-center">{renderCellContent(trader.tradesMade, 5)}</TableCell>
                <TableCell className="whitespace-nowrap text-center">{trader.rating ? trader.rating.toFixed(1) : <span className="text-muted-foreground/50">-</span>}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {trader.website ? (<a href={trader.website.startsWith('http') ? trader.website : `https://${trader.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Visit <ExternalLink className="h-3 w-3" /></a>) : <span className="text-muted-foreground/50">-</span>}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {trader.phone ? (<a href={`tel:${trader.phone}`} className="text-primary hover:underline">{renderCellContent(trader.phone, 15)}</a>) : <span className="text-muted-foreground/50">-</span>}
                </TableCell>
                <TableCell>{renderCellContent(trader.ownerName, 20)}</TableCell>
                <TableCell>{renderCellContent(trader.mainCategory, 15)}</TableCell>
                <TableCell>{renderCellContent(trader.categories, 20)}</TableCell>
                <TableCell>{renderCellContent(trader.workdayTiming, 20)}</TableCell>
                <TableCell>{renderCellContent(trader.address, 25)}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {trader.ownerProfileLink ? (<a href={trader.ownerProfileLink.startsWith('http') ? trader.ownerProfileLink : `https://${trader.ownerProfileLink}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Profile <ExternalLink className="h-3 w-3" /></a>) : <span className="text-muted-foreground/50">-</span>}
                </TableCell>
                <TableCell className="flex gap-1 whitespace-nowrap">
                  <EditTraderDialog trader={trader} onUpdateTrader={(traderId, values) => handleUpdateTrader(traderId, values)} />
                  <DeleteTraderDialog traderName={trader.name} onDeleteTrader={() => handleDeleteTrader(trader.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>Next</Button>
        </div>
      )}
    </div>
  );
}

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn("z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

