
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
import { Badge } from "@/components/ui/badge";
import type { Trader, BaseBranchId, ParsedTraderData, BulkDeleteTradersResult, TraderStatus } from "@/types";
import { ArrowUpDown, Trash2, SlidersHorizontal, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import type { z } from "zod";
import type { traderFormSchema } from "./TraderForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type TraderFormValues = z.infer<typeof traderFormSchema>;
type SortKey = keyof Trader | 'estimatedAnnualRevenue' | 'rating' | 'lastActivity' | 'name' | 'status';
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
  isLoading
}: TraderTableClientProps) {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({ key: "lastActivity", direction: "descending" });
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    ownerProfileLink: false,
    workdayTiming: false,
    address: false,
    description: false,
    notes: false,
    categories: false,
    reviews: false,
    callBackDate: false,
    estimatedCompanyValue: true,
    employeeCount: true,
  });

  const { toast } = useToast();

  const sortedTraders = useMemo(() => {
    let sortableItems = [...traders];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            if (sortConfig.key === 'lastActivity' || sortConfig.key === 'callBackDate') {
                const dateA = new Date(aValue).getTime();
                const dateB = new Date(bValue).getTime();
                return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
            }
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
      <TableHead className="cursor-pointer" onClick={() => requestSort(sortKey)}>
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

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="w-full">
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
        <div className="flex items-center gap-2 mt-2 sm:mt-0 self-end">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.keys(columnVisibility).map((columnId) => (
                <DropdownMenuCheckboxItem
                  key={columnId}
                  className="capitalize"
                  checked={columnVisibility[columnId]}
                  onCheckedChange={(value) =>
                    setColumnVisibility(prev => ({...prev, [columnId]: !!value}))
                  }
                >
                  {columnId.replace(/([A-Z])/g, ' $1')}
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
          <BulkAddTradersDialog
            branchId={branchId}
            onBulkAddTraders={onBulkAdd}
          />
          <AddTraderDialog 
            onAddTrader={onAdd} 
            branchId={branchId}
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead padding="checkbox">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                  onChange={(e) => toggleAllRowsSelected(e.target.checked)}
                  checked={sortedTraders.length > 0 && selectedRowCount === sortedTraders.length}
                />
              </TableHead>
              <SortableHeader label="Name" sortKey="name" />
              <SortableHeader label="Est. Annual Revenue" sortKey="estimatedAnnualRevenue" />
              {columnVisibility.estimatedCompanyValue && <SortableHeader label="Est. Company Value" sortKey="estimatedCompanyValue" />}
              {columnVisibility.employeeCount && <SortableHeader label="Employees" sortKey="employeeCount" />}
              <SortableHeader label="Status" sortKey="status" />
              <SortableHeader label="Last Activity" sortKey="lastActivity" />
              <TableHead>Website</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTraders.length > 0 ? (
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
                  <TableCell className="font-medium">{trader.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(trader.estimatedAnnualRevenue)}</TableCell>
                  {columnVisibility.estimatedCompanyValue && <TableCell className="text-right">{formatCurrency(trader.estimatedCompanyValue)}</TableCell>}
                  {columnVisibility.employeeCount && <TableCell className="text-center">{trader.employeeCount ?? '-'}</TableCell>}
                  <TableCell>
                    <Badge variant={trader.status === 'Call-Back' ? 'destructive' : 'secondary'}>{trader.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {trader.lastActivity ? format(parseISO(trader.lastActivity), "dd/MM/yyyy") : '-'}
                  </TableCell>
                  <TableCell>
                    {trader.website ? <a href={trader.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a> : '-'}
                  </TableCell>
                  <TableCell>{trader.ownerName ?? '-'}</TableCell>
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
                  colSpan={10}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {selectedRowCount} of {sortedTraders.length} row(s) selected.
        </div>
      </div>
    </div>
  );
}
