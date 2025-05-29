
"use client";

import type { Trader, BranchId, ParsedTraderData } from "@/types";
import { useState, useMemo, useEffect } from "react";
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
import { ArrowUpDown, Search, Users, FileWarning } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { enGB } from 'date-fns/locale'; // For UK date formatting if needed for specific cases
import { useToast } from "@/hooks/use-toast";
import type { z } from "zod";
import type { traderFormSchema } from "./TraderForm";

const ITEMS_PER_PAGE = 5;

type SortKey = keyof Pick<Trader, 'name' | 'totalSales' | 'tradesMade' | 'status' | 'lastActivity'>;

interface TraderTableClientProps {
  initialTraders: Trader[];
  branchId: BranchId;
  onAdd: (values: z.infer<typeof traderFormSchema>) => Promise<Trader | null>; // Removed branchId from here, will use state
  onUpdate: (traderId: string, values: z.infer<typeof traderFormSchema>) => Promise<Trader | null>; // Removed branchId
  onDelete: (traderId: string) => Promise<boolean>; // Removed branchId
  onBulkAdd: (traders: ParsedTraderData[]) => Promise<Trader[] | null>; // Removed branchId
}

export function TraderTableClient({ initialTraders, branchId: propBranchId, onAdd, onUpdate, onDelete, onBulkAdd }: TraderTableClientProps) {
  const [traders, setTraders] = useState<Trader[]>(initialTraders);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  // Use propBranchId passed down from DashboardClientPageContent which gets it from localStorage
  const branchId = propBranchId;


  useEffect(() => {
    setTraders(initialTraders);
  }, [initialTraders]);

  const filteredTraders = useMemo(() => {
    let searchableTraders = [...traders];
    if (searchTerm) {
      searchableTraders = searchableTraders.filter(trader =>
        trader.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig !== null) {
      searchableTraders.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
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
  };
  
  const handleAddTrader = async (values: z.infer<typeof traderFormSchema>) => {
    const newTrader = await onAdd(values); // branchId is handled by the parent/action
    if (newTrader) {
      setTraders(prev => [...prev, newTrader].sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
      toast({ title: "Success", description: "Trader added successfully." });
    } else {
      toast({ variant: "destructive", title: "Error", description: "Failed to add trader." });
    }
  };

  const handleUpdateTrader = async (traderId: string, values: z.infer<typeof traderFormSchema>) => {
    const updatedTrader = await onUpdate(traderId, values); // branchId is handled by the parent/action
    if (updatedTrader) {
      setTraders(prev => prev.map(t => t.id === traderId ? updatedTrader : t));
      toast({ title: "Success", description: "Trader updated successfully." });
    } else {
      toast({ variant: "destructive", title: "Error", description: "Failed to update trader." });
    }
  };

  const handleDeleteTrader = async (traderId: string) => {
    const success = await onDelete(traderId); // branchId is handled by the parent/action
    if (success) {
      setTraders(prev => prev.filter(t => t.id !== traderId));
      toast({ title: "Success", description: "Trader deleted successfully." });
    } else {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete trader." });
    }
  };

  const handleBulkAddTraders = async (tradersToCreate: ParsedTraderData[]) => {
    // The onBulkAdd function passed from DashboardClientPageContent already includes branchId
    const newTraders = await onBulkAdd(tradersToCreate);
    if (newTraders && newTraders.length > 0) {
      setTraders(prev => [...prev, ...newTraders].sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
      // Toast is handled in BulkAddTradersDialog for more specific messages
    } else if (newTraders === null) {
      toast({ variant: "destructive", title: "Error", description: "Failed to bulk add traders (action returned null)." });
    }
    return newTraders; // Return to dialog for its own toast logic
  };


  const SortableHeader = ({ sortKey, label }: { sortKey: SortKey, label: string }) => (
    <TableHead onClick={() => requestSort(sortKey)} className="cursor-pointer hover:bg-muted/50">
      <div className="flex items-center gap-2">
        {label}
        <ArrowUpDown className="h-4 w-4 opacity-50" />
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search traders by name..."
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
      <div className="rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader sortKey="name" label="Name" />
              <TableHead>Total Sales</TableHead> {/* Changed to non-sortable to apply UK currency */}
              <SortableHeader sortKey="tradesMade" label="Trades Made" />
              <SortableHeader sortKey="status" label="Status" />
              <TableHead>Last Activity</TableHead> {/* Changed for UK date format */}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTraders.map((trader) => (
              <TableRow key={trader.id}>
                <TableCell className="font-medium">{trader.name}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(trader.totalSales)}
                </TableCell>
                <TableCell>{trader.tradesMade}</TableCell>
                <TableCell>
                  <Badge variant={trader.status === 'Active' ? 'default' : 'secondary'}
                    className={trader.status === 'Active' ? 'bg-green-500/20 text-green-700 border-green-500/30' : 'bg-red-500/10 text-red-700 border-red-500/20'}
                  >
                    {trader.status}
                  </Badge>
                </TableCell>
                <TableCell>{format(parseISO(trader.lastActivity), 'dd/MM/yyyy')}</TableCell>
                <TableCell className="flex gap-1">
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
