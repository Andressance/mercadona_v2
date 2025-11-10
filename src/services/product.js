import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase.js"; // Asegúrate de que tu config de Firebase esté correcta

// Función para obtener todos los productos de Firestore
export const getAllProducts = async () => {
  const snapshot = await getDocs(collection(db, "producto")); // tu colección de productos
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};