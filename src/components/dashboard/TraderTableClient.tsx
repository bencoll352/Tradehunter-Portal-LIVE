
"use client";

import * as React from "react"; 
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
import { ArrowUpDown, Search, FileWarning, ExternalLink, Filter, FileText as NotesIcon } from "lucide-react"; // Added NotesIcon
import { format, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import type { traderFormSchema } from "./TraderForm";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const ITEMS_PER_PAGE = 20; 

type SortKey = keyof Pick<Trader, 'name' | 'totalSales' | 'tradesMade' | 'status' | 'lastActivity' | 'description' | 'rating' | 'ownerName' | 'mainCategory' | 'address' | 'notes'>;

interface TraderTableClientProps {
  initialTraders: Trader[];
  branchId: BranchId;
  allBranchTraders: Trader[]; 
  onAdd: (values: z.infer<typeof traderFormSchema>) => Promise<boolean>;
  onUpdate: (traderId: string, values: z.infer<typeof traderFormSchema>) => Promise<boolean>;
  onDelete: (traderId: string) => Promise<boolean>;
  onBulkAdd: (traders: ParsedTraderData[]) => Promise<{ data: Trader[] | null; error: string | null; }>;
}

const CATEGORY_FILTERS = [
  { label: "All Categories", keywords: [] },
  { label: "Carpenters & Joiners", keywords: ["carpenter", "joiner"] },
  { label: "General Builders", keywords: ["builder", "general builder"] },
  { label: "Groundworkers", keywords: ["groundwork"] },
  { label: "Bricklayers & Stonemasons", keywords: ["bricklayer", "stonemason"] },
  { label: "Roofing", keywords: ["roofing", "roofer"] },
  { label: "Interior Design", keywords: ["interior design", "designer"] },
  { label: "Property Maintenance", keywords: ["propertymaintenance", "maintenance"] },
  { label: "Plasterers", keywords: ["plasterer"] },
  { label: "Landscapers", keywords: ["landscap", "garden design", "gardendesign"] },
  { label: "Decking & Fencing", keywords: ["decking", "fencing"] },
  { label: "Patios & Driveways", keywords: ["patio", "driveway", "paving"] },
  { label: "Drywall Installers", keywords: ["drywall", "dry wall"] },
  { label: "Flooring Installers", keywords: ["flooring", "floor installer"] },
  { label: "Residential Construction", keywords: ["residential construction", "house builder"] },
  { label: "Commercial Construction", keywords: ["commercial construction"] },
  { label: "Extensions", keywords: ["extension"] },
  { label: "Handyman / Home Improvements", keywords: ["handyman", "home improvement", "homeimprovement"] },
  { label: "Modular Construction", keywords: ["modular", "prefabricated"] },
  { label: "House Developers", keywords: ["house developer", "developer"] },
  { label: "Painters & Decorators", keywords: ["painter", "decorator"] },
  { label: "Kitchen & Bathroom (K&B)", keywords: ["k and b", "kitchen", "bathroom", "k&b"] },
];


export function TraderTableClient({ initialTraders, branchId: propBranchId, allBranchTraders, onAdd, onUpdate, onDelete, onBulkAdd }: TraderTableClientProps) {
  const [traders, setTraders] = useState<Trader[]>(initialTraders);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>(CATEGORY_FILTERS[0].label);
  const { toast } = useToast();
  const branchId = propBranchId;

  useEffect(() => {
    setTraders(initialTraders);
    setCurrentPage(1); 
  }, [initialTraders]);

  const filteredTraders = useMemo(() => {
    let searchableTraders = [...traders];
    
    if (activeCategoryFilter && activeCategoryFilter !== CATEGORY_FILTERS[0].label) {
      const selectedFilter = CATEGORY_FILTERS.find(f => f.label === activeCategoryFilter);
      if (selectedFilter && selectedFilter.keywords.length > 0) {
        searchableTraders = searchableTraders.filter(trader => {
          const mainCatLower = trader.mainCategory?.toLowerCase() || '';
          const categoriesLower = trader.categories?.toLowerCase() || '';
          return selectedFilter.keywords.some(keyword => 
            mainCatLower.includes(keyword.toLowerCase()) || categoriesLower.includes(keyword.toLowerCase())
          );
        });
      }
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
        (trader.notes && trader.notes.toLowerCase().includes(searchTermLower))
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
          return sortConfig.direction === 'ascending' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
        }
        if (sortConfig.key === 'lastActivity') {
            const dateA = parseISO(valA as string).getTime();
            const dateB = parseISO(valB as string).getTime();
            return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
        }
        
        // Fallback: convert to string for comparison if types are mixed or not directly comparable
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

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const handleCategoryFilterChange = (categoryLabel: string) => {
    setActiveCategoryFilter(categoryLabel);
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
      case 'Active':
        newStatus = 'Inactive';
        break;
      case 'Inactive':
        newStatus = 'Active';
        break;
      case 'Call-Back':
        newStatus = 'Active';
        break;
      case 'New Lead':
        newStatus = 'Active';
        break;
      default:
        newStatus = 'Active'; 
    }

    const formValues: z.infer<typeof traderFormSchema> = {
      name: trader.name,
      totalSales: trader.totalSales,
      tradesMade: trader.tradesMade,
      status: newStatus,
      description: trader.description || "",
      rating: trader.rating, 
      website: trader.website || "",
      phone: trader.phone || "",
      address: trader.address || "",
      mainCategory: trader.mainCategory || "",
      ownerName: trader.ownerName || "",
      ownerProfileLink: trader.ownerProfileLink || "",
      categories: trader.categories || "",
      workdayTiming: trader.workdayTiming || "",
      notes: trader.notes || "", // Include notes
    };
    await onUpdate(trader.id, formValues);
  };

  const handleDeleteTrader = async (traderId: string): Promise<boolean> => {
    const success = await onDelete(traderId);
    if (success) {
      toast({ title: "Success", description: "Trader deleted successfully." });
    }
    return success; 
  };

  const handleBulkAddTraders = async (tradersToCreate: ParsedTraderData[]): Promise<{ data: Trader[] | null; error: string | null; }> => {
    const result = await onBulkAdd(tradersToCreate);
    return result;
  };

  const SortableHeader = ({ sortKey, label }: { sortKey: SortKey, label: string }) => (
    <TableHead onClick={() => requestSort(sortKey)} className="cursor-pointer hover:bg-muted/50 whitespace-nowrap">
      <div className="flex items-center gap-1">
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
            <TooltipContent className="max-w-md break-words">
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
      case 'Active':
        return 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30';
      case 'Inactive':
        return 'bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/30';
      case 'Call-Back':
        return 'bg-amber-500/20 text-amber-700 border-amber-500/30 hover:bg-amber-500/30';
      case 'New Lead':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30 hover:bg-blue-500/30';
      default:
        return 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
    }
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
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filter by Category:</span>
        </div>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-2">
            {CATEGORY_FILTERS.map(filter => (
              <Button
                key={filter.label}
                variant={activeCategoryFilter === filter.label ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryFilterChange(filter.label)}
                className="shrink-0"
              >
                {filter.label}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>


      {paginatedTraders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg">
          <FileWarning className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-muted-foreground">No Traders Found</h3>
          <p className="text-muted-foreground">
            {searchTerm || activeCategoryFilter !== CATEGORY_FILTERS[0].label ? "Try adjusting your search or filter, or add a new trader." : "Add a new trader or use bulk upload to get started."}
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
              <TableRow key={trader.id}>
                <TableCell className="font-medium whitespace-nowrap">{renderCellContent(trader.name, 20)}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {typeof trader.totalSales === 'number' ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(trader.totalSales) : <span className="text-muted-foreground/50">-</span>}
                </TableCell>
                <TableCell>
                   <Button
                      variant="ghost"
                      size="sm"
                      className={`p-1 h-auto hover:opacity-80 ${getStatusBadgeClass(trader.status).split(' ').find(c => c.startsWith('hover:bg-'))}`}
                      onClick={() => handleStatusToggle(trader)}
                    >
                    <Badge variant={'outline'}
                      className={`${getStatusBadgeClass(trader.status)} cursor-pointer`}
                    >
                      {trader.status}
                    </Badge>
                  </Button>
                </TableCell>
                <TableCell className="whitespace-nowrap">{trader.lastActivity ? format(parseISO(trader.lastActivity), 'dd/MM/yyyy') : <span className="text-muted-foreground/50">-</span>}</TableCell>
                <TableCell>{renderCellContent(trader.description)}</TableCell>
                <TableCell>{renderCellContent(trader.notes, 25, true)}</TableCell>
                <TableCell className="whitespace-nowrap text-center">{renderCellContent(trader.tradesMade, 5)}</TableCell>
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
                      {renderCellContent(trader.phone, 15)}
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


    