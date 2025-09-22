
"use client";

import { useState, useMemo } from "react";
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddTraderDialog } from "./AddTraderDialog";
import { EditTraderDialog } from "./EditTraderDialog";
import { DeleteTraderDialog } from "./DeleteTraderDialog";
import { BulkAddTradersDialog } from "./BulkAddTradersDialog";
import { BulkUpdateFinancialsDialog } from "./BulkUpdateFinancialsDialog";
import { Badge } from "@/components/ui/badge";
import type { Trader, BaseBranchId, ParsedTraderData, BulkDeleteTradersResult, ParsedFinancialData } from "@/types";
import { ArrowUpDown, Trash2, SlidersHorizontal, ArrowUp, ArrowDown, Phone, Globe, ExternalLink, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import type { z } from "zod";
import type { traderFormSchema } from "./TraderForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { bulkUpdateFinancialsAction } from "@/app/(app)/tradehunter/actions";

type TraderFormValues = z.infer<typeof traderFormSchema>;
type SortKey = keyof Trader | 'estimatedAnnualRevenue' | 'rating' | 'lastActivity' | 'name' | 'status' | 'callBackDate' | 'reviews';

type SortDirection = 'ascending' | 'descending';

interface TraderTableClientProps {
  traders: Trader[];
  branchId: BaseBranchId;
  onAdd: (values: TraderFormValues) => Promise<boolean>;
  onUpdate: (traderId: string, values: TraderFormValues) => Promise<boolean>;
  onDelete: (traderId: string) => Promise<boolean>;
  onBulkAdd: (traders: ParsedTraderData[]) => Promise<{ data: Trader[] | null; error: string | null; }>;
  onBulkDelete: (traderIds: string[]) => Promise<BulkDeleteTradersResult>;
  nameFilter: string;
  setNameFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  mainCategories: string[];
  isLoading: boolean;
  existingTraders: Trader[];
}

export function TraderTableClient({
  traders,
  branchId,
  onAdd,
  onUpdate,
  onDelete,
  onBulkAdd,
  onBulkDelete,
  nameFilter,
  setNameFilter,
  categoryFilter,
  setCategoryFilter,
  mainCategories,
  isLoading,
}: TraderTableClientProps) {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({ key: "lastActivity", direction: "descending" });
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  
  const allColumns = [
    { id: 'name', label: 'Name' },
    { id: 'status', label: 'Status' },
    { id: 'lastActivity', label: 'Last Activity' },
    { id: 'callBackDate', label: 'Call-Back Date' },
    { id: 'description', label: 'Description' },
    { id: 'rating', label: 'Google Rating' },
    { id: 'reviews', label: 'Google number of reviews' },
    { id: 'website', label: 'Website' },
    { id: 'phone', label: 'Phone' },
    { id: 'ownerName', label: 'Owner Name' },
    { id: 'ownerProfileLink', label: 'Link' },
    { id: 'mainCategory', label: 'Main Category' },
    { id: 'categories', label: 'Categories' },
    { id: 'workdayTiming', label: 'Workday Timing' },
    { id: 'address', label: 'Address' },
    { id: 'notes', label: 'Notes' },
    { id: 'estimatedAnnualRevenue', label: 'Est. Annual Revenue' },
    { id: 'estimatedCompanyValue', label: 'Est. Company Value' },
    { id: 'employeeCount', label: 'Employees' },
  ];

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    name: true,
    status: true,
    lastActivity: true,
    callBackDate: true,
    description: true,
    rating: true,
    reviews: true,
    website: true,
    phone: true,
    ownerName: true,
    ownerProfileLink: true,
    mainCategory: true,
    categories: true,
    workdayTiming: true,
    address: true,
    notes: true,
    estimatedAnnualRevenue: true,
    estimatedCompanyValue: true,
    employeeCount: true,
  });

  const { toast } = useToast();

  const sortedTraders = useMemo(() => {
    let sortableItems = [...traders];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Trader];
        const bValue = b[sortConfig.key as keyof Trader];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (sortConfig.key === 'lastActivity' || sortConfig.key === 'callBackDate') {
            const dateA = aValue ? new Date(aValue as string).getTime() : 0;
            const dateB = bValue ? new Date(bValue as string).getTime() : 0;
             if (isNaN(dateA)) return 1;
             if (isNaN(dateB)) return -1;
            return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return 0;
      });
    }
    return sortableItems;
  }, [traders, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const handleBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection).filter(id => rowSelection[id]);
    if (selectedIds.length === 0) {
      toast({ variant: "destructive", title: "No traders selected", description: "Please select traders to delete." });
      return;
    }
    const result = await onBulkDelete(selectedIds);
    if (result.successCount > 0) {
      toast({
        title: "Bulk Delete Successful",
        description: `${result.successCount} trader(s) deleted.`,
      });
    }
    if (result.failureCount > 0) {
      toast({
        variant: "destructive",
        title: "Bulk Delete Failed",
        description: `${result.failureCount} trader(s) could not be deleted. Error: ${result.error}`,
        duration: 8000,
      });
    }
    setRowSelection({});
  };

  const handleBulkFinancialsUpdate = async (financialData: ParsedFinancialData[]) => {
    const result = await bulkUpdateFinancialsAction(branchId, financialData);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Bulk Update Failed',
        description: result.error,
        duration: 10000,
      });
    } else {
      let summaryMessages = [];
      if (result.updatedCount > 0) summaryMessages.push(`${result.updatedCount} trader(s) updated successfully.`);
      if (result.notFoundCount > 0) summaryMessages.push(`${result.notFoundCount} trader(s) could not be found by name.`);
      if (summaryMessages.length === 0) summaryMessages.push("No traders were updated.");
      
      toast({
        title: 'Bulk Update Processed',
        description: <div className="flex flex-col gap-1">{summaryMessages.map((msg, i) => <span key={i}>{msg}</span>)}</div>,
        duration: 10000,
      });
    }
    return result;
  };

  const selectedRowCount = Object.values(rowSelection).filter(Boolean).length;

  const toggleAllRowsSelected = (checked: boolean) => {
    const newSelection: Record<string, boolean> = {};
    if (checked) {
      sortedTraders.forEach(trader => {
        newSelection[trader.id] = true;
      });
    }
    setRowSelection(newSelection);
  };
  
  const formatCurrency = (value: number | null | undefined) => {
      if (value === null || value === undefined) return <span className="text-muted-foreground">-</span>;
      return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  }

  const SortableHeader = ({ label, sortKey }: { label: string; sortKey: SortKey }) => {
    const isSorted = sortConfig?.key === sortKey;
    return (
      <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => requestSort(sortKey)}>
        <div className="flex items-center gap-2">
          {label}
          {isSorted ? (
            sortConfig?.direction === 'ascending' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </TableHead>
    );
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Trader Database</CardTitle>
        <CardDescription>Manage traders for branch: {branchId || 'Loading...'}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                <Input
                placeholder="Filter by name..."
                value={nameFilter}
                onChange={(event) => setNameFilter(event.target.value)}
                className="w-full sm:max-w-xs"
                />
                <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
                >
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {mainCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0 self-end flex-wrap justify-end">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    <span className="hidden md:inline">Columns</span>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                {allColumns.map((column) => (
                    <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={columnVisibility[column.id]}
                    onCheckedChange={(value) =>
                        setColumnVisibility(prev => ({...prev, [column.id]: !!value}))
                    }
                    >
                    {column.label}
                    </DropdownMenuCheckboxItem>
                ))}
                </DropdownMenuContent>
            </DropdownMenu>
            {selectedRowCount > 0 && (
                <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({selectedRowCount})
                </Button>
            )}
             <BulkUpdateFinancialsDialog
              branchId={branchId}
              onBulkUpdate={handleBulkFinancialsUpdate}
            />
            <BulkAddTradersDialog
                branchId={branchId}
                onBulkAdd={onBulkAdd}
            />
            <AddTraderDialog 
                onAddTrader={onAdd} 
                branchId={branchId}
            />
            </div>
        </div>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead padding="checkbox">
                          <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                          onChange={(e) => toggleAllRowsSelected(e.target.checked)}
                          checked={!isLoading && sortedTraders.length > 0 && selectedRowCount === sortedTraders.length}
                          disabled={isLoading || sortedTraders.length === 0}
                          />
                      </TableHead>
                      {allColumns.map(col => (
                          columnVisibility[col.id] && <SortableHeader key={col.id} label={col.label} sortKey={col.id as SortKey} />
                      ))}
                      <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={`skeleton-${i}`}>
                              <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                              {allColumns.map(col => columnVisibility[col.id] && <TableCell key={`${col.id}-skel`}><Skeleton className="h-4 w-20" /></TableCell>)}
                              <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                          </TableRow>
                      ))
                  ) : sortedTraders.length > 0 ? (
                  sortedTraders.map((trader) => (
                      <TableRow
                      key={trader.id}
                      data-state={rowSelection[trader.id] && "selected"}
                      >
                      <TableCell>
                          <input
                              type="checkbox"
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                              checked={rowSelection[trader.id] || false}
                              onChange={(e) => setRowSelection(prev => ({...prev, [trader.id]: e.target.checked}))}
                          />
                      </TableCell>
                      
                      {columnVisibility.name && <TableCell className="font-medium truncate max-w-40">{trader.name}</TableCell>}
                      {columnVisibility.status && <TableCell><Badge variant={trader.status === 'Call-Back' ? 'destructive' : 'secondary'}>{trader.status}</Badge></TableCell>}
                      {columnVisibility.lastActivity && <TableCell className="whitespace-nowrap">{trader.lastActivity ? format(parseISO(trader.lastActivity), "dd/MM/yyyy") : '-'}</TableCell>}
                      {columnVisibility.callBackDate && <TableCell className="whitespace-nowrap">{trader.callBackDate ? format(parseISO(trader.callBackDate), "dd/MM/yyyy") : '-'}</TableCell>}
                      {columnVisibility.description && <TableCell className="truncate max-w-48">{trader.description ?? '-'}</TableCell>}
                      {columnVisibility.rating && <TableCell className="text-center">{typeof trader.rating === 'number' ? trader.rating.toFixed(1) : (typeof trader.rating === 'string' ? parseFloat(trader.rating).toFixed(1) : '-')}</TableCell>}
                      {columnVisibility.reviews && <TableCell className="text-center">{trader.reviews ?? '-'}</TableCell>}
                      {columnVisibility.website && <TableCell>{trader.website ? <a href={trader.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1"><Globe className="h-4 w-4"/>Visit</a> : '-'}</TableCell>}
                      {columnVisibility.phone && <TableCell className="whitespace-nowrap">{trader.phone ?? '-'}</TableCell>}
                      {columnVisibility.ownerName && <TableCell className="truncate max-w-40">{trader.ownerName ?? '-'}</TableCell>}
                      {columnVisibility.ownerProfileLink && <TableCell>{trader.ownerProfileLink ? <a href={trader.ownerProfileLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1"><ExternalLink className="h-4 w-4"/>Profile</a> : '-'}</TableCell>}
                      {columnVisibility.mainCategory && <TableCell className="truncate max-w-40">{trader.mainCategory ?? null}</TableCell>}
                      {columnVisibility.categories && <TableCell className="truncate max-w-48">{trader.categories ?? '-'}</TableCell>}
                      {columnVisibility.workdayTiming && <TableCell className="truncate max-w-40">{trader.workdayTiming ?? '-'}</TableCell>}
                      {columnVisibility.address && <TableCell className="truncate max-w-48">{trader.address ?? '-'}</TableCell>}
                      {columnVisibility.notes && <TableCell className="truncate max-w-48">{trader.notes ?? '-'}</TableCell>}
                      {columnVisibility.estimatedAnnualRevenue && <TableCell className="text-right whitespace-nowrap">{formatCurrency(trader.estimatedAnnualRevenue)}</TableCell>}
                      {columnVisibility.estimatedCompanyValue && <TableCell className="text-right whitespace-nowrap">{formatCurrency(trader.estimatedCompanyValue)}</TableCell>}
                      {columnVisibility.employeeCount && <TableCell className="text-center">{trader.employeeCount ?? '-'}</TableCell>}

                      <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                          <EditTraderDialog trader={trader} onUpdateTrader={onUpdate} />
                          <DeleteTraderDialog traderName={trader.name} onDeleteTrader={() => onDelete(trader.id)} />
                          </div>
                      </TableCell>
                      </TableRow>
                  ))
                  ) : (
                  <TableRow>
                      <TableCell
                      colSpan={Object.values(columnVisibility).filter(v => v).length + 2}
                      className="h-24 text-center"
                      >
                      No results found.
                      </TableCell>
                  </TableRow>
                  )}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
            {selectedRowCount} of {sortedTraders.length} row(s) selected.
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
