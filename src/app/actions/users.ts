import { TUserData, TUserTabel, TUserFirestore } from "@/types/services/user";
import {
  collection,
  query,
  getDocs,
  doc,
  deleteDoc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  orderBy,
  Timestamp,
} from "firebase/firestore/lite";
import { firestore, handleActionError, calculateReminderDays } from "./shared";

// Add a new account user
export const addAccountUser = async (
  serviceId: string,
  accountId: string,
  user: TUserData
) => {
  return handleActionError(async () => {
    const userData = {
      ...user,
      createdAt: serverTimestamp(),
    };
    const collectionRef = collection(
      firestore,
      `services/${serviceId}/accounts/${accountId}/users`
    );
    await addDoc(collectionRef, userData);
    return true;
  });
};

// Get all account users
export const getAccountUsers = async (serviceId: string, accountId: string) => {
  const collectionPath = `services/${serviceId}/accounts/${accountId}/users`;

  const q = query(
    collection(firestore, collectionPath),
    orderBy("createdAt", "desc")
  );

  try {
    const querySnapshot = await getDocs(q);

    const users: TUserTabel[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      const startingDate = data.startingDate as Timestamp;
      const endingDate = data.endingDate as Timestamp;

      const reminderDays = calculateReminderDays(startingDate, endingDate);

      const user: TUserTabel = {
        id: doc.id,
        fullName: data.fullName,
        description: data.description || "",
        startingDate: startingDate ? startingDate.toDate().toISOString() : null,
        endingDate: endingDate ? endingDate.toDate().toISOString() : null,
        reminderDays,
        subscriptionStatus: data.subscriptionStatus || "active",
      };
      users.push(user);
    });

    return { success: true, users };
  } catch (error) {
    console.error("Error in getAccountUsers:", error);
    return { success: false, users: null };
  }
};

// Get a single account user
export const getAccountUser = async (
  serviceId: string,
  accountId: string,
  userId: string
) => {
  return handleActionError(async () => {
    console.log("Fetching user with ID:", userId);
    console.log("Service ID:", serviceId);
    console.log("Account ID:", accountId);

    if (!serviceId || !accountId || !userId) return null;

    const docRef = doc(
      firestore,
      `services/${serviceId}/accounts/${accountId}/users`,
      userId
    );
    const querySnapshot = await getDoc(docRef);
    const data = querySnapshot.data();

    console.log("Raw user data from Firestore:", data);

    if (!data || !data.fullName) {
      console.log("No user data found or missing fullName");
      return null;
    }

    // Ensure timestamps are properly handled
    const startingDate = data.startingDate as Timestamp;
    const endingDate = data.endingDate as Timestamp;

    console.log("Timestamps:", { startingDate, endingDate });

    const user: TUserTabel = {
      id: querySnapshot.id,
      fullName: data.fullName,
      description: data.description || "",
      startingDate: startingDate ? startingDate.toDate().toISOString() : null,
      endingDate: endingDate ? endingDate.toDate().toISOString() : null,
      reminderDays: calculateReminderDays(startingDate, endingDate),
      subscriptionStatus: data.subscriptionStatus || "active",
    };

    console.log("Processed user data:", user);
    return user;
  });
};

// Update account user
export const updateAccountUser = async (
  serviceId: string,
  accountId: string,
  userId: string,
  user: TUserData
) => {
  return handleActionError(async () => {
    console.log("Updating user with ID:", userId);
    console.log("Update data:", user);

    // Convert JavaScript Date objects to Firestore Timestamps
    const userData = {
      ...user,
      startingDate: Timestamp.fromDate(user.startingDate),
      endingDate: Timestamp.fromDate(user.endingDate),
      updatedAt: serverTimestamp(),
    };

    console.log("Processed update data:", userData);

    await updateDoc(
      doc(
        firestore,
        `services/${serviceId}/accounts/${accountId}/users`,
        userId
      ),
      userData
    );
    return true;
  });
};

// Delete account user
export const deleteAccountUser = async (
  serviceId: string,
  accountId: string,
  userId: string
) => {
  return handleActionError(async () => {
    await deleteDoc(
      doc(
        firestore,
        `services/${serviceId}/accounts/${accountId}/users`,
        userId
      )
    );
    return true;
  });
};
