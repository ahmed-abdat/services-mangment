import { TUserTabel } from "@/types/services/user";
import moment from "moment";

export function formatUserForClient(
  user: TUserTabel | null | undefined
): FormattedUserTabel {
  if (!user) {
    // Return a default formatted user if input is null/undefined
    return {
      id: "",
      fullName: "",
      description: "",
      startingDate: null,
      endingDate: null,
      reminderDays: 0,
      subscriptionStatus: "Expired",
    };
  }

  // Format dates if they are strings
  const formattedUser = {
    ...user,
    startingDate: user.startingDate
      ? moment(user.startingDate).format("YYYY-MM-DD")
      : null,
    endingDate: user.endingDate
      ? moment(user.endingDate).format("YYYY-MM-DD")
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
