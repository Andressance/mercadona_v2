import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { useLocalStorage } from '../../hooks/useLocalStorage.js';
import { ensureDefaultList, subscribeToList, addListItem, removeListItem, toggleListItem } from '../../services/firestore.js';
// IMPORTAMOS EL NUEVO SERVICIO
import { trackPurchase } from '../../services/suggestions.js';

const CartCtx = createContext(null);

export function CartProvider({ children }) {
  const { user, mode } = useAuth();
  const [localItems, setLocalItems] = useLocalStorage('cart.items', []);
  const [onlineItems, setOnlineItems] = useState([]);
  const [currentListId, setCurrentListId] = useState(null);

  useEffect(() => {
    let unsub;
    if (mode === 'online' && user) {
      (async () => {
        const listId = await ensureDefaultList(user.uid);
        setCurrentListId(listId);
        unsub = subscribeToList(listId, setOnlineItems);
      })();
    } else {
      setCurrentListId(null);
      setOnlineItems([]);
    }
    return () => { if (unsub) unsub(); };
  }, [user, mode]);

  const items = mode === 'online' ? onlineItems : localItems;

  const addItem = async ({ name, quantity }) => {
    if (!name) return;
    if (mode === 'online' && currentListId) {
      await addListItem(currentListId, { name, quantity });
    } else {
      const id = crypto.randomUUID();
      setLocalItems([...localItems, { id, name, quantity, checked: false }]);
    }
  };

  const removeItem = async (id) => {
    if (mode === 'online' && currentListId) {
      await removeListItem(currentListId, id);
    } else {
      setLocalItems(localItems.filter((it) => it.id !== id));
    }
  };

  const toggleItem = async (id) => {
    if (mode === 'online' && currentListId) {
      await toggleListItem(currentListId, id);
    } else {
      setLocalItems(localItems.map((it) => it.id === id ? { ...it, checked: !it.checked } : it));
    }
  };

  const clearCart = async () => {
    // ¡AQUÍ ESTÁ LA MAGIA!
    // Antes de borrar el carrito, registramos la "compra"
    // Solo lo hacemos en modo local, ya que nuestra lógica de tracking es local
    if (mode === 'local' && localItems.length > 0) {
      trackPurchase(localItems);
    }

    // Lógica original de clearCart
    if (mode === 'online' && currentListId) {
      for (const it of onlineItems) { await removeListItem(currentListId, it.id); }
    } else {
      setLocalItems([]);
    }
  };

  return (
    <CartCtx.Provider value={{ items, addItem, removeItem, toggleItem, clearCart, currentListId }}>
      {children}
    </CartCtx.Provider>
  );
}

export const useCart = () => useContext(CartCtx);