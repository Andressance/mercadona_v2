import { db } from './firebase.js';
import { collection, addDoc, doc, getDoc, getDocs, onSnapshot, query, where, updateDoc } from 'firebase/firestore';

const listsCol = collection(db, 'lists');

export async function createList(data) {
  console.log('createList llamado con:', data); // LOG 7
  
  const docData = {
    name: data.name,
    ownerId: data.ownerId,
    memberIds: data.memberIds || [data.ownerId],
    products: data.products || [],
    createdAt: Date.now()
  };
  
  console.log('Guardando en Firestore:', docData); // LOG 8
  
  const listRef = await addDoc(collection(db, 'lists'), docData);
  
  console.log('Documento creado con ID:', listRef.id); // LOG 9
  
  return listRef.id;
}


export async function ensureDefaultList(userId) {
  // Leer listas donde el usuario ya es miembro (alineado con reglas)
  const q = query(listsCol, where('memberIds', 'array-contains', userId));
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].id;
  return await createList({ name: 'Mi lista', ownerId: userId });
}

export async function getListsForUser(userId) {
  console.log('getListsForUser llamado para:', userId); // LOG 10
  
  const listsRef = collection(db, 'lists');
  const q = query(listsRef, where('memberIds', 'array-contains', userId));
  const querySnapshot = await getDocs(q);
  
  const lists = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  console.log('Consulta devolvió:', lists); // LOG 11
  
  return lists;
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