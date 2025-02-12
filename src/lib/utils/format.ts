import { TUserTabel } from "@/types/services/user";
import moment from "moment";

export function formatUserForClient(
  user: TUserTabel | null | undefined
): FormattedUserTabel {
  if (!user) {
    // Return a default formatted user if input is null/undefined
    return {
      id: "",
      email: "",
      description: "",
      startingDate: null,
      endingDate: null,
      reminderDays: 0,
      subscriptionStatus: "Expired",
    };
  }

  // Convert Firestore Timestamps to ISO strings
  const formattedUser = {
    ...user,
    startingDate: user.startingDate
      ? moment(user.startingDate.toDate()).format("YYYY-MM-DD")
      : null,
    endingDate: user.endingDate
      ? moment(user.endingDate.toDate()).format("YYYY-MM-DD")
      : null,
  };

  return formattedUser;
}

// Define the return type explicitly
export type FormattedUserTabel = Omit<
  TUserTabel,
  "startingDate" | "endingDate"
> & {
  startingDate: string | null;
  endingDate: string | null;
};
