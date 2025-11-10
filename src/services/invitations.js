import { 
  collection, addDoc, getDocs, query, where, doc, updateDoc, arrayUnion, deleteDoc, getDoc 
} from "firebase/firestore";
import { db } from './firebase';

// Enviar invitación por uid
export async function sendInvitation(uidToInvite, ownerId, listId) {
  return await addDoc(collection(db, "invitations"), {
    uidToInvite,
    ownerId,
    listId,
    status: 'pending',
    createdAt: Date.now()
  });
}

export async function getListsForUser(userId) {
  const listsRef = collection(db, 'lists');
  const q = query(listsRef, where('memberIds', 'array-contains', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Obtener invitaciones para un usuario por su uid
export async function getInvitationsForUser(uid) {
  const q = query(collection(db, "invitations"), where("uidToInvite", "==", uid), where("status", "==", "pending"));
  const snap = await getDocs(q);
  return snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
}

// Resto igual a la versión anterior
export async function acceptInvitation(userId, invitationId) {
  const invitationRef = doc(db, "invitations", invitationId);
  const invitationSnap = await getDoc(invitationRef);
  if (!invitationSnap.exists()) throw new Error('Invitación no encontrada');
  const { listId } = invitationSnap.data();
  const listRef = doc(db, "lists", listId);
  await updateDoc(listRef, {
    memberIds: arrayUnion(userId)
  });
  await deleteDoc(invitationRef);
}

export async function rejectInvitation(userId, invitationId) {
  const invitationRef = doc(db, "invitations", invitationId);
  await deleteDoc(invitationRef);
}
