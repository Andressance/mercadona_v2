import { collection, addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase.js";

export const getUserUidFromFirestore = async (authUid) => {
  const userRef = doc(db, "users", authUid); // asumimos que el docId = authUid
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("Usuario no encontrado en Firestore");
  }

  const userData = userSnap.data();
  return userData.uid; // esto es el UID que guardaste en tu tabla 'users'
};

export const createNewList = async (ownerUid, products) => {
  const docRef = await addDoc(collection(db, "Lista"), {
    ownerId: ownerUid,
    products,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};