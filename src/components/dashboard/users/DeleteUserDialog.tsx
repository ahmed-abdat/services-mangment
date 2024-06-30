import * as React from "react"
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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

type DeleteUserDialogProps = {
    isOpen: boolean,
    onChange: (isOpen : boolean) => void,
    deleteUser : (userId : string) => void,
    delteUsers : (userIds : string[]) => void,
    isDeleteSingleUser : boolean,
    userId : string | null,
    userIds : string[],
}

export function DeleteUserDialog({
    isOpen,
    onChange,
    deleteUser,
    delteUsers,
    isDeleteSingleUser,
    userId,
    userIds,
}: DeleteUserDialogProps) {

    const handleDelete = () => {
        if (isDeleteSingleUser) {
            if (userId) {
                deleteUser(userId)
            }
        } else {
            delteUsers(userIds)
        }
    }
  return (
    <AlertDialog open={isOpen} onOpenChange={() => onChange(!isOpen)}>
      <AlertDialogContent dir="ltr">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete {isDeleteSingleUser ? 'this user' : 'these users'} ? with id {isDeleteSingleUser ? userId : userIds.join(", ")} 
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the selected user(s).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
