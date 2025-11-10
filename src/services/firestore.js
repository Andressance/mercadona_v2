import { db } from './firebase.js';
import { collection, addDoc, doc, getDoc, getDocs, onSnapshot, query, where, updateDoc, arrayUnion } from 'firebase/firestore';
const listsCol = collection(db, 'lists');

export async function createList({ name, ownerId }) {
  const docRef = await addDoc(listsCol, { name, ownerId, memberIds: [ownerId], items: [] });
  return docRef.id;
}

export async function ensureDefaultList(userId) {
  const q = query(listsCol, where('memberIds', 'array-contains', userId));
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].id;
  return await createList({ name: 'Mi lista', ownerId: userId });
}

export async function getListsForUser(userId) {
  const q = query(listsCol, where('memberIds', 'array-contains', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeToList(listId, cb) {
  const ref = doc(db, 'lists', listId);
  return onSnapshot(ref, (snap) => {
    const data = snap.data();
    cb((data?.items || []).map((it) => ({ ...it })));
  });
}

export async function addListItem(listId, { name, quantity }) {
  const ref = doc(db, 'lists', listId);
  const snap = await getDoc(ref);
  const data = snap.data();
  const items = data?.items || [];
  const normalizedName = name.toLowerCase(); 

  let itemFound = false;

  const updatedItems = items.map(it => {
    if (it.name.toLowerCase() === normalizedName) {
      itemFound = true;
      return { ...it, quantity: it.quantity + quantity };
    }
    return it;
  });

  if (!itemFound) {
    const id = crypto.randomUUID();
    updatedItems.push({ id, name, quantity, checked: false });
  }

  await updateDoc(ref, { items: updatedItems });
}

export async function removeListItem(listId, id) {
  const ref = doc(db, 'lists', listId);
  const snap = await getDoc(ref);
  const data = snap.data();
  const items = (data?.items || []).filter((it) => it.id !== id);
  await updateDoc(ref, { items });
}

export async function toggleListItem(listId, id) {
  const ref = doc(db, 'lists', listId);
  const snap = await getDoc(ref);
  const data = snap.data();
  const items = (data?.items || []).map((it) => it.id === id ? { ...it, checked: !it.checked } : it);
  await updateDoc(ref, { items });
}

export async function joinListById(listId, userId) {
  const ref = doc(db, 'lists', listId);

  // Esta operación SÓLO escribe, no lee primero.
  // Usa 'arrayUnion' para añadir el userId de forma atómica.
  // Si el usuario ya existe en 'memberIds', no hace nada.
  await updateDoc(ref, {
    memberIds: arrayUnion(userId)
  });
}

// --- NUEVA FUNCIÓN ---
/**
 * Añade un array de productos (carrito) a una lista existente,
 * fusionando cantidades si los productos ya existen.
 * @param {string} listId - ID de la lista de destino.
 * @param {Array} cartItems - Array de productos del carrito.
 */
export async function addCartItemsToList(listId, cartItems) {
  const ref = doc(db, 'lists', listId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("La lista no existe");

  const data = snap.data();
  const existingItems = data?.items || [];

  // Usamos un Map para la eficiencia al fusionar
  // Clave: nombre normalizado, Valor: objeto item
  const itemsMap = new Map(existingItems.map(it => [it.name.toLowerCase(), it]));

  // Recorremos los productos del carrito
  for (const cartItem of cartItems) {
    const normalizedName = cartItem.name.toLowerCase();
    
    if (itemsMap.has(normalizedName)) {
      // Si existe, actualiza la cantidad
      const existing = itemsMap.get(normalizedName);
      existing.quantity += cartItem.quantity;
    } else {
      // Si no existe, crea un nuevo objeto item y añádelo al Map
      const newItem = {
        id: crypto.randomUUID(),
        name: cartItem.name,
        quantity: cartItem.quantity,
        checked: false
      };
      itemsMap.set(normalizedName, newItem);
    }
  }

  // Convertimos el Map de nuevo a un array
  const updatedItems = Array.from(itemsMap.values());

  // Actualizamos el documento de Firestore una sola vez
  await updateDoc(ref, { items: updatedItems });
}