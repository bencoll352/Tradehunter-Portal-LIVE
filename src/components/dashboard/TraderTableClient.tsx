
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
    ownerProfileLink: false,
    workdayTiming: false,
    categories: false,
    address: false,
    description: false,
    notes: false,
    totalAssets: false,
    estimatedCompanyValue: false,
    estimatedAnnualRevenue: false,
    employeeCount: false,
    reviews: false,
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
        accessorKey: "description",
        header: "Description",
      },
      {
        accessorKey: "reviews",
        header: "Reviews",
      },
      {
        accessorKey: "rating",
        header: "Rating",
      },
      {
        accessorKey: "website",
        header: "Website",
      },
      {
        accessorKey: "phone",
        header: "Phone",
      },
      {
        accessorKey: "ownerName",
        header: "Owner Name",
      },
      {
        accessorKey: "ownerProfileLink",
        header: "Owner Profile",
      },
      {
        accessorKey: "mainCategory",
        header: "Main Category",
      },
      {
        accessorKey: "categories",
        header: "Categories",
      },
      {
        accessorKey: "workdayTiming",
        header: "Workday Timing",
      },
      {
        accessorKey: "address",
        header: "Address",
      },
      {
        accessorKey: "totalAssets",
        header: "Total Assets",
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("totalAssets"));
          if (isNaN(amount)) return "-";
          const formatted = new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: "GBP",
          }).format(amount);
          return <div className="text-right font-medium">{formatted}</div>;
        },
      },
      {
        accessorKey: "estimatedCompanyValue",
        header: "Estimated Company Value",
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("estimatedCompanyValue"));
          if (isNaN(amount)) return "-";
          const formatted = new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: "GBP",
          }).format(amount);
          return <div className="text-right font-medium">{formatted}</div>;
        },
      },
      {
        accessorKey: "estimatedAnnualRevenue",
        header: "Estimated Annual Revenue",
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("estimatedAnnualRevenue"));
          if (isNaN(amount)) return "-";
          const formatted = new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: "GBP",
          }).format(amount);
          return <div className="text-right font-medium">{formatted}</div>;
        },
      },
      {
        accessorKey: "employeeCount",
        header: "Employee Count",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "secondary";
          if (status === "Active") badgeVariant = "default";
          if (status === 'New Lead') badgeVariant = 'outline';
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
          const dateValue = row.getValue("lastActivity");
          if (typeof dateValue !== 'string') {
            return <span className="text-destructive text-xs">Invalid Date</span>;
          }
          try {
            return format(parseISO(dateValue), "dd/MM/yyyy");
          } catch(e) {
            return <span className="text-destructive text-xs">Invalid Date</span>
          }
        },
      },
      {
        accessorKey: "notes",
        header: "Notes",
      },
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
            existingTraders={traders}
            onBulkAddTraders={onBulkAdd}
          />

          <AddTraderDialog 
            onAddTrader={onAdd} 
            branchId={branchId}
            existingTraders={traders}
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
