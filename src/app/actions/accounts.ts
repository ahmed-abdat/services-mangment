import { app } from "@/config/firebase";
import { ServiceAccount } from "@/types/services/service-accounts";
import { getService } from "./services";
import {
  collection,
  getFirestore,
  query,
  getDocs,
  doc,
  deleteDoc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  where,
  orderBy,
} from "firebase/firestore/lite";

const firestore = getFirestore(app);

// Add a new service account
export const addServiceAccount = async (
  serviceName: string,
  account: ServiceAccount
) => {
  try {
    const { service, success } = await getService(serviceName);
    const accountDetails = {
      ...account,
      thumbnail: success && service ? service.thumbnail : null,
      createdAt: serverTimestamp(),
      details: account.details ?? null,
    };
    const collectionRef = collection(
      firestore,
      `services/${serviceName}/accounts`
    );
    await addDoc(collectionRef, accountDetails);
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
};

// Get a single service account
export const getServiceAccount = async (
  serviceId: string,
  accountId: string
) => {
  if (!serviceId || !accountId) return { success: false, account: null };
  const docRef = doc(firestore, `services/${serviceId}/accounts`, accountId);
  try {
    const querySnapshot = await getDoc(docRef);
    const account = { ...querySnapshot.data() } as ServiceAccount;
    if (!account.name) return { success: false, account: null };
    return { success: true, account };
  } catch (error) {
    console.log(error);
    return { success: false, account: null };
  }
};

// Check if account name exists
export const checkifAccountNameExiste = async (
  serviceId: string,
  name: string
) => {
  if (!serviceId || !name) return { success: false, account: null };
  const q = query(
    collection(firestore, `services/${serviceId}/accounts`),
    where("name", "==", name)
  );
  try {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.size > 0) {
      return { success: true, account: querySnapshot.docs[0].data() };
    }
    return { success: false, account: null };
  } catch (error) {
    console.log(error);
    return { success: false, account: null };
  }
};

// Get all service accounts
export const getServiceAccounts = async (serviceId: string) => {
  const accounts: ServiceAccount[] = [];
  const q = query(
    collection(firestore, `services/${serviceId}/accounts`),
    orderBy("createdAt", "desc")
  );
  try {
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      accounts.push({ id: doc.id, ...doc.data() } as ServiceAccount);
    });
    return { success: true, accounts };
  } catch (error) {
    console.log(error);
    return { success: false, accounts };
  }
};

// Update service account
export const updateServiceAccount = async (
  serviceId: string,
  accountId: string,
  account: ServiceAccount
) => {
  try {
    await updateDoc(
      doc(firestore, `services/${serviceId}/accounts`, accountId),
      {
        ...account,
        updatedAt: serverTimestamp(),
      }
    );
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
};

// Delete service account
export const deleteServiceAccount = async (
  serviceId: string,
  accountId: string
) => {
  try {
    // delete all the accounts and users inside the each account
    const usersRef = collection(
      firestore,
      `services/${serviceId}/accounts/${accountId}/users`
    );
    const users = await getDocs(usersRef);
    users.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
    await deleteDoc(
      doc(firestore, `services/${serviceId}/accounts`, accountId)
    );
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
};
