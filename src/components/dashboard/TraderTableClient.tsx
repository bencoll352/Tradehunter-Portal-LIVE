
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
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
import type { Trader, BaseBranchId, ParsedTraderData, BulkDeleteTradersResult } from "@/types";
import { ArrowUpDown, ChevronDown, Trash2, Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import type { z } from "zod";
import type { traderFormSchema } from "./TraderForm";

type TraderFormValues = z.infer<typeof traderFormSchema>;

interface TraderTableClientProps {
  initialTraders: Trader[];
  branchId: BaseBranchId;
  allBranchTraders: Trader[]; // Used for duplicate checking in AddTraderDialog
  onAdd: (values: TraderFormValues) => Promise<boolean>;
  onUpdate: (traderId: string, values: TraderFormValues) => Promise<boolean>;
  onDelete: (traderId: string) => Promise<boolean>;
  onBulkAdd: (traders: ParsedTraderData[]) => Promise<{ data: Trader[] | null; error: string | null; }>;
  onBulkDelete: (traderIds: string[]) => Promise<BulkDeleteTradersResult>;
}

export function TraderTableClient({
  initialTraders,
  branchId,
  allBranchTraders,
  onAdd,
  onUpdate,
  onDelete,
  onBulkAdd,
  onBulkDelete,
}: TraderTableClientProps) {
  const [traders, setTraders] = useState(initialTraders);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "lastActivity", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    // Hide columns by default, can be toggled
    ownerProfileLink: false,
    workdayTiming: false,
    categories: false,
    address: false,
    description: false,
    notes: false,
  });
  const [rowSelection, setRowSelection] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    setTraders(initialTraders);
  }, [initialTraders]);

  const handleAddTrader = async (values: TraderFormValues): Promise<boolean> => {
    return await onAdd(values);
  };

  const handleUpdateTrader = async (traderId: string, values: TraderFormValues): Promise<boolean> => {
    return await onUpdate(traderId, values);
  };

  const handleDeleteTrader = async (traderId: string): Promise<boolean> => {
    const success = await onDelete(traderId);
    if (success) {
      toast({ title: "Success", description: "Trader deleted." });
    }
    return success;
  };
  
  const handleBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection);
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
    setRowSelection({}); // Clear selection after operation
  };
  
  const handleBulkAddTraders = async (branchId: BaseBranchId, traders: ParsedTraderData[]) => {
      // This function is now passed directly from props, so we just call it.
      // The parent (DashboardClientPageContent) will handle the toast and state refresh logic.
      return await onBulkAdd(traders);
  };

  const columns: ColumnDef<Trader>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            className="rounded border-gray-300 text-primary focus:ring-primary"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(value) => table.toggleAllPageRowsSelected(!!value.target.checked)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
           <input
            type="checkbox"
            className="rounded border-gray-300 text-primary focus:ring-primary"
            checked={row.getIsSelected()}
            onChange={(value) => row.toggleSelected(!!value.target.checked)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          let badgeVariant: "default" | "secondary" | "destructive" = "secondary";
          if (status === "Active") badgeVariant = "default";
          if (status === "Call-Back") return <Badge variant="destructive"><Flame className="mr-1 h-3 w-3" />Hot Lead</Badge>
          return <Badge variant={badgeVariant}>{status}</Badge>;
        },
      },
       {
        accessorKey: "callBackDate",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Call-Back Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = row.getValue("callBackDate") as string;
          return date ? format(parseISO(date), "dd/MM/yyyy") : <span className="text-muted-foreground">-</span>;
        },
      },
      {
        accessorKey: "lastActivity",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Activity
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = row.getValue("lastActivity") as string;
          try {
            return date ? format(parseISO(date), "dd/MM/yyyy") : <span className="text-muted-foreground">-</span>;
          } catch(e) {
            return <span className="text-destructive text-xs">Invalid Date</span>
          }
        },
      },
      { accessorKey: "rating", header: "Rating" },
      { accessorKey: "website", header: "Website" },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "address", header: "Address" },
      { accessorKey: "ownerName", header: "Owner Name" },
      { accessorKey: "mainCategory", header: "Main Category" },
      { accessorKey: "categories", header: "Categories" },
      { accessorKey: "workdayTiming", header: "Workday Timing" },
      { accessorKey: "ownerProfileLink", header: "Owner Profile Link" },
      { accessorKey: "description", header: "Description" },
      { accessorKey: "notes", header: "Notes" },
      {
        id: "actions",
        cell: ({ row }) => {
          const trader = row.original;
          return (
            <div className="flex items-center justify-end">
              <EditTraderDialog trader={trader} onUpdateTrader={(id, values) => handleUpdateTrader(id, values)} />
              <DeleteTraderDialog traderName={trader.name} onDeleteTrader={() => handleDeleteTrader(trader.id)} />
            </div>
          );
        },
      },
    ],
    [handleDeleteTrader, handleUpdateTrader]
  );

  const table = useReactTable({
    data: traders,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter traders by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

           {Object.keys(rowSelection).length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({Object.keys(rowSelection).length})
            </Button>
          )}

          <BulkAddTradersDialog
            branchId={branchId}
            existingTraders={allBranchTraders}
            onBulkAddTraders={(branchId, traders) => handleBulkAddTraders(branchId, traders)}
          />

          <AddTraderDialog 
            onAddTrader={handleAddTrader} 
            branchId={branchId}
            existingTraders={allBranchTraders}
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
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
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
