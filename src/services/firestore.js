import { db } from './firebase.js';
import { collection, addDoc, doc, getDoc, getDocs, onSnapshot, query, where, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';

const listsCol = collection(db, 'lists');

export async function createList({ name, ownerId }) {
  const docRef = await addDoc(listsCol, { name, ownerId, memberIds: [ownerId], items: [] });
  return docRef.id;
}

export async function ensureDefaultList(userId) {
  const q = query(listsCol, where('ownerId', '==', userId));
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