import { db } from './firebase.js';
// 1. AÑADIR 'setDoc' y 'doc' A LA IMPORTACIÓN
import { collection, addDoc, doc, getDoc, getDocs, onSnapshot, query, where, updateDoc, setDoc } from 'firebase/firestore';

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
  const id = crypto.randomUUID();
  items.push({ id, name, quantity, checked: false });
  await updateDoc(ref, { items });
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
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Lista no encontrada');
  const data = snap.data();
  const memberIds = data.memberIds || [];
  if (!memberIds.includes(userId)) {
    await updateDoc(ref, { memberIds: [...memberIds, userId] });
  }
}

// --- 2. ¡AÑADIR ESTAS NUEVAS FUNCIONES PARA HÁBITOS! ---

const getHabitRef = (userId) => doc(db, 'userHabits', userId);

/**
 * Obtiene el historial de hábitos de un usuario desde Firestore
 * @param {string} userId
 * @returns {Promise<Object>} El objeto de historial (o {} si es nuevo)
 */
export async function getHabitHistory(userId) {
  if (!userId) return {};
  const ref = getHabitRef(userId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data().history || {};
  }
  return {};
}

/**
 * Guarda el historial de hábitos de un usuario en Firestore
 * @param {string} userId
 * @param {Object} history El objeto de historial actualizado
 */
export async function saveHabitHistory(userId, history) {
  if (!userId) return;
  const ref = getHabitRef(userId);
  // Usamos setDoc para crear/sobrescribir el documento con el nuevo historial
  await setDoc(ref, { history });
}