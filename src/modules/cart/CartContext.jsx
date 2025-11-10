import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { useLocalStorage } from '../../hooks/useLocalStorage.js';
import { ensureDefaultList, subscribeToList, addListItem, removeListItem, toggleListItem } from '../../services/firestore.js';

const CartCtx = createContext(null);

export function CartProvider({ children }) {
  const { user, mode } = useAuth();
  const [localItems, setLocalItems] = useLocalStorage('cart.items', []);
  const [onlineItems, setOnlineItems] = useState([]);
  const [currentListId, setCurrentListId] = useState(null);

  useEffect(() => {
    if (mode === 'online' && user) {
      (async () => {
        const listId = await ensureDefaultList(user.uid);
        setCurrentListId(listId);
        return subscribeToList(listId, setOnlineItems);
      })();
    } else {
      setCurrentListId(null);
    }
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
    if (mode === 'online' && currentListId) {
      // Simple: remove all items one by one
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