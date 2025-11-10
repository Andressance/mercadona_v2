import { collection, addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase.js";
import jsPDF from 'jspdf';

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
};

export const generatePdf = (items) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Mi lista de compra", 10, 10);

  items.forEach((item, index) => {
    // --- CORRECCIÓN ---
    // Se han cambiado las comillas simples ' por backticks `
    doc.text(`${index + 1}. ${item.name} x${item.quantity}`, 10, 20 + index * 10);
  });

  doc.save("mi_lista.pdf");
};
