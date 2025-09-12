
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";


type TraderFormValues = z.infer<typeof traderFormSchema>;

interface TraderTableClientProps {
  initialTraders: Trader[];
  branchId: BaseBranchId;
  onAdd: (values: TraderFormValues) => Promise<boolean>;
  onUpdate: (traderId: string, values: TraderFormValues) => Promise<boolean>;
  onDelete: (traderId: string) => Promise<boolean>;
  onBulkAdd: (traders: ParsedTraderData[]) => Promise<{ data: Trader[] | null; error: string | null; }>;
  onBulkDelete: (traderIds: string[]) => Promise<BulkDeleteTradersResult>;
}

export function TraderTableClient({
  initialTraders,
  branchId,
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
    // Hide less important columns by default
    ownerProfileLink: false,
    workdayTiming: false,
    address: false,
    description: false,
    notes: false,
    categories: false,
    reviews: false,
    callBackDate: false,
  });
  const [rowSelection, setRowSelection] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    setTraders(initialTraders);
  }, [initialTraders]);
  
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
    setRowSelection({});
  };

  const mainCategories = useMemo(() => {
    const categories = new Set(traders.map(t => t.mainCategory).filter(Boolean));
    return Array.from(categories) as string[];
  }, [traders]);
  
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
        accessorKey: "estimatedAnnualRevenue",
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Est. Annual Revenue
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("estimatedAnnualRevenue"));
          if (isNaN(amount)) return <span className="text-muted-foreground">-</span>;
          const formatted = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
          return <div className="text-right font-medium">{formatted}</div>;
        },
      },
      {
        accessorKey: "estimatedCompanyValue",
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Est. Company Value
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("estimatedCompanyValue"));
          if (isNaN(amount)) return <span className="text-muted-foreground">-</span>;
          const formatted = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
          return <div className="text-right font-medium">{formatted}</div>;
        },
      },
      {
        accessorKey: "employeeCount",
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Employees
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="text-center">{row.getValue("employeeCount") ?? <span className="text-muted-foreground">-</span>}</div>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          if (status === "Call-Back") return <Badge className="bg-orange-500 hover:bg-orange-500/80 text-white"><Flame className="mr-1 h-3 w-3" />Hot Lead</Badge>
          if (status === 'New Lead') return <Badge className="bg-blue-500 hover:bg-blue-500/80 text-white">New Lead</Badge>
          if (status === "Active") return <Badge variant="default">Active</Badge>;
          return <Badge variant="secondary">{status}</Badge>;
        },
      },
       {
        accessorKey: "lastActivity",
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Last Activity
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const dateValue = row.getValue("lastActivity");
          if (typeof dateValue !== 'string') return <span className="text-destructive text-xs">Invalid Date</span>;
          try {
            const date = parseISO(dateValue);
            // Check for a very old or invalid date, which might indicate a problem.
            if (date.getFullYear() < 1971) {
                return <span className="text-muted-foreground text-xs">No activity</span>;
            }
            return format(date, "dd/MM/yyyy");
          } catch(e) {
            return <span className="text-destructive text-xs">Invalid Date</span>
          }
        },
      },
      { accessorKey: "description", header: "Description" },
      { accessorKey: "notes", header: "Notes" },
      { accessorKey: "rating", header: "Rating" },
      {
        accessorKey: "website",
        header: "Website",
        cell: ({ row }) => {
            const website = row.getValue("website") as string | undefined;
            if (!website) return <span className="text-muted-foreground">-</span>;
            return <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a>
        }
      },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "ownerName", header: "Owner Name" },
      { accessorKey: "mainCategory", header: "Main Category" },
      { accessorKey: "categories", header: "Categories" },
      {
        id: "actions",
        cell: ({ row }) => {
          const trader = row.original;
          return (
            <div className="flex items-center justify-end">
              <EditTraderDialog trader={trader} onUpdateTrader={(id, values) => onUpdate(id, values)} />
              <DeleteTraderDialog traderName={trader.name} onDeleteTrader={() => onDelete(trader.id)} />
            </div>
          );
        },
      },
    ],
    [onDelete, onUpdate]
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
    initialState: {
        pagination: {
            pageSize: 20,
        },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4 gap-2">
        <div className="flex items-center gap-2">
            <Input
            placeholder="Filter by name..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-xs"
            />
            <Select
              value={(table.getColumn('mainCategory')?.getFilterValue() as string) ?? 'all'}
              onValueChange={(value) => {
                if (value === 'all') {
                  table.getColumn('mainCategory')?.setFilterValue(undefined);
                } else {
                  table.getColumn('mainCategory')?.setFilterValue(value);
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
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
