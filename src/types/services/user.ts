import { Timestamp } from "firebase/firestore/lite";

export type TUserDate = {
  date: Date | undefined;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
};

export type TUserData = {
  id?: string;
  fullName: string;
  description: string;
  phone_number?: string;
  startingDate: Date;
  endingDate: Date;
};

// For internal use with Firestore
export type TUserFirestore = {
  id?: string;
  fullName: string;
  description: string;
  phone_number?: string;
  startingDate: Timestamp;
  endingDate: Timestamp;
  reminderDays: number;
  subscriptionStatus?: string;
};

// For use in the application (after data is fetched)
export type TUserTabel = {
  id?: string;
  fullName: string;
  description: string;
  phone_number?: string;
  startingDate: string | null;
  endingDate: string | null;
  reminderDays: number;
  subscriptionStatus?: string;
};

export type FormattedUserTabel = TUserTabel;
