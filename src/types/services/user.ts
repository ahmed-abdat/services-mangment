import { Timestamp } from "firebase/firestore/lite";

export type TUserDate = {
  date: Date | undefined;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
};

export type TUserData = {
  id?: string;
  email: string;
  description: string;
  startingDate: Date;
  endingDate: Date;
};

export type TUserTabel = {
  id?: string;
  email: string;
  description: string;
  startingDate: Timestamp;
  endingDate: Timestamp;
  reminderDays: number;
  subscriptionStatus?: string;
};

export type FormattedUserTabel = Omit<
  TUserTabel,
  "startingDate" | "endingDate"
> & {
  startingDate: string | null;
  endingDate: string | null;
};
