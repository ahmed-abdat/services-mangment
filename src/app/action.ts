import { app } from "@/config/firebase";
import { ServiceAccount } from "@/types/services/service-accounts";
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
} from "firebase/firestore/lite";
import {
  getStorage,
  ref,
  deleteObject,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";


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
      const docRef = await setDoc(doc(firestore, "services", name), posteData);
      console.log("poste added");
  
      // add thumbnail file image to storage
      const storage = getStorage();
      const thumbnailRef = ref(
        storage,
        `services-thumbnails/${name}/` + service?.thumbnail?.name
      );
      if (service?.thumbnail?.file) {
        uploadBytes(thumbnailRef, service.thumbnail.file).then(async () => {
          const downloadURL = await getDownloadURL(thumbnailRef);
          await updateDoc(doc(firestore, "services", name), {
            thumbnail: { url: downloadURL, name: service?.thumbnail?.name },
          });
        });
      }
        return { success: true, id: name };
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
  }


  export const getService = async (name : string) => {
    const docRef = doc(firestore, "services", name);
    try {
      const querySnapshot = await getDoc(docRef);
      const service = { id: querySnapshot.id, ...querySnapshot.data() } as Service;
      return { success: true, service };
    } catch (error) {
      console.log(error);
      return { success: false, service: null }; 
    }
  }

  export const deleteService = async (id: string , thumbnail : Thumbnail) => {
    try {
      await deleteDoc(doc(firestore, "services", id));
      await deleteThumbnail(id, thumbnail);
      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  }

  export const deleteThumbnail = async (
    id: string,
    thumbnail: Thumbnail,
  ) => {
    if (!thumbnail) return console.error("no file");
    try {
      const storage = getStorage();
      const thumbnailRef = ref(storage, `services-thumbnails/${id}/` + thumbnail?.name);
      await deleteObject(thumbnailRef);
      console.log("thumbnail deleted");
    } catch (error) {
      console.error(error);
    }
  };
  

  export const updateService = async (id: string, service: {
    name? : string,
    thumbnail? : Thumbnail,
    oldThumbnail? : Thumbnail
  }) => {
    try {
      if(service.name) {
        await updateDoc(doc(firestore, "services", id), {
          name: service.name,
          updatedAt: serverTimestamp(),
        });
      }
      if(service.thumbnail && service.oldThumbnail) {
        await deleteThumbnail(id, service.oldThumbnail);
        await updateThumbnail(id, service.thumbnail);
      }
      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  }

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

  export const addServiceAccount = async (serviceName: string, account: ServiceAccount) => {
    try {
      const {service , success} = await getService(serviceName);
      const accountDetails = {
        ...account,
        thumbnail : success && service ? service.thumbnail : null,
        createdAt: serverTimestamp(),
        details : account.details ?? null
      }
      // await addDoc(collection(firestore, `services/${serviceName}/accounts`), accountDetails);
      const collectionRef = collection(firestore, `services/${serviceName}/accounts`);
      const docRef = doc(collectionRef , account.name);
      await setDoc(docRef, accountDetails);
      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  }


  export const getServiceAccount = async (serviceName: string , accountName : string) => {
    const docRef = doc(firestore, `services/${serviceName}/accounts`, accountName);
    try {
      const querySnapshot = await getDoc(docRef);
      console.log(querySnapshot.data());
      
      const account = { ...querySnapshot.data() } as ServiceAccount;
      if(!account.name) return { success: false, account: null };
      return { success: true, account };
    } catch (error) {
      console.log(error);
      return { success: false, account: null };
    }
  }

  export const getServiceAccounts = async (serviceName: string) => {
    const accounts: ServiceAccount[] = [];
    const q = query(
      collection(firestore, `services/${serviceName}/accounts`),
      orderBy("createdAt", "desc")
    );
    try {
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        accounts.push({ name: doc.id, ...doc.data() } as ServiceAccount);
      });
      return { success: true, accounts };
    } catch (error) {
      console.log(error);
      return { success: false, accounts };
    }
  }