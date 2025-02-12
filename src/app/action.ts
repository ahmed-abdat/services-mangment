import { app } from "@/config/firebase";
import { ServiceAccount } from "@/types/services/service-accounts";
import { TUserData, TUserTabel } from "@/types/services/user";
import { Service, Thumbnail } from "@/types/upload-serves";
import {
  collection,
  getFirestore,
  orderBy,
  query,
  limit,
  getDocs,
  startAfter,
  doc,
  deleteDoc,
  getDoc,
  addDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  arrayRemove,
  where,
  setDoc,
  DocumentReference,
  Timestamp,
} from "firebase/firestore/lite";
import {
  getStorage,
  ref,
  deleteObject,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import moment from "moment";

const firestore = getFirestore(app);

// ? CRUD Service collection
export const addService = async (service: Service) => {
  const { thumbnail, name } = service;
  try {
    const posteData = {
      name,
      thumbnail: { url: "", name: thumbnail?.name },
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(firestore, "services"), posteData);
    console.log("poste added");

    // add thumbnail file image to storage
    const storage = getStorage();
    const thumbnailRef = ref(
      storage,
      `services-thumbnails/${docRef.id}/` + service?.thumbnail?.name
    );
    if (service?.thumbnail?.file) {
      uploadBytes(thumbnailRef, service.thumbnail.file).then(async () => {
        const downloadURL = await getDownloadURL(thumbnailRef);
        await updateDoc(doc(firestore, "services", docRef.id), {
          thumbnail: { url: downloadURL, name: service?.thumbnail?.name },
        });
      });
    }
    return { success: true, id: docRef.id };
  } catch (error) {
    console.log(error);
    return { success: false, id: null };
  }
};

export const getServices = async () => {
  const services: Service[] = [];
  const q = query(
    collection(firestore, "services"),
    orderBy("createdAt", "desc")
  );
  try {
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      services.push({ id: doc.id, ...doc.data() } as Service);
    });
    return { success: true, services };
  } catch (error) {
    console.log(error);
    return { success: false, services };
  }
};

export const getService = async (name: string) => {
  if (!name) return { success: false, service: null };
  const docRef = doc(firestore, "services", name);
  try {
    const querySnapshot = await getDoc(docRef);
    const service = {
      id: querySnapshot.id,
      ...querySnapshot.data(),
    } as Service;
    return { success: true, service };
  } catch (error) {
    console.log(error);
    return { success: false, service: null };
  }
};

export const deleteService = async (id: string, thumbnail: Thumbnail) => {
  try {
    // First, delete all users in all accounts
    const accountsRef = collection(firestore, `services/${id}/accounts`);
    const accountsSnapshot = await getDocs(accountsRef);

    // Delete all users for each account
    for (const accountDoc of accountsSnapshot.docs) {
      const usersRef = collection(
        firestore,
        `services/${id}/accounts/${accountDoc.id}/users`
      );
      const usersSnapshot = await getDocs(usersRef);

      // Delete each user document
      const userDeletions = usersSnapshot.docs.map((userDoc) =>
        deleteDoc(
          doc(
            firestore,
            `services/${id}/accounts/${accountDoc.id}/users`,
            userDoc.id
          )
        )
      );
      await Promise.all(userDeletions);

      // Delete the account document
      await deleteDoc(doc(firestore, `services/${id}/accounts`, accountDoc.id));
    }

    // Delete the service thumbnail from storage
    await deleteThumbnail(id, thumbnail);

    // Finally delete the service document itself
    await deleteDoc(doc(firestore, "services", id));

    return { success: true };
  } catch (error) {
    console.error("Error deleting service:", error);
    return { success: false };
  }
};

export const deleteThumbnail = async (id: string, thumbnail: Thumbnail) => {
  if (!thumbnail) return console.error("no file");
  try {
    const storage = getStorage();
    const thumbnailRef = ref(
      storage,
      `services-thumbnails/${id}/` + thumbnail?.name
    );
    await deleteObject(thumbnailRef);
    console.log("thumbnail deleted");
  } catch (error) {
    console.error(error);
  }
};

export const updateService = async (
  id: string,
  service: {
    name?: string;
    thumbnail?: Thumbnail;
    oldThumbnail?: Thumbnail;
  }
) => {
  try {
    if (service.name) {
      // update document id with new name
      await updateDoc(doc(firestore, "services", id), {
        name: service.name,
        updatedAt: serverTimestamp(),
      });
    }
    if (service.thumbnail && service.oldThumbnail) {
      await deleteThumbnail(id, service.oldThumbnail);
      await updateThumbnail(id, service.thumbnail);
    }
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
};

export const updateThumbnail = async (id: string, thumbnail: Thumbnail) => {
  if (!thumbnail?.file) return console.error("no file");
  try {
    const storage = getStorage();
    const thumbnailRef = ref(
      storage,
      `services-thumbnails/${id}/` + thumbnail?.file.name
    );
    await uploadBytes(thumbnailRef, thumbnail?.file);
    const downloadURL = await getDownloadURL(thumbnailRef);
    await updateDoc(doc(firestore, "services", id), {
      thumbnail: { url: downloadURL, name: thumbnail?.file.name },
    });
    console.log("thumbnail updated");
  } catch (error) {
    console.error(error);
  }
};

// ? CRUD service accounts

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
    // await addDoc(collection(firestore, `services/${serviceName}/accounts`), accountDetails);
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

// ? CRUD service account users

export const addAccountUser = async (
  serviceId: string,
  accountId: string,
  user: TUserData
) => {
  try {
    const collectionRef = collection(
      firestore,
      `services/${serviceId}/accounts/${accountId}/users`
    );
    await addDoc(collectionRef, user);
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
};

export const getAccountUser = async (
  serviceId: string,
  accountId: string,
  userId: string
) => {
  if (!serviceId || !accountId || !userId)
    return { success: false, user: null };
  const docRef = doc(
    firestore,
    `services/${serviceId}/accounts/${accountId}/users`,
    userId
  );
  try {
    const querySnapshot = await getDoc(docRef);
    const user = { ...querySnapshot.data() } as TUserTabel;
    if (
      !user.fullName ||
      !user.description ||
      !user.startingDate ||
      !user.endingDate
    )
      return { success: false, user: null };
    return { success: true, user };
  } catch (error) {
    console.log(error);
    return { success: false, user: null };
  }
};

export const getAccountUsers = async (serviceId: string, accountId: string) => {
  const q = query(
    collection(firestore, `services/${serviceId}/accounts/${accountId}/users`)
  );
  try {
    const querySnapshot = await getDocs(q);


    const users: TUserTabel[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Ensure timestamps are treated as Firestore Timestamp objects
      const startingDate = data.startingDate as Timestamp;
      const endingDate = data.endingDate as Timestamp;

      // Calculate reminder days based on starting and ending dates
      const reminderDays = calculateReminderDays(startingDate, endingDate);

      // Construct the user object with proper type and data transformations
      const user: TUserTabel = {
        id: doc.id,
        fullName: data.fullName,
        phone_number: data.phone_number || "",
        description: data.description || "", // Default to empty string if description is missing
        startingDate: startingDate ? startingDate.toDate().toISOString() : null, // Convert Timestamp to ISO string or null
        endingDate: endingDate ? endingDate.toDate().toISOString() : null, // Convert Timestamp to ISO string or null
        reminderDays,
        subscriptionStatus: data.subscriptionStatus || "active", // Default to 'active' if status is missing
      };
      users.push(user);
    });

    return { success: true, users };
  } catch (error) {
    console.error("Error in getAccountUsers:", error);
    return { success: false, users: null };
  }
};

const calculateReminderDays = (
  startingDate: Timestamp | null,
  endingDate: Timestamp | null
): number => {
  if (!startingDate || !endingDate) return 0;

  const now = moment().startOf("day"); // Start of today
  const end = moment(endingDate.toDate()).endOf("day"); // End of the end date

  // If already expired, return 0
  if (now.isAfter(end)) {
    return 0;
  }

  // Return remaining days until expiration (inclusive of end date)
  return end.diff(now, "days") + 1;
};

export const deleteAccountUser = async (
  serviceId: string,
  accountId: string,
  userId: string
) => {
  try {
    await deleteDoc(
      doc(
        firestore,
        `services/${serviceId}/accounts/${accountId}/users`,
        userId
      )
    );
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
};

export const deleteAllAccountUsers = async (
  serviceId: string,
  accountId: string
) => {
  try {
    const q = query(
      collection(firestore, `services/${serviceId}/accounts/${accountId}/users`)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
};

export const updateAccountUser = async (
  serviceId: string,
  accountId: string,
  userId: string,
  user: TUserData
) => {
  try {
    await updateDoc(
      doc(
        firestore,
        `services/${serviceId}/accounts/${accountId}/users`,
        userId
      ),
      {
        ...user,
      }
    );
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
};
