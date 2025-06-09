"use client";

import * as React from "react";
import { memo, useCallback, useMemo } from "react";
import {
  CaretSortIcon,
  ChevronDownIcon,
  DotsHorizontalIcon,
} from "@radix-ui/react-icons";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FiTrash } from "react-icons/fi";
import moment from "moment";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FormattedUserTable } from "@/types/services/user";
import {
  deleteAccountUser,
  deleteMultipleAccountUsers,
} from "@/features/dashboard/actions/service-users";
import { useRouter } from "next/navigation";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { toast } from "sonner";

interface UsersTableProps {
  users: FormattedUserTable[];
  params: { serviceId: string; accountId: string };
}

function UsersTable({ users, params }: UsersTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      id: false,
      full_name: true,
      phone_number: true,
      description: false,
      starting_date: true,
      ending_date: true,
      subscriptionDuration: true, // Total subscription duration in days
      subscription_status: true,
      actions: true,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDeleteSingleUser, setIsDeleteSingleUser] = React.useState(true);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [usersToDelete, setUsersToDelete] = React.useState<string[]>([]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleDeleteUser = useCallback(
    async (userId: string) => {
      try {
        const { success } = await deleteAccountUser(
          params.serviceId,
          params.accountId,
          userId
        );
        if (success) {
          toast.success("User deleted successfully");
          router.refresh();
        } else {
          toast.error("Error deleting user");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Error deleting user");
      }
    },
    [params.serviceId, params.accountId, router]
  );

  const handleDeleteMultipleUsers = useCallback(
    async (userIds: string[]) => {
      try {
        // Validate that we have user IDs to delete
        if (!userIds || userIds.length === 0) {
          toast.error("No users selected for deletion");
          return;
        }

        const { success } = await deleteMultipleAccountUsers(
          params.serviceId,
          params.accountId,
          userIds
        );
        if (success) {
          toast.success(
            `${userIds.length} user${
              userIds.length > 1 ? "s" : ""
            } deleted successfully`
          );
          router.refresh();
        } else {
          toast.error("Error deleting users");
        }
      } catch (error) {
        console.error("Error deleting multiple users:", error);
        toast.error("Error deleting users");
      }
    },
    [params.serviceId, params.accountId, router]
  );

  // Memoize columns definition
  const columns = useMemo<ColumnDef<FormattedUserTable>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: true,
      },
      {
        accessorKey: "id",
        header: "User ID",
        cell: ({ row }) => <div>{row.getValue("id")}</div>,
        enableHiding: true,
      },
      {
        accessorKey: "full_name",
        header: "Full Name",
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue("full_name")}</div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "phone_number",
        header: "Phone Number",
        cell: ({ row }) => (
          <div>{row.getValue("phone_number") || "Not provided"}</div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "starting_date",
        header: "Starting Date",
        cell: ({ row }) => <div>{row.getValue("starting_date")}</div>,
        enableSorting: false,
      },
      {
        accessorKey: "ending_date",
        header: "Ending Date",
        cell: ({ row }) => <div>{row.getValue("ending_date")}</div>,
        enableSorting: false,
      },
      {
        accessorKey: "subscriptionDuration",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Duration
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>{row.getValue("subscriptionDuration")} days</div>
        ),
        sortingFn: "basic",
        enableSorting: true,
      },
      {
        accessorKey: "subscription_status",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const status = row.getValue("subscription_status");
          const colorClass =
            status === "Active"
              ? "bg-green-100 text-green-800 p-1 flex items-center justify-center rounded-md"
              : "bg-red-100 text-red-800 p-1 flex items-center justify-center rounded-md";
          return (
            <div className={`capitalize ${colorClass}`}>
              {row.getValue("subscription_status")}
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const statusOrder: { [key: string]: number } = {
            Active: 1,
            Expired: 2,
          };
          return (
            statusOrder[rowA.original.subscription_status || "Expired"] -
            statusOrder[rowB.original.subscription_status || "Expired"]
          );
        },
        enableSorting: true,
      },
      {
        id: "actions",
        enableHiding: true,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <DotsHorizontalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    router.push(
                      `/services/${params.serviceId}/${params.accountId}/add-user?userId=${user.id}`
                    )
                  }
                >
                  Edit user
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setIsDeleteDialogOpen(true);
                    setIsDeleteSingleUser(true);
                    setUserId(user.id ?? null);
                  }}
                >
                  Delete user
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [params.serviceId, params.accountId, router]
  );

  // Memoize processed users data
  const processedUsers = useMemo(() => {
    return users.map((user) => ({
      ...user,
      subscription_status: moment(user.ending_date).isAfter(moment())
        ? "Active"
        : "Expired",
    }));
  }, [users]);

  // Memoize table instance
  const table = useReactTable({
    data: processedUsers,
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

  const selectedRowCount = Object.keys(table.getSelectedRowModel().rows).length;

  return (
    <div className="w-full">
      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onChange={setIsDeleteDialogOpen}
        deleteUser={handleDeleteUser}
        deleteUsers={handleDeleteMultipleUsers}
        isDeleteSingleUser={isDeleteSingleUser}
        userId={userId}
        userIds={usersToDelete}
      />
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by name..."
          value={
            (table.getColumn("full_name")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("full_name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
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
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            setIsDeleteDialogOpen(true);
            setIsDeleteSingleUser(false);
            setUsersToDelete(
              Object.values(table.getSelectedRowModel().rows)
                .map((row) => row.original.id)
                .filter((id): id is string => Boolean(id))
            );
          }}
          disabled={selectedRowCount === 0}
          className="ml-4"
        >
          <FiTrash className="h-5 w-5" />
        </Button>
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

export default memo(UsersTable);
