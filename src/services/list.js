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

// En tu archivo de servicios (firestore.js o similar)
export async function createNewList(ownerId, products) {
  const listRef = await addDoc(collection(db, "lists"), {
    name: "Mi Lista de Compra", // O pide un nombre
    ownerId: ownerId,
    memberIds: [ownerId], // IMPORTANTE: incluir al owner como miembro
    products: products,
    createdAt: Date.now()
  });
  return listRef.id;
}
