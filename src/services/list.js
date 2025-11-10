import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase.js";

/**
 * Crea una nueva lista de productos para el usuario.
 * @param {string} userUid - El UID del usuario que será el owner.
 * @param {Array<{name: string, quantity: number}>} products - Productos del carrito.
 * @returns {string|null} - ID del documento creado, o null si falla.
 */
export const createNewList = async (userUid, products) => {
  if (!userUid || !products || products.length === 0) return null;

  const docRef = await addDoc(collection(db, "Lista"), {
    ownerId: userUid,    // <-- guardamos el uid del usuario aquí
    products,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};