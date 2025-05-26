import { TUserTable } from "@/types/services/user";
import moment from "moment";

export function formatUserForClient(
  user: TUserTable | null | undefined
): FormattedUserTable {
  if (!user) {
    // Return a default formatted user if input is null/undefined
    return {
      id: "",
      full_name: "",
      description: "",
      starting_date: null,
      ending_date: null,
      subscriptionDuration: 0,
      subscription_status: "Expired",
    };
  }

  // Format dates if they are strings
  const formattedUser = {
    ...user,
    starting_date: user.starting_date
      ? moment(user.starting_date).format("YYYY-MM-DD")
      : null,
    ending_date: user.ending_date
      ? moment(user.ending_date).format("YYYY-MM-DD")
      : null,
  };

  return formattedUser;
}

// Define the return type explicitly
export type FormattedUserTable = Omit<
  TUserTable,
  "starting_date" | "ending_date"
> & {
  starting_date: string | null;
  ending_date: string | null;
};
