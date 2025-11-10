import { useMemo } from 'react';

// CLAVE: Usamos una nueva clave de localStorage para el historial de hábitos
const HISTORY_KEY = 'purchase.history';

/**
 * Normaliza un nombre de producto para usarlo como clave
 * "Leche Desnatada" -> "leche desnatada"
 */
const normalize = (name) => name.toLowerCase().trim();

/**
 * Obtiene el historial de compras desde localStorage
 * @returns {Object<string, {name: string, count: number, purchasesSinceLastBuy: number}>}
 */
function getPurchaseHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
  } catch {
    return {};
  }
}

/**
 * Guarda el historial de compras en localStorage
 */
function savePurchaseHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

/**
 * ¡LA LÓGICA PRINCIPAL!
 * Se llama cuando el usuario "compra" (limpia el carrito).
 * @param {Array<{name: string}>} purchasedItems - Items que estaban en el carrito
 */
export function trackPurchase(purchasedItems) {
  const history = getPurchaseHistory();
  const purchasedKeys = new Set(purchasedItems.map(it => normalize(it.name)));

  // 1. Actualizar CADA producto en el historial
  for (const key in history) {
    if (purchasedKeys.has(key)) {
      // El usuario COMPRÓ este item
      const item = history[key];
      item.count = (item.count || 0) + 1; // Incrementar contador
      item.purchasesSinceLastBuy = 0; // Resetear contador de "olvido"
    } else {
      // El usuario NO COMPRÓ este item
      const item = history[key];
      item.purchasesSinceLastBuy = (item.purchasesSinceLastBuy || 0) + 1;

      // REGLA DE 10 COMPRAS: Si lo olvida 10 veces y estaba en la lista...
      if (item.purchasesSinceLastBuy > 10 && item.count >= 3) {
        item.count = 2; // ...lo bajamos a 2 (sale de la lista)
        item.purchasesSinceLastBuy = 0; // Reseteamos para no volver a bajarlo
      }
    }
  }

  // 2. Añadir nuevos productos al historial si no existían
  for (const item of purchasedItems) {
    const key = normalize(item.name);
    if (!history[key]) {
      history[key] = {
        name: item.name.trim(), // Guardamos el nombre con mayúsculas
        count: 1,
        purchasesSinceLastBuy: 0
      };
    }
  }

  savePurchaseHistory(history);
}

/**
 * Obtiene la lista "Siempre Compro" (count >= 3)
 * @returns {Array<{id: string, name: string, count: number}>}
 */
export function getAlwaysList() {
  const history = getPurchaseHistory();
  const list = [];
  
  for (const key in history) {
    const item = history[key];
    // REGLA DE 3 COMPRAS: Si el contador es 3 o más, aparece en la lista
    if (item.count >= 3) {
      list.push({
        id: key, // Usamos la key (nombre normalizado) como ID
        name: item.name,
        count: item.count
      });
    }
  }
  return list.sort((a, b) => b.count - a.count); // Opcional: ordenar por más comprados
}


// --- Lógica de Sugerencias (no la tocamos) ---
// (Esta parte es para la página "Cart.jsx" y puede convivir)

export function useSuggestions(cartItems) {
  // Las sugerencias ahora también pueden incluir tus "Always Buy"
  const always = getAlwaysList();

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
    const alwaysSugs = always.map((a) => ({ id: 'alw-' + a.id, name: a.name, defaultQty: 1 }));
    const all = [...alwaysSugs, ...base, ...seasonal];
    return all.filter((s) => !namesInCart.has(normalize(s.name))).slice(0, 12);
  }, [cartItems, always]);
}