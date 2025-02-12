import { app } from "@/config/firebase";
import { Service, Thumbnail } from "@/types/upload-serves";
import {
  collection,
  getFirestore,
  orderBy,
  query,
  getDocs,
  doc,
  deleteDoc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore/lite";
import {
  getStorage,
  ref,
  deleteObject,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

const firestore = getFirestore(app);

// Add a new service
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

// Get all services
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

// Get a single service
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

// Delete a service and its thumbnail
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

// Delete thumbnail from storage
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

// Update service
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

// Update thumbnail
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
