export type TUserDate = {
  date: Date | undefined;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
};

// Extended type for UserEndingDate that includes startingDate for relative calculations
export type TUserEndingDate = {
  date: Date | undefined;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  startingDate?: Date | undefined; // Optional starting date for relative calculations
};

export type TUserData = {
  id?: string;
  full_name: string;
  description: string;
  phone_number?: string;
  starting_date: Date;
  ending_date: Date;
};

// For internal use with Supabase database
export type TUserDatabase = {
  id?: string;
  full_name: string;
  description: string;
  phone_number?: string;
  starting_date: string;
  ending_date: string;
  subscriptionDuration: number; // Total duration between start and end dates in days
  subscription_status?: string;
};

// For use in the application (after data is fetched)
export type TUserTable = {
  id?: string;
  full_name: string;
  description: string;
  phone_number?: string;
  starting_date: string | null;
  ending_date: string | null;
  subscriptionDuration: number; // Total duration between start and end dates in days
  subscription_status?: string;
};

export type FormattedUserTable = TUserTable;
