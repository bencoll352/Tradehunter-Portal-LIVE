
"use client";

import type { Trader, BranchId, ParsedTraderData } from "@/types";
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
import { EditTraderDialog } from "./EditTraderDialog";
import { DeleteTraderDialog } from "./DeleteTraderDialog";
import { AddTraderDialog } from "./AddTraderDialog";
import { BulkAddTradersDialog } from "./BulkAddTradersDialog";
import { ArrowUpDown, Search, Users, FileWarning, Link as LinkIcon, ExternalLink } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import type { traderFormSchema } from "./TraderForm";

const ITEMS_PER_PAGE = 5;

type SortKey = keyof Pick<Trader, 'name' | 'totalSales' | 'tradesMade' | 'status' | 'lastActivity' | 'description' | 'rating' | 'ownerName' | 'mainCategory' | 'address'>;

interface TraderTableClientProps {
  initialTraders: Trader[];
  branchId: BranchId;
  onAdd: (values: z.infer<typeof traderFormSchema>) => Promise<Trader | null>;
  onUpdate: (traderId: string, values: z.infer<typeof traderFormSchema>) => Promise<Trader | null>;
  onDelete: (traderId: string) => Promise<boolean>;
  onBulkAdd: (traders: ParsedTraderData[]) => Promise<Trader[] | null>;
}

export function TraderTableClient({ initialTraders, branchId: propBranchId, onAdd, onUpdate, onDelete, onBulkAdd }: TraderTableClientProps) {
  const [traders, setTraders] = useState<Trader[]>(initialTraders);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const branchId = propBranchId;

  useEffect(() => {
    setTraders(initialTraders);
  }, [initialTraders]);

  const filteredTraders = useMemo(() => {
    let searchableTraders = [...traders];
    if (searchTerm) {
      searchableTraders = searchableTraders.filter(trader =>
        trader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trader.description && trader.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (trader.mainCategory && trader.mainCategory.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (trader.address && trader.address.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (sortConfig !== null) {
      searchableTraders.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortConfig.direction === 'ascending' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
        }
        // For dates (lastActivity) or other types, direct comparison might be fine
        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return searchableTraders;
  }, [traders, searchTerm, sortConfig]);

  const totalPages = Math.ceil(filteredTraders.length / ITEMS_PER_PAGE);
  const paginatedTraders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTraders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTraders, currentPage]);

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };
  
  const handleAddTrader = async (values: z.infer<typeof traderFormSchema>) => {
    const newTrader = await onAdd(values);
    if (newTrader) {
      setTraders(prev => [...prev, newTrader].sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
      toast({ title: "Success", description: "Trader added successfully." });
    } else {
      toast({ variant: "destructive", title: "Error", description: "Failed to add trader." });
    }
  };

  const handleUpdateTrader = async (traderId: string, values: z.infer<typeof traderFormSchema>) => {
    const updatedTrader = await onUpdate(traderId, values);
    if (updatedTrader) {
      setTraders(prev => prev.map(t => t.id === traderId ? updatedTrader : t).sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
      // Toast for specific status update handled in handleStatusToggle
      if (values.name) { // Avoid double toast if only status changed
          toast({ title: "Success", description: "Trader updated successfully." });
      }
    } else {
      toast({ variant: "destructive", title: "Error", description: "Failed to update trader." });
    }
    return updatedTrader; // Return for chaining if needed
  };

  const handleStatusToggle = async (trader: Trader) => {
    const newStatus = trader.status === "Active" ? "Inactive" : "Active";
    const formValues: z.infer<typeof traderFormSchema> = {
      name: trader.name,
      totalSales: trader.totalSales,
      tradesMade: trader.tradesMade,
      status: newStatus,
      description: trader.description || "",
      rating: trader.rating, // Keep as number | undefined
      website: trader.website || "",
      phone: trader.phone || "",
      address: trader.address || "",
      mainCategory: trader.mainCategory || "",
      ownerName: trader.ownerName || "",
      ownerProfileLink: trader.ownerProfileLink || "",
      categories: trader.categories || "",
      workdayTiming: trader.workdayTiming || "",
      closedOn: trader.closedOn || "",
      reviewKeywords: trader.reviewKeywords || "",
    };
    const updated = await handleUpdateTrader(trader.id, formValues);
    if (updated) {
        toast({ title: "Status Updated", description: `${trader.name}'s status changed to ${newStatus}.` });
    }
  };

  const handleDeleteTrader = async (traderId: string) => {
    const success = await onDelete(traderId);
    if (success) {
      setTraders(prev => prev.filter(t => t.id !== traderId));
      toast({ title: "Success", description: "Trader deleted successfully." });
    } else {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete trader." });
    }
  };

  const handleBulkAddTraders = async (tradersToCreate: ParsedTraderData[]) => {
    const newTraders = await onBulkAdd(tradersToCreate);
    if (newTraders && newTraders.length > 0) {
      setTraders(prev => [...prev, ...newTraders].sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
    } else if (newTraders === null) {
      toast({ variant: "destructive", title: "Error", description: "Failed to bulk add traders (action returned null)." });
    }
    return newTraders;
  };

  const SortableHeader = ({ sortKey, label }: { sortKey: SortKey, label: string }) => (
    <TableHead onClick={() => requestSort(sortKey)} className="cursor-pointer hover:bg-muted/50 whitespace-nowrap">
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      </div>
    </TableHead>
  );

  const renderCellContent = (content: string | number | undefined | null, maxChars = 30) => {
    const stringContent = String(content || '');
    if (stringContent.length > maxChars) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="truncate block max-w-[${maxChars}ch]">{stringContent.substring(0, maxChars)}...</span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs break-words">{stringContent}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return stringContent || <span className="text-muted-foreground/50">-</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
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
        <div className="flex gap-2 flex-wrap">
          <BulkAddTradersDialog branchId={branchId} onBulkAddTraders={(currentBranchIdIgnore, traders) => handleBulkAddTraders(traders)} />
          <AddTraderDialog onAddTrader={handleAddTrader} branchId={branchId} />
        </div>
      </div>

      {paginatedTraders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg">
          <FileWarning className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-muted-foreground">No Traders Found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Try adjusting your search or add a new trader." : "Add a new trader or use bulk upload to get started."}
          </p>
        </div>
      ) : (
      <div className="rounded-md border shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader sortKey="name" label="Name" />
              <SortableHeader sortKey="totalSales" label="Total Sales" />
              <SortableHeader sortKey="status" label="Status" />
              <SortableHeader sortKey="lastActivity" label="Last Activity" />
              <SortableHeader sortKey="description" label="Description" />
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
              <TableRow key={trader.id}>
                <TableCell className="font-medium whitespace-nowrap">{renderCellContent(trader.name, 20)}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(trader.totalSales)}
                </TableCell>
                <TableCell>
                   <Button
                      variant="ghost"
                      size="sm"
                      className={`p-1 h-auto hover:opacity-80 ${
                        trader.status === 'Active' ? 'hover:bg-green-500/30' : 'hover:bg-red-500/30'
                      }`}
                      onClick={() => handleStatusToggle(trader)}
                    >
                    <Badge variant={trader.status === 'Active' ? 'default' : 'secondary'}
                      className={`${trader.status === 'Active' ? 'bg-green-500/20 text-green-700 border-green-500/30' : 'bg-red-500/10 text-red-700 border-red-500/20'} cursor-pointer`}
                    >
                      {trader.status}
                    </Badge>
                  </Button>
                </TableCell>
                <TableCell className="whitespace-nowrap">{format(parseISO(trader.lastActivity), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{renderCellContent(trader.description)}</TableCell>
                <TableCell className="whitespace-nowrap text-center">{trader.tradesMade}</TableCell>
                <TableCell className="whitespace-nowrap text-center">{trader.rating ? trader.rating.toFixed(1) : <span className="text-muted-foreground/50">-</span>}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {trader.website ? (
                    <a href={trader.website.startsWith('http') ? trader.website : `https://${trader.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      Visit <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : <span className="text-muted-foreground/50">-</span>}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {trader.phone ? (
                    <a href={`tel:${trader.phone}`} className="text-primary hover:underline">
                      {trader.phone}
                    </a>
                  ) : <span className="text-muted-foreground/50">-</span>}
                </TableCell>
                <TableCell>{renderCellContent(trader.ownerName, 20)}</TableCell>
                <TableCell>{renderCellContent(trader.mainCategory, 15)}</TableCell>
                <TableCell>{renderCellContent(trader.categories, 20)}</TableCell>
                <TableCell>{renderCellContent(trader.workdayTiming, 20)}</TableCell>
                <TableCell>{renderCellContent(trader.address, 25)}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {trader.ownerProfileLink ? (
                    <a href={trader.ownerProfileLink.startsWith('http') ? trader.ownerProfileLink : `https://${trader.ownerProfileLink}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      Profile <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : <span className="text-muted-foreground/50">-</span>}
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

// Mini Tooltip components for use within the table for truncated text
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
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Ensure TooltipPrimitive is imported if not already (it should be from lucide usually or radix)
// For this specific case, we'll assume Tooltip related imports are handled if useToast uses it.
// If not, we might need: import * as TooltipPrimitive from "@radix-ui/react-tooltip";
// And import cn from "@/lib/utils";
// For now, this structure should work provided those are available in the scope or via useToast.
// A cleaner way if not, is to import them directly:
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

