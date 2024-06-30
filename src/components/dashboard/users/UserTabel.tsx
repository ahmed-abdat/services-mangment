"use client";

import * as React from "react";
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
import { Timestamp } from "firebase/firestore";

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
import { TUserTabel } from "@/types/services/user";
import { deleteAccountUser, deleteAllAccountUsers } from "@/app/action";
import { useRouter } from "next/navigation";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { toast } from "sonner";

const formatDate = (timestamp: Timestamp | null): string => {
  return timestamp
    ? moment(timestamp?.toDate()).format("YYYY/MM/DD")
    : "Invalid date";
};

const updateSubscriptionStatus = (
  timestamp: Timestamp | null
): "Active" | "Expired" => {
  return timestamp && moment().isBefore(timestamp.toDate())
    ? "Active"
    : "Expired";
};

export default function UsersTable({
  users,
  params,
}: {
  users: TUserTabel[];
  params: { serviceId: string; accountId: string };
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      id: false,
      email: true,
      telephone: true,
      description: false,
      startingDate: true,
      endingDate: true,
      reminderDays: true,
      subscriptionStatus: true,
      actions: true,
    });

  const [rowSelection, setRowSelection] = React.useState({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDeleteSingleUser, setIsDeleteSingleUser] = React.useState(true);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [usersToDelete, setUsersToDelete] = React.useState<string[]>([]);
  const router = useRouter();

  const handleEditUser = async (user: TUserTabel) => {
    // Add logic to handle editing a user
    console.log(
      "Edit user:",
      user,
      "Service ID:",
      params.serviceId,
      "Account ID:",
      params.accountId
    );
  };

  const handleDeleteUser = async (userId: string) => {
    // Add logic to handle deleting a user
    console.log(
      "Delete user:",
      userId,
      "Service ID:",
      params.serviceId,
      "Account ID:",
      params.accountId
    );
    try {
      const { success } = await deleteAccountUser(
        params.serviceId,
        params.accountId,
        userId
      );
      if (success) {
        setTimeout(() => {
          console.log("user deleted successfully");
          toast.success("User deleted successfully");
          // how to make hard refresh to get the new data
        }, 1000);
      } else {
        console.log("error deleting user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleDeleteMultipleUsers = async (selectedRowIds: string[]) => {
    // Add logic to handle deleting multiple users
    console.log(
      "Delete multiple users:",
      selectedRowIds,
      "Service ID:",
      params.serviceId,
      "Account ID:",
      params.accountId
    );
    try {
      const {success} = await deleteAllAccountUsers(params.serviceId, params.accountId)
      if(success){
        setTimeout(() => {
          console.log("users deleted successfully");
          toast.success("Users deleted successfully");
          router.refresh();
        } , 1000);
      }else {
        console.log("error deleting users");
        toast.error("Error deleting users");
      }
    } catch (error) {
      console.error('Error deleting multiple users:', error)
      toast.error("Error deleting users");
    }
  };

  // columns
  const columns: ColumnDef<TUserTabel>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("email")}</div>
      ),
      enableSorting: false, // Disable sorting by email
    },
    {
      accessorKey: "telephone",
      header: "Telephone",
      cell: ({ row }) => <div>{row.getValue("telephone")}</div>,
    },
    {
      accessorKey: "startingDate",
      header: "Starting Date",
      cell: ({ row }) => <div>{formatDate(row.original.startingDate)}</div>,
      enableSorting: false, // Ensure sorting is disabled
    },
    {
      accessorKey: "endingDate",
      header: "Ending Date",
      cell: ({ row }) => <div>{formatDate(row.original.endingDate)}</div>,
      enableSorting: false, // Ensure sorting is disabled
    },
    {
      accessorKey: "reminderDays",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Reminder Days
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("reminderDays")} days</div>,
      sortingFn: "basic", // Use 'basic' sorting function for numerical sorting
      enableSorting: true, // Ensure sorting is enabled
    },
    {
      accessorKey: "subscriptionStatus",
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
        const status = row.getValue("subscriptionStatus");
        const colorClass =
          status === "Active"
            ? "bg-green-100 text-green-800 p-1 flex items-center justify-center rounded-md"
            : "bg-red-100 text-red-800 p-1 flex items-center justify-center rounded-md";
        return (
          <div className={`capitalize ${colorClass}`}>
            {row.getValue("subscriptionStatus")}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const statusOrder: { [key: string]: number } = {
          Active: 1,
          Expired: 2,
        };
        return (
          statusOrder[rowA.original.subscriptionStatus || "Expired"] -
          statusOrder[rowB.original.subscriptionStatus || "Expired"]
        );
      },
      enableSorting: true, // Ensure sorting is enabled
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
              <DropdownMenuItem onClick={() => router.push(`/services/${params.serviceId}/${params.accountId}/upload-user?userId=${user.id}`)}>
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
  ];

  const [processedUsers, setProcessedUsers] = React.useState<
    Array<
      TUserTabel & {
        formattedStartingDate: string;
        formattedEndingDate: string;
      }
    >
  >([]);

  React.useEffect(() => {
    const updatedData = users.map((user) => ({
      ...user,
      subscriptionStatus: updateSubscriptionStatus(user.endingDate),
      formattedStartingDate: formatDate(user.startingDate),
      formattedEndingDate: formatDate(user.endingDate),
    }));
    setProcessedUsers(updatedData);
  }, [users]);

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
        delteUsers={handleDeleteMultipleUsers}
        isDeleteSingleUser={isDeleteSingleUser}
        userId={userId}
        userIds={usersToDelete}
      />
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by telephone..."
          value={
            (table.getColumn("telephone")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("telephone")?.setFilterValue(event.target.value)
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
            setUsersToDelete(Object.keys(table.getSelectedRowModel().rows));
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
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
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
