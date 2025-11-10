import { useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

const ALWAYS_KEY = 'always.items';

export function useSuggestions(cartItems) {
  const [always] = useLocalStorage(ALWAYS_KEY, []);
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
    const namesInCart = new Set(cartItems.map((i) => i.name.toLowerCase()));
    const alwaysSugs = always.map((a) => ({ id: 'alw-' + a.id, name: a.name, defaultQty: 1 }));
    const all = [...alwaysSugs, ...base, ...seasonal];
    return all.filter((s) => !namesInCart.has(s.name.toLowerCase())).slice(0, 12);
  }, [cartItems, always]);
}

export function getAlwaysList() {
  try { return JSON.parse(localStorage.getItem(ALWAYS_KEY) || '[]'); } catch { return []; }
}

export function addAlwaysItem({ name }) {
  const curr = getAlwaysList();
  const id = crypto.randomUUID();
  const next = [...curr, { id, name }];
  localStorage.setItem(ALWAYS_KEY, JSON.stringify(next));
}

export function removeAlwaysItem(id) {
  const curr = getAlwaysList();
  const next = curr.filter((x) => x.id !== id);
  localStorage.setItem(ALWAYS_KEY, JSON.stringify(next));
}