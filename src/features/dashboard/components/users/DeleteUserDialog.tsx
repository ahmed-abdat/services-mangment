import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type DeleteUserDialogProps = {
  isOpen: boolean;
  onChange: (isOpen: boolean) => void;
  deleteUser: (userId: string) => void;
  deleteUsers: (userIds: string[]) => void;
  isDeleteSingleUser: boolean;
  userId: string | null;
  userIds: string[];
};

export function DeleteUserDialog({
  isOpen,
  onChange,
  deleteUser,
  deleteUsers,
  isDeleteSingleUser,
  userId,
  userIds,
}: DeleteUserDialogProps) {
  const handleDelete = () => {
    try {
      if (isDeleteSingleUser) {
        if (!userId) {
          console.error("No user ID provided for deletion");
          return;
        }
        deleteUser(userId);
      } else {
        if (!userIds || userIds.length === 0) {
          console.error("No user IDs provided for bulk deletion");
          return;
        }
        deleteUsers(userIds);
      }
    } catch (error) {
      console.error("Error during user deletion:", error);
    }
  };
  return (
    <AlertDialog open={isOpen} onOpenChange={onChange}>
      <AlertDialogContent dir="ltr">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {isDeleteSingleUser ? "User" : "Users"}
            {isDeleteSingleUser && userId && ` (ID: ${userId})`}
            {!isDeleteSingleUser &&
              userIds.length > 0 &&
              ` (IDs: ${userIds.join(", ")})`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            {isDeleteSingleUser ? "this user" : "these users"}? This action
            cannot be undone and will permanently delete the selected{" "}
            {isDeleteSingleUser ? "user" : "users"} from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
