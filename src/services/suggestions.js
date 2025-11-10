import { useMemo } from 'react';
// IMPORTAMOS LOS SERVICIOS DE FIRESTORE
import { db } from "./firebase.js";
import { doc, getDoc, setDoc } from "firebase/firestore";

/**
 * Normaliza un nombre de producto para usarlo como clave
 */
const normalize = (name) => name.toLowerCase().trim();

/**
 * Obtiene el historial de compras desde Firestore
 * @param {string} uid - ID del usuario
 * @returns {Promise<Object>}
 */
async function getPurchaseHistory(uid) {
  if (!uid) return {};
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data().purchaseHistory || {};
    }
    return {};
  } catch (e) {
    console.error("Error al obtener historial de compra:", e);
    return {};
  }
}

/**
 * Guarda el historial de compras en Firestore
 * @param {string} uid - ID del usuario
 * @param {Object} history - El objeto de historial
 */
async function savePurchaseHistory(uid, history) {
  if (!uid) return;
  try {
    const userRef = doc(db, 'users', uid);
    // Usamos { merge: true } para no sobrescribir otros datos del usuario
    await setDoc(userRef, { purchaseHistory: history }, { merge: true });
  } catch (e) {
    console.error("Error al guardar historial de compra:", e);
  }
}

/**
 * Se llama cuando el usuario "compra" (simula la compra).
 * AHORA ES ASYNC Y USA UID
 * @param {string} uid - ID del usuario
 * @param {Array<{name: string}>} purchasedItems - Items que estaban en el carrito
 */
export async function trackPurchase(uid, purchasedItems) {
  const history = await getPurchaseHistory(uid);
  const purchasedKeys = new Set(purchasedItems.map(it => normalize(it.name)));

  // 1. Actualizar CADA producto en el historial
  for (const key in history) {
    if (purchasedKeys.has(key)) {
      const item = history[key];
      item.count = (item.count || 0) + 1;
      item.purchasesSinceLastBuy = 0;
    } else {
      const item = history[key];
      item.purchasesSinceLastBuy = (item.purchasesSinceLastBuy || 0) + 1;
      if (item.purchasesSinceLastBuy >= 5 && item.count >= 3) {
        item.count = 2;
        item.purchasesSinceLastBuy = 0;
      }
    }
  }

  // 2. Añadir nuevos productos al historial si no existían
  for (const item of purchasedItems) {
    const key = normalize(item.name);
    if (!history[key]) {
      history[key] = {
        name: item.name.trim(),
        count: 1,
        purchasesSinceLastBuy: 0
      };
    }
  }

  await savePurchaseHistory(uid, history);
}

/**
 * Obtiene la lista "Siempre Compro" (count >= 3)
 * AHORA ES ASYNC Y USA UID
 * @param {string} uid - ID del usuario
 * @returns {Promise<Array<{id: string, name: string, count: number}>>}
 */
export async function getAlwaysList(uid) {
  const history = await getPurchaseHistory(uid);
  const list = [];
  
  for (const key in history) {
    const item = history[key];
    if (item.count >= 3) {
      list.push({
        id: key,
        name: item.name,
        count: item.count
      });
    }
  }
  return list.sort((a, b) => b.count - a.count);
}


// --- Lógica de Sugerencias MODIFICADA ---
// Ahora acepta 'alwaysList' como argumento

export function useSuggestions(cartItems, alwaysList = []) {
  // const always = getAlwaysList(); // Ya no se llama aquí
  
  const base = [
    { id: 'pan', name: 'Pan', defaultQty: 1 },
    { id: 'leche', name: 'Leche', defaultQty: 2 },
    { id: 'huevos', name: 'Huevos', defaultQty: 1 },
    { id: 'arroz', name: 'Arroz', defaultQty: 1 },
    { id: 'pasta', name: 'Pasta', defaultQty: 1 },
  ];
  const seasonal = [
    { id: 'turron', name: 'Turrón', defaultQty: 1 },
    { id: 'uva', name: 'Uva', defaultQty: 1 },
  ];
  return useMemo(() => {
    const namesInCart = new Set(cartItems.map((i) => normalize(i.name)));
    // Usa la lista que le pasamos como argumento
    const alwaysSugs = alwaysList.map((a) => ({ id: 'alw-' + a.id, name: a.name, defaultQty: 1 }));
    const all = [...alwaysSugs, ...base, ...seasonal];
    return all.filter((s) => !namesInCart.has(normalize(s.name))).slice(0, 12);
  }, [cartItems, alwaysList]); // Depende de alwaysList
}