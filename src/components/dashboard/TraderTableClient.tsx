
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
import { BulkAddTradersDialog } from "./BulkAddTradersDialog"; // Added import
import { ArrowUpDown, Search, Users, FileWarning } from "lucide-react";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import type { z } from "zod";
import type { traderFormSchema } from "./TraderForm";

const ITEMS_PER_PAGE = 5;

type SortKey = keyof Pick<Trader, 'name' | 'totalSales' | 'tradesMade' | 'status' | 'lastActivity'>;

interface TraderTableClientProps {
  initialTraders: Trader[];
  branchId: BranchId;
  onAdd: (branchId: BranchId, values: z.infer<typeof traderFormSchema>) => Promise<Trader | null>;
  onUpdate: (branchId: BranchId, traderId: string, values: z.infer<typeof traderFormSchema>) => Promise<Trader | null>;
  onDelete: (branchId: BranchId, traderId: string) => Promise<boolean>;
  onBulkAdd: (branchId: BranchId, traders: ParsedTraderData[]) => Promise<Trader[] | null>; // Added prop
}

export function TraderTableClient({ initialTraders, branchId, onAdd, onUpdate, onDelete, onBulkAdd }: TraderTableClientProps) {
  const [traders, setTraders] = useState<Trader[]>(initialTraders);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

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
        // Handle undefined or null for sortable keys if necessary, though current keys are generally defined
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
    const newTrader = await onAdd(branchId, values);
    if (newTrader) {
      setTraders(prev => [...prev, newTrader]);
      toast({ title: "Success", description: "Trader added successfully." });
    } else {
      toast({ variant: "destructive", title: "Error", description: "Failed to add trader." });
    }
  };

  const handleUpdateTrader = async (traderId: string, values: z.infer<typeof traderFormSchema>) => {
    const updatedTrader = await onUpdate(branchId, traderId, values);
    if (updatedTrader) {
      setTraders(prev => prev.map(t => t.id === traderId ? updatedTrader : t));
      toast({ title: "Success", description: "Trader updated successfully." });
    } else {
      toast({ variant: "destructive", title: "Error", description: "Failed to update trader." });
    }
  };

  const handleDeleteTrader = async (traderId: string) => {
    const success = await onDelete(branchId, traderId);
    if (success) {
      setTraders(prev => prev.filter(t => t.id !== traderId));
      toast({ title: "Success", description: "Trader deleted successfully." });
    } else {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete trader." });
    }
  };

  const handleBulkAddTraders = async (currentBranchId: BranchId, tradersToCreate: ParsedTraderData[]) => {
    const newTraders = await onBulkAdd(currentBranchId, tradersToCreate);
    if (newTraders && newTraders.length > 0) {
      setTraders(prev => [...prev, ...newTraders]); // Add new traders to the existing list
      toast({ title: "Success", description: `${newTraders.length} traders added successfully via bulk upload.` });
      return newTraders;
    } else if (newTraders === null) {
      toast({ variant: "destructive", title: "Error", description: "Failed to bulk add traders." });
      return null;
    }
    // If newTraders is an empty array, it means the operation completed but nothing was added, toast handled in dialog.
    return newTraders;
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
        <div className="flex gap-2">
          <BulkAddTradersDialog branchId={branchId} onBulkAddTraders={handleBulkAddTraders} />
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
              <SortableHeader sortKey="totalSales" label="Total Sales" />
              <SortableHeader sortKey="tradesMade" label="Trades Made" />
              <SortableHeader sortKey="status" label="Status" />
              <SortableHeader sortKey="lastActivity" label="Last Activity" />
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTraders.map((trader) => (
              <TableRow key={trader.id}>
                <TableCell className="font-medium">{trader.name}</TableCell>
                <TableCell>${trader.totalSales.toLocaleString()}</TableCell>
                <TableCell>{trader.tradesMade}</TableCell>
                <TableCell>
                  <Badge variant={trader.status === 'Active' ? 'default' : 'secondary'}
                    className={trader.status === 'Active' ? 'bg-green-500/20 text-green-700 border-green-500/30' : 'bg-red-500/10 text-red-700 border-red-500/20'}
                  >
                    {trader.status}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(trader.lastActivity), 'MMM dd, yyyy')}</TableCell>
                <TableCell className="flex gap-1">
                  <EditTraderDialog trader={trader} onUpdateTrader={handleUpdateTrader} />
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
